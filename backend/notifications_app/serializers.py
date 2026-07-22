from rest_framework import serializers
from .models import Notification, EmailNotification, SMSNotification


class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = [
            'id', 'recipient_email', 'subject', 'body', 'status', 'sent_at',
            'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SMSNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSNotification
        fields = [
            'id', 'phone_number', 'message', 'status', 'sent_at', 'provider',
            'provider_message_id', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    email_notification = EmailNotificationSerializer(read_only=True)
    sms_notification = SMSNotificationSerializer(read_only=True)
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


class NotificationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['is_read']
