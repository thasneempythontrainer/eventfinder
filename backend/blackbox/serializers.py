from rest_framework import serializers
from .models import EventFeedback, EventBlackBoxReport


class EventFeedbackSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = EventFeedback
        fields = [
            'id', 'event', 'user', 'user_username', 'event_title',
            'rating', 'positive_feedback', 'problems', 'suggestions',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class EventFeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventFeedback
        fields = ['event', 'rating', 'positive_feedback', 'problems', 'suggestions']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BlackBoxReportSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.start_date', read_only=True)
    event_category = serializers.SerializerMethodField()
    organizer_name = serializers.SerializerMethodField()

    class Meta:
        model = EventBlackBoxReport
        fields = [
            'id', 'event', 'event_title', 'event_date', 'event_category',
            'organizer_name',
            'expected_attendees', 'actual_attendees', 'total_feedbacks',
            'average_rating', 'sentiment_positive', 'sentiment_neutral',
            'sentiment_negative', 'success_factors', 'problems_found',
            'recommendations', 'category_stats',
            'generated_at', 'updated_at'
        ]

    def get_event_category(self, obj):
        return getattr(obj.event.category, 'name', None)

    def get_organizer_name(self, obj):
        user = obj.event.organizer
        return user.get_full_name() or user.username
