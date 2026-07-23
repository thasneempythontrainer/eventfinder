from django.contrib import admin
from .models import EventFeedback, EventBlackBoxReport


@admin.register(EventFeedback)
class EventFeedbackAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'rating', 'created_at']
    list_filter = ['rating']
    search_fields = ['event__title', 'user__username']


@admin.register(EventBlackBoxReport)
class EventBlackBoxReportAdmin(admin.ModelAdmin):
    list_display = ['event', 'average_rating', 'actual_attendees', 'generated_at']
    list_filter = ['generated_at']
