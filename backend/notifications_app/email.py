"""
Outbound email rendering and delivery.

Every notification created anywhere in the project is turned into an email by
the post_save hook in signals.py, which calls send_notification_email().

Delivery rules:
  * A send never raises into the caller. A mail outage must not turn a
    successful booking or password reset into a 500.
  * Every attempt is recorded in EmailNotification, so a failure is auditable
    instead of disappearing.
  * Transactional mail (welcome, password reset) ignores user preferences.
    Everything else respects the per-category opt-out.
"""

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils import timezone

from .models import EmailNotification, Notification, user_wants_email

logger = logging.getLogger(__name__)


# Notification types that are always delivered, whatever the user's
# preferences say. These carry security or access information, so opting out
# of "email me stuff" must not mean opting out of them.
TRANSACTIONAL_TYPES = {
    "WELCOME",
    "PASSWORD_RESET_REQUESTED",
    "PASSWORD_CHANGED",
    "ACCOUNT_ACTIVATED",
    "ACCOUNT_DEACTIVATED",
    "ACCOUNT_LOGIN",
}

# Types whose email is sent explicitly by the view that creates them, because
# the message needs data the template cannot reach (a signed token URL, for
# example). The post_save hook must not send these a second time.
MANUALLY_SENT_TYPES = {
    "PASSWORD_RESET_REQUESTED",
}

# Which preference category each notification type belongs to. Anything not
# listed here falls back to the ACCOUNT category.
CATEGORY_BY_TYPE = {
    "BOOKING_CONFIRMATION": "BOOKINGS",
    "BOOKING_CONFIRMED": "BOOKINGS",
    "BOOKING_REJECTED": "BOOKINGS",
    "BOOKING_CANCELLED": "BOOKINGS",
    "BOOKING_REMINDER": "BOOKINGS",
    "WAITLIST_JOINED": "BOOKINGS",
    "WAITLIST_ASSIGNED": "BOOKINGS",
    "PAYMENT_SUCCESS": "BOOKINGS",
    "PAYMENT_FAILED": "BOOKINGS",
    "EVENT_UPDATE": "EVENTS",
    "EVENT_CANCELLED": "EVENTS",
    "EVENT_POSTPONED": "EVENTS",
    "EVENT_APPROVED": "EVENTS",
    "EVENT_REJECTED": "EVENTS",
    "EVENT_CHANGE_APPROVED": "EVENTS",
    "EVENT_CHANGE_REJECTED": "EVENTS",
    "EVENT_CHANGE_REQUESTED": "EVENTS",
    "EVENT_FEEDBACK_REMINDER": "EVENTS",
    "FULLY_BOOKED": "EVENTS",
    "SEATS_AVAILABLE": "EVENTS",
    "NEW_EXPERIENCE": "EVENTS",
    "ORGANIZER_APPROVAL": "ORGANIZER",
    "ORGANIZER_REJECTED": "ORGANIZER",
    "ORGANIZER_APPLICATION_RECEIVED": "ORGANIZER",
    "EVENT_APPROVED_ADMIN_ALERT": "MARKETING",
    "PROFILE_EDIT_REQUEST": "ACCOUNT",
    "PROFILE_EDIT_APPROVED": "ACCOUNT",
    "PROFILE_EDIT_REJECTED": "ACCOUNT",
    "PARTICIPANT_REQUEST_NEW": "ACCOUNT",
    "PARTICIPANT_RESPONSE": "ACCOUNT",
}

DEFAULT_CATEGORY = "ACCOUNT"


def category_for(notification_type):
    return CATEGORY_BY_TYPE.get(notification_type, DEFAULT_CATEGORY)


