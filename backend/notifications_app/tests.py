from django.core import mail
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from notifications_app.email import send_notification_email
from notifications_app.models import EmailNotification, EmailPreference, Notification


def _results(data):
    """Paginated responses wrap the list under 'results'."""
    if isinstance(data, dict):
        return data.get("results", [])
    return data


class NotificationListFilterTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", password="pw", role="USER", email="u@example.com"
        )
        self.other = User.objects.create_user(
            username="user2", password="pw", role="USER", email="u2@example.com"
        )
        self.client.force_authenticate(self.user)

        self.postponed = Notification.objects.create(
            user=self.user,
            notification_type="EVENT_POSTPONED",
            title="Event Postponed",
            message="postponed",
        )
        self.cancelled = Notification.objects.create(
            user=self.user,
            notification_type="EVENT_CANCELLED",
            title="Event Cancelled",
            message="cancelled",
        )
        self.read = Notification.objects.create(
            user=self.user,
            notification_type="EVENT_UPDATE",
            title="Event Details Updated",
            message="updated",
            is_read=True,
        )
        # Must never leak into the results.
        Notification.objects.create(
            user=self.other,
            notification_type="EVENT_POSTPONED",
            title="Someone else's",
            message="private",
        )

    def test_list_only_returns_own_notifications(self):
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {n["id"] for n in _results(response.data)}
        self.assertEqual(ids, {self.postponed.id, self.cancelled.id, self.read.id})

    def test_filter_by_type(self):
        response = self.client.get("/api/notifications/?type=EVENT_CANCELLED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [n["id"] for n in _results(response.data)], [self.cancelled.id]
        )
        self.assertEqual(response.data["count"], 1)

    def test_filter_unread(self):
        response = self.client.get("/api/notifications/?unread=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {n["id"] for n in _results(response.data)}
        self.assertEqual(ids, {self.postponed.id, self.cancelled.id})
        self.assertEqual(response.data["count"], 2)

    def test_combined_filters(self):
        response = self.client.get("/api/notifications/?type=EVENT_POSTPONED&unread=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [n["id"] for n in _results(response.data)], [self.postponed.id]
        )

    def test_filters_do_not_affect_other_users(self):
        response = self.client.get("/api/notifications/?type=EVENT_POSTPONED")
        ids = {n["id"] for n in _results(response.data)}
        self.assertNotIn(
            Notification.objects.get(user=self.other).id, ids
        )

    def test_page_size_is_respected(self):
        response = self.client.get("/api/notifications/?page_size=2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(_results(response.data)), 2)
        self.assertEqual(response.data["count"], 3)

    def test_page_size_is_capped(self):
        response = self.client.get("/api/notifications/?page_size=100000")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(_results(response.data)), 3)

    def test_unread_count_ignores_read(self):
        response = self.client.get("/api/notifications/unread_count/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 2)

    def test_mark_as_read_updates_count(self):
        response = self.client.post(f"/api/notifications/{self.postponed.id}/mark_as_read/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.postponed.refresh_from_db()
        self.assertTrue(self.postponed.is_read)

        count = self.client.get("/api/notifications/unread_count/")
        self.assertEqual(count.data["unread_count"], 1)

    def test_cannot_mark_another_users_notification_read(self):
        theirs = Notification.objects.get(user=self.other)
        response = self.client.post(f"/api/notifications/{theirs.id}/mark_as_read/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/notifications/")
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )


class NotificationEmailDispatchTests(APITestCase):
    """A new Notification must become an email, and failures must be audited."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="user1", password="pw", role="USER", email="u@example.com"
        )

    def _create(self, notification_type="EVENT_POSTPONED"):
        return Notification.objects.create(
            user=self.user,
            notification_type=notification_type,
            title="Event Postponed",
            message="The event moved.",
        )

    def _set_preference(self, category, enabled):
        EmailPreference.objects.update_or_create(
            user=self.user, category=category, defaults={"enabled": enabled}
        )

    def test_postpone_creates_email_audit(self):
        notification = self._create()
        record = send_notification_email(notification)

        self.assertIsNotNone(record)
        self.assertEqual(record.status, EmailNotification.Status.SENT)
        self.assertEqual(record.recipient_email, "u@example.com")
        self.assertIsNotNone(record.sent_at)

    def test_cancel_creates_email_audit(self):
        notification = self._create("EVENT_CANCELLED")
        record = send_notification_email(notification)
        self.assertEqual(record.status, EmailNotification.Status.SENT)

    def test_opting_out_suppresses_mail_but_keeps_notification(self):
        self._set_preference("EVENTS", False)

        notification = self._create()
        self.assertIsNone(send_notification_email(notification))
        self.assertFalse(
            EmailNotification.objects.filter(notification=notification).exists()
        )
        # The in-app notification must survive an email opt-out.
        self.assertTrue(Notification.objects.filter(pk=notification.pk).exists())

    def test_opting_back_in_sends(self):
        self._set_preference("EVENTS", False)
        self.assertIsNone(send_notification_email(self._create()))
        self._set_preference("EVENTS", True)
        self.assertIsNotNone(send_notification_email(self._create()))

    def test_opting_out_of_events_does_not_affect_bookings(self):
        self._set_preference("EVENTS", False)
        self.assertIsNotNone(
            send_notification_email(self._create("BOOKING_CONFIRMED"))
        )

    def test_missing_preference_row_means_enabled(self):
        self.assertFalse(EmailPreference.objects.exists())
        self.assertIsNotNone(send_notification_email(self._create()))

    def test_user_without_email_gets_no_attempt(self):
        self.user.email = ""
        self.user.save()
        self.assertIsNone(send_notification_email(self._create()))
        self.assertFalse(EmailNotification.objects.exists())

    def test_deactivated_user_gets_no_activity_mail(self):
        """A self-cancelled account should stop receiving activity mail."""
        self.user.is_active = False
        self.user.save()
        self.assertIsNone(send_notification_email(self._create()))
        self.assertFalse(EmailNotification.objects.exists())

    def test_deactivated_user_still_gets_the_deactivation_notice(self):
        """The last thing a departing user hears must be the reason."""
        self.user.is_active = False
        self.user.save()
        self.assertIsNotNone(
            send_notification_email(self._create("ACCOUNT_DEACTIVATED"))
        )

    @override_settings(EMAIL_BACKEND="tests.email_broken_backend.BrokenEmailBackend")
    def test_send_failure_is_audited_not_raised(self):
        notification = self._create()
        record = send_notification_email(notification)

        self.assertIsNotNone(record)
        self.assertEqual(record.status, EmailNotification.Status.FAILED)
        self.assertIn("OSError", record.error_message)

    def test_creating_notification_emails_via_signal(self):
        """The post_save hook is what makes new notifications send mail."""
        self.assertTrue(EmailNotification.objects.count() == 0)
        with self.captureOnCommitCallbacks(execute=True):
            self._create()
        self.assertEqual(EmailNotification.objects.count(), 1)
