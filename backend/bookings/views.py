from django.db.models import Q
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import uuid
from datetime import datetime

from .models import Booking, Ticket
from .serializers import BookingSerializer, BookingCreateSerializer, BookingUpdateSerializer
from events.models import Event
from .ticket_pdf import generate_ticket_pdf


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
        """Create a new booking"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        event = get_object_or_404(Event, id=request.data.get('event'))
        
        # Block booking for completed or cancelled events
        if event.status in ("COMPLETED", "CANCELLED"):
            return Response(
                {"detail": f"This event has {event.status.lower()} and tickets are no longer available."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        num_tickets = serializer.validated_data.get('number_of_tickets')
        
        # Check available seats
        if num_tickets > event.available_seats:
            return Response(
                {"detail": f"Only {event.available_seats} seats available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate booking reference
        booking_reference = f"BK{uuid.uuid4().hex[:8].upper()}"
        
        # Create booking
        booking = Booking.objects.create(
            user=request.user,
            event=event,
            number_of_tickets=num_tickets,
            total_price=serializer.validated_data.get('total_price'),
            booking_reference=booking_reference,
            status="CONFIRMED"
        )
        
        # Generate tickets with QR codes
        for i in range(num_tickets):
            ticket_number = f"{booking_reference}T{i+1}"
            ticket = Ticket.objects.create(
                booking=booking,
                ticket_number=ticket_number
            )
            ticket.generate_qr_code()
        
        # Update available seats
        event.available_seats -= num_tickets
        event.save()
        
        # Trigger notification (will implement with Celery)
        # send_booking_confirmation.delay(booking.id)
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
