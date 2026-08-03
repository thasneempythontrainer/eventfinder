from django.db import models
from django.conf import settings
from events.models import Event
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile


class Booking(models.Model):
    """
    Model to handle event ticket bookings
    """
    
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("PENDING_APPROVAL", "Awaiting Organizer Confirmation"),
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
        ("REJECTED", "Rejected"),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    
    number_of_tickets = models.PositiveIntegerField()
    
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    
    payment_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True
    )
    
    booking_reference = models.CharField(
        max_length=50,
        unique=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "event"]),
            models.Index(fields=["booking_reference"]),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title} - {self.booking_reference}"


class Ticket(models.Model):
    """
    Individual ticket model for each booking
    """
    
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="tickets"
    )
    
    ticket_number = models.CharField(
        max_length=50,
        unique=True
    )
    
    qr_code = models.ImageField(
        upload_to="qrcodes/",
        blank=True,
        null=True
    )
    
    is_scanned = models.BooleanField(default=False)
    
    scanned_at = models.DateTimeField(
        blank=True,
        null=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["created_at"]
    
    def __str__(self):
        return self.ticket_number

    def generate_qr_code(self):
        """Generate a QR code image for this ticket and save it"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(self.ticket_number)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#1a1a1a", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        filename = f"qr_{self.ticket_number}.png"
        self.qr_code.save(filename, ContentFile(buffer.getvalue()), save=False)
        self.save(update_fields=["qr_code"])


class WaitlistEntry(models.Model):
    """
    Waitlist for fully-booked events. When a booked user cancels,
    the next waiting user is automatically assigned a seat.
    """

    STATUS_CHOICES = (
        ("WAITING", "Waiting"),
        ("ASSIGNED", "Assigned"),
        ("REMOVED", "Removed"),
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="waitlist_entries",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="waitlist_entries",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="WAITING",
    )

    position = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        unique_together = ("event", "user")

    def __str__(self):
        return f"{self.user.username} waiting for {self.event.title}"

    @classmethod
    def next_in_line(cls, event):
        return cls.objects.filter(
            event=event,
            status="WAITING",
        ).order_by("created_at").first()

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and self.status == "WAITING":
            self.refresh_from_db()
            self.position = WaitlistEntry.objects.filter(
                event=self.event,
                status="WAITING",
                created_at__lte=self.created_at,
            ).count()
            WaitlistEntry.objects.filter(pk=self.pk).update(position=self.position)
