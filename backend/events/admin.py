from django.contrib import admin

from .models import Category, Event, EventImage


class EventImageInline(admin.TabularInline):
    model = EventImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "created_at",
    )

    search_fields = (
        "name",
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "category",
        "city",
        "start_date",
        "status",
    )

    list_filter = (
        "status",
        "category",
        "city",
    )

    search_fields = (
        "title",
        "venue",
        "city",
    )

    inlines = [
        EventImageInline,
    ]


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):

    list_display = (
        "event",
        "uploaded_at",
    )