from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta

from events.models import Event
from bookings.models import Booking
from community.models import EventExperience
from accounts.models import User, OrganizerProfile
from notifications_app.models import Notification


class AdminDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for admin dashboard statistics
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get admin dashboard overview"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get statistics
        Event.sync_statuses()
        today = timezone.now().date()
        thirty_days_ago = timezone.now() - timedelta(days=30)

        stats = {
            'total_events': Event.objects.count(),
            'upcoming_events': Event.objects.filter(
                status='UPCOMING',
                start_date__gte=today
            ).count(),
            'completed_events': Event.objects.filter(
                status='COMPLETED'
            ).count(),
            'total_users': User.objects.count(),
            'total_organizers': OrganizerProfile.objects.filter(
                approval_status='APPROVED'
            ).count(),
            'pending_organizers': OrganizerProfile.objects.filter(
                approval_status='PENDING'
            ).count(),
            'total_bookings': Booking.objects.count(),
            'confirmed_bookings': Booking.objects.filter(
                status='CONFIRMED'
            ).count(),
            'cancelled_bookings': Booking.objects.filter(
                status='CANCELLED'
            ).count(),
            'total_revenue': float(
                sum(b.total_price for b in Booking.objects.filter(
                    status='CONFIRMED'
                ))
            ),
            'revenue_this_month': float(
                sum(b.total_price for b in Booking.objects.filter(
                    status='CONFIRMED',
                    created_at__gte=thirty_days_ago
                ))
            ),
            'average_ticket_price': 0,
            'total_experiences': EventExperience.objects.count(),
            'average_rating': 0,
        }

        # Calculate average ratings
        avg_rating = EventExperience.objects.aggregate(Avg('rating'))['rating__avg']
        stats['average_rating'] = round(avg_rating, 2) if avg_rating else 0

        # Calculate average ticket price
        avg_price = Booking.objects.aggregate(Avg('total_price'))['total_price__avg']
        stats['average_ticket_price'] = round(avg_price, 2) if avg_price else 0

        return Response(stats)

    @action(detail=False, methods=['GET'])
    def revenue_breakdown(self, request):
        """Get revenue breakdown by event"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        events = Event.objects.annotate(
            total_revenue=Sum(
                'bookings__total_price',
                filter=Q(bookings__status='CONFIRMED')
            ),
            booking_count=Count(
                'bookings',
                filter=Q(bookings__status='CONFIRMED')
            )
        ).filter(total_revenue__isnull=False).order_by('-total_revenue')[:10]

        data = [
            {
                'event_id': e.id,
                'event_title': e.title,
                'revenue': float(e.total_revenue or 0),
                'bookings': e.booking_count,
            }
            for e in events
        ]

        return Response(data)

    @action(detail=False, methods=['GET'])
    def recent_bookings(self, request):
        """Get recent bookings"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        bookings = Booking.objects.select_related('user', 'event').order_by(
            '-created_at'
        )[:20]

        data = [
            {
                'booking_id': b.id,
                'booking_reference': b.booking_reference,
                'user_name': b.user.username,
                'event_title': b.event.title,
                'amount': float(b.total_price),
                'status': b.status,
                'created_at': b.created_at,
            }
            for b in bookings
        ]

        return Response(data)

    @action(detail=False, methods=['GET'])
    def pending_approvals(self, request):
        """Get pending organizer approvals"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        pending = OrganizerProfile.objects.filter(
            approval_status='PENDING'
        ).select_related('user').order_by('created_at')

        data = [
            {
                'profile_id': p.id,
                'user_id': p.user.id,
                'username': p.user.username,
                'organization_name': p.organization_name,
                'government_id': p.government_id.url if p.government_id else None,
                'created_at': p.created_at,
            }
            for p in pending
        ]

        return Response(data)


class OrganizerDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for organizer dashboard
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get organizer dashboard overview"""
        if request.user.role != 'ORGANIZER':
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.now().date()
        thirty_days_ago = timezone.now() - timedelta(days=30)

        Event.sync_statuses()
        events = Event.objects.filter(organizer=request.user)

        stats = {
            'total_events': events.count(),
            'upcoming_events': events.filter(
                status='UPCOMING',
                start_date__gte=today
            ).count(),
            'completed_events': events.filter(status='COMPLETED').count(),
            'total_bookings': Booking.objects.filter(
                event__organizer=request.user,
                status='CONFIRMED'
            ).count(),
            'total_revenue': float(
                sum(b.total_price for b in Booking.objects.filter(
                    event__organizer=request.user,
                    status='CONFIRMED'
                ))
            ),
            'revenue_this_month': float(
                sum(b.total_price for b in Booking.objects.filter(
                    event__organizer=request.user,
                    status='CONFIRMED',
                    created_at__gte=thirty_days_ago
                ))
            ),
            'total_reviews': EventExperience.objects.filter(
                event__organizer=request.user
            ).count(),
            'average_rating': 0,
        }

        # Calculate average rating
        avg_rating = EventExperience.objects.filter(
            event__organizer=request.user
        ).aggregate(Avg('rating'))['rating__avg']
        stats['average_rating'] = round(avg_rating, 2) if avg_rating else 0

        return Response(stats)

    @action(detail=False, methods=['GET'])
    def my_events(self, request):
        """Get organizer's events with statistics"""
        if request.user.role != 'ORGANIZER':
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        Event.sync_statuses()
        events = Event.objects.filter(organizer=request.user).annotate(
            booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED')),
            revenue=Sum(
                'bookings__total_price',
                filter=Q(bookings__status='CONFIRMED')
            ),
            average_rating=Avg('experiences__rating')
        ).order_by('-created_at')

        data = [
            {
                'event_id': e.id,
                'title': e.title,
                'status': e.status,
                'start_date': e.start_date,
                'bookings': e.booking_count,
                'revenue': float(e.revenue or 0),
                'average_rating': round(e.average_rating, 2) if e.average_rating else 0,
            }
            for e in events
        ]

        return Response(data)

    @action(detail=False, methods=['GET'])
    def recent_bookings(self, request):
        """Get recent bookings for organizer's events"""
        if request.user.role != 'ORGANIZER':
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        bookings = Booking.objects.filter(
            event__organizer=request.user
        ).select_related('user', 'event').order_by('-created_at')[:20]

        data = [
            {
                'booking_id': b.id,
                'booking_reference': b.booking_reference,
                'user_name': b.user.username,
                'event_title': b.event.title,
                'tickets': b.number_of_tickets,
                'amount': float(b.total_price),
                'status': b.status,
                'created_at': b.created_at,
            }
            for b in bookings
        ]

        return Response(data)


class UserDashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for user dashboard
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get user dashboard overview"""
        if request.user.role != 'USER':
            return Response(
                {"detail": "Only regular users can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.now().date()

        bookings = Booking.objects.filter(user=request.user)

        stats = {
            'total_bookings': bookings.count(),
            'upcoming_events': bookings.filter(
                event__start_date__gte=today,
                status='CONFIRMED'
            ).count(),
            'past_events': bookings.filter(
                event__start_date__lt=today,
                status='CONFIRMED'
            ).count(),
            'total_spent': float(
                sum(b.total_price for b in bookings.filter(status='CONFIRMED'))
            ),
            'unread_notifications': Notification.objects.filter(
                user=request.user,
                is_read=False
            ).count(),
            'experiences_shared': EventExperience.objects.filter(
                user=request.user
            ).count(),
        }

        return Response(stats)

    @action(detail=False, methods=['GET'])
    def upcoming_events(self, request):
        """Get user's upcoming events"""
        if request.user.role != 'USER':
            return Response(
                {"detail": "Only regular users can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.now().date()

        events = Event.objects.filter(
            bookings__user=request.user,
            bookings__status='CONFIRMED',
            start_date__gte=today
        ).distinct().order_by('start_date')[:10]

        from events.serializers import EventSerializer
        serializer = EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def past_events(self, request):
        """Get user's past events"""
        if request.user.role != 'USER':
            return Response(
                {"detail": "Only regular users can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        today = timezone.now().date()

        events = Event.objects.filter(
            bookings__user=request.user,
            bookings__status='CONFIRMED',
            start_date__lt=today
        ).distinct().order_by('-start_date')[:10]

        from events.serializers import EventSerializer
        serializer = EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_bookings(self, request):
        """Get user's bookings"""
        if request.user.role != 'USER':
            return Response(
                {"detail": "Only regular users can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        bookings = Booking.objects.filter(user=request.user).select_related(
            'event'
        ).order_by('-created_at')

        from bookings.serializers import BookingSerializer
        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return Response(serializer.data)
