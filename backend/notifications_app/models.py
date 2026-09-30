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
        ("PROFILE_EDIT_REQUEST", "Profile Edit Request"),
        ("PROFILE_EDIT_APPROVED", "Profile Edit Approved"),
        ("PROFILE_EDIT_REJECTED", "Profile Edit Rejected"),
        ("EVENT_FEEDBACK_REMINDER", "Feedback Reminder"),
        ("FULLY_BOOKED", "Event Fully Booked"),
        ("SEATS_AVAILABLE", "Seats Became Available"),
        ("PARTICIPANT_REQUEST_NEW", "New Participant Request"),
        ("PARTICIPANT_RESPONSE", "New Participant Response"),
        ("EVENT_CANCELLED", "Event Cancelled"),
        ("EVENT_POSTPONED", "Event Postponed"),
        ("EVENT_CHANGE_REQUESTED", "Event Change Requested"),
        ("EVENT_CHANGE_APPROVED", "Event Change Approved"),
        ("EVENT_CHANGE_REJECTED", "Event Change Rejected"),
        ("BOOKING_CONFIRMED", "Booking Confirmed"),
        ("BOOKING_REJECTED", "Booking Rejected"),
        ("WAITLIST_JOINED", "Joined Waitlist"),
        ("WAITLIST_ASSIGNED", "Waitlist Assigned"),
        ("WELCOME", "Welcome"),
        ("ORGANIZER_APPLICATION_RECEIVED", "Organizer Application Received"),
        ("ACCOUNT_LOGIN", "Account Login"),
        ("PASSWORD_RESET_REQUESTED", "Password Reset Requested"),
        ("PASSWORD_CHANGED", "Password Changed"),
        ("ACCOUNT_ACTIVATED", "Account Activated"),
        ("ACCOUNT_DEACTIVATED", "Account Deactivated"),
        ("BOOKING_CANCELLED", "Booking Cancelled"),
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

    # Set on notifications that exist because a human has to act on them, such
    # as admin alerts about cancellations and change requests. These bypass the
    # recipient's email preferences: an admin who switches off "Event updates"
    # to reduce noise must not silently stop learning about events that need
    # refund or compliance follow-up.
    requires_action = models.BooleanField(default=False)
    
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

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SENT = "SENT", "Sent"
        FAILED = "FAILED", "Failed"

    STATUS_CHOICES = Status.choices

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


class EmailPreference(models.Model):
    """
    Per-category opt-out for outbound email.

    A missing row means every category is enabled, so preferences work for
    existing users without a data migration. Transactional categories
    (welcome, password reset) are deliberately not listed here and are always
    delivered.
    """

    CATEGORIES = (
        ("ACCOUNT", "Account activity"),
        ("BOOKINGS", "Bookings and tickets"),
        ("EVENTS", "Event updates"),
        ("ORGANIZER", "Organizer application updates"),
        ("MARKETING", "Promotions and announcements"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_preferences",
    )

    category = models.CharField(max_length=20, choices=CATEGORIES)

    enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "category")

    def __str__(self):
        state = "on" if self.enabled else "off"
        return f"{self.user.username} - {self.category} email {state}"


def user_wants_email(user, category):
    """True unless the user has explicitly switched this category off."""
    if not user or not getattr(user, "email", None):
        return False
    preference = EmailPreference.objects.filter(
        user=user, category=category
    ).first()
    return True if preference is None else preference.enabled
