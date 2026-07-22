from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta

from accounts.models import User
from notifications_app.models import Notification
from .models import Event, Category, EventImage
from .serializers import (
    EventSerializer, EventDetailSerializer, EventCreateSerializer,
    EventUpdateSerializer, CategorySerializer, EventImageSerializer
)


class EventFilter(FilterSet):
    city = CharFilter(field_name='city', lookup_expr='icontains')

    class Meta:
        model = Event
        fields = ['status', 'category']


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing event categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class EventImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing event images
    """
    serializer_class = EventImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        event_id = self.request.query_params.get('event_id')
        if event_id:
            return EventImage.objects.filter(event_id=event_id)
        return EventImage.objects.all()

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        event = get_object_or_404(Event, id=event_id)
        
        # Check if user is the organizer
        if event.organizer != self.request.user:
            raise PermissionError("You can only upload images to your own events")
        
        serializer.save()


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing events
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'venue', 'city']
    ordering_fields = ['start_date', 'created_at', 'ticket_price', 'booking_count', 'average_rating']
    ordering = ['-created_at']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Event.objects.all().annotate(
            booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED')),
            average_rating=Avg('experiences__rating')
        )
        if self.request.user.is_authenticated and self.request.user.role == 'ADMIN':
            return qs
        if self.request.user.is_authenticated and self.request.user.role == 'ORGANIZER':
            return qs
        return qs.exclude(status='PENDING')

    def get_serializer_class(self):
        if self.action == 'create':
            return EventCreateSerializer
        elif self.action in ('partial_update', 'update'):
            return EventUpdateSerializer
        elif self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'ORGANIZER':
            try:
                profile = user.organizer_profile
                if profile.approval_status != 'APPROVED':
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied(
                        "Your organizer account has not been approved yet. "
                        "Please wait for admin approval before creating events."
                    )
            except Exception:
                pass
        event = serializer.save(organizer=user)

        if user.role == 'ORGANIZER':
            admin_users = User.objects.filter(role='ADMIN', is_active=True)
            for admin in admin_users:
                Notification.objects.create(
                    user=admin,
                    notification_type='EVENT_APPROVED',
                    title='New Event Requires Approval',
                    message=f'{user.get_full_name() or user.username} created event "{event.title}" and it requires approval.',
                    related_event=event,
                )

    def perform_update(self, serializer):
        event = serializer.instance
        user = self.request.user
        if user.role == 'ORGANIZER' and event.organizer != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own events.")
        if event.status in ('ONGOING', 'COMPLETED'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot edit events that are ongoing or completed.")
        if user.role == 'ORGANIZER':
            serializer.save(status='PENDING')
            admin_users = User.objects.filter(role='ADMIN', is_active=True)
            for admin in admin_users:
                Notification.objects.create(
                    user=admin,
                    notification_type='EVENT_APPROVED',
                    title='Event Updated - Re-approval Needed',
                    message=f'{user.get_full_name() or user.username} updated event "{event.title}" and it requires re-approval.',
                    related_event=event,
                )
        else:
            serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role == 'ORGANIZER' and instance.organizer != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own events.")
        if instance.status in ('ONGOING', 'COMPLETED'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot delete events that are ongoing or completed.")
        from bookings.models import Booking
        has_bookings = Booking.objects.filter(event=instance).exists()
        if has_bookings and user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot delete an event that has bookings. Only an admin can delete this event.")
        instance.delete()

    @action(detail=False, methods=['GET'])
    def upcoming(self, request):
        """Get upcoming events"""
        today = datetime.now().date()
        events = Event.objects.filter(
            status='UPCOMING',
            start_date__gte=today
        ).order_by('start_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def ongoing(self, request):
        """Get ongoing events"""
        today = datetime.now().date()
        events = Event.objects.filter(
            Q(status='ONGOING') | (
                Q(status='UPCOMING') &
                Q(start_date__lte=today) &
                Q(end_date__gte=today)
            )
        ).order_by('start_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def completed(self, request):
        """Get completed events"""
        today = datetime.now().date()
        events = Event.objects.filter(
            Q(status='COMPLETED') | (Q(end_date__lt=today))
        ).order_by('-end_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_events(self, request):
        """Get current user's events (organizer only)"""
        if request.user.role != 'ORGANIZER':
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        events = Event.objects.filter(organizer=request.user).order_by('-created_at')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def nearby(self, request):
        """Get nearby events based on latitude/longitude"""
        lat = request.query_params.get('latitude')
        lon = request.query_params.get('longitude')
        radius = request.query_params.get('radius', 10)  # km
        
        if not lat or not lon:
            return Response(
                {"detail": "latitude and longitude query parameters are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lat = float(lat)
            lon = float(lon)
            radius = float(radius)
        except ValueError:
            return Response(
                {"detail": "Invalid latitude, longitude, or radius values"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple distance calculation (for production use PostGIS)
        # This uses the Haversine formula approximation
        events = Event.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__range=(lat - radius/111, lat + radius/111),
            longitude__range=(lon - radius/111, lon + radius/111)
        ).order_by('start_date')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def trending(self, request):
        """Get trending events (most bookings)"""
        events = Event.objects.filter(
            status='UPCOMING'
        ).annotate(
            booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED'))
        ).order_by('-booking_count')[:10]
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def top_rated(self, request):
        """Get top rated events"""
        events = Event.objects.annotate(
            average_rating=Avg('experiences__rating')
        ).filter(
            average_rating__isnull=False,
            experiences__isnull=False
        ).order_by('-average_rating')[:10]
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def upload_images(self, request, pk=None):
        """Upload multiple images for an event"""
        event = self.get_object()
        
        if event.organizer != request.user:
            return Response(
                {"detail": "You can only upload images to your own events"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if 'images' not in request.FILES:
            return Response(
                {"detail": "images field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        images = request.FILES.getlist('images')
        created_images = []
        
        for image in images:
            event_image = EventImage.objects.create(
                event=event,
                image=image
            )
            created_images.append(event_image)
        
        serializer = EventImageSerializer(created_images, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['GET'])
    def gallery(self, request, pk=None):
        """Get event gallery"""
        event = self.get_object()
        images = event.gallery.all()
        
        serializer = EventImageSerializer(images, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def statistics(self, request):
        """Get event statistics (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        total_events = Event.objects.count()
        upcoming_events = Event.objects.filter(
            status='UPCOMING',
            start_date__gte=datetime.now().date()
        ).count()
        total_bookings = 0
        
        from bookings.models import Booking
        total_revenue = sum(
            b.total_price for b in Booking.objects.filter(status='CONFIRMED')
        )
        
        return Response({
            'total_events': total_events,
            'upcoming_events': upcoming_events,
            'total_revenue': float(total_revenue)
        })

    @action(detail=False, methods=['GET'])
    def pending_approval(self, request):
        """Get events pending admin approval (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        events = Event.objects.filter(status='PENDING').annotate(
            booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED')),
            average_rating=Avg('experiences__rating')
        ).order_by('-created_at')
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def approve_event(self, request, pk=None):
        """Approve a pending event (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        event = self.get_object()
        if event.status != 'PENDING':
            return Response(
                {"detail": "Only pending events can be approved"},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.status = 'UPCOMING'
        event.save()

        from notifications_app.models import Notification
        Notification.objects.create(
            user=event.organizer,
            notification_type='EVENT_APPROVED',
            title='Event Approved',
            message=(
                f'Your event "{event.title}" has been approved by admin '
                f'and is now live. Users can now see and book tickets.'
            ),
            related_event=event
        )

        return Response({'status': 'Event approved successfully'})

    @action(detail=True, methods=['POST'])
    def reject_event(self, request, pk=None):
        """Reject a pending event (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        event = self.get_object()
        if event.status != 'PENDING':
            return Response(
                {"detail": "Only pending events can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.status = 'CANCELLED'
        event.save()

        from notifications_app.models import Notification
        Notification.objects.create(
            user=event.organizer,
            notification_type='EVENT_REJECTED',
            title='Event Rejected',
            message=(
                f'Your event "{event.title}" has been rejected by admin. '
                f'Please review and create a new event.'
            ),
            related_event=event
        )

        return Response({'status': 'Event rejected'})
