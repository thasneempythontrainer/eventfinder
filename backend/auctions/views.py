from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Count, Q

from .models import EventRequest, EventRequestSupport, EventRequestComment, EventBid
from .serializers import (
    EventRequestListSerializer, EventRequestDetailSerializer,
    EventRequestCommentSerializer, EventBidSerializer,
)
from events.models import Event


class EventRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = EventRequest.objects.annotate(
            supports_count=Count('supports'),
            bids_count=Count('bids'),
        )

        req_status = self.request.query_params.get('status')
        category = self.request.query_params.get('category')
        location = self.request.query_params.get('location')
        search = self.request.query_params.get('search')

        if req_status:
            qs = qs.filter(status=req_status)
        if category:
            qs = qs.filter(category_id=category)
        if location:
            qs = qs.filter(preferred_location__icontains=location)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventRequestDetailSerializer
        if self.action == 'list':
            return EventRequestListSerializer
        return EventRequestListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        qs = EventRequest.objects.annotate(
            supports_count=Count('supports'),
            bids_count=Count('bids'),
        )
        instance = qs.get(pk=instance.pk)
        serializer = EventRequestDetailSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def support(self, request, pk=None):
        event_request = self.get_object()
        support, created = EventRequestSupport.objects.get_or_create(
            request=event_request,
            user=request.user,
        )

        if not created:
            support.delete()
            return Response({
                'status': 'unsupported',
                'support_count': event_request.support_count,
            })

        return Response({
            'status': 'supported',
            'support_count': event_request.support_count,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def add_comment(self, request, pk=None):
        event_request = self.get_object()
        comment_text = request.data.get('comment', '').strip()

        if not comment_text:
            return Response(
                {"detail": "Comment text is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = EventRequestComment.objects.create(
            request=event_request,
            user=request.user,
            comment=comment_text,
        )

        serializer = EventRequestCommentSerializer(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def close_request(self, request, pk=None):
        event_request = self.get_object()

        if event_request.user != request.user and request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only the request creator or admin can close this request"},
                status=status.HTTP_403_FORBIDDEN
            )

        event_request.status = 'CLOSED'
        event_request.save(update_fields=['status', 'updated_at'])
        return Response({"detail": "Request closed successfully"})

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def select_bid(self, request, pk=None):
        event_request = self.get_object()

        if event_request.user != request.user:
            return Response(
                {"detail": "Only the request creator can select a bid"},
                status=status.HTTP_403_FORBIDDEN
            )

        if event_request.status in ('CONVERTED', 'CLOSED'):
            return Response(
                {"detail": "This request is no longer accepting selections"},
                status=status.HTTP_400_BAD_REQUEST
            )

        bid_id = request.data.get('bid_id')
        if not bid_id:
            return Response(
                {"detail": "bid_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            selected_bid = EventBid.objects.get(id=bid_id, request=event_request)
        except EventBid.DoesNotExist:
            return Response(
                {"detail": "Bid not found for this request"},
                status=status.HTTP_404_NOT_FOUND
            )

        EventBid.objects.filter(request=event_request).update(status='REJECTED')
        selected_bid.status = 'SELECTED'
        selected_bid.save(update_fields=['status'])

        event_request.status = 'SELECTED'
        event_request.save(update_fields=['status', 'updated_at'])

        from notifications_app.models import Notification
        Notification.objects.create(
            user=selected_bid.organizer,
            notification_type='EVENT_REQUEST_BID_SELECTED',
            title='Your Bid Was Selected!',
            message=(
                f'Congratulations! Your bid for "{event_request.title}" was selected. '
                f'Please create the event based on your proposal.'
            ),
        )

        return Response({"detail": "Bid selected. Organizer notified."})

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def my_requests(self, request):
        requests = EventRequest.objects.filter(
            user=request.user
        ).annotate(
            supports_count=Count('supports'),
            bids_count=Count('bids'),
        ).order_by('-created_at')

        serializer = EventRequestListSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data)


class EventBidViewSet(viewsets.ModelViewSet):
    serializer_class = EventBidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return EventBid.objects.all()
        if user.role == 'ORGANIZER':
            return EventBid.objects.filter(organizer=user)
        return EventBid.objects.filter(request__user=user)

    def perform_create(self, serializer):
        if self.request.user.role != 'ORGANIZER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only organizers can submit bids")

        event_request = serializer.validated_data['request']

        if event_request.status not in ('OPEN', 'RECEIVING_BIDS'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("This request is not accepting bids")

        if EventBid.objects.filter(
            request=event_request, organizer=self.request.user
        ).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You have already submitted a bid for this request")

        bid = serializer.save(organizer=self.request.user)

        if event_request.status == 'OPEN':
            event_request.status = 'RECEIVING_BIDS'
            event_request.save(update_fields=['status', 'updated_at'])

        from notifications_app.models import Notification
        Notification.objects.create(
            user=event_request.user,
            notification_type='EVENT_REQUEST_BID',
            title='New Bid on Your Event Request',
            message=(
                f'{self.request.user.get_full_name() or self.request.user.username} '
                f'submitted a bid for "{event_request.title}".'
            ),
        )

    @action(detail=False, methods=['GET'])
    def my_bids(self, request):
        bids = EventBid.objects.filter(
            organizer=request.user
        ).select_related('request').order_by('-created_at')

        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def for_request(self, request):
        request_id = request.query_params.get('request_id')
        if not request_id:
            return Response(
                {"detail": "request_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        bids = EventBid.objects.filter(request_id=request_id)
        serializer = self.get_serializer(bids, many=True)
        return Response(serializer.data)
