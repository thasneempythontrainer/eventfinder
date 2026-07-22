import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

from .models import ChatRoom, ChatMessage, ChatRoomMember


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat
    """

    async def connect(self):
        """Handle WebSocket connection"""
        self.event_id = self.scope['url_route']['kwargs']['event_id']
        self.room_group_name = f'chat_{self.event_id}'
        self.user = self.scope["user"]

        # Reject connection if user is not authenticated
        if not self.user or isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Check if user has a confirmed booking
        self.can_send = await self.user_has_booking()

        # Send chat history and permissions to the connecting user
        history = await self.get_chat_history()
        await self.send(json.dumps({
            'type': 'chat_history',
            'messages': history,
            'can_send': self.can_send
        }))

        # Add user to chat room members
        await self.add_user_to_room()

        # Notify others that user joined
        profile_picture = await self.get_profile_picture_url()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'username': self.user.username,
                'user_id': self.user.id,
                'profile_picture': profile_picture
            }
        )

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if not hasattr(self, 'room_group_name'):
            return

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        if self.user and hasattr(self.user, 'is_authenticated') and self.user.is_authenticated:
            # Update user status
            await self.set_user_inactive()

            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'username': self.user.username,
                    'user_id': self.user.id
                }
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket message"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)

        except json.JSONDecodeError:
            await self.send(json.dumps({
                'error': 'Invalid JSON'
            }))

    async def handle_chat_message(self, data):
        """Handle chat message"""
        if not self.can_send:
            await self.send(json.dumps({
                'type': 'error',
                'message': 'Only ticket holders can send messages'
            }))
            return

        message = data.get('message')

        if not message or not message.strip():
            await self.send(json.dumps({
                'type': 'error',
                'message': 'Message cannot be empty'
            }))
            return

        # Save message to database
        await self.save_message(message)

        profile_picture = await self.get_profile_picture_url()

        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': self.user.username,
                'user_id': self.user.id,
                'profile_picture': profile_picture,
                'timestamp': timezone.now().isoformat()
            }
        )

    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'username': self.user.username,
                'user_id': self.user.id,
                'is_typing': is_typing
            }
        )

    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'username': event['username'],
            'user_id': event['user_id'],
            'profile_picture': event['profile_picture'],
            'timestamp': event['timestamp']
        }))

    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(json.dumps({
            'type': 'typing_indicator',
            'username': event['username'],
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))

    async def user_joined(self, event):
        """Notify user joined"""
        await self.send(json.dumps({
            'type': 'user_joined',
            'username': event['username'],
            'user_id': event['user_id'],
            'profile_picture': event['profile_picture']
        }))

    async def user_left(self, event):
        """Notify user left"""
        await self.send(json.dumps({
            'type': 'user_left',
            'username': event['username'],
            'user_id': event['user_id']
        }))

    # Database operations using database_sync_to_async
    @database_sync_to_async
    def get_chat_history(self):
        """Get recent chat messages for the room"""
        try:
            chat_room = ChatRoom.objects.get(event_id=self.event_id)
            messages = chat_room.messages.select_related('user').order_by('-created_at')[:50]
            return [
                {
                    'id': msg.id,
                    'message': msg.message,
                    'username': msg.user.username,
                    'user_id': msg.user.id,
                    'profile_picture': msg.user.profile_picture.url if msg.user.profile_picture else None,
                    'timestamp': msg.created_at.isoformat()
                }
                for msg in reversed(list(messages))
            ]
        except ChatRoom.DoesNotExist:
            return []

    @database_sync_to_async
    def user_has_booking(self):
        """Check if user has a confirmed booking for this event"""
        from bookings.models import Booking
        return Booking.objects.filter(
            user=self.user,
            event_id=self.event_id,
            status='CONFIRMED'
        ).exists()

    @database_sync_to_async
    def save_message(self, message):
        """Save message to database"""
        try:
            chat_room = ChatRoom.objects.get(event_id=self.event_id)
            ChatMessage.objects.create(
                chat_room=chat_room,
                user=self.user,
                message=message
            )
        except ChatRoom.DoesNotExist:
            pass

    @database_sync_to_async
    def add_user_to_room(self):
        """Add user to chat room members"""
        try:
            chat_room, created = ChatRoom.objects.get_or_create(event_id=self.event_id)
            ChatRoomMember.objects.get_or_create(
                chat_room=chat_room,
                user=self.user,
                defaults={'is_active': True}
            )
        except Exception as e:
            print(f"Error adding user to room: {e}")

    @database_sync_to_async
    def set_user_inactive(self):
        """Set user as inactive in chat room"""
        try:
            chat_room = ChatRoom.objects.get(event_id=self.event_id)
            member = ChatRoomMember.objects.filter(
                chat_room=chat_room,
                user=self.user
            ).first()
            if member:
                member.is_active = False
                member.save()
        except ChatRoom.DoesNotExist:
            pass

    @database_sync_to_async
    def get_profile_picture_url(self):
        """Get user's profile picture URL"""
        if self.user.profile_picture:
            return self.user.profile_picture.url
        return None
