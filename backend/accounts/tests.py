import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.db import connection
from django.db.utils import IntegrityError
from django.test import TransactionTestCase, override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User


def _png_bytes():
    return (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00"
        b"\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )


class RegisterUserEmailTests(APITestCase):
    url = "/api/auth/register/"

    def test_registration_succeeds_with_unused_email(self):
        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Lovelace",
                "email": "ada@example.com",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="ada@example.com").exists())

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="ada", email="ada@example.com", password="pw"
        )

        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Two",
                "email": "ada@example.com",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertIn("already exists", str(response.data["email"][0]))
        self.assertEqual(User.objects.filter(email="ada@example.com").count(), 1)

    def test_duplicate_email_is_rejected_ignoring_case(self):
        User.objects.create_user(
            username="ada", email="Ada@Example.com", password="pw"
        )

        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Two",
                "email": "ada@example.com",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_duplicate_email_error_asks_for_another_email(self):
        User.objects.create_user(
            username="ada", email="ada@example.com", password="pw"
        )

        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Two",
                "email": "ada@example.com",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["email"][0]),
            "An account with this email already exists. Please use another email.",
        )

    def test_duplicate_email_ignoring_surrounding_whitespace(self):
        User.objects.create_user(
            username="ada", email="ada@example.com", password="pw"
        )

        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Two",
                "email": "  ada@example.com  ",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_email_is_stored_trimmed(self):
        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Lovelace",
                "email": "  ada@example.com  ",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="ada@example.com").exists())

    def test_email_is_required(self):
        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Lovelace",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_blank_email_is_rejected(self):
        response = self.client.post(
            self.url,
            {
                "first_name": "Ada",
                "last_name": "Lovelace",
                "email": "",
                "password": "supersecret123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class RegisterOrganizerEmailTests(APITestCase):
    """Uploaded government IDs are redirected to a temp dir, not the real one."""

    def setUp(self):
        super().setUp()
        self._media_root = tempfile.mkdtemp()
        self._settings = override_settings(MEDIA_ROOT=self._media_root)
        self._settings.enable()

    def tearDown(self):
        self._settings.disable()
        shutil.rmtree(self._media_root, ignore_errors=True)
        super().tearDown()

    url = "/api/auth/register/organizer/"

    def _payload(self, email):
        return {
            "first_name": "Grace",
            "last_name": "Hopper",
            "email": email,
            "password": "supersecret123",
            "organization_name": "Grace Labs",
            "government_id": SimpleUploadedFile("id.png", _png_bytes(), "image/png"),
        }

    def test_registration_succeeds_with_unused_email(self):
        response = self.client.post(self.url, self._payload("grace@example.com"))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="grace@example.com").exists())

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="grace", email="grace@example.com", password="pw"
        )

        response = self.client.post(self.url, self._payload("grace@example.com"))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)
        self.assertIn("already exists", str(response.data["email"][0]))
        self.assertEqual(User.objects.filter(email="grace@example.com").count(), 1)

    def test_organizer_cannot_register_with_a_users_email(self):
        User.objects.create_user(
            username="ada", email="ada@example.com", password="pw"
        )

        response = self.client.post(self.url, self._payload("ada@example.com"))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class EmailUniquenessAtDatabaseLevelTests(APITestCase):
    def test_database_rejects_duplicate_email(self):
        User.objects.create_user(
            username="ada", email="ada@example.com", password="pw"
        )

        with self.assertRaises(IntegrityError):
            User.objects.create_user(
                username="ada2", email="ada@example.com", password="pw"
            )


class DedupeEmailsCommandTests(TransactionTestCase):
    """The command is a safety net for databases that predate the constraint.

    The unique index is temporarily dropped so genuinely duplicated rows can be
    created, then restored. TransactionTestCase is required because MySQL
    cannot run DDL inside a transaction.
    """

    def setUp(self):
        super().setUp()
        self._set_email_unique(False)

    def tearDown(self):
        User.objects.all().delete()
        self._set_email_unique(True)
        super().tearDown()

    def _set_email_unique(self, unique):
        field = User._meta.get_field("email")
        replacement = field.clone()
        replacement.unique = unique
        replacement.set_attributes_from_name("email")
        with connection.schema_editor() as editor:
            editor.remove_field(User, field)
            editor.add_field(User, replacement)

    def test_keeps_oldest_and_deletes_the_rest(self):
        User.objects.create_user(
            username="keep", email="dupe@example.com", password="pw"
        )
        User.objects.create_user(
            username="middle", email="dupe@example.com", password="pw"
        )
        User.objects.create_user(
            username="last", email="DUPE@example.com", password="pw"
        )

        call_command("dedupe_emails", "--apply", verbosity=0)

        self.assertEqual(
            [u.username for u in User.objects.order_by("pk")], ["keep"]
        )

    def test_dry_run_deletes_nothing(self):
        keep = User.objects.create_user(
            username="keep", email="dupe@example.com", password="pw"
        )
        dupe = User.objects.create_user(
            username="dupe", email="dupe@example.com", password="pw"
        )

        call_command("dedupe_emails", verbosity=0)

        self.assertTrue(User.objects.filter(pk=keep.pk).exists())
        self.assertTrue(User.objects.filter(pk=dupe.pk).exists())

    def test_distinct_emails_are_untouched(self):
        User.objects.create_user(username="a", email="a@example.com", password="pw")
        User.objects.create_user(username="b", email="b@example.com", password="pw")

        call_command("dedupe_emails", "--apply", verbosity=0)

        self.assertEqual(User.objects.count(), 2)

    def test_blank_emails_are_treated_as_duplicates(self):
        keep = User.objects.create_user(username="keep", email="", password="pw")
        User.objects.create_user(username="blank", email="", password="pw")

        call_command("dedupe_emails", "--apply", verbosity=0)

        self.assertEqual(
            [u.pk for u in User.objects.all()], [keep.pk]
        )
