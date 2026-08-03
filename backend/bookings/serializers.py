from rest_framework import serializers
from .models import Booking, Ticket, WaitlistEntry


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'qr_code', 'is_scanned', 'scanned_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BookingEventSerializer(serializers.ModelSerializer):
    """Minimal event info nested inside booking"""
    class Meta:
        from events.models import Event
        model = Event
        fields = [
            'id', 'title', 'start_date', 'end_date', 'start_time', 'end_time',
            'venue', 'city', 'ticket_price', 'banner', 'status'
        ]


class BookingSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_start_date = serializers.DateField(source='event.start_date', read_only=True)
    event_city = serializers.CharField(source='event.city', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True, allow_null=True)
    event = BookingEventSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_name', 'user_email', 'user_phone', 'event', 'event_title', 'event_start_date',
            'event_city', 'number_of_tickets', 'total_price', 'status',
            'booking_reference', 'payment_id', 'tickets', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_reference', 'created_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['event', 'number_of_tickets', 'total_price']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']


class WaitlistEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_start_date = serializers.DateField(source='event.start_date', read_only=True)

    class Meta:
        model = WaitlistEntry
        fields = [
            'id', 'event', 'event_title', 'event_start_date',
            'user', 'user_name', 'user_full_name', 'user_email', 'user_phone',
            'status', 'position', 'created_at',
        ]
        read_only_fields = ['id', 'status', 'position', 'created_at']

    def get_user_full_name(self, obj):
        return obj.user.get_full_name()
