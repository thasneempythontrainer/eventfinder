"""
Read-only normalization audit. Reports data-level anomalies and redundant
derived columns. Makes no writes.
"""
from decimal import Decimal

from django.db import connection
from django.db.models import Count, Q, Sum

from accounts.models import OrganizerProfile, User
from bookings.models import Booking, Ticket, WaitlistEntry
from blackbox.models import EventBlackBoxReport, EventFeedback
from community.models import EventExperience, ExperienceLike
from events.models import Event, EventFavorite, ParticipantRequest, ParticipantResponse
from notifications_app.models import Notification


def section(title):
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


def counts():
    section("ROW COUNTS")
    models = [
        User, OrganizerProfile, Event, Booking, Ticket, WaitlistEntry,
        EventFavorite, ParticipantRequest, ParticipantResponse,
        EventFeedback, EventBlackBoxReport, EventExperience, ExperienceLike,
        Notification,
    ]
    for model in models:
        print(f"  {model.__name__:<26} {model.objects.count():>6}")


def transitive_dependencies():
    section("3NF: DERIVED / TRANSITIVELY-DEPENDENT COLUMNS")

    # Event.available_seats is a function of total_seats and confirmed bookings.
    drift = []
    for event in Event.objects.all().iterator():
        booked = Booking.objects.filter(
            event=event, status__in=('CONFIRMED', 'PENDING', 'PENDING_APPROVAL')
        ).aggregate(t=Sum('number_of_tickets'))['t'] or 0
        expected = max(event.total_seats - booked, 0)
        if expected != event.available_seats:
            drift.append((event.id, event.title, event.available_seats, expected))
    print(f"\n  Event.available_seats  -> derived from total_seats - booked tickets")
    print(f"  rows out of sync: {len(drift)}")
    for eid, title, stored, expected in drift[:10]:
        print(f"    event {eid} '{title[:40]}': stored={stored} expected={expected}")

    # ParticipantRequest.current_participants vs actual INTERESTED responses
    drift = []
    for pr in ParticipantRequest.objects.all().iterator():
        actual = ParticipantResponse.objects.filter(
            participant_request=pr, status='INTERESTED'
        ).count()
        if actual != pr.current_participants:
            drift.append((pr.id, pr.current_participants, actual))
    print(f"\n  ParticipantRequest.current_participants -> COUNT(responses WHERE INTERESTED)")
    print(f"  rows out of sync: {len(drift)}")
    for pid, stored, actual in drift[:10]:
        print(f"    request {pid}: stored={stored} actual={actual}")

    # EventExperience.likes_count vs ExperienceLike rows
    drift = []
    for exp in EventExperience.objects.all().iterator():
        actual = ExperienceLike.objects.filter(experience=exp).count()
        if actual != exp.likes_count:
            drift.append((exp.id, exp.likes_count, actual))
    print(f"\n  EventExperience.likes_count -> COUNT(experience_like)")
    print(f"  rows out of sync: {len(drift)}")
    for eid, stored, actual in drift[:10]:
        print(f"    experience {eid}: stored={stored} actual={actual}")

    # WaitlistEntry.position vs actual ordering within event
    bad = 0
    for event_id in WaitlistEntry.objects.values_list('event_id', flat=True).distinct():
        entries = list(
            WaitlistEntry.objects.filter(event_id=event_id, status='WAITING')
            .order_by('created_at').values_list('position', flat=True)
        )
        expected = list(range(1, len(entries) + 1))
        if entries != expected:
            bad += 1
    print(f"\n  WaitlistEntry.position -> ROW_NUMBER() over created_at")
    print(f"  events with non-contiguous/incorrect positions: {bad}")


def redundant_foreign_keys():
    section("3NF: FOREIGN KEYS DERIVED FROM ANOTHER FK")
    mismatches = 0
    for pr in ParticipantRequest.objects.select_related('event').iterator():
        if pr.organizer_id != pr.event.organizer_id:
            mismatches += 1
    print(f"\n  ParticipantRequest.organizer -> always equals event.organizer")
    print(f"  rows where it differs: {mismatches}")

    mismatches = 0
    for cr in __import__(
        'events.models', fromlist=['EventChangeRequest']
    ).EventChangeRequest.objects.select_related('event').iterator():
        if cr.organizer_id != cr.event.organizer_id:
            mismatches += 1
    print(f"\n  EventChangeRequest.organizer -> always equals event.organizer")
    print(f"  rows where it differs: {mismatches}")


