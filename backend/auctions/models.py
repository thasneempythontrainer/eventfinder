from django.db import models
from django.conf import settings
from events.models import Category


class EventRequest(models.Model):
    """
    User-created demand for an event that organizers can bid on.
    """

    STATUS_CHOICES = (
        ("OPEN", "Open"),
        ("RECEIVING_BIDS", "Receiving Bids"),
        ("SELECTED", "Organizer Selected"),
        ("CONVERTED", "Converted to Event"),
        ("CLOSED", "Closed"),
    )

    DEMAND_LEVELS = (
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("VIRAL", "Viral"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_requests",
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="event_requests",
    )

    preferred_location = models.CharField(max_length=255, blank=True, default="")

    preferred_date = models.DateField(null=True, blank=True)

    preferred_time = models.TimeField(null=True, blank=True)

    expected_attendees = models.PositiveIntegerField(default=50)

    budget_min = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    budget_max = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    additional_requirements = models.TextField(blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="OPEN",
    )

    demand_level = models.CharField(
        max_length=10,
        choices=DEMAND_LEVELS,
        default="LOW",
    )

    converted_event = models.ForeignKey(
        "events.Event",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="source_request",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["category", "status"]),
        ]

    def __str__(self):
        return f"{self.title} by {self.user.username}"

    @property
    def support_count(self):
        return self.supports.count()

    @property
    def bid_count(self):
        return self.bids.count()

    def update_demand_level(self):
        supports = self.support_count
        bids = self.bid_count
        score = supports + (bids * 3)

        if score >= 50:
            self.demand_level = "VIRAL"
        elif score >= 20:
            self.demand_level = "HIGH"
        elif score >= 5:
            self.demand_level = "MEDIUM"
        else:
            self.demand_level = "LOW"
        self.save(update_fields=["demand_level"])


class EventRequestSupport(models.Model):
    """
    Track user support/upvotes on event requests.
    """

    request = models.ForeignKey(
        EventRequest,
        on_delete=models.CASCADE,
        related_name="supports",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_request_supports",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("request", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} supports {self.request.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.request.update_demand_level()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        self.request.update_demand_level()


class EventRequestComment(models.Model):
    """
    Comments/suggestions on event requests.
    """

    request = models.ForeignKey(
        EventRequest,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_request_comments",
    )

    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["request", "created_at"]),
        ]

    def __str__(self):
        return f"Comment by {self.user.username} on {self.request.title}"


class EventBid(models.Model):
    """
    Organizer bid/proposal on an event request.
    """

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SELECTED", "Selected"),
        ("REJECTED", "Rejected"),
    )

    request = models.ForeignKey(
        EventRequest,
        on_delete=models.CASCADE,
        related_name="bids",
    )

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_bids",
    )

    event_plan = models.TextField(
        help_text="Detailed description of the event plan"
    )

    proposed_date = models.DateField()

    proposed_time = models.TimeField(null=True, blank=True)

    venue = models.CharField(max_length=255)

    ticket_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    capacity = models.PositiveIntegerField()

    budget_estimation = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    benefits_included = models.TextField(
        help_text="What's included (certificates, food, mentors, etc.)"
    )

    additional_ideas = models.TextField(blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("request", "organizer")
        indexes = [
            models.Index(fields=["request", "status"]),
            models.Index(fields=["organizer", "status"]),
        ]

    def __str__(self):
        return f"Bid by {self.organizer.username} on {self.request.title}"
