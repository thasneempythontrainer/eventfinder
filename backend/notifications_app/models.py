from django.db import models
from django.conf import settings
from events.models import Event
from bookings.models import Booking


class Notification(models.Model):
    """
    Model to track all notifications sent to users
    """
    
    NOTIFICATION_TYPES = (
        ("BOOKING_CONFIRMATION", "Booking Confirmation"),
        ("BOOKING_REMINDER", "Booking Reminder"),
        ("EVENT_UPDATE", "Event Update"),
        ("ORGANIZER_APPROVAL", "Organizer Approval"),
        ("ORGANIZER_REJECTED", "Organizer Rejected"),
        ("EVENT_APPROVED", "Event Approved"),
        ("EVENT_REJECTED", "Event Rejected"),
        ("NEW_EXPERIENCE", "New Experience"),
        ("CHAT_MESSAGE", "Chat Message"),
        ("PAYMENT_SUCCESS", "Payment Success"),
        ("PAYMENT_FAILED", "Payment Failed"),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )
    
    title = models.CharField(max_length=200)
    
    message = models.TextField()
    
    related_event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="notifications",
        blank=True,
        null=True
    )
    
    related_booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="notifications",
        blank=True,
        null=True
    )
    
    is_read = models.BooleanField(default=False)
    
    read_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["is_read", "user"]),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type}"


class EmailNotification(models.Model):
    """
    Model to track email notifications
    """
    
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SENT", "Sent"),
        ("FAILED", "Failed"),
    )
    
    notification = models.OneToOneField(
        Notification,
        on_delete=models.CASCADE,
        related_name="email_notification"
    )
    
    recipient_email = models.EmailField()
    
    subject = models.CharField(max_length=255)
    
    body = models.TextField()
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    
    sent_at = models.DateTimeField(blank=True, null=True)
    
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
        ]
    
    def __str__(self):
        return f"Email to {self.recipient_email} - {self.status}"


class SMSNotification(models.Model):
    """
    Model to track SMS notifications
    """
    
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SENT", "Sent"),
        ("FAILED", "Failed"),
    )
    
    notification = models.OneToOneField(
        Notification,
        on_delete=models.CASCADE,
        related_name="sms_notification"
    )
    
    phone_number = models.CharField(max_length=15)
    
    message = models.CharField(max_length=160)
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    
    sent_at = models.DateTimeField(blank=True, null=True)
    
    provider = models.CharField(
        max_length=50,
        blank=True
    )
    
    provider_message_id = models.CharField(
        max_length=255,
        blank=True
    )
    
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
        ]
    
    def __str__(self):
        return f"SMS to {self.phone_number} - {self.status}"
