from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User Model
    """

    ROLE_CHOICES = (
        ("USER", "User"),
        ("ORGANIZER", "Organizer"),
        ("ADMIN", "Admin"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="USER",
    )

    phone_regex = RegexValidator(
        regex=r"^\+?\d{10,15}$",
        message="Enter a valid phone number."
    )

    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=15,
        blank=True,
        null=True,
        unique=True
    )

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True
    )

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class OrganizerProfile(models.Model):

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="organizer_profile"
    )

    organization_name = models.CharField(
        max_length=200
    )

    government_id = models.FileField(
        upload_to="government_ids/"
    )

    address = models.TextField()

    description = models.TextField(blank=True, default="")

    approval_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.organization_name


class ProfileEditRequest(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="profile_edit_requests"
    )

    proposed_data = models.JSONField(
        help_text="JSON object with proposed field changes"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    admin_notes = models.TextField(blank=True, default="")

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_edit_requests"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Edit request by {self.user.username} - {self.status}"