# Subjects are defined per type so the sender never has to guess. The body is
# rendered from a template with the notification's own context, which keeps the
# wording in one reviewable place.
SUBJECT_TEMPLATES = {
    "WELCOME": "Welcome to EventFinder, {first_name}!",
    "ORGANIZER_APPLICATION_RECEIVED": "We received your organizer application",
    "ORGANIZER_APPROVAL": "Your EventFinder organizer account has been approved",
    "ORGANIZER_REJECTED": "About your EventFinder organizer application",
    "ACCOUNT_LOGIN": "New login to your EventFinder account",
    "PASSWORD_RESET_REQUESTED": "Reset your EventFinder password",
    "PASSWORD_CHANGED": "Your EventFinder password has been changed",
    "ACCOUNT_ACTIVATED": "Your EventFinder account has been activated",
    "ACCOUNT_DEACTIVATED": "Your EventFinder account has been deactivated",
    "BOOKING_CONFIRMATION": "Booking confirmed - {event_title}",
    "BOOKING_CONFIRMED": "Booking confirmed - {event_title}",
    "BOOKING_CANCELLED": "Booking cancelled - {event_title}",
    "BOOKING_REJECTED": "Your booking request was declined - {event_title}",
    "BOOKING_REMINDER": "Reminder: {event_title} is coming up",
    "WAITLIST_JOINED": "You joined the waitlist for {event_title}",
    "WAITLIST_ASSIGNED": "A seat opened up - {event_title}",
    "PAYMENT_SUCCESS": "Payment received - {event_title}",
    "PAYMENT_FAILED": "Payment failed for {event_title}",
    "EVENT_UPDATE": "Update to {event_title}",
    "EVENT_CANCELLED": "Cancelled: {event_title}",
    "EVENT_POSTPONED": "Rescheduled: {event_title}",
    "EVENT_APPROVED": "Your event is live - {event_title}",
    "EVENT_REJECTED": "About your event {event_title}",
    "EVENT_CHANGE_APPROVED": "Event change approved - {event_title}",
    "EVENT_CHANGE_REJECTED": "Event change declined - {event_title}",
    "EVENT_CHANGE_REQUESTED": "Change requested for {event_title}",
    "EVENT_FEEDBACK_REMINDER": "How was {event_title}?",
    "FULLY_BOOKED": "{event_title} is now fully booked",
    "SEATS_AVAILABLE": "Seats available for {event_title}",
    "NEW_EXPERIENCE": "New experience at {event_title}",
    "PROFILE_EDIT_REQUEST": "We received your profile change request",
    "PROFILE_EDIT_APPROVED": "Your profile change was approved",
    "PROFILE_EDIT_REJECTED": "Your profile change was declined",
    "PARTICIPANT_REQUEST_NEW": "New participant request for {event_title}",
    "PARTICIPANT_RESPONSE": "New response for {event_title}",
    "CHAT_MESSAGE": "New message on EventFinder",
}

FALLBACK_SUBJECT = "EventFinder update: {title}"

SIGNATURE = "Event Finder Team"
UNSUBSCRIBE_HINT = (
    "You are receiving this because of your EventFinder account settings. "
    "You can change which emails you get from your profile settings page."
)


def _first_name(user):
    return (user.first_name or user.username or "there").strip()


def build_context(notification):
    """Everything a subject or body template might reference."""
    user = notification.user
    event = notification.related_event
    booking = notification.related_booking

    context = {
        "notification": notification,
        "user": user,
        "first_name": _first_name(user),
        "username": user.username,
        "title": notification.title,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "event": event,
        "event_title": getattr(event, "title", None) or "your event",
        "event_date": getattr(event, "start_date", None),
        "event_venue": getattr(event, "venue", None),
        "booking": booking,
        "booking_reference": getattr(booking, "booking_reference", None),
        "frontend_url": settings.FRONTEND_URL,
        "unsubscribe_hint": UNSUBSCRIBE_HINT,
    }
    return context


class _SafeFormatDict(dict):
    """Leaves unknown placeholders visible instead of raising KeyError."""

    def __missing__(self, key):
        return "{" + key + "}"


def render_subject(notification, context):
    template = SUBJECT_TEMPLATES.get(
        notification.notification_type, FALLBACK_SUBJECT
    )
    try:
        return template.format_map(_SafeFormatDict(context)).strip()
    except (IndexError, ValueError):
        logger.exception("Malformed subject template for %s", notification.pk)
        return "EventFinder update"


