from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminDashboardViewSet, OrganizerDashboardViewSet, UserDashboardViewSet

router = DefaultRouter()
router.register(r'admin', AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'organizer', OrganizerDashboardViewSet, basename='organizer-dashboard')
router.register(r'user', UserDashboardViewSet, basename='user-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
