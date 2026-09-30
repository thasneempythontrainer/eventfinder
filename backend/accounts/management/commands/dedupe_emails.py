from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User


class Command(BaseCommand):
    help = (
        "Find accounts that share an email address and delete the later ones, "
        "keeping the oldest account of each group. Dry run by default."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Actually delete the duplicate accounts. Without this flag "
                 "nothing is modified.",
        )

    def handle(self, *args, **options):
        apply = options["apply"]

        keeper = {}
        duplicates = []

        for user in User.objects.order_by("pk"):
            key = (user.email or "").strip().lower()
            if key in keeper:
                duplicates.append((keeper[key], user))
            else:
                keeper[key] = user

        if not duplicates:
            self.stdout.write(
                self.style.SUCCESS("No duplicate emails found. Nothing to do.")
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"Found {len(duplicates)} duplicate account(s)."
            )
        )

        for kept, removed in duplicates:
            self.stdout.write(
                f"  {removed.username} (id={removed.id}, role={removed.role}) "
                f"-> keeping {kept.username} (id={kept.id})"
            )

        if not apply:
            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    "Dry run. Re-run with --apply to delete these accounts."
                )
            )
            return

        with transaction.atomic():
            for _, removed in duplicates:
                removed.delete()

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Deleted {len(duplicates)} duplicate account(s).")
        )
