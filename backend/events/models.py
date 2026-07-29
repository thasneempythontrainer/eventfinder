
# Create your models here.
from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Event(models.Model):

    STATUS_CHOICES = (
        ("PENDING", "Pending Approval"),
        ("UPCOMING", "Upcoming"),
        ("ONGOING", "Ongoing"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="events",
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    venue = models.CharField(max_length=255)

    city = models.CharField(max_length=100)

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    start_date = models.DateField()

    end_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    banner = models.ImageField(
        upload_to="event_banners/"
    )

    ticket_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_seats = models.PositiveIntegerField()

    available_seats = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "start_time"]

    def __str__(self):
        return self.title


class EventImage(models.Model):

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="gallery",
    )

    image = models.ImageField(
        upload_to="event_gallery/"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event.title} Image"


class ParticipantRequest(models.Model):
    STATUS_CHOICES = (
        ("OPEN", "Open"),
        ("FULFILLED", "Fulfilled"),
        ("CLOSED", "Closed"),
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="participant_requests",
    )

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="participant_requests",
    )

    description = models.TextField()

    required_participants = models.PositiveIntegerField()

    current_participants = models.PositiveIntegerField(default=0)

    deadline = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Request for {self.event.title} by {self.organizer.username}"


class ParticipantResponse(models.Model):
    STATUS_CHOICES = (
        ("INTERESTED", "Interested"),
        ("SELECTED", "Selected"),
        ("DECLINED", "Declined"),
    )

    participant_request = models.ForeignKey(
        ParticipantRequest,
        on_delete=models.CASCADE,
        related_name="responses",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="participant_responses",
    )

    message = models.TextField(blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="INTERESTED",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("participant_request", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.participant_request}"