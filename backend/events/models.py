
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