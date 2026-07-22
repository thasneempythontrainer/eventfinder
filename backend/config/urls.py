from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Import ViewSets
from accounts.views import UserViewSet
from events.views import EventViewSet, CategoryViewSet, EventImageViewSet
from bookings.views import BookingViewSet
from chat.views import ChatRoomViewSet
from community.views import EventExperienceViewSet
from notifications_app.views import NotificationViewSet

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'users', UserViewSet, basename='user')
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'event-images', EventImageViewSet, basename='event-image')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'chat-rooms', ChatRoomViewSet, basename='chat-room')
router.register(r'experiences', EventExperienceViewSet, basename='experience')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Authentication
    path("api/auth/", include("accounts.urls")),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Dashboard
    path("api/dashboard/", include("dashboard.urls")),

    # API Routes
    path("api/", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )