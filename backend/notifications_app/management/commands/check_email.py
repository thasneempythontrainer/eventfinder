"""Report whether outbound email is actually configured.

    python manage.py check_email

Exits non-zero when SMTP credentials are missing, so it doubles as a
deployment check. Pass --test to attempt a real delivery to the configured
From address.
"""

import sys

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError

CONSOLE_BACKENDS = ("console.EmailBackend", "locmem.EmailBackend")


class Command(BaseCommand):
    help = "Show whether outbound email is configured, and optionally test it."

    def add_arguments(self, parser):
        parser.add_argument(
            "--test",
            action="store_true",
            help="Attempt to send a real test message to the From address.",
        )

    def handle(self, *args, **options):
        user = settings.EMAIL_HOST_USER
        password = settings.EMAIL_HOST_PASSWORD
        is_console = any(b in settings.EMAIL_BACKEND for b in CONSOLE_BACKENDS)

        self.stdout.write("")
        self.stdout.write("Email configuration")
        self.stdout.write("-" * 46)

        if is_console:
            self.stdout.write(
                self.style.WARNING("STATUS: NOT SENDING - console fallback active")
            )
            self.stdout.write("")
            self.stdout.write(
                "  Emails are being printed to the server console, not sent."
            )
            self.stdout.write("  To fix:")
            self.stdout.write("    1. Create a Gmail App Password:")
            self.stdout.write(
                "       https://myaccount.google.com/apppasswords"
            )
            self.stdout.write("    2. Fill in EMAIL_HOST_USER and")
            self.stdout.write("       EMAIL_HOST_PASSWORD in backend/.env")
            self.stdout.write("    3. Restart the server")
            self.stdout.write("    4. Run: python manage.py check_email --test")
        else:
            self.stdout.write(
                self.style.SUCCESS("STATUS: SMTP configured")
            )

        self.stdout.write("")
        self.stdout.write(f"  EMAIL_BACKEND      {settings.EMAIL_BACKEND}")
        self.stdout.write(
            f"  EMAIL_HOST         {settings.EMAIL_HOST}:{settings.EMAIL_PORT}"
        )
        self.stdout.write(f"  EMAIL_USE_TLS      {settings.EMAIL_USE_TLS}")
        self.stdout.write(f"  EMAIL_HOST_USER    {user or self.style.ERROR('(not set)')}")
        self.stdout.write(
            f"  EMAIL_HOST_PASSWORD "
            f"{'(set)' if password else self.style.ERROR('(not set)')}"
        )
        self.stdout.write(f"  DEFAULT_FROM_EMAIL {settings.DEFAULT_FROM_EMAIL}")
        self.stdout.write("")

        if is_console:
            raise CommandError(
                "Email is not configured; messages are only printed to the console."
            )

        if not options["test"]:
            return

        recipient = user or settings.DEFAULT_FROM_EMAIL
        self.stdout.write(f"Sending a test message to {recipient}...")
        try:
            send_mail(
                subject="EventFinder test email",
                message="SMTP is working. You can ignore this message.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
        except Exception as exc:
            raise CommandError(f"Test delivery failed: {type(exc).__name__}: {exc}")

        self.stdout.write(self.style.SUCCESS(f"Test email delivered to {recipient}"))