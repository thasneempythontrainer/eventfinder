"""Read-only: would CHECK constraints be addable without failing on existing data?"""
from django.db import connection
from django.db.models import Sum

from bookings.models import Booking
from community.models import EventExperience
from events.models import Event

print("=" * 70)
print("DATA THAT WOULD VIOLATE THE PROPOSED CHECK CONSTRAINTS")
print("=" * 70)

checks = []


def check(label, sql, params=None):
    with connection.cursor() as c:
        c.execute(sql, params or [])
        rows = c.fetchall()
    checks.append((label, rows))
    print(f"\n  {label}")
    if not rows:
        print("    clean - constraint can be added")
    for r in rows[:8]:
        print(f"    {r}")
    return rows


check(
    "Event: end_date < start_date",
    "SELECT id, title, start_date, end_date FROM events_event "
    "WHERE end_date < start_date",
)
check(
    "Event: available_seats > total_seats",
    "SELECT id, title, total_seats, available_seats FROM events_event "
    "WHERE available_seats > total_seats",
)
check(
    "Event: latitude out of [-90, 90]",
    "SELECT id, title, latitude FROM events_event "
    "WHERE latitude < -90 OR latitude > 90",
)
check(
    "Event: longitude out of [-180, 180]",
    "SELECT id, title, longitude FROM events_event "
    "WHERE longitude < -180 OR longitude > 180",
)
check(
    "EventExperience: rating outside 1..5",
    "SELECT id, title, rating FROM community_eventexperience "
    "WHERE rating < 1 OR rating > 5",
)
check(
    "Booking: number_of_tickets < 1",
    "SELECT id, booking_reference, number_of_tickets FROM bookings_booking "
    "WHERE number_of_tickets < 1",
)
check(
    "Event: end_time < start_time on a single-day event",
    "SELECT id, title, start_time, end_time FROM events_event "
    "WHERE end_date = start_date AND end_time < start_time",
)

print()
print("=" * 70)
print("CURRENT VALUES OF THE 'language' MULTI-VALUE COLUMN")
print("=" * 70)
for e in Event.objects.exclude(language="").values_list("id", "language"):
    print(f"    event {e[0]}: {e[1]!r}")
n = Event.objects.exclude(language="").count()
print(f"\n    events with a language set: {n}")
print("    values containing a separator:",
      sum(1 for e in Event.objects.exclude(language="")
          if any(sep in e.language for sep in (',', ';', '/'))))

print()
print("=" * 70)
print("SUMMARY")
print("=" * 70)
dirty = [(label, rows) for label, rows in checks if rows]
if dirty:
    print(f"  {len(dirty)} constraint(s) CANNOT be added until data is fixed:")
    for label, rows in dirty:
        print(f"    - {label}: {len(rows)} violating row(s)")
else:
    print("  All proposed CHECK constraints can be added safely.")
