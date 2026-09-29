from datetime import date, time, timedelta
from decimal import Decimal

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from bookings.models import Booking
from events.models import Category, Event, EventChangeRequest
from notifications_app.models import Notification


def _results(data):
    """Paginated responses wrap the list under 'results'."""
    if isinstance(data, dict):
        return data.get("results", [])
    return data


class EventPostponeNotificationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", password="pw", role="ADMIN", email="a@example.com"
        )
        self.organizer = User.objects.create_user(
            username="org1", password="pw", role="ORGANIZER", email="o@example.com"
        )
        self.organizer.organizer_profile = None
        self.attendee = User.objects.create_user(
            username="user1", password="pw", role="USER", email="u@example.com"
        )
        self.category = Category.objects.create(name="Tech")

        start = timezone.localdate() + timedelta(days=10)
        self.event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title="Test Event",
            description="desc",
            venue="Hall A",
            city="Town",
            start_date=start,
            end_date=start,
            start_time=time(10, 0),
            end_time=time(12, 0),
            banner="event_banners/test.png",
            ticket_price=Decimal("10.00"),
            total_seats=50,
            available_seats=49,
            status="UPCOMING",
        )
        self.booking = Booking.objects.create(
            user=self.attendee,
            event=self.event,
            number_of_tickets=1,
            total_price=Decimal("10.00"),
            status="CONFIRMED",
            booking_reference="REF-TEST-1",
        )

    def test_postpone_notifies_attendee_organizer_and_admin(self):
        self.client.force_authenticate(self.organizer)
        response = self.client.post(
            f"/api/events/{self.event.id}/postpone_event/",
            {"reason": "Venue unavailable"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["event_status"], "POSTPONED")
        self.assertEqual(response.data["notified_users"], 1)

        self.event.refresh_from_db()
        self.assertEqual(self.event.status, "POSTPONED")

        for recipient in (self.attendee, self.organizer, self.admin):
            with self.subTest(user=recipient.username):
                note = Notification.objects.filter(
                    user=recipient, notification_type="EVENT_POSTPONED"
                ).first()
                self.assertIsNotNone(note, f"{recipient.username} was not notified")
                self.assertIn("Test Event", note.message)

        attendee_note = Notification.objects.get(
            user=self.attendee, notification_type="EVENT_POSTPONED"
        )
        self.assertIn("Venue unavailable", attendee_note.message)

    def test_postpone_blocked_for_non_organizer(self):
        self.client.force_authenticate(self.attendee)
        response = self.client.post(f"/api/events/{self.event.id}/postpone_event/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class EventChangeRequestTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", password="pw", role="ADMIN", email="a@example.com"
        )
        self.organizer = User.objects.create_user(
            username="org1", password="pw", role="ORGANIZER", email="o@example.com"
        )
        self.attendee = User.objects.create_user(
            username="user1", password="pw", role="USER", email="u@example.com"
        )
        self.category = Category.objects.create(name="Tech")
        self.other_category = Category.objects.create(name="Music")

        start = timezone.localdate() + timedelta(days=10)
        self.event = Event.objects.create(
            organizer=self.organizer,
            category=self.category,
            title="Test Event",
            description="old description",
            venue="Hall A",
            city="Town",
            start_date=start,
            end_date=start,
            start_time=time(10, 0),
            end_time=time(12, 0),
            banner="event_banners/test.png",
            ticket_price=Decimal("10.00"),
            total_seats=50,
            available_seats=50,
            status="UPCOMING",
        )
        self.booking = Booking.objects.create(
            user=self.attendee,
            event=self.event,
            number_of_tickets=2,
            total_price=Decimal("20.00"),
            status="CONFIRMED",
            booking_reference="REF-TEST-2",
        )

    def _propose(self, payload):
        self.client.force_authenticate(self.organizer)
        return self.client.patch(f"/api/events/{self.event.id}/", payload, format="json")

    def test_organizer_edit_is_staged_not_applied(self):
        new_start = self.event.start_date + timedelta(days=5)
        response = self._propose(
            {
                "title": "Test Event Renamed",
                "description": "new description",
                "start_date": new_start.isoformat(),
                "venue": "Hall B",
                "category": self.other_category.id,
                "ticket_price": "25.00",
                "certificate_available": True,
            }
        )

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertTrue(response.data["requires_admin_approval"])

        # Live event is untouched until an admin approves.
        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Test Event")
        self.assertEqual(self.event.description, "old description")
        self.assertEqual(self.event.start_date, self.event.start_date)
        self.assertEqual(self.event.venue, "Hall A")
        self.assertEqual(self.event.ticket_price, Decimal("10.00"))
        self.assertFalse(self.event.certificate_available)
        self.assertEqual(self.event.status, "UPCOMING")

        change_request = EventChangeRequest.objects.get()
        self.assertEqual(change_request.status, "PENDING")
        self.assertEqual(change_request.organizer, self.organizer)
        self.assertEqual(change_request.previous_status, "UPCOMING")

        changes = {c["field"]: c for c in change_request.changes}
        self.assertEqual(
            set(changes),
            {
                "title", "description", "start_date", "venue",
                "category", "ticket_price", "certificate_available",
            },
        )
        self.assertEqual(changes["title"]["old"], "Test Event")
        self.assertEqual(changes["title"]["new"], "Test Event Renamed")
        self.assertEqual(changes["title"]["label"], "Title")
        self.assertEqual(changes["category"]["old"], "Tech")
        self.assertEqual(changes["category"]["new"], "Music")
        self.assertEqual(changes["certificate_available"]["old"], "No")
        self.assertEqual(changes["certificate_available"]["new"], "Yes")
        self.assertEqual(changes["ticket_price"]["old"], "10.00")
        self.assertEqual(changes["ticket_price"]["new"], "25.00")

        self.assertTrue(
            Notification.objects.filter(
                user=self.admin, notification_type="EVENT_CHANGE_REQUESTED"
            ).exists()
        )

    def test_organizer_cannot_change_status_directly(self):
        response = self._propose({"status": "CANCELLED"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.event.refresh_from_db()
        self.assertEqual(self.event.status, "UPCOMING")

    def test_identical_update_is_rejected(self):
        response = self._propose({"title": "Test Event"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(EventChangeRequest.objects.exists())

    def test_admin_sees_comparison_and_approves(self):
        new_start = self.event.start_date + timedelta(days=5)
        self._propose(
            {
                "title": "Test Event Renamed",
                "start_date": new_start.isoformat(),
                "venue": "Hall B",
            }
        )
        change_request = EventChangeRequest.objects.get()

        self.client.force_authenticate(self.admin)
        detail = self.client.get(f"/api/event-change-requests/{change_request.id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["event_title"], "Test Event")
        self.assertEqual(detail.data["organizer_name"], "org1")
        self.assertEqual(detail.data["previous_data"]["title"], "Test Event")
        self.assertEqual(detail.data["proposed_data"]["title"], "Test Event Renamed")
        self.assertEqual(len(detail.data["changes"]), 3)

        queue = self.client.get("/api/event-change-requests/pending/")
        self.assertEqual(queue.status_code, status.HTTP_200_OK)
        self.assertEqual(len(_results(queue.data)), 1)

        approve = self.client.post(
            f"/api/event-change-requests/{change_request.id}/approve/",
            {"admin_notes": "Looks good"},
            format="json",
        )
        self.assertEqual(approve.status_code, status.HTTP_200_OK)
        self.assertEqual(
            set(approve.data["applied_fields"]), {"title", "start_date", "venue"}
        )

        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Test Event Renamed")
        self.assertEqual(self.event.venue, "Hall B")
        self.assertEqual(self.event.start_date, new_start)
        self.assertEqual(self.event.status, "UPCOMING")

        change_request.refresh_from_db()
        self.assertEqual(change_request.status, "APPROVED")
        self.assertEqual(change_request.reviewed_by, self.admin)
        self.assertIsNotNone(change_request.reviewed_at)
        self.assertEqual(change_request.admin_notes, "Looks good")

        self.assertTrue(
            Notification.objects.filter(
                user=self.organizer, notification_type="EVENT_CHANGE_APPROVED"
            ).exists()
        )
        # start_date/venue changed, so the attendee gets told.
        attendee_note = Notification.objects.filter(
            user=self.attendee, notification_type="EVENT_UPDATE"
        ).first()
        self.assertIsNotNone(attendee_note)
        self.assertIn("Venue", attendee_note.message)
        self.assertIn("Start Date", attendee_note.message)

    def test_admin_rejects_and_event_stays_untouched(self):
        self._propose({"title": "Bad Title"})
        change_request = EventChangeRequest.objects.get()

        self.client.force_authenticate(self.admin)
        reject = self.client.post(
            f"/api/event-change-requests/{change_request.id}/reject/",
            {"admin_notes": "Misleading title"},
            format="json",
        )
        self.assertEqual(reject.status_code, status.HTTP_200_OK)

        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Test Event")

        change_request.refresh_from_db()
        self.assertEqual(change_request.status, "REJECTED")
        self.assertEqual(change_request.admin_notes, "Misleading title")

        note = Notification.objects.get(
            user=self.organizer, notification_type="EVENT_CHANGE_REJECTED"
        )
        self.assertIn("Misleading title", note.message)

    def test_organizer_cannot_approve(self):
        self._propose({"title": "Whatever"})
        change_request = EventChangeRequest.objects.get()

        self.client.force_authenticate(self.organizer)
        response = self.client.post(
            f"/api/event-change-requests/{change_request.id}/approve/"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_second_edit_supersedes_first(self):
        self._propose({"title": "First Edit"})
        first = EventChangeRequest.objects.get()
        self._propose({"title": "Second Edit"})
        second = EventChangeRequest.objects.exclude(pk=first.pk).get()

        first.refresh_from_db()
        self.assertEqual(first.status, "SUPERSEDED")
        self.assertEqual(second.status, "PENDING")
        self.assertEqual(second.proposed_data["title"], "Second Edit")

    def test_approving_seat_change_recomputes_availability(self):
        self._propose({"total_seats": 3})
        change_request = EventChangeRequest.objects.get()

        self.client.force_authenticate(self.admin)
        self.client.post(f"/api/event-change-requests/{change_request.id}/approve/")

        self.event.refresh_from_db()
        self.assertEqual(self.event.total_seats, 3)
        # 2 tickets already sold, so 1 of the 3 seats remains.
        self.assertEqual(self.event.available_seats, 1)

    def test_non_participant_cannot_see_queue(self):
        self._propose({"title": "Something"})
        self.client.force_authenticate(self.attendee)
        response = self.client.get("/api/event-change-requests/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(_results(response.data)), 0)

    def test_queue_can_be_filtered_by_status(self):
        self._propose({"title": "Approved Edit"})
        open_request = EventChangeRequest.objects.get()

        self.client.force_authenticate(self.admin)
        self.client.post(f"/api/event-change-requests/{open_request.id}/approve/")

        self._propose({"title": "Still Pending"})
        pending_request = EventChangeRequest.objects.exclude(
            pk=open_request.pk
        ).get()

        response = self.client.get("/api/event-change-requests/?status=APPROVED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([r["id"] for r in _results(response.data)], [open_request.id])

        response = self.client.get("/api/event-change-requests/?status=PENDING")
        self.assertEqual(
            [r["id"] for r in _results(response.data)], [pending_request.id]
        )

    def test_superseded_request_cannot_be_approved(self):
        self._propose({"title": "First Edit"})
        first = EventChangeRequest.objects.get()
        self._propose({"title": "Second Edit"})
        first.refresh_from_db()
        self.assertEqual(first.status, "SUPERSEDED")

        self.client.force_authenticate(self.admin)
        response = self.client.post(f"/api/event-change-requests/{first.id}/approve/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Test Event")

    def test_admin_direct_edit_still_applies(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/events/{self.event.id}/",
            {"title": "Admin Edited"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.event.refresh_from_db()
        self.assertEqual(self.event.title, "Admin Edited")
        self.assertFalse(EventChangeRequest.objects.exists())

    def test_admin_direct_edit_notifies_attendees_when_details_change(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/events/{self.event.id}/",
            {"venue": "Hall C", "description": "same idea, new wording"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        note = Notification.objects.filter(
            user=self.attendee, notification_type="EVENT_UPDATE"
        ).first()
        self.assertIsNotNone(note)
        # Only attendee-relevant fields are listed.
        self.assertIn("Venue", note.message)
        self.assertNotIn("Description", note.message)
