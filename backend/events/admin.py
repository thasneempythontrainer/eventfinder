from django.contrib import admin

from .models import Category, Event, EventImage, EventChangeRequest


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


@admin.register(EventChangeRequest)
class EventChangeRequestAdmin(admin.ModelAdmin):
    """Lets an admin read the before/after comparison and action a request."""

    list_display = (
        "event",
        "organizer",
        "status",
        "changed_field_count",
        "reviewed_by",
        "created_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "event__title",
        "organizer__username",
    )

    readonly_fields = (
        "event",
        "organizer",
        "previous_data",
        "proposed_data",
        "changes",
        "previous_status",
        "reviewed_by",
        "reviewed_at",
        "created_at",
    )

    def changed_field_count(self, obj):
        return len(obj.changes or [])

    changed_field_count.short_description = "Changed fields"
