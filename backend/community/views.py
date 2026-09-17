from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import EventExperience, ExperienceImage, ExperienceLike, ExperienceComment
from .serializers import (
    EventExperienceSerializer, EventExperienceCreateSerializer,
    ExperienceImageSerializer, ExperienceCommentSerializer,
    ExperienceCommentCreateSerializer
)
from events.models import Event
from bookings.models import Booking


class EventExperienceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling post-event experience sharing
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return EventExperience.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return EventExperienceCreateSerializer
        return EventExperienceSerializer

    @action(detail=False, methods=['GET'])
    def event_experiences(self, request):
        """Get all experiences for a specific event"""
        event_id = request.query_params.get('event_id')
        
        if not event_id:
            return Response(
                {"detail": "event_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        experiences = EventExperience.objects.filter(
            event_id=event_id
        ).order_by('-created_at')
        
        serializer = self.get_serializer(
            experiences,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new experience (only for users who attended the event)"""
        event_id = request.data.get('event')
        event = get_object_or_404(Event, id=event_id)
        
        # Check if user has a confirmed booking for this event
        has_booking = Booking.objects.filter(
            user=request.user,
            event=event,
            status='CONFIRMED'
        ).exists()
        
        if not has_booking:
            return Response(
                {"detail": "You must have a confirmed booking to share your experience"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user already shared an experience for this event
        if EventExperience.objects.filter(user=request.user, event=event).exists():
            return Response(
                {"detail": "You have already shared an experience for this event"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Handle uploaded images
        images = request.FILES.getlist('images')
        for image_file in images:
            ExperienceImage.objects.create(
                experience=serializer.instance,
                image=image_file
            )
        
        return Response(
            EventExperienceSerializer(
                serializer.instance,
                context={'request': request}
            ).data,
            status=status.HTTP_201_CREATED
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def like(self, request, pk=None):
        """Like an experience"""
        experience = self.get_object()
        
        like, created = ExperienceLike.objects.get_or_create(
            experience=experience,
            user=request.user
        )
        
        if created:
            experience.likes_count += 1
            experience.save()
            return Response(
                {'status': 'liked', 'likes_count': experience.likes_count},
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {'status': 'already liked', 'likes_count': experience.likes_count}
        )

    @action(detail=True, methods=['POST'])
    def unlike(self, request, pk=None):
        """Unlike an experience"""
        experience = self.get_object()
        
        like = ExperienceLike.objects.filter(
            experience=experience,
            user=request.user
        ).first()
        
        if like:
            like.delete()
            experience.likes_count = max(0, experience.likes_count - 1)
            experience.save()
            return Response({'status': 'unliked', 'likes_count': experience.likes_count})
        
        return Response(
            {'status': 'not liked', 'likes_count': experience.likes_count}
        )

    @action(detail=True, methods=['GET'])
    def comments(self, request, pk=None):
        """Get comments for an experience"""
        experience = self.get_object()
        comments = experience.comments.all().order_by('created_at')
        
        serializer = ExperienceCommentSerializer(
            comments,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def add_comment(self, request, pk=None):
        """Add a comment to an experience (event organizer or attendees only)"""
        experience = self.get_object()
        event = experience.event

        is_organizer = event.organizer == request.user
        has_booking = Booking.objects.filter(
            user=request.user,
            event=event,
            status='CONFIRMED'
        ).exists()

        if not is_organizer and not has_booking:
            return Response(
                {"detail": "Only the event organizer or users who attended the event can reply to experiences."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ExperienceCommentCreateSerializer(
            data=request.data,
            context={
                'request': request,
                'experience_id': experience.id
            }
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                ExperienceCommentSerializer(
                    serializer.instance,
                    context={'request': request}
                ).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def add_image(self, request, pk=None):
        """Add images to an experience"""
        experience = self.get_object()
        
        if experience.user != request.user:
            return Response(
                {"detail": "You can only add images to your own experience"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if 'image' not in request.FILES:
            return Response(
                {"detail": "Image file is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image = ExperienceImage.objects.create(
            experience=experience,
            image=request.FILES['image'],
            caption=request.data.get('caption', '')
        )
        
        serializer = ExperienceImageSerializer(image, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['GET'])
    def user_experiences(self, request):
        """Get current user's experiences"""
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        experiences = EventExperience.objects.filter(user=request.user)
        serializer = self.get_serializer(
            experiences,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
