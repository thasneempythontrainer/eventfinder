from django.urls import path

from .views import (
    RegisterUserView,
    RegisterOrganizerView,
    LoginView,
    ProfileView,
)

urlpatterns = [

    path(
        "register/",
        RegisterUserView.as_view(),
        name="register"
    ),

    path(
        "register/user/",
        RegisterUserView.as_view(),
        name="register-user"
    ),

    path(
        "register/organizer/",
        RegisterOrganizerView.as_view(),
        name="register-organizer"
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

]