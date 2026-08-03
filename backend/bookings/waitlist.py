import uuid
from decimal import Decimal

from .models import Booking, Ticket, WaitlistEntry


def assign_waitlist_seats(event):
    """Automatically assign freed seats to the next waitlisted users.

    Iterates while seats are available; each assigned user gets a confirmed
    booking with a generated ticket and is notified.
    """
    assigned = []
    from notifications_app.models import Notification

    while event.available_seats > 0:
        entry = WaitlistEntry.next_in_line(event)
        if not entry:
            break

        booking_reference = f"BK{uuid.uuid4().hex[:8].upper()}"
        booking = Booking.objects.create(
            user=entry.user,
            event=event,
            number_of_tickets=1,
            total_price=Decimal(str(event.ticket_price)),
            booking_reference=booking_reference,
            status="CONFIRMED",
        )

        ticket_number = f"{booking_reference}T1"
        ticket = Ticket.objects.create(booking=booking, ticket_number=ticket_number)
        ticket.generate_qr_code()

        entry.status = "ASSIGNED"
        entry.save(update_fields=["status"])

        event.available_seats -= 1
        event.save(update_fields=["available_seats"])

        Notification.objects.create(
            user=entry.user,
            notification_type="WAITLIST_ASSIGNED",
            title="You got a ticket!",
            message=(
                f'A seat became available for "{event.title}" and you have been '
                f"assigned a ticket automatically from the waitlist. "
                f"Booking reference: {booking_reference}"
            ),
            related_event=event,
            related_booking=booking,
        )

        Notification.objects.create(
            user=event.organizer,
            notification_type="WAITLIST_ASSIGNED",
            title="Waitlist Ticket Assigned",
            message=(
                f'A waitlisted user ({entry.user.get_full_name() or entry.user.username}) '
                f'was automatically assigned a freed ticket for "{event.title}".'
            ),
            related_event=event,
            related_booking=booking,
        )

        assigned.append(booking.id)

    return assigned
