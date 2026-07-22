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
        ("CONFIRMED", "Confirmed"),
        ("CANCELLED", "Cancelled"),
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