def check_constraint_gaps():
    section("CONSTRAINT GAPS (no DB-level enforcement)")
    with connection.cursor() as c:
        c.execute("""
            SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME LIKE 'events_event%'
              AND COLUMN_NAME IN
                ('rating','start_date','end_date','start_time','end_time',
                 'available_seats','total_seats','latitude','longitude')
            ORDER BY TABLE_NAME, COLUMN_NAME
        """)
        print("\n  Range-checkable columns and their current DDL:")
        for table, col, ctype, nullable, key in c.fetchall():
            print(f"    {table}.{col:<16} {ctype:<18} null={nullable} key={key or '-'}")

    print("\n  Missing CHECK constraints that normalization relies on:")
    print("    - Event.end_date   >= Event.start_date")
    print("    - Event.end_time   >= Event.start_time (same-day events)")
    print("    - 0 <= Event.latitude  <=  90")
    print("    - 0 <= Event.longitude <= 180")
    print("    - Event.available_seats <= Event.total_seats")
    print("    - EventExperience.rating BETWEEN 1 AND 5")
    print("    - EventFeedback.rating    BETWEEN 1 AND 5")
    print("    - Booking.number_of_tickets > 0")
    print("    - WaitlistEntry.position > 0")

    with connection.cursor() as c:
        c.execute("""
            SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_TYPE = 'CHECK'
        """)
        print(f"\n  CHECK constraints currently in the database: {c.fetchone()[0]}")


def multivalued_columns():
    section("1NF: MULTI-VALUED COLUMNS STORED IN A SINGLE FIELD")
    multi = Event.objects.filter(language__regex=r'[,;/]')
    print(f"\n  Event.language (comma/slash separated lists): {multi.count()} rows")
    for e in multi[:8]:
        print(f"    event {e.id}: {e.language!r}")

    fb = EventFeedback.objects.exclude(positive_feedback=None)
    print(f"\n  EventFeedback.positive_feedback (JSONField array): {fb.count()} rows")
    if fb.exists():
        print(f"    sample: {fb.first().positive_feedback}")

    bb = EventBlackBoxReport.objects.all()
    print(f"\n  EventBlackBoxReport JSONField columns (array-in-column):")
    print(f"    success_factors, problems_found, recommendations, category_stats")
    print(f"    rows: {bb.count()}")
    for f in ('success_factors', 'problems_found', 'recommendations', 'category_stats'):
        print(f"      {f:<18} non-empty: {bb.exclude(**{f: []}).count()}")


def indexes():
    section("INDEX / KEY COVERAGE ON HIGH-CARDINALITY FOREIGN KEYS")
    with connection.cursor() as c:
        c.execute("""
            SELECT TABLE_NAME, INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX)
            FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE() AND NON_UNIQUE = 1
            GROUP BY TABLE_NAME, INDEX_NAME
            HAVING TABLE_NAME IN (
                'bookings_booking','community_experiencelike',
                'events_participantresponse','bookings_ticket',
                'notifications_app_notification')
            ORDER BY TABLE_NAME
        """)
        rows = c.fetchall()
        if rows:
            for table, idx, cols in rows:
                print(f"  {table:<38} {cols}")
        else:
            print("  (no secondary indexes found on the tables above)")

    print("\n  Note: Django auto-creates an index on every ForeignKey column.")
    print("  Missing are COMPOSITE indexes for the hot query patterns, e.g.:")
    print("    - Booking(event, status)  for seat counting / event analytics")
    print("    - Notification(user, is_read) exists; Notification(user, type) does not")


def enum_like_columns():
    section("DOMAIN ENFORCEMENT: CHAR-FIELD 'ENUMS' VS LOOKUP TABLES")
    for model, field, choices in [
        (Event, 'status', dict(Event.STATUS_CHOICES)),
        (Booking, 'status', dict(Booking.STATUS_CHOICES)),
        (Notification, 'notification_type', dict(Notification.NOTIFICATION_TYPES)),
    ]:
        defined = set(choices)
        distinct = set(
            model.objects.values_list(field, flat=True).distinct()
        )
        stragglers = {d for d in distinct if d not in defined}
        print(f"\n  {model.__name__}.{field}: {len(defined)} allowed values")
        print(f"    values in DB not in choices: {stragglers or 'none'}")


if __name__ == '__main__':
    counts()
    transitive_dependencies()
    redundant_foreign_keys()
    check_constraint_gaps()
    multivalued_columns()
    indexes()
    enum_like_columns()
    print()
