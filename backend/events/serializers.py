from rest_framework import serializers
from django.utils import timezone

from .models import Category, Event, EventImage, ParticipantRequest, ParticipantResponse


class CategorySerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'created_at', 'updated_at', 'event_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_event_count(self, obj):
        return obj.events.count()


class EventImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = EventImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class EventSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    organizer_name = serializers.CharField(
        source="organizer.username",
        read_only=True,
    )

    organizer_email = serializers.EmailField(
        source="organizer.email",
        read_only=True,
    )

    organizer_first_name = serializers.CharField(
        source="organizer.first_name",
        read_only=True,
    )

    organizer_last_name = serializers.CharField(
        source="organizer.last_name",
        read_only=True,
    )

    organizer_phone = serializers.CharField(
        source="organizer.phone_number",
        read_only=True,
    )

    gallery = EventImageSerializer(
        many=True,
        read_only=True,
    )

    images = EventImageSerializer(
        source="gallery",
        many=True,
        read_only=True,
    )

    booking_count = serializers.SerializerMethodField()
    is_fully_booked = serializers.SerializerMethodField()
    waitlist_count = serializers.SerializerMethodField()

    class Meta:
        model = Event

        fields = [
            'id', 'organizer', 'organizer_name', 'organizer_email',
            'organizer_first_name', 'organizer_last_name', 'organizer_phone',
            'category', 'category_name', 'title', 'description',
            'venue', 'city',
            'latitude', 'longitude', 'start_date', 'end_date', 'start_time',
            'end_time', 'banner', 'ticket_price', 'total_seats', 'available_seats',
            'booking_deadline', 'language', 'what_to_bring',
            'parking_available', 'parking_details', 'wifi_available', 'wifi_details',
            'food_available', 'food_details', 'water_refill_stations',
            'restrooms_available', 'charging_stations', 'wheelchair_accessible',
            'prayer_room', 'certificate_available',
            'status', 'gallery', 'images', 'booking_count', 'is_fully_booked',
            'waitlist_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'available_seats']

    def get_booking_count(self, obj):
        return obj.bookings.filter(status='CONFIRMED').count()

    def get_is_fully_booked(self, obj):
        return obj.available_seats == 0

    def get_waitlist_count(self, obj):
        return obj.waitlist_entries.filter(status='WAITING').count()


class EventCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event

        fields = [
            'category', 'title', 'description', 'venue', 'city',
            'latitude', 'longitude', 'start_date', 'end_date', 'start_time',
            'end_time', 'banner', 'ticket_price', 'total_seats',
            'booking_deadline', 'language', 'what_to_bring',
            'parking_available', 'parking_details', 'wifi_available', 'wifi_details',
            'food_available', 'food_details', 'water_refill_stations',
            'restrooms_available', 'charging_stations', 'wheelchair_accessible',
            'prayer_room', 'certificate_available', 'certificate_template',
        ]

    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        validated_data['available_seats'] = validated_data['total_seats']
        validated_data['status'] = 'PENDING'
        return super().create(validated_data)

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date cannot be before start date.")
        deadline = attrs.get('booking_deadline')
        if deadline:
            import datetime
            from django.utils import timezone
            naive = deadline
            if timezone.is_naive(deadline):
                naive = timezone.make_aware(deadline)
            start_dt = datetime.datetime.combine(
                start_date,
                attrs.get('start_time') or datetime.time.min,
            )
            if timezone.is_naive(start_dt):
                start_dt = timezone.make_aware(start_dt)
            if naive >= start_dt:
                raise serializers.ValidationError(
                    "Booking deadline must be before the event start time."
                )
        return attrs


class EventUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event

        fields = [
            'title', 'description', 'category', 'venue', 'city', 'latitude', 'longitude',
            'start_date', 'end_date', 'start_time', 'end_time', 'banner',
            'ticket_price', 'total_seats', 'status',
            'booking_deadline', 'language', 'what_to_bring',
            'parking_available', 'parking_details', 'wifi_available', 'wifi_details',
            'food_available', 'food_details', 'water_refill_stations',
            'restrooms_available', 'charging_stations', 'wheelchair_accessible',
            'prayer_room', 'certificate_available', 'certificate_template',
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed event view with full information"""

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    organizer_name = serializers.CharField(
        source="organizer.username",
        read_only=True,
    )

    organizer_first_name = serializers.CharField(
        source="organizer.first_name",
        read_only=True,
    )

    organizer_last_name = serializers.CharField(
        source="organizer.last_name",
        read_only=True,
    )

    organizer_email = serializers.EmailField(
        source="organizer.email",
        read_only=True,
    )

    organizer_phone = serializers.CharField(
        source="organizer.phone_number",
        read_only=True,
    )

    organizer_profile_picture = serializers.SerializerMethodField()

    gallery = EventImageSerializer(many=True, read_only=True)
    images = EventImageSerializer(source="gallery", many=True, read_only=True)
    booking_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    is_fully_booked = serializers.SerializerMethodField()
    waitlist_count = serializers.SerializerMethodField()
    user_waitlist_status = serializers.SerializerMethodField()
    has_confirmed_booking = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'organizer_name', 'organizer_first_name',
            'organizer_last_name', 'organizer_email', 'organizer_phone',
            'organizer_profile_picture',
            'category', 'category_name', 'title', 'description', 'venue',
            'city', 'latitude', 'longitude', 'start_date', 'end_date',
            'start_time', 'end_time', 'banner', 'ticket_price', 'total_seats',
            'available_seats', 'booking_deadline', 'language', 'what_to_bring',
            'parking_available', 'parking_details', 'wifi_available', 'wifi_details',
            'food_available', 'food_details', 'water_refill_stations',
            'restrooms_available', 'charging_stations', 'wheelchair_accessible',
            'prayer_room', 'certificate_available',
            'status', 'gallery', 'images', 'booking_count',
            'average_rating', 'is_fully_booked', 'waitlist_count',
            'user_waitlist_status', 'has_confirmed_booking',
            'created_at', 'updated_at'
        ]

    def get_is_fully_booked(self, obj):
        return obj.available_seats == 0

    def get_waitlist_count(self, obj):
        return obj.waitlist_entries.filter(status='WAITING').count()

    def get_user_waitlist_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            entry = obj.waitlist_entries.filter(
                user=request.user
            ).first()
            if entry:
                return {
                    'id': entry.id,
                    'status': entry.status,
                    'position': entry.position,
                }
        return None

    def get_has_confirmed_booking(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from bookings.models import Booking
            return obj.bookings.filter(
                user=request.user,
                status__in=('CONFIRMED', 'PENDING_APPROVAL'),
            ).exists()
        return False

    def get_organizer_profile_picture(self, obj):
        if obj.organizer.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.organizer.profile_picture.url)
        return None

    def get_booking_count(self, obj):
        return obj.bookings.filter(status='CONFIRMED').count()

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg_rating = obj.experiences.aggregate(Avg('rating'))['rating__avg']
        return round(avg_rating, 2) if avg_rating else 0


class ParticipantRequestSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    category = serializers.IntegerField(source="event.category_id", read_only=True)
    category_name = serializers.CharField(source="event.category.name", read_only=True)
    organizer_name = serializers.CharField(source="organizer.username", read_only=True)
    response_count = serializers.SerializerMethodField()

    class Meta:
        model = ParticipantRequest
        fields = [
            'id', 'event', 'event_title', 'category', 'category_name',
            'organizer', 'organizer_name',
            'description', 'required_participants', 'current_participants',
            'deadline', 'status', 'response_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organizer', 'current_participants', 'created_at', 'updated_at']

    def get_response_count(self, obj):
        return obj.responses.count()

    def validate_required_participants(self, value):
        if value < 1:
            raise serializers.ValidationError("Required participants must be at least 1.")
        return value

    def validate_deadline(self, value):
        if value is not None and value < timezone.now():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    def validate_status(self, value):
        return 'OPEN'


class ParticipantResponseSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    request_description = serializers.CharField(source="participant_request.description", read_only=True)
    event_title = serializers.CharField(source="participant_request.event.title", read_only=True)

    class Meta:
        model = ParticipantResponse
        fields = [
            'id', 'participant_request', 'request_description', 'event_title',
            'user', 'user_name', 'message', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
