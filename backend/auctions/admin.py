from django.contrib import admin
from .models import EventRequest, EventRequestSupport, EventRequestComment, EventBid


@admin.register(EventRequest)
class EventRequestAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'status', 'demand_level', 'created_at']
    list_filter = ['status', 'demand_level', 'category']
    search_fields = ['title', 'description']


@admin.register(EventRequestSupport)
class EventRequestSupportAdmin(admin.ModelAdmin):
    list_display = ['request', 'user', 'created_at']


@admin.register(EventRequestComment)
class EventRequestCommentAdmin(admin.ModelAdmin):
    list_display = ['request', 'user', 'comment', 'created_at']


@admin.register(EventBid)
class EventBidAdmin(admin.ModelAdmin):
    list_display = ['request', 'organizer', 'status', 'ticket_price', 'created_at']
    list_filter = ['status']
