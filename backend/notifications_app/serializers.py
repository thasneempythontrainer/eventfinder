from rest_framework import serializers
from .models import Notification, EmailNotification, SMSNotification


class EmailNotificationStatusSerializer(serializers.ModelSerializer):
    """Delivery status only.

    The rendered body, recipient address and error text are deliberately not
    exposed here: this serializer is reachable from the user-facing
    /api/notifications/ endpoint, and error_message in particular can contain
    SMTP host details.
    """

    class Meta:
        model = EmailNotification
        fields = ['id', 'status', 'sent_at', 'created_at']
        read_only_fields = fields


class SMSNotificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSNotification
        fields = ['id', 'status', 'sent_at', 'created_at']
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    email_notification = EmailNotificationStatusSerializer(read_only=True)
    sms_notification = SMSNotificationStatusSerializer(read_only=True)
    event_title = serializers.CharField(source='related_event.title', read_only=True, allow_null=True)
    booking_reference = serializers.CharField(source='related_booking.booking_reference', read_only=True, allow_null=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message', 'related_event',
            'event_title', 'related_booking', 'booking_reference', 'is_read',
            'read_at', 'email_notification', 'sms_notification', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'email_notification', 'sms_notification', 'created_at'
        ]


class AdminEmailNotificationSerializer(serializers.ModelSerializer):
    """Full delivery record for the admin/audit use case only."""

    user_email = serializers.EmailField(source='notification.user.email', read_only=True)
    notification_type = serializers.CharField(
        source='notification.notification_type', read_only=True
    )

    class Meta:
        model = EmailNotification
        fields = [
            'id', 'notification', 'notification_type', 'user_email',
            'recipient_email', 'subject', 'body', 'status', 'sent_at',
            'error_message', 'created_at'
        ]
        read_only_fields = fields


class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']