def render_body(notification, context):
    """Prefer a dedicated template, fall back to the notification text."""
    template_name = (
        f"notifications/email/{notification.notification_type.lower()}.txt"
    )
    try:
        return render_to_string(template_name, context).strip()
    except Exception:
        logger.debug(
            "No dedicated body template for %s, using notification text",
            notification.notification_type,
            exc_info=True,
        )

    lines = [
        f"Hello {context['first_name']},",
        "",
        notification.message,
    ]

    if notification.related_event is not None:
        event = notification.related_event
        lines += [
            "",
            f"Event: {getattr(event, 'title', '')}",
        ]
        if getattr(event, "start_date", None):
            lines.append(f"Starts: {event.start_date}")
        if getattr(event, "venue", None):
            lines.append(f"Venue: {event.venue}")

    if notification.related_booking is not None:
        booking = notification.related_booking
        if getattr(booking, "booking_reference", None):
            lines.append(f"Booking reference: {booking.booking_reference}")

    lines += [
        "",
        f"Open EventFinder: {settings.FRONTEND_URL}",
        "",
        UNSUBSCRIBE_HINT,
        "",
        SIGNATURE,
        "EventFinder",
    ]
    return "\n".join(lines)


def _should_send(notification):
    if notification.notification_type in MANUALLY_SENT_TYPES:
        return False
    if not notification.user or not notification.user.email:
        return False
    # Checked before the is_active test below: a user who has just been
    # deactivated still has to be told they were deactivated.
    if notification.notification_type in TRANSACTIONAL_TYPES:
        return True
    # Someone has to act on this, so it is delivered regardless of the
    # recipient's category preferences. Covers admin oversight alerts such as
    # cancellations, which would otherwise be silenced by opting out of event
    # updates.
    if getattr(notification, "requires_action", False):
        return True
    if notification.user.is_active is False:
        # A deactivated account should not keep receiving activity mail.
        return False
    category = category_for(notification.notification_type)
    try:
        return user_wants_email(notification.user, category)
    except Exception:
        logger.exception(
            "Failed to read email preference for user %s", notification.user_id
        )
        return True


def send_notification_email(notification):
    """Render and send the email for one notification. Never raises."""
    if not _should_send(notification):
        return None

    context = build_context(notification)
    subject = render_subject(notification, context)
    body = render_body(notification, context)

    record = EmailNotification.objects.create(
        notification=notification,
        recipient_email=notification.user.email,
        subject=subject,
        body=body,
        status=EmailNotification.Status.PENDING,
    )

    message = EmailMultiAlternatives(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[record.recipient_email],
    )
    message.attach_alternative(body, "text/plain")

    try:
        get_connection().send_messages([message])
    except Exception as exc:
        record.status = EmailNotification.Status.FAILED
        record.error_message = f"{type(exc).__name__}: {exc}"
        record.save(update_fields=["status", "error_message"])
        logger.error(
            "Failed to email %s about notification %s: %s",
            record.recipient_email, notification.pk, exc,
        )
        return record

    record.status = EmailNotification.Status.SENT
    record.sent_at = timezone.now()
    record.save(update_fields=["status", "sent_at"])
    logger.info(
        "Emailed %s about notification %s (%s)",
        record.recipient_email, notification.pk, notification.notification_type,
    )
    return record


def send_adhoc_email(recipient, subject, body, notification=None):
    """Send an ad-hoc transactional email that has no Notification row.

    Used for messages that must be delivered even though they are not a
    stored notification, such as the password reset link. Still audited when a
    notification is supplied.
    """
    message = EmailMultiAlternatives(
        subject=subject,
        body=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    message.attach_alternative(body, "text/plain")

    try:
        get_connection().send_messages([message])
    except Exception as exc:
        logger.error("Failed to email %s: %s", recipient, exc)
        if notification is not None:
            EmailNotification.objects.create(
                notification=notification,
                recipient_email=recipient,
                subject=subject,
                body=body,
                status=EmailNotification.Status.FAILED,
                error_message=f"{type(exc).__name__}: {exc}",
            )
        return False

    if notification is not None:
        EmailNotification.objects.create(
            notification=notification,
            recipient_email=recipient,
            subject=subject,
            body=body,
            status=EmailNotification.Status.SENT,
            sent_at=timezone.now(),
        )
    return True
