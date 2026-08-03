from django.contrib import admin

from .models import Booking, Ticket, WaitlistEntry


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("booking_reference", "user", "event", "number_of_tickets", "total_price", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("booking_reference", "user__username", "event__title")


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("ticket_number", "booking", "is_scanned", "scanned_at")
    list_filter = ("is_scanned",)


@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ("user", "event", "status", "position", "created_at")
    list_filter = ("status",)
