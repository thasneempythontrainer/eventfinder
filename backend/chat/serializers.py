from rest_framework import serializers
from .models import ChatRoom, ChatMessage, ChatRoomMember


class ChatMessageSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'user', 'user_username', 'user_profile_picture', 'message',
            'attachment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_profile_picture(self, obj):
        if obj.user.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
        return None


class ChatRoomMemberSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoomMember
        fields = [
            'id', 'user', 'user_username', 'user_profile_picture',
            'joined_at', 'last_seen', 'is_active'
        ]
        read_only_fields = ['id', 'joined_at', 'last_seen']
    
    def get_user_profile_picture(self, obj):
        if obj.user.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_picture.url)
        return None


class ChatRoomSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_banner = serializers.SerializerMethodField()
    messages = ChatMessageSerializer(many=True, read_only=True)
    members = ChatRoomMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'event', 'event_title', 'event_banner', 'messages', 'members',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_event_banner(self, obj):
        if obj.event.banner:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.event.banner.url)
        return None


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['message', 'attachment']
    
    def create(self, validated_data):
        chat_room_id = self.context['chat_room_id']
        validated_data['user'] = self.context['request'].user
        validated_data['chat_room_id'] = chat_room_id
        return super().create(validated_data)
