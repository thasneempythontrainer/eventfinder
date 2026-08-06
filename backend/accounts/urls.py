from django.urls import path

from .views import (
    RegisterUserView,
    RegisterOrganizerView,
    LoginView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
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
        "password-reset/",
        PasswordResetRequestView.as_view(),
        name="password-reset"
    ),

    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

]