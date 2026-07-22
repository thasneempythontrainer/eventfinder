from django.db import models
from django.conf import settings
from events.models import Event


class EventExperience(models.Model):
    """
    Model for participants to share their post-event experiences
    """
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_experiences"
    )
    
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="experiences"
    )
    
    title = models.CharField(max_length=200)
    
    description = models.TextField()
    
    rating = models.PositiveIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        default=5
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    likes_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "event")
        indexes = [
            models.Index(fields=["event", "-created_at"]),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title}"


class ExperienceImage(models.Model):
    """
    Model for storing multiple images/photos in experience
    """
    
    experience = models.ForeignKey(
        EventExperience,
        on_delete=models.CASCADE,
        related_name="images"
    )
    
    image = models.ImageField(
        upload_to="experience_images/"
    )
    
    caption = models.CharField(
        max_length=500,
        blank=True
    )
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["uploaded_at"]
    
    def __str__(self):
        return f"Image - {self.experience.event.title}"


class ExperienceLike(models.Model):
    """
    Model to track likes on experiences
    """
    
    experience = models.ForeignKey(
        EventExperience,
        on_delete=models.CASCADE,
        related_name="experience_likes"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="experience_likes"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("experience", "user")
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.user.username} liked {self.experience.event.title}"


class ExperienceComment(models.Model):
    """
    Model for comments on experiences
    """
    
    experience = models.ForeignKey(
        EventExperience,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="experience_comments"
    )
    
    comment = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["experience", "created_at"]),
        ]
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.experience.event.title}"
