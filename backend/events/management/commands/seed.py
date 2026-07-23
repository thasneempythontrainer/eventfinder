import os
import sys
import urllib.request
from datetime import date, time, timedelta
from io import BytesIO

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils import timezone

from accounts.models import User, OrganizerProfile
from events.models import Category, Event, EventImage
from bookings.models import Booking, Ticket
from community.models import EventExperience
from notifications_app.models import Notification


class Command(BaseCommand):
    help = "Seed the database with dummy data"

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Clearing existing data..."))
        Notification.objects.all().delete()
        Ticket.objects.all().delete()
        Booking.objects.all().delete()
        EventExperience.objects.all().delete()
        EventImage.objects.all().delete()
        Event.objects.all().delete()
        Category.objects.all().delete()
        OrganizerProfile.objects.all().delete()
        User.objects.all().delete()

        # ------------------------------------------------------------------
        # Create Users
        # ------------------------------------------------------------------
        self.stdout.write("Creating users...")

        admin = User.objects.create_superuser(
            email="admin@eventfinder.com",
            username="admin",
            password="admin12345",
            first_name="Admin",
            last_name="User",
            role="ADMIN",
            phone_number="+919000000001",
            is_verified=True,
        )

        organizer1_user = User.objects.create_user(
            email="organizer1@eventfinder.com",
            username="organizer1",
            password="organizer12345",
            first_name="Rahul",
            last_name="Sharma",
            role="ORGANIZER",
            phone_number="+919000000002",
            is_verified=True,
            is_active=True,
        )

        organizer2_user = User.objects.create_user(
            email="organizer2@eventfinder.com",
            username="organizer2",
            password="organizer12345",
            first_name="Priya",
            last_name="Patel",
            role="ORGANIZER",
            phone_number="+919000000003",
            is_verified=True,
            is_active=True,
        )

        user1 = User.objects.create_user(
            email="user1@eventfinder.com",
            username="user1",
            password="user123456",
            first_name="Amit",
            last_name="Kumar",
            role="USER",
            phone_number="+919000000004",
            is_verified=True,
        )

        user2 = User.objects.create_user(
            email="user2@eventfinder.com",
            username="user2",
            password="user123456",
            first_name="Sneha",
            last_name="Reddy",
            role="USER",
            phone_number="+919000000005",
            is_verified=True,
        )

        user3 = User.objects.create_user(
            email="user3@eventfinder.com",
            username="user3",
            password="user123456",
            first_name="Vikram",
            last_name="Singh",
            role="USER",
            phone_number="+919000000006",
            is_verified=True,
        )

        user4 = User.objects.create_user(
            email="user4@eventfinder.com",
            username="user4",
            password="user123456",
            first_name="Neha",
            last_name="Gupta",
            role="USER",
            phone_number="+919000000007",
            is_verified=True,
        )

        # ------------------------------------------------------------------
        # Organizer Profiles
        # ------------------------------------------------------------------
        self.stdout.write("Creating organizer profiles...")

        OrganizerProfile.objects.create(
            user=organizer1_user,
            organization_name="LiveNation Events",
            address="123 Music Avenue, Mumbai, Maharashtra",
            approval_status="APPROVED",
        )

        OrganizerProfile.objects.create(
            user=organizer2_user,
            organization_name="Fiesta Productions",
            address="456 Festival Road, Bangalore, Karnataka",
            approval_status="APPROVED",
        )

        # ------------------------------------------------------------------
        # Categories
        # ------------------------------------------------------------------
        self.stdout.write("Creating categories...")

        categories_data = [
            ("Music", "Live music concerts and performances", "music_note"),
            ("Sports", "Sports events and tournaments", "sports_soccer"),
            ("Technology", "Tech conferences and meetups", "computer"),
            ("Food & Drink", "Food festivals and culinary events", "restaurant"),
            ("Art & Culture", "Art exhibitions and cultural shows", "palette"),
            ("Business", "Business conferences and networking", "business_center"),
            ("Health & Wellness", "Yoga, fitness, and wellness events", "fitness_center"),
            ("Education", "Workshops, seminars, and courses", "school"),
        ]

        categories = {}
        for name, desc, icon in categories_data:
            cat = Category.objects.create(name=name, description=desc, icon=icon)
            categories[name] = cat

        # ------------------------------------------------------------------
        # Helper: download a banner image from the web
        # ------------------------------------------------------------------
        BANNER_URLS = {
            "music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
            "jazz": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=400&fit=crop",
            "tech": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
            "food": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
            "cricket": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop",
            "art": "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=400&fit=crop",
            "startup": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
            "yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
            "python": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
            "edm": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop",
        }

        def make_banner(key):
            url = BANNER_URLS.get(key, "https://picsum.photos/seed/event/800/400")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = resp.read()
                return ContentFile(data, name=f"{key}_banner.jpg")
            except Exception:
                return ContentFile(b"\xff\xd8\xff\xe0\x00\x10JFIF", name="banner.jpg")

        # ------------------------------------------------------------------
        # Events
        # ------------------------------------------------------------------
        self.stdout.write("Creating events...")

        today = date.today()

        events_data = [
            {
                "organizer": organizer1_user,
                "category": categories["Music"],
                "title": "Summer Music Festival 2026",
                "banner_key": "music",
                "description": "Join us for an electrifying weekend of live music featuring top artists from around the country. Three stages, food trucks, and an unforgettable atmosphere.",
                "venue": "Jawaharlal Nehru Stadium",
                "city": "Delhi",
                "latitude": 28.5809,
                "longitude": 77.2331,
                "start_date": today + timedelta(days=15),
                "end_date": today + timedelta(days=17),
                "start_time": time(16, 0),
                "end_time": time(23, 0),
                "ticket_price": 2500,
                "total_seats": 5000,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer1_user,
                "category": categories["Music"],
                "title": "Jazz Night Under the Stars",
                "banner_key": "jazz",
                "description": "An intimate evening of smooth jazz under the open sky. Featuring renowned jazz musicians and a premium dining experience.",
                "venue": "Royal Orchid Terrace",
                "city": "Mumbai",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "start_date": today + timedelta(days=25),
                "end_date": today + timedelta(days=25),
                "start_time": time(19, 0),
                "end_time": time(23, 30),
                "ticket_price": 4500,
                "total_seats": 500,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer2_user,
                "category": categories["Technology"],
                "title": "TechSummit 2026 - AI & Beyond",
                "banner_key": "tech",
                "description": "India's premier technology conference exploring AI, machine learning, blockchain, and the future of tech. 50+ speakers, hands-on workshops, and networking opportunities.",
                "venue": "Bangalore International Exhibition Centre",
                "city": "Bangalore",
                "latitude": 13.0827,
                "longitude": 77.5877,
                "start_date": today + timedelta(days=30),
                "end_date": today + timedelta(days=32),
                "start_time": time(9, 0),
                "end_time": time(18, 0),
                "ticket_price": 5000,
                "total_seats": 2000,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer2_user,
                "category": categories["Food & Drink"],
                "title": "Street Food Carnival",
                "banner_key": "food",
                "description": "Taste the best street food from across India! 100+ food stalls, live cooking shows, eating contests, and family-friendly activities.",
                "venue": "MG Road Carnival Ground",
                "city": "Chennai",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "start_date": today + timedelta(days=10),
                "end_date": today + timedelta(days=12),
                "start_time": time(11, 0),
                "end_time": time(22, 0),
                "ticket_price": 500,
                "total_seats": 10000,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer1_user,
                "category": categories["Sports"],
                "title": "Champions Cricket League",
                "banner_key": "cricket",
                "description": "Watch the most exciting T20 cricket action of the season. 8 teams compete for the championship trophy over 2 thrilling weeks.",
                "venue": "Eden Gardens",
                "city": "Kolkata",
                "latitude": 22.5646,
                "longitude": 88.3433,
                "start_date": today + timedelta(days=5),
                "end_date": today + timedelta(days=18),
                "start_time": time(14, 0),
                "end_time": time(22, 0),
                "ticket_price": 1500,
                "total_seats": 60000,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer2_user,
                "category": categories["Art & Culture"],
                "title": "Rangoli Art Exhibition",
                "banner_key": "art",
                "description": "A stunning exhibition of traditional and contemporary Indian art. Featuring 200+ artists and interactive art installations.",
                "venue": "National Gallery of Modern Art",
                "city": "Mumbai",
                "latitude": 19.0596,
                "longitude": 72.8295,
                "start_date": today - timedelta(days=5),
                "end_date": today + timedelta(days=10),
                "start_time": time(10, 0),
                "end_time": time(19, 0),
                "ticket_price": 300,
                "total_seats": 1000,
                "status": "ONGOING",
            },
            {
                "organizer": organizer1_user,
                "category": categories["Business"],
                "title": "Startup India Summit",
                "banner_key": "startup",
                "description": "Connect with 500+ startup founders, investors, and industry leaders. Pitch competitions, panel discussions, and networking dinners.",
                "venue": "Taj Palace Hotel",
                "city": "Delhi",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "start_date": today - timedelta(days=20),
                "end_date": today - timedelta(days=19),
                "start_time": time(9, 0),
                "end_time": time(18, 0),
                "ticket_price": 8000,
                "total_seats": 800,
                "status": "COMPLETED",
            },
            {
                "organizer": organizer2_user,
                "category": categories["Health & Wellness"],
                "title": "Sunrise Yoga Festival",
                "banner_key": "yoga",
                "description": "Start your day with peace and energy. Guided yoga sessions by world-class instructors, meditation workshops, and organic food stalls.",
                "venue": "Marine Drive Promenade",
                "city": "Mumbai",
                "latitude": 18.9432,
                "longitude": 72.8234,
                "start_date": today + timedelta(days=3),
                "end_date": today + timedelta(days=3),
                "start_time": time(5, 30),
                "end_time": time(9, 0),
                "ticket_price": 800,
                "total_seats": 2000,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer1_user,
                "category": categories["Education"],
                "title": "Python Programming Bootcamp",
                "banner_key": "python",
                "description": "3-day intensive Python bootcamp covering web development, data science, and automation. Hands-on projects and certification included.",
                "venue": "IIT Bombay Convention Centre",
                "city": "Mumbai",
                "latitude": 19.1334,
                "longitude": 72.9133,
                "start_date": today + timedelta(days=20),
                "end_date": today + timedelta(days=22),
                "start_time": time(9, 0),
                "end_time": time(17, 0),
                "ticket_price": 3500,
                "total_seats": 200,
                "status": "UPCOMING",
            },
            {
                "organizer": organizer2_user,
                "category": categories["Music"],
                "title": "EDM Nights Bangalore",
                "banner_key": "edm",
                "description": "Experience the best electronic dance music party in Bangalore. International DJs, laser shows, and an electrifying atmosphere.",
                "venue": "Phoenix Marketcity",
                "city": "Bangalore",
                "latitude": 12.9987,
                "longitude": 77.6906,
                "start_date": today + timedelta(days=7),
                "end_date": today + timedelta(days=7),
                "start_time": time(20, 0),
                "end_time": time(2, 0),
                "ticket_price": 2000,
                "total_seats": 3000,
                "status": "UPCOMING",
            },
        ]

        events = []
        for data in events_data:
            banner_key = data.pop("banner_key")
            banner_file = make_banner(banner_key)
            ev = Event.objects.create(
                banner=banner_file,
                available_seats=data["total_seats"],
                **data,
            )
            events.append(ev)

        # ------------------------------------------------------------------
        # Bookings
        # ------------------------------------------------------------------
        self.stdout.write("Creating bookings...")

        bookings_data = [
            (user1, events[0], 3, events[0].ticket_price * 3, "CONFIRMED"),
            (user1, events[3], 2, events[3].ticket_price * 2, "CONFIRMED"),
            (user1, events[6], 1, events[6].ticket_price * 1, "CONFIRMED"),
            (user2, events[0], 2, events[0].ticket_price * 2, "CONFIRMED"),
            (user2, events[2], 1, events[2].ticket_price * 1, "CONFIRMED"),
            (user2, events[4], 4, events[4].ticket_price * 4, "CONFIRMED"),
            (user3, events[1], 2, events[1].ticket_price * 2, "CONFIRMED"),
            (user3, events[3], 1, events[3].ticket_price * 1, "CONFIRMED"),
            (user3, events[5], 2, events[5].ticket_price * 2, "CONFIRMED"),
            (user4, events[0], 1, events[0].ticket_price * 1, "CONFIRMED"),
            (user4, events[7], 3, events[7].ticket_price * 3, "CONFIRMED"),
            (user4, events[9], 2, events[9].ticket_price * 2, "CONFIRMED"),
            (user1, events[8], 1, events[8].ticket_price * 1, "PENDING"),
            (user2, events[4], 2, events[4].ticket_price * 2, "CANCELLED"),
        ]

        import uuid

        for user, event, tickets, total, status in bookings_data:
            ref = f"BK{uuid.uuid4().hex[:8].upper()}"
            booking = Booking.objects.create(
                user=user,
                event=event,
                number_of_tickets=tickets,
                total_price=total,
                booking_reference=ref,
                status=status,
            )

            event.available_seats = max(0, event.available_seats - tickets)
            event.save()

            for i in range(tickets):
                Ticket.objects.create(
                    booking=booking,
                    ticket_number=f"{ref}T{i + 1}",
                )

        # ------------------------------------------------------------------
        # Experiences
        # ------------------------------------------------------------------
        self.stdout.write("Creating experiences...")

        exp_data = [
            {
                "user": user1,
                "event": events[6],
                "title": "Incredible networking opportunity!",
                "description": "Startup India Summit was a game-changer. Met amazing founders and got valuable feedback on our product. The pitch competition was fierce and inspiring.",
                "rating": 5,
            },
            {
                "user": user2,
                "event": events[6],
                "title": "Well organized event",
                "description": "Great speakers and well-organized panels. The investor networking dinner was the highlight. Would definitely attend next year.",
                "rating": 4,
            },
            {
                "user": user3,
                "event": events[6],
                "title": "Good but could be better",
                "description": "Enjoyed the startup pitches but some sessions were too crowded. Great food and venue though. Overall a solid experience.",
                "rating": 3,
            },
            {
                "user": user1,
                "event": events[5],
                "title": "Beautiful art showcase",
                "description": "The Rangoli Art Exhibition was stunning. The mix of traditional and modern art was refreshing. The interactive installations were the best part.",
                "rating": 5,
            },
            {
                "user": user4,
                "event": events[5],
                "title": "A visual feast!",
                "description": "Spent 3 hours here and still didn't see everything. The contemporary section was my favorite. Highly recommend for art lovers.",
                "rating": 4,
            },
        ]

        experiences = []
        for data in exp_data:
            exp = EventExperience.objects.create(**data)
            experiences.append(exp)

        # ------------------------------------------------------------------
        # Notifications
        # ------------------------------------------------------------------
        self.stdout.write("Creating notifications...")

        notif_data = [
            (user1, "BOOKING_CONFIRMATION", "Booking Confirmed", f"Your booking for {events[0].title} has been confirmed!", events[0]),
            (user1, "EVENT_UPDATE", "Event Update", f"{events[6].title} has been completed. Share your experience!", events[6]),
            (user2, "BOOKING_CONFIRMATION", "Booking Confirmed", f"Your booking for {events[2].title} is confirmed!", events[2]),
            (user4, "BOOKING_REMINDER", "Event Reminder", f"{events[7].title} is starting in 3 days!", events[7]),
            (organizer1_user, "ORGANIZER_APPROVAL", "Account Approved", "Your organizer account has been approved!", None),
        ]

        for user, ntype, title, message, event in notif_data:
            Notification.objects.create(
                user=user,
                notification_type=ntype,
                title=title,
                message=message,
                related_event=event,
            )

        # ------------------------------------------------------------------
        # Summary
        # ------------------------------------------------------------------
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 50))
        self.stdout.write(self.style.SUCCESS(" Database seeded successfully!"))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(f"  Users:         {User.objects.count()}")
        self.stdout.write(f"  Categories:    {Category.objects.count()}")
        self.stdout.write(f"  Events:        {Event.objects.count()}")
        self.stdout.write(f"  Bookings:      {Booking.objects.count()}")
        self.stdout.write(f"  Tickets:       {Ticket.objects.count()}")
        self.stdout.write(f"  Experiences:   {EventExperience.objects.count()}")
        self.stdout.write(f"  Notifications: {Notification.objects.count()}")
        self.stdout.write(self.style.SUCCESS("\nLogin credentials:"))
        self.stdout.write("  Admin:     admin@eventfinder.com     / admin12345")
        self.stdout.write("  Organizer: organizer1@eventfinder.com / organizer12345")
        self.stdout.write("  Organizer: organizer2@eventfinder.com / organizer12345")
        self.stdout.write("  User:      user1@eventfinder.com     / user123456")
        self.stdout.write("  User:      user2@eventfinder.com     / user123456")
        self.stdout.write("  User:      user3@eventfinder.com     / user123456")
        self.stdout.write("  User:      user4@eventfinder.com     / user123456")
        self.stdout.write(self.style.SUCCESS("=" * 50))
