from rest_framework import serializers
from .models import EventExperience, ExperienceImage, ExperienceLike, ExperienceComment


class ExperienceImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ExperienceImage
        fields = ['id', 'image', 'caption', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class ExperienceCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = ExperienceComment
        fields = [
            'id', 'user', 'user_username', 'user_profile_picture', 'comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_profile_picture(self, obj):
        if obj.user.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
        return None


class EventExperienceSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    comments = ExperienceCommentSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_profile_picture = serializers.SerializerMethodField()
    event_title = serializers.CharField(source='event.title', read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = EventExperience
        fields = [
            'id', 'user', 'user_username', 'user_profile_picture', 'event',
            'event_title', 'title', 'description', 'rating', 'images',
            'comments', 'likes_count', 'is_liked_by_user', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'likes_count', 'created_at', 'updated_at']
    
    def get_images(self, obj):
        images = obj.images.all()
        return ExperienceImageSerializer(
            images, many=True, context=self.context
        ).data

    def get_user_profile_picture(self, obj):
        if obj.user.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
        return None
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.experience_likes.filter(user=request.user).exists()
        return False


class EventExperienceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventExperience
        fields = ['event', 'title', 'description', 'rating']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExperienceCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceComment
        fields = ['comment']
    
    def create(self, validated_data):
        experience_id = self.context['experience_id']
        validated_data['user'] = self.context['request'].user
        validated_data['experience_id'] = experience_id
        return super().create(validated_data)
