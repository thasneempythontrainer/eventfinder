from rest_framework import serializers
from .models import EventRequest, EventRequestSupport, EventRequestComment, EventBid


class EventRequestCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = EventRequestComment
        fields = [
            'id', 'user', 'user_username', 'user_profile_picture',
            'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_profile_picture(self, obj):
        if obj.user.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
        return None


class EventRequestListSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    supports_count = serializers.IntegerField(read_only=True)
    bids_count = serializers.IntegerField(read_only=True)
    is_supported_by_user = serializers.SerializerMethodField()

    class Meta:
        model = EventRequest
        fields = [
            'id', 'user', 'user_username', 'title', 'description',
            'category', 'category_name', 'preferred_location',
            'preferred_date', 'preferred_time', 'expected_attendees',
            'budget_min', 'budget_max', 'additional_requirements',
            'status', 'demand_level', 'supports_count', 'bids_count',
            'is_supported_by_user', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'demand_level', 'created_at', 'updated_at']

    def get_is_supported_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.supports.filter(user=request.user).exists()
        return False


class EventBidSerializer(serializers.ModelSerializer):
    organizer_username = serializers.CharField(source='organizer.username', read_only=True)
    organizer_organization = serializers.SerializerMethodField()
    organizer_rating = serializers.SerializerMethodField()
    organizer_events_count = serializers.SerializerMethodField()

    class Meta:
        model = EventBid
        fields = [
            'id', 'request', 'organizer', 'organizer_username',
            'organizer_organization', 'organizer_rating',
            'organizer_events_count',
            'event_plan', 'proposed_date', 'proposed_time', 'venue',
            'ticket_price', 'capacity', 'budget_estimation',
            'benefits_included', 'additional_ideas',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organizer', 'status', 'created_at', 'updated_at']

    def get_organizer_organization(self, obj):
        try:
            return obj.organizer.organizer_profile.organization_name
        except Exception:
            return None

    def get_organizer_rating(self, obj):
        from django.db.models import Avg
        avg = obj.organizer.events.annotate(
            avg_rating=Avg('experiences__rating')
        ).aggregate(avg=Avg('avg_rating'))['avg']
        return round(avg, 2) if avg else 0

    def get_organizer_events_count(self, obj):
        return obj.organizer.events.count()


class EventRequestDetailSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    supports_count = serializers.IntegerField(read_only=True)
    bids_count = serializers.IntegerField(read_only=True)
    is_supported_by_user = serializers.SerializerMethodField()
    comments = EventRequestCommentSerializer(many=True, read_only=True)
    bids = EventBidSerializer(many=True, read_only=True)
    converted_event_id = serializers.IntegerField(source='converted_event.id', read_only=True, default=None)

    class Meta:
        model = EventRequest
        fields = [
            'id', 'user', 'user_username', 'title', 'description',
            'category', 'category_name', 'preferred_location',
            'preferred_date', 'preferred_time', 'expected_attendees',
            'budget_min', 'budget_max', 'additional_requirements',
            'status', 'demand_level', 'supports_count', 'bids_count',
            'is_supported_by_user', 'comments', 'bids',
            'converted_event_id', 'created_at', 'updated_at'
        ]

    def get_is_supported_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.supports.filter(user=request.user).exists()
        return False
