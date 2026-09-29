from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import ValidationError
from django.http import HttpResponse
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from django.utils import timezone as django_timezone
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime

from accounts.models import User
from notifications_app.models import Notification
from .changes import (
    ATTENDEE_RELEVANT_FIELDS,
    FIELD_LABELS,
    build_diff,
    coerce_proposed_value,
    file_name,
)
from .models import (
    Event,
    Category,
    EventImage,
    EventFavorite,
    EventChangeRequest,
    ParticipantRequest,
    ParticipantResponse,
)
from .serializers import (
    EventSerializer, EventDetailSerializer, EventCreateSerializer,
    EventUpdateSerializer, CategorySerializer, EventImageSerializer,
    EventChangeRequestSerializer, ParticipantRequestSerializer,
    ParticipantResponseSerializer,
)


class EventFilter(FilterSet):
    city = CharFilter(field_name='city', lookup_expr='icontains')

    class Meta:
        model = Event
        fields = ['status', 'category']


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing event categories.
    Read access for everyone, write access for admins only.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticatedOrReadOnly()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can create categories.")
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can update categories.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can delete categories.")
        event_count = instance.events.count()
        if event_count > 0:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f"Cannot delete '{instance.name}' — {event_count} event(s) use this category. "
                "Reassign or remove those events first."
            )
        instance.delete()


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
        Event.sync_statuses()
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

    def update(self, request, *args, **kwargs):
        """
        Organizer edits are staged for admin review instead of being applied,
        so the response is a change request rather than the updated event.
        """
        self._change_request = None
        response = super().update(request, *args, **kwargs)
        if getattr(self, '_change_request', None) is not None:
            payload = EventChangeRequestSerializer(
                self._change_request, context={'request': request}
            ).data
            return Response(
                {
                    'detail': 'Your changes were submitted for admin review. '
                              'The event stays live with its current details '
                              'until the request is approved.',
                    'requires_admin_approval': True,
                    'change_request': payload,
                },
                status=status.HTTP_202_ACCEPTED,
            )
        return response

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
            self._queue_organizer_edit(serializer, event)
        else:
            attendee_fields = sorted(
                set(serializer.validated_data) & ATTENDEE_RELEVANT_FIELDS
            )
            serializer.save()
            if attendee_fields:
                readable = ', '.join(
                    FIELD_LABELS.get(field, field.replace('_', ' ').title())
                    for field in attendee_fields
                )
                self._notify_booked_users(
                    event,
                    'EVENT_UPDATE',
                    'Event Details Updated',
                    f'"{event.title}" has been updated. Changed: {readable}. '
                    f'Please review the event page for the latest details.',
                )

    def _queue_organizer_edit(self, serializer, event):
        """
        Organizer edits are never applied straight to the live event. They are
        parked on an EventChangeRequest so an admin can compare before/after and
        approve or reject them.
        """
        user = self.request.user
        validated = dict(serializer.validated_data)

        # An organizer has no business flipping lifecycle state.
        validated.pop('status', None)

        banner = validated.pop('banner', None)
        certificate_template = validated.pop('certificate_template', None)

        previous_data, proposed_data, changes = build_diff(event, validated)

        file_changes = []
        if banner is not None:
            old_name = file_name(getattr(event, 'banner', None))
            if file_name(banner) != old_name:
                file_changes.append(('banner', old_name, file_name(banner)))
        if certificate_template is not None:
            old_name = file_name(getattr(event, 'certificate_template', None))
            if file_name(certificate_template) != old_name:
                file_changes.append(
                    ('certificate_template', old_name, file_name(certificate_template))
                )

        for field, old_name, new_name in file_changes:
            previous_data[field] = old_name
            proposed_data[field] = new_name
            changes.append(
                {
                    'field': field,
                    'label': FIELD_LABELS.get(field, field.replace('_', ' ').title()),
                    'old': old_name or '',
                    'new': new_name or '',
                    'is_file': True,
                }
            )

        if not changes:
            raise ValidationError("No changes detected to submit for review.")

        # Only one open request per event at a time.
        EventChangeRequest.objects.filter(
            event=event, status='PENDING'
        ).update(status='SUPERSEDED')

        change_request = EventChangeRequest.objects.create(
            event=event,
            organizer=user,
            previous_data=previous_data,
            proposed_data=proposed_data,
            changes=changes,
            previous_status=event.status,
            new_banner=banner,
            new_certificate_template=certificate_template,
        )

        admin_users = User.objects.filter(role='ADMIN', is_active=True)
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                notification_type='EVENT_CHANGE_REQUESTED',
                title='Event Update - Review Needed',
                message=(
                    f'{user.get_full_name() or user.username} requested changes to '
                    f'"{event.title}" ({change_request.summary()}). '
                    f'Review the comparison and approve or reject it.'
                ),
                related_event=event,
            )

        self._change_request = change_request

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
        Event.sync_statuses()
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
        Event.sync_statuses()
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
        Event.sync_statuses()
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

        Event.sync_statuses()
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
        Event.sync_statuses()
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

    @action(detail=True, methods=['GET'])
    def analytics(self, request, pk=None):
        """Get detailed analytics for a specific event"""
        event = self.get_object()

        from bookings.models import Booking
        bookings = Booking.objects.filter(event=event)

        confirmed_bookings = bookings.filter(status='CONFIRMED')
        pending_bookings = bookings.filter(status='PENDING')
        cancelled_bookings = bookings.filter(status='CANCELLED')

        confirmed_count = confirmed_bookings.count()
        pending_count = pending_bookings.count()
        cancelled_count = cancelled_bookings.count()

        total_revenue = float(
            sum(b.total_price for b in confirmed_bookings)
        )

        tickets_sold = sum(b.number_of_tickets for b in confirmed_bookings)

        return Response({
            'booking_stats': {
                'confirmed': confirmed_count,
                'pending': pending_count,
                'cancelled': cancelled_count,
                'total': confirmed_count + pending_count + cancelled_count,
            },
            'revenue_stats': {
                'total': total_revenue,
                'average_per_booking': round(total_revenue / confirmed_count, 2) if confirmed_count else 0,
            },
            'ticket_stats': {
                'total_seats': event.total_seats,
                'available_seats': event.available_seats,
                'sold': tickets_sold,
                'occupancy_rate': round((tickets_sold / event.total_seats) * 100, 1) if event.total_seats else 0,
            },
        })

    @action(detail=False, methods=['GET'])
    def statistics(self, request):
        """Get event statistics (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        Event.sync_statuses()
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
    def organizer_analytics(self, request):
        """Get analytics for the logged-in organizer's events"""
        if not request.user.is_authenticated or request.user.role != 'ORGANIZER':
            return Response(
                {"detail": "Only organizers can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        from bookings.models import Booking

        Event.sync_statuses()
        events = Event.objects.filter(organizer=request.user)
        total_events = events.count()
        completed_events = events.filter(status='COMPLETED').count()
        upcoming_events = events.filter(status='UPCOMING').count()

        bookings = Booking.objects.filter(event__organizer=request.user)
        total_bookings = bookings.count()
        confirmed_bookings = bookings.filter(status='CONFIRMED').count()
        cancelled_bookings = bookings.filter(status='CANCELLED').count()
        pending_bookings = bookings.filter(status='PENDING').count()

        total_revenue = float(
            sum(b.total_price for b in bookings.filter(status='CONFIRMED'))
        )

        from community.models import EventExperience
        experience_stats = EventExperience.objects.filter(
            event__organizer=request.user
        ).aggregate(avg_rating=Avg('rating'), total=Count('id'))

        overall_avg_rating = experience_stats['avg_rating'] or 0
        total_experiences = experience_stats['total'] or 0

        positive = EventExperience.objects.filter(event__organizer=request.user, rating__gte=4).count()
        neutral = EventExperience.objects.filter(event__organizer=request.user, rating=3).count()
        negative = EventExperience.objects.filter(event__organizer=request.user, rating__lte=2).count()
        total_sentiment = positive + neutral + negative or 1

        sentiment = {
            'positive': round((positive / total_sentiment) * 100, 1),
            'neutral': round((neutral / total_sentiment) * 100, 1),
            'negative': round((negative / total_sentiment) * 100, 1),
        }

        category_perf = list(
            events.values('category__name')
            .annotate(
                event_count=Count('id'),
                avg_rating=Avg('experiences__rating'),
                booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED')),
            )
            .order_by('-avg_rating')
            .exclude(category__name__isnull=True)[:10]
        )

        for cat in category_perf:
            cat['category'] = cat.pop('category__name') or 'Uncategorized'
            if cat['avg_rating'] is None:
                cat['avg_rating'] = 0

        success_count = events.filter(
            experiences__rating__gte=3.5
        ).distinct().count()
        success_rate = round((success_count / completed_events) * 100) if completed_events > 0 else 0

        return Response({
            'total_events': total_events,
            'completed_events': completed_events,
            'upcoming_events': upcoming_events,
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'cancelled_bookings': cancelled_bookings,
            'pending_bookings': pending_bookings,
            'total_revenue': total_revenue,
            'overall_avg_rating': round(overall_avg_rating, 1),
            'total_experiences': total_experiences,
            'success_rate': success_rate,
            'overall_sentiment': sentiment,
            'category_performance': category_perf,
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

    @staticmethod
    def _notify_booked_users(event, notification_type, title, message):
        """Send a notification to every user with an active booking for an event."""
        from bookings.models import Booking
        user_ids = list(
            Booking.objects.filter(
                event=event,
                status__in=('PENDING', 'PENDING_APPROVAL', 'CONFIRMED'),
            ).values_list('user_id', flat=True).distinct()
        )
        # Never notify the organizer about their own action.
        user_ids = [uid for uid in user_ids if uid != event.organizer_id]
        Notification.objects.bulk_create([
            Notification(
                user_id=uid,
                notification_type=notification_type,
                title=title,
                message=message,
                related_event=event,
            )
            for uid in user_ids
        ])
        return len(user_ids)

    @action(detail=True, methods=['POST'])
    def start_event(self, request, pk=None):
        """Mark an upcoming event as ongoing (organizer only)."""
        event = self.get_object()
        if request.user.role != 'ORGANIZER' or event.organizer != request.user:
            return Response(
                {"detail": "Only the event organizer can start this event"},
                status=status.HTTP_403_FORBIDDEN
            )
        if event.status != 'UPCOMING':
            return Response(
                {"detail": "Only upcoming events can be started"},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.status = 'ONGOING'
        event.save()
        return Response({'status': 'Event started', 'event_status': event.status})

    @action(detail=True, methods=['POST'])
    def end_event(self, request, pk=None):
        """Stop/end an ongoing event unexpectedly (organizer only)."""
        event = self.get_object()
        if request.user.role != 'ORGANIZER' or event.organizer != request.user:
            return Response(
                {"detail": "Only the event organizer can end this event"},
                status=status.HTTP_403_FORBIDDEN
            )
        if event.status != 'ONGOING':
            return Response(
                {"detail": "Only ongoing events can be ended"},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.status = 'COMPLETED'
        event.save()
        return Response({'status': 'Event ended', 'event_status': event.status})

    @action(detail=True, methods=['POST'])
    def cancel_event(self, request, pk=None):
        """Cancel an event and notify all booked users (organizer/admin)."""
        event = self.get_object()
        is_organizer = request.user.role == 'ORGANIZER' and event.organizer == request.user
        if not is_organizer and request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only the event organizer or an admin can cancel this event"},
                status=status.HTTP_403_FORBIDDEN
            )
        if event.status in ('COMPLETED', 'CANCELLED'):
            return Response(
                {"detail": "This event has already ended or been cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.status = 'CANCELLED'
        event.save()
        self._notify_booked_users(
            event,
            'EVENT_CANCELLED',
            'Event Cancelled',
            f'We are sorry to inform you that "{event.title}" has been cancelled. '
            f'Please contact the organizer for refund details.',
        )
        Notification.objects.create(
            user=event.organizer,
            notification_type='EVENT_CANCELLED',
            title='Event Cancelled',
            message=f'Your event "{event.title}" has been cancelled.',
            related_event=event,
        )
        return Response({'status': 'Event cancelled'})

    @action(detail=True, methods=['POST'])
    def postpone_event(self, request, pk=None):
        """Postpone an upcoming event and notify attendees, organizer and admins."""
        event = self.get_object()
        if request.user.role != 'ORGANIZER' or event.organizer != request.user:
            return Response(
                {"detail": "Only the event organizer can postpone this event"},
                status=status.HTTP_403_FORBIDDEN
            )
        if event.status != 'UPCOMING':
            return Response(
                {"detail": "Only upcoming events can be postponed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = (request.data.get('reason') or '').strip()
        new_date = request.data.get('new_start_date')

        event.status = 'POSTPONED'
        event.save()

        attendee_message = (
            f'"{event.title}" has been postponed. A new date and time will be announced '
            f'by the organizer. Your booking remains valid.'
        )
        if new_date:
            attendee_message += f' The new date is expected to be {new_date}.'
        if reason:
            attendee_message += f' Reason: {reason}'

        notified = self._notify_booked_users(
            event,
            'EVENT_POSTPONED',
            'Event Postponed',
            attendee_message,
        )

        organizer_message = (
            f'Your event "{event.title}" has been marked as postponed. '
            f'{notified} booked user(s) were notified.'
        )
        if reason:
            organizer_message += f' Reason given: {reason}'

        Notification.objects.create(
            user=event.organizer,
            notification_type='EVENT_POSTPONED',
            title='Event Postponed',
            message=organizer_message,
            related_event=event,
        )

        for admin in User.objects.filter(role='ADMIN', is_active=True):
            Notification.objects.create(
                user=admin,
                notification_type='EVENT_POSTPONED',
                title='Event Postponed by Organizer',
                message=(
                    f'{event.organizer.get_full_name() or event.organizer.username} '
                    f'postponed "{event.title}". {notified} booked user(s) were notified.'
                    + (f' Reason: {reason}' if reason else '')
                ),
                related_event=event,
            )

        return Response({
            'status': 'Event postponed',
            'event_status': event.status,
            'notified_users': notified,
        })

    @action(detail=True, methods=['GET'])
    def participants_pdf(self, request, pk=None):
        """Export the participant list as a PDF (organizer/admin only)."""
        event = self.get_object()
        if request.user.role != 'ADMIN' and (
            request.user.role != 'ORGANIZER' or event.organizer != request.user
        ):
            return Response(
                {"detail": "Only the event organizer or an admin can export participants"},
                status=status.HTTP_403_FORBIDDEN
            )
        from bookings.models import Booking
        from .participants_pdf import generate_participants_pdf
        bookings = Booking.objects.filter(event=event).order_by('created_at')
        pdf_buffer = generate_participants_pdf(event, bookings)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        filename = f"participants_{event.id}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    @action(detail=True, methods=['GET'])
    def download_certificate(self, request, pk=None):
        """Download a participation certificate (confirmed attendees only)."""
        event = self.get_object()
        if not event.certificate_available:
            return Response(
                {"detail": "No certificate is available for this event"},
                status=status.HTTP_400_BAD_REQUEST
            )
        from bookings.models import Booking
        has_booking = Booking.objects.filter(
            event=event,
            user=request.user,
            status__in=('CONFIRMED', 'PENDING_APPROVAL'),
        ).exists()
        if not has_booking:
            return Response(
                {"detail": "Only confirmed attendees can download a certificate"},
                status=status.HTTP_403_FORBIDDEN
            )
        from .certificate_pdf import generate_certificate_pdf
        template_path = None
        if event.certificate_template:
            try:
                template_path = event.certificate_template.path
            except Exception:
                template_path = None
        pdf_buffer = generate_certificate_pdf(event, request.user, template_path)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        safe_title = ''.join(ch for ch in event.title if ch.isalnum() or ch in (' ', '-')).strip() or 'certificate'
        filename = f"certificate_{safe_title.replace(' ', '_')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    @action(detail=True, methods=['POST'])
    def toggle_favorite(self, request, pk=None):
        """Toggle the authenticated user's favorite for an event"""
        event = self.get_object()
        favorite, created = EventFavorite.objects.get_or_create(
            user=request.user,
            event=event,
        )
        if not created:
            favorite.delete()
        return Response({'is_favorited': created})

    @action(detail=False, methods=['GET'])
    def my_favorites(self, request):
        """Get the authenticated user's favorite events"""
        events = Event.objects.filter(
            favorited_by__user=request.user
        ).annotate(
            booking_count=Count('bookings', filter=Q(bookings__status='CONFIRMED')),
            average_rating=Avg('experiences__rating')
        ).order_by('-favorited_by__created_at')
        serializer = EventSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def pending_changes(self, request, pk=None):
        """The open change request for an event, if any (admin/organizer)."""
        event = self.get_object()
        change_request = EventChangeRequest.objects.filter(
            event=event, status='PENDING'
        ).first()
        if change_request is None:
            return Response({'detail': 'No pending change request for this event'},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = EventChangeRequestSerializer(
            change_request, context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def change_history(self, request, pk=None):
        """Full change history for an event (admin/organizer)."""
        event = self.get_object()
        if request.user.role == 'ORGANIZER' and event.organizer != request.user:
            return Response(
                {"detail": "You can only view the change history of your own events"},
                status=status.HTTP_403_FORBIDDEN
            )
        change_requests = EventChangeRequest.objects.filter(event=event)
        serializer = EventChangeRequestSerializer(
            change_requests, many=True, context={'request': request}
        )
        return Response(serializer.data)


class EventChangeRequestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Organizer edit requests awaiting admin review.

    Admins get the full queue with a before/after comparison and can approve or
    reject. Organizers can only see their own requests to track progress.
    """

    serializer_class = EventChangeRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'event', 'organizer']
    ordering_fields = ['created_at', 'reviewed_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = EventChangeRequest.objects.select_related('event', 'organizer', 'reviewed_by')
        user = self.request.user
        if user.role == 'ADMIN':
            return qs
        if user.role == 'ORGANIZER':
            return qs.filter(organizer=user)
        return qs.none()

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAuthenticated()]
        return super().get_permissions()

    def _get_pending(self, request, pk=None):
        change_request = self.get_object()
        if request.user.role != 'ADMIN':
            raise ValidationError("Only admins can review event change requests.")
        if change_request.status != 'PENDING':
            raise ValidationError(
                f"This request was already {change_request.status.lower()}."
            )
        return change_request

    @action(detail=True, methods=['POST'])
    def approve(self, request, pk=None):
        """Apply an organizer's proposed changes to the live event."""
        change_request = self._get_pending(request, pk)
        event = change_request.event

        applied_fields = []
        for field, value in (change_request.proposed_data or {}).items():
            if field in ('banner', 'certificate_template'):
                continue
            try:
                setattr(event, field, coerce_proposed_value(field, value))
            except Category.DoesNotExist:
                raise ValidationError({field: f"Category '{value}' no longer exists."})

        if change_request.new_banner:
            event.banner = change_request.new_banner
        if change_request.new_certificate_template:
            event.certificate_template = change_request.new_certificate_template

        if 'total_seats' in (change_request.proposed_data or {}):
            event.available_seats = self._recompute_available_seats(event)

        event.status = change_request.previous_status
        event.save()

        change_request.status = 'APPROVED'
        change_request.admin_notes = request.data.get('admin_notes', '')
        change_request.reviewed_by = request.user
        change_request.reviewed_at = django_timezone.now()
        change_request.save(
            update_fields=[
                'status', 'admin_notes', 'reviewed_by', 'reviewed_at', 'updated_at'
            ]
        )

        changed = set(change_request.changed_field_names)
        attendee_facing = sorted(changed & ATTENDEE_RELEVANT_FIELDS)

        Notification.objects.create(
            user=change_request.organizer,
            notification_type='EVENT_CHANGE_APPROVED',
            title='Event Update Approved',
            message=(
                f'Your changes to "{event.title}" were approved by admin '
                f'({change_request.summary()}). The event now reflects the new details.'
            ),
            related_event=event,
        )

        if attendee_facing:
            readable = ', '.join(
                FIELD_LABELS.get(field, field.replace('_', ' ').title())
                for field in attendee_facing
            )
            EventViewSet._notify_booked_users(
                event,
                'EVENT_UPDATE',
                'Event Details Updated',
                f'"{event.title}" has been updated. '
                f'Changed: {readable}. '
                f'Please review the event page for the latest details.',
            )

        return Response({
            'status': 'Change request approved',
            'applied_fields': sorted(changed),
            'attendee_notified_fields': attendee_facing,
            'event': EventSerializer(event, context={'request': request}).data,
        })

    @action(detail=True, methods=['POST'])
    def reject(self, request, pk=None):
        """Reject an organizer's proposed changes; the live event is untouched."""
        change_request = self._get_pending(request, pk)
        event = change_request.event

        change_request.status = 'REJECTED'
        change_request.admin_notes = request.data.get('admin_notes', '')
        change_request.reviewed_by = request.user
        change_request.reviewed_at = django_timezone.now()
        change_request.save(
            update_fields=[
                'status', 'admin_notes', 'reviewed_by', 'reviewed_at', 'updated_at'
            ]
        )

        message = (
            f'Your changes to "{event.title}" were rejected by admin '
            f'({change_request.summary()}). The event is unchanged.'
        )
        if change_request.admin_notes:
            message += f' Reason: {change_request.admin_notes}'

        Notification.objects.create(
            user=change_request.organizer,
            notification_type='EVENT_CHANGE_REJECTED',
            title='Event Update Rejected',
            message=message,
            related_event=event,
        )

        return Response({
            'status': 'Change request rejected',
            'admin_notes': change_request.admin_notes,
        })

    @staticmethod
    def _recompute_available_seats(event):
        from django.db.models import Sum
        from bookings.models import Booking
        booked = Booking.objects.filter(
            event=event, status__in=('CONFIRMED', 'PENDING', 'PENDING_APPROVAL')
        ).aggregate(total=Sum('number_of_tickets'))['total'] or 0
        return max(event.total_seats - booked, 0)

    @action(detail=False, methods=['GET'])
    def pending(self, request):
        """Pending event change requests (admin queue)."""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )
        qs = self.get_queryset().filter(status='PENDING')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class ParticipantRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = ParticipantRequest.objects.all()

        event_id = self.request.query_params.get('event_id')
        status_param = self.request.query_params.get('status')
        category_ids = self.request.query_params.getlist('category')

        if event_id:
            qs = qs.filter(event_id=event_id)
        if status_param:
            qs = qs.filter(status=status_param)
        if category_ids:
            qs = qs.filter(event__category_id__in=category_ids)

        if self.request.user.is_authenticated:
            if self.request.user.role == 'ORGANIZER':
                qs = qs.filter(organizer=self.request.user)
            elif self.request.user.role == 'USER':
                qs = qs.filter(status='OPEN')

        return qs

    def get_serializer_class(self):
        return ParticipantRequestSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'ORGANIZER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only organizers can create participant requests.")

        event_id = self.request.data.get('event')
        event = get_object_or_404(Event, id=event_id)

        if event.organizer != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only create requests for your own events.")

        serializer.save(organizer=user)


class ParticipantResponseViewSet(viewsets.ModelViewSet):
    serializer_class = ParticipantResponseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return ParticipantResponse.objects.all()
        if user.role == 'ORGANIZER':
            return ParticipantResponse.objects.filter(
                participant_request__organizer=user
            )
        return ParticipantResponse.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'USER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only users can respond to participant requests.")

        request_id = self.request.data.get('participant_request')
        participant_request = get_object_or_404(ParticipantRequest, id=request_id)

        if participant_request.status != 'OPEN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("This participant request is no longer open.")

        if ParticipantResponse.objects.filter(
            participant_request=participant_request,
            user=user,
        ).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You have already responded to this request.")

        response = serializer.save(user=user)

        participant_request.current_participants = participant_request.responses.filter(
            status='INTERESTED'
        ).count()
        if participant_request.current_participants >= participant_request.required_participants:
            participant_request.status = 'FULFILLED'
        participant_request.save()

        # Notify organizer
        from notifications_app.models import Notification
        Notification.objects.create(
            user=participant_request.organizer,
            notification_type='PARTICIPANT_RESPONSE',
            title='New Participant Response',
            message=(
                f'{user.username} is interested in participating in '
                f'"{participant_request.event.title}".'
            ),
            related_event=participant_request.event,
        )

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        if instance.participant_request.organizer != user and user.role != 'ADMIN':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only the request organizer can update responses.")

        serializer.save()
