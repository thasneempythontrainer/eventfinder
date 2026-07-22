from django.db import models
from django.conf import settings
from events.models import Event


class ChatRoom(models.Model):
    """
    Model for event chat rooms
    """
    
    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name="chat_room"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"Chat - {self.event.title}"


class ChatMessage(models.Model):
    """
    Model for individual chat messages in a room
    """
    
    chat_room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages"
    )
    
    message = models.TextField()
    
    attachment = models.FileField(
        upload_to="chat_attachments/",
        blank=True,
        null=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["chat_room", "created_at"]),
        ]
    
    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"


class ChatRoomMember(models.Model):
    """
    Track chat room members and their status
    """
    
    chat_room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="members"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_rooms"
    )
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    last_seen = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ("chat_room", "user")
        ordering = ["-last_seen"]
    
    def __str__(self):
        return f"{self.user.username} - {self.chat_room.event.title}"
