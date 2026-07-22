from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import ChatRoom, ChatMessage, ChatRoomMember
from .serializers import ChatRoomSerializer, ChatMessageSerializer, ChatMessageCreateSerializer
from events.models import Event


class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing event chat rooms
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'event_id'

    def get_queryset(self):
        return ChatRoom.objects.all()

    @action(detail=False, methods=['GET'])
    def event_chat(self, request):
        """Get or create chat room for an event"""
        event_id = request.query_params.get('event_id')
        
        if not event_id:
            return Response(
                {"detail": "event_id query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event = get_object_or_404(Event, id=event_id)
        chat_room, created = ChatRoom.objects.get_or_create(event=event)
        
        # Add user to chat room members if not already a member
        ChatRoomMember.objects.get_or_create(
            chat_room=chat_room,
            user=request.user
        )
        
        serializer = self.get_serializer(chat_room)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def messages(self, request, event_id=None):
        """Get messages for a chat room"""
        chat_room = get_object_or_404(ChatRoom, event_id=event_id)
        
        messages = chat_room.messages.all().order_by('created_at')
        
        # Pagination support
        limit = request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except ValueError:
            limit = 50
        
        messages = messages[:limit]
        
        serializer = ChatMessageSerializer(
            messages,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def send_message(self, request, event_id=None):
        """Send a message to chat room"""
        chat_room = get_object_or_404(ChatRoom, event_id=event_id)
        
        # Ensure user is a member
        member, created = ChatRoomMember.objects.get_or_create(
            chat_room=chat_room,
            user=request.user
        )
        
        serializer = ChatMessageCreateSerializer(
            data=request.data,
            context={
                'request': request,
                'chat_room_id': chat_room.id
            }
        )
        
        if serializer.is_valid():
            message = serializer.save()
            return Response(
                ChatMessageSerializer(message, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['GET'])
    def members(self, request, event_id=None):
        """Get chat room members"""
        chat_room = get_object_or_404(ChatRoom, event_id=event_id)
        
        members = chat_room.members.all().order_by('-last_seen')
        
        from .serializers import ChatRoomMemberSerializer
        serializer = ChatRoomMemberSerializer(
            members,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def join(self, request, event_id=None):
        """Join a chat room"""
        chat_room = get_object_or_404(ChatRoom, event_id=event_id)
        
        member, created = ChatRoomMember.objects.get_or_create(
            chat_room=chat_room,
            user=request.user,
            defaults={'is_active': True}
        )
        
        if not created:
            member.is_active = True
            member.save()
        
        from .serializers import ChatRoomMemberSerializer
        serializer = ChatRoomMemberSerializer(member, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def leave(self, request, event_id=None):
        """Leave a chat room"""
        chat_room = get_object_or_404(ChatRoom, event_id=event_id)
        
        member = ChatRoomMember.objects.filter(
            chat_room=chat_room,
            user=request.user
        ).first()
        
        if member:
            member.is_active = False
            member.save()
        
        return Response({'status': 'left chat room'})
