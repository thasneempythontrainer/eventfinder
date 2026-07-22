from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import Notification, EmailNotification, SMSNotification
from .serializers import NotificationSerializer, NotificationUpdateSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and managing notifications
    """
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['POST'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        
        if notification.is_read:
            return Response({'status': 'already read'})
        
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['POST'])
    def mark_all_as_read(self, request):
        """Mark all user notifications as read"""
        unread = Notification.objects.filter(
            user=request.user,
            is_read=False
        )
        
        count = unread.count()
        unread.update(is_read=True, read_at=timezone.now())
        
        return Response({
            'status': 'success',
            'marked_as_read': count
        })

    @action(detail=False, methods=['GET'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).order_by('-created_at')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({'unread_count': count})

    @action(detail=False, methods=['GET'])
    def by_type(self, request):
        """Get notifications by type"""
        notification_type = request.query_params.get('type')
        
        if not notification_type:
            return Response(
                {"detail": "type query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = Notification.objects.filter(
            user=request.user,
            notification_type=notification_type
        ).order_by('-created_at')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['DELETE'])
    def delete_old(self, request):
        """Delete old notifications (older than 30 days)"""
        from datetime import timedelta
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        old_notifications = Notification.objects.filter(
            user=request.user,
            created_at__lt=thirty_days_ago
        )
        
        count, _ = old_notifications.delete()
        
        return Response({
            'status': 'success',
            'deleted_count': count
        })

    @action(detail=False, methods=['GET'])
    def statistics(self, request):
        """Get notification statistics"""
        total = Notification.objects.filter(user=request.user).count()
        unread = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        # Count by type
        by_type = {}
        for choice_id, choice_label in Notification.NOTIFICATION_TYPES:
            count = Notification.objects.filter(
                user=request.user,
                notification_type=choice_id
            ).count()
            if count > 0:
                by_type[choice_id] = count
        
        return Response({
            'total_notifications': total,
            'unread_count': unread,
            'by_type': by_type
        })
