from django.db.models import Q
from django.http import HttpResponse
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import uuid
import razorpay
import hashlib
import hmac
from decimal import Decimal
from datetime import datetime

from .models import Booking, Ticket
from .serializers import BookingSerializer, BookingCreateSerializer, BookingUpdateSerializer
from events.models import Event
from .ticket_pdf import generate_ticket_pdf

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling ticket bookings
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Users see only their bookings
        if user.role == "USER":
            return Booking.objects.filter(user=user)
        # Organizers see bookings for their events
        elif user.role == "ORGANIZER":
            return Booking.objects.filter(event__organizer=user)
        # Admins see all bookings
        elif user.role == "ADMIN":
            return Booking.objects.all()
        return Booking.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return BookingCreateSerializer
        elif self.action == "partial_update":
            return BookingUpdateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        """Create a new booking without payment (for free events)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        event = get_object_or_404(Event, id=request.data.get('event'))
        
        if event.status in ("COMPLETED", "CANCELLED"):
            return Response(
                {"detail": f"This event has {event.status.lower()} and tickets are no longer available."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        num_tickets = serializer.validated_data.get('number_of_tickets')
        
        if num_tickets > event.available_seats:
            return Response(
                {"detail": f"Only {event.available_seats} seats available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        total_price = Decimal(str(event.ticket_price)) * num_tickets
        
        booking_reference = f"BK{uuid.uuid4().hex[:8].upper()}"
        
        booking = Booking.objects.create(
            user=request.user,
            event=event,
            number_of_tickets=num_tickets,
            total_price=total_price,
            booking_reference=booking_reference,
            status="CONFIRMED"
        )
        
        for i in range(num_tickets):
            ticket_number = f"{booking_reference}T{i+1}"
            ticket = Ticket.objects.create(
                booking=booking,
                ticket_number=ticket_number
            )
            ticket.generate_qr_code()
        
        event.available_seats -= num_tickets
        event.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['POST'])
    def create_order(self, request):
        """Create a Razorpay order for paid booking"""
        event_id = request.data.get('event')
        num_tickets = request.data.get('number_of_tickets')

        if not event_id or not num_tickets:
            return Response(
                {"detail": "event and number_of_tickets are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            num_tickets = int(num_tickets)
        except (ValueError, TypeError):
            return Response(
                {"detail": "number_of_tickets must be an integer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        event = get_object_or_404(Event, id=event_id)

        if event.status in ("COMPLETED", "CANCELLED"):
            return Response(
                {"detail": f"This event has {event.status.lower()} and tickets are no longer available."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if num_tickets < 1 or num_tickets > event.available_seats:
            return Response(
                {"detail": f"Only {event.available_seats} seats available"},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_price = Decimal(str(event.ticket_price)) * num_tickets
        amount_in_paise = int(total_price * 100)

        if amount_in_paise == 0:
            return Response(
                {"detail": "This is a free event. Use direct booking."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking_reference = f"BK{uuid.uuid4().hex[:8].upper()}"

        order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": booking_reference,
            "notes": {
                "event_id": str(event.id),
                "event_title": event.title,
                "user_id": str(request.user.id),
                "num_tickets": str(num_tickets),
            }
        })

        booking = Booking.objects.create(
            user=request.user,
            event=event,
            number_of_tickets=num_tickets,
            total_price=total_price,
            booking_reference=booking_reference,
            payment_id=order["id"],
            status="PENDING"
        )

        return Response({
            "order_id": order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "booking_reference": booking_reference,
            "key_id": settings.RAZORPAY_KEY_ID,
            "event_title": event.title,
            "user_name": request.user.first_name or request.user.username,
            "user_email": request.user.email,
            "user_phone": request.user.phone_number or "",
        })

    @action(detail=False, methods=['POST'])
    def verify_payment(self, request):
        """Verify Razorpay payment and confirm booking"""
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        booking_reference = request.data.get('booking_reference')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_reference]):
            return Response(
                {"detail": "Missing payment verification data"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = Booking.objects.get(
                booking_reference=booking_reference,
                user=request.user
            )
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if booking.status == "CONFIRMED":
            return Response(
                BookingSerializer(booking).data,
                status=status.HTTP_200_OK
            )

        if booking.status != "PENDING":
            return Response(
                {"detail": "Booking is not in pending state"},
                status=status.HTTP_400_BAD_REQUEST
            )

        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            booking.status = "CANCELLED"
            booking.save()
            return Response(
                {"detail": "Payment verification failed. Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.payment_id = razorpay_payment_id
        booking.status = "CONFIRMED"
        booking.save()

        for i in range(booking.number_of_tickets):
            ticket_number = f"{booking.booking_reference}T{i+1}"
            ticket = Ticket.objects.create(
                booking=booking,
                ticket_number=ticket_number
            )
            ticket.generate_qr_code()

        booking.event.available_seats -= booking.number_of_tickets
        booking.event.save()

        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['GET'])
    def my_bookings(self, request):
        """Get current user's bookings"""
        bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if booking.user != request.user and request.user.role != "ADMIN":
            return Response(
                {"detail": "You don't have permission to cancel this booking"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status == "CANCELLED":
            return Response(
                {"detail": "Booking is already cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Restore available seats
        booking.event.available_seats += booking.number_of_tickets
        booking.event.save()
        
        booking.status = "CANCELLED"
        booking.save()
        
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['GET'])
    def tickets(self, request, pk=None):
        """Get tickets for a booking"""
        booking = self.get_object()
        tickets = booking.tickets.all()
        data = {
            'booking_reference': booking.booking_reference,
            'tickets': [
                {
                    'ticket_number': t.ticket_number,
                    'qr_code': request.build_absolute_uri(t.qr_code.url) if t.qr_code else None,
                    'is_scanned': t.is_scanned,
                    'scanned_at': t.scanned_at
                }
                for t in tickets
            ]
        }
        return Response(data)

    @action(detail=True, methods=['GET'], url_path='download_tickets')
    def download_tickets(self, request, pk=None):
        """Download professional PDF ticket with QR code"""
        booking = self.get_object()
        # Ensure QR codes exist for all tickets (backfill for old bookings)
        for ticket in booking.tickets.all():
            if not ticket.qr_code:
                ticket.generate_qr_code()
        pdf_buffer = generate_ticket_pdf(booking)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        filename = f"tickets_{booking.booking_reference}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    @action(detail=False, methods=['GET'])
    def event_bookings(self, request):
        """Get all bookings for organizer's events (organizer only)"""
        if request.user.role != "ORGANIZER":
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookings = Booking.objects.filter(event__organizer=request.user)
        
        # Filter by event if provided
        event_id = request.query_params.get('event_id')
        if event_id:
            bookings = bookings.filter(event_id=event_id)
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def statistics(self, request):
        """Get booking statistics"""
        if request.user.role == "USER":
            total_bookings = Booking.objects.filter(user=request.user).count()
            confirmed = Booking.objects.filter(user=request.user, status="CONFIRMED").count()
            cancelled = Booking.objects.filter(user=request.user, status="CANCELLED").count()
        elif request.user.role == "ORGANIZER":
            total_bookings = Booking.objects.filter(event__organizer=request.user).count()
            confirmed = Booking.objects.filter(
                event__organizer=request.user, status="CONFIRMED"
            ).count()
            revenue = sum(b.total_price for b in Booking.objects.filter(
                event__organizer=request.user, status="CONFIRMED"
            ))
            return Response({
                'total_bookings': total_bookings,
                'confirmed_bookings': confirmed,
                'revenue': revenue
            })
        elif request.user.role == "ADMIN":
            total_bookings = Booking.objects.count()
            confirmed = Booking.objects.filter(status="CONFIRMED").count()
            cancelled = Booking.objects.filter(status="CANCELLED").count()
        
        return Response({
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed,
            'cancelled_bookings': cancelled
        })
