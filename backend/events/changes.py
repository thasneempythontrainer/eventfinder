"""
Helpers for building before/after comparisons between an approved event and
an organizer's proposed edit.

File fields (banner, certificate template) cannot live in a JSONField, so they
are reported by filename only and the actual upload is carried on the
EventChangeRequest itself.
"""

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime, parse_time

from .models import Category, Event

FILE_FIELDS = ("banner", "certificate_template")

FIELD_LABELS = {
    "category": "Category",
    "title": "Title",
    "description": "Description",
    "venue": "Venue",
    "city": "City",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "start_date": "Start Date",
    "end_date": "End Date",
    "start_time": "Start Time",
    "end_time": "End Time",
    "banner": "Banner",
    "ticket_price": "Ticket Price",
    "total_seats": "Total Seats",
    "booking_deadline": "Booking Deadline",
    "language": "Language",
    "what_to_bring": "What To Bring",
    "parking_available": "Parking Available",
    "parking_details": "Parking Details",
    "wifi_available": "Wi-Fi Available",
    "wifi_details": "Wi-Fi Details",
    "food_available": "Food Available",
    "food_details": "Food Details",
    "water_refill_stations": "Water Refill Stations",
    "restrooms_available": "Restrooms Available",
    "charging_stations": "Charging Stations",
    "wheelchair_accessible": "Wheelchair Accessible",
    "prayer_room": "Prayer Room",
    "certificate_available": "Certificate Available",
    "certificate_template": "Certificate Template",
}

# Fields that force booked users to be told something meaningful changed.
ATTENDEE_RELEVANT_FIELDS = {
    "start_date",
    "end_date",
    "start_time",
    "end_time",
    "venue",
    "city",
    "ticket_price",
    "total_seats",
}


def to_comparable(value, field=""):
    """
    Convert a model/serializer value into something JSON safe and stable enough
    to be compared and rendered in the admin diff table.
    """
    if value is None:
        return None
    if field == "category":
        return getattr(value, "name", None) or str(value)
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float, str)):
        return value
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def display_value(value):
    """Render a comparable value for the diff table (empty string for None)."""
    if value is None or value == "":
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return str(value)


def file_name(field_file):
    if not field_file:
        return None
    try:
        return field_file.name.rsplit("/", 1)[-1]
    except (AttributeError, ValueError):
        return None


def build_diff(event, validated_data):
    """
    Compare ``validated_data`` against the live ``event`` and return
    ``(previous_data, proposed_data, changes)``.

    ``previous_data`` / ``proposed_data`` only contain the fields that actually
    changed, keyed by field name, holding JSON safe values.
    """
    previous_data = {}
    proposed_data = {}
    changes = []

    for field, new_value in validated_data.items():
        if field in FILE_FIELDS:
            continue

        old_value = to_comparable(getattr(event, field, None), field)
        new_comparable = to_comparable(new_value, field)

        if old_value == new_comparable:
            continue

        previous_data[field] = old_value
        proposed_data[field] = new_comparable
        changes.append(
            {
                "field": field,
                "label": FIELD_LABELS.get(field, field.replace("_", " ").title()),
                "old": display_value(old_value),
                "new": display_value(new_comparable),
            }
        )

    for field, new_file in validated_data.items():
        if field not in FILE_FIELDS:
            continue
        old_name = file_name(getattr(event, field, None))
        new_name = file_name(new_file)
        if new_name and old_name == new_name:
            continue
        previous_data[field] = old_name
        proposed_data[field] = new_name
        changes.append(
            {
                "field": field,
                "label": FIELD_LABELS.get(field, field.replace("_", " ").title()),
                "old": old_name or "",
                "new": new_name or "",
                "is_file": True,
            }
        )

    return previous_data, proposed_data, changes


def coerce_proposed_value(field, value):
    """
    Convert a JSON value coming back out of ``proposed_data`` into the python
    type the model field expects before it is written on approval.
    """
    if value is None:
        return None
    if field == "category":
        if isinstance(value, int):
            return value
        return Category.objects.get(name=value).id
    model_field = Event._meta.get_field(field)
    internal = model_field.get_internal_type()
    if internal == "DateField":
        return parse_date(value)
    if internal == "DateTimeField":
        parsed = parse_datetime(value)
        if parsed is not None and timezone.is_naive(parsed):
            parsed = timezone.make_aware(parsed)
        return parsed
    if internal == "TimeField":
        return parse_time(value)
    if internal == "BooleanField":
        if isinstance(value, str):
            return value.strip().lower() in ("true", "1", "yes")
        return bool(value)
    if internal in ("DecimalField", "IntegerField", "PositiveIntegerField"):
        return model_field.to_python(value)
    return value
