"""
Email dispatch for notifications.

Notifications are created in ~29 places across the views. Rather than editing
each call site, a single post_save hook here turns every new Notification into
an email. Adding a notification anywhere in the codebase therefore emails
automatically.

The send is deferred to transaction.on_commit so a notification created inside
a transaction that later rolls back never sends mail. If the transaction never
commits (and the code was not running under an atomic block) the fallback
sends immediately.
"""

import logging

from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Notification

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notification, dispatch_uid="notify_email_on_notification")
def email_on_notification_created(sender, instance, created, raw=False, **kwargs):
    if not created or raw:
        return

    from .email import send_notification_email

    def _send():
        try:
            send_notification_email(instance)
        except Exception:
            # send_notification_email handles its own errors; this is the
            # outer net so a template bug can never surface as a 500.
            logger.exception(
                "Unexpected failure emailing notification %s", instance.pk
            )

    transaction.on_commit(_send)
