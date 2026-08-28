import urllib.request
from io import BytesIO

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify

from events.models import Event


class Command(BaseCommand):
    help = "Update event banner images with contextually appropriate images"

    UNSPLASH_URLS = {
        "music": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop",
        "jazz": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=400&fit=crop",
        "tech": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop",
        "food": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=400&fit=crop",
        "cricket": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop",
        "sports": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop",
        "art": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=400&fit=crop",
        "startup": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop",
        "business": "https://images.unsplash.com/photo-1559136555-9303baea1ebd?w=800&h=400&fit=crop",
        "yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
        "wellness": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=400&fit=crop",
        "python": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
        "education": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
        "edm": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop",
        "default": "https://picsum.photos/seed/event/800/400",
    }

    EVENT_IMAGE_MAP = {
        11: "music",
        12: "jazz",
        13: "tech",
        14: "food",
        15: "cricket",
        16: "art",
        17: "startup",
        18: "yoga",
        19: "python",
        20: "edm",
        21: "food",
    }

    def download_image(self, key):
        url = self.UNSPLASH_URLS.get(key, self.UNSPLASH_URLS["default"])
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
            return ContentFile(data, name=f"{key}_banner.jpg")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Failed to download {url}: {e}"))
            return None

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Updating event banner images..."))

        events = Event.objects.all().order_by("id")
        updated = 0
        failed = 0

        for event in events:
            key = self.EVENT_IMAGE_MAP.get(event.id)
            if not key:
                category_name = event.category.name.lower() if event.category else ""
                if "music" in category_name:
                    key = "music"
                elif "sport" in category_name:
                    key = "sports"
                elif "tech" in category_name:
                    key = "tech"
                elif "food" in category_name:
                    key = "food"
                elif "art" in category_name:
                    key = "art"
                elif "business" in category_name:
                    key = "business"
                elif "health" in category_name or "wellness" in category_name:
                    key = "wellness"
                elif "education" in category_name:
                    key = "education"
                else:
                    key = "default"

            banner_file = self.download_image(key)
            if banner_file:
                event.banner = banner_file
                event.save(update_fields=["banner"])
                self.stdout.write(f"  Updated: {event.title} -> {key}_banner.jpg")
                updated += 1
            else:
                self.stdout.write(self.style.ERROR(f"  Failed: {event.title}"))
                failed += 1

        self.stdout.write(self.style.SUCCESS(f"\nDone! Updated: {updated}, Failed: {failed}"))