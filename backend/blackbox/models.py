from django.db import models
from django.conf import settings
from events.models import Event


class EventFeedback(models.Model):
    """
    Structured post-event feedback from attendees.
    """

    POSITIVE_CHOICES = (
        ("VENUE", "Venue"),
        ("SPEAKER", "Speaker Quality"),
        ("ACTIVITIES", "Activities"),
        ("ORGANIZATION", "Organization"),
        ("NETWORKING", "Networking"),
    )

    PROBLEM_CHOICES = (
        ("LATE_START", "Late Start"),
        ("POOR_MANAGEMENT", "Poor Management"),
        ("TOO_CROWDED", "Too Crowded"),
        ("HIGH_PRICE", "High Price"),
        ("POOR_LOCATION", "Poor Location"),
        ("TECHNICAL_ISSUES", "Technical Issues"),
        ("OTHER", "Other"),
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="feedbacks",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_feedbacks",
    )

    rating = models.PositiveIntegerField(
        choices=[(i, i) for i in range(1, 6)],
    )

    positive_feedback = models.JSONField(
        default=list,
        blank=True,
        help_text="List of positive aspects: venue, speaker, activities, organization, networking",
    )

    problems = models.JSONField(
        default=list,
        blank=True,
        help_text="List of problems: late_start, poor_management, too_crowded, etc.",
    )

    suggestions = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "user")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["event", "rating"]),
        ]

    def __str__(self):
        return f"Feedback: {self.user.username} -> {self.event.title} ({self.rating}/5)"


class EventBlackBoxReport(models.Model):
    """
    Auto-generated comprehensive event performance report.
    """

    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name="blackbox_report",
    )

    expected_attendees = models.PositiveIntegerField(default=0)
    actual_attendees = models.PositiveIntegerField(default=0)
    total_feedbacks = models.PositiveIntegerField(default=0)

    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )

    sentiment_positive = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Percentage of positive sentiment",
    )

    sentiment_neutral = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    sentiment_negative = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    success_factors = models.JSONField(
        default=list,
        blank=True,
        help_text="List of success factor strings",
    )

    problems_found = models.JSONField(
        default=list,
        blank=True,
        help_text="List of problem strings",
    )

    recommendations = models.JSONField(
        default=list,
        blank=True,
        help_text="List of recommendation strings",
    )

    category_stats = models.JSONField(
        default=dict,
        blank=True,
        help_text="Category-level statistics",
    )

    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"Black Box Report: {self.event.title}"
