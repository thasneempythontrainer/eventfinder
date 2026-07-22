from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from twilio.rest import Client
from django.utils import timezone
from datetime import timedelta

from .models import Notification, EmailNotification, SMSNotification
from bookings.models import Booking


# Initialize Twilio client
def get_twilio_client():
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


@shared_task
def send_booking_confirmation_email(booking_id):
    """Send booking confirmation email"""
    try:
        booking = Booking.objects.get(id=booking_id)
        
        subject = f"Booking Confirmation - {booking.event.title}"
        message = f"""
        Hello {booking.user.first_name},
        
        Your booking has been confirmed!
        
        Event: {booking.event.title}
        Date: {booking.event.start_date}
        Time: {booking.event.start_time}
        Tickets: {booking.number_of_tickets}
        Total Price: ${booking.total_price}
        Booking Reference: {booking.booking_reference}
        
        Please keep this reference for check-in.
        
        Best regards,
        Event Finder Team
        """
        
        # Create notification
        notification = Notification.objects.create(
            user=booking.user,
            notification_type='BOOKING_CONFIRMATION',
            title=subject,
            message=f"Booking {booking.booking_reference} confirmed",
            related_booking=booking
        )
        
        # Send email
        email_notification = EmailNotification.objects.create(
            notification=notification,
            recipient_email=booking.user.email,
            subject=subject,
            body=message
        )
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [booking.user.email],
            fail_silently=False,
        )
        
        email_notification.status = 'SENT'
        email_notification.sent_at = timezone.now()
        email_notification.save()
        
        return f"Email sent to {booking.user.email}"
        
    except Exception as e:
        return f"Error sending email: {str(e)}"


@shared_task
def send_booking_confirmation_sms(booking_id):
    """Send booking confirmation SMS"""
    try:
        booking = Booking.objects.get(id=booking_id)
        
        message = f"Your booking {booking.booking_reference} for {booking.event.title} is confirmed. Tickets: {booking.number_of_tickets}"
        
        # Create notification
        notification = Notification.objects.create(
            user=booking.user,
            notification_type='BOOKING_CONFIRMATION',
            title='Booking Confirmation',
            message=message,
            related_booking=booking
        )
        
        # Send SMS
        sms_notification = SMSNotification.objects.create(
            notification=notification,
            phone_number=booking.user.phone_number,
            message=message
        )
        
        if settings.TWILIO_ACCOUNT_SID:
            client = get_twilio_client()
            sms = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=booking.user.phone_number
            )
            
            sms_notification.status = 'SENT'
            sms_notification.sent_at = timezone.now()
            sms_notification.provider = 'TWILIO'
            sms_notification.provider_message_id = sms.sid
            sms_notification.save()
            
            return f"SMS sent to {booking.user.phone_number}"
        else:
            sms_notification.status = 'FAILED'
            sms_notification.error_message = 'Twilio credentials not configured'
            sms_notification.save()
            
            return "SMS service not configured"
            
    except Exception as e:
        return f"Error sending SMS: {str(e)}"


@shared_task
def send_event_reminder(event_id):
    """Send event reminder to users with confirmed bookings"""
    from events.models import Event
    
    try:
        event = Event.objects.get(id=event_id)
        bookings = Booking.objects.filter(
            event=event,
            status='CONFIRMED'
        )
        
        for booking in bookings:
            send_event_reminder_notification.delay(booking.id)
            
        return f"Reminders queued for {bookings.count()} users"
        
    except Exception as e:
        return f"Error sending reminders: {str(e)}"


@shared_task
def send_event_reminder_notification(booking_id):
    """Send individual event reminder"""
    try:
        booking = Booking.objects.get(id=booking_id)
        
        subject = f"Reminder: {booking.event.title} is starting soon!"
        message = f"""
        Hello {booking.user.first_name},
        
        This is a reminder about your upcoming event:
        
        Event: {booking.event.title}
        Date: {booking.event.start_date}
        Time: {booking.event.start_time}
        Venue: {booking.event.venue}
        
        Don't forget to arrive on time!
        
        Best regards,
        Event Finder Team
        """
        
        # Create notification
        notification = Notification.objects.create(
            user=booking.user,
            notification_type='BOOKING_REMINDER',
            title=subject,
            message='Event reminder',
            related_event=booking.event
        )
        
        # Send email
        email_notification = EmailNotification.objects.create(
            notification=notification,
            recipient_email=booking.user.email,
            subject=subject,
            body=message
        )
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [booking.user.email],
            fail_silently=False,
        )
        
        email_notification.status = 'SENT'
        email_notification.sent_at = timezone.now()
        email_notification.save()
        
        return f"Reminder sent to {booking.user.email}"
        
    except Exception as e:
        return f"Error sending reminder: {str(e)}"


@shared_task
def notify_organizer_approval(organizer_id):
    """Notify organizer of approval status"""
    from accounts.models import User
    
    try:
        organizer = User.objects.get(id=organizer_id)
        
        if organizer.organizer_profile.approval_status == 'APPROVED':
            subject = "Your organizer account has been approved!"
            message = f"""
            Hello {organizer.first_name},
            
            Congratulations! Your organizer account has been approved.
            
            You can now create and manage events on our platform.
            
            Best regards,
            Event Finder Team
            """
        else:
            subject = "Your organizer account has been rejected"
            message = f"""
            Hello {organizer.first_name},
            
            Unfortunately, your organizer account has been rejected.
            Please contact support for more information.
            
            Best regards,
            Event Finder Team
            """
        
        # Create notification
        notification = Notification.objects.create(
            user=organizer,
            notification_type='ORGANIZER_APPROVAL',
            title=subject,
            message=subject
        )
        
        # Send email
        email_notification = EmailNotification.objects.create(
            notification=notification,
            recipient_email=organizer.email,
            subject=subject,
            body=message
        )
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [organizer.email],
            fail_silently=False,
        )
        
        email_notification.status = 'SENT'
        email_notification.sent_at = timezone.now()
        email_notification.save()
        
        return f"Approval notification sent to {organizer.email}"
        
    except Exception as e:
        return f"Error sending approval notification: {str(e)}"


@shared_task
def cleanup_old_notifications():
    """Delete notifications older than 90 days"""
    ninety_days_ago = timezone.now() - timedelta(days=90)
    deleted_count, _ = Notification.objects.filter(
        created_at__lt=ninety_days_ago
    ).delete()
    
    return f"Deleted {deleted_count} old notifications"

# from celery import shared_task

# @shared_task
# def test_task():
#     print("Hello from Celery!")
#     return "Success"