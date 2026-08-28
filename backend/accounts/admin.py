from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, OrganizerProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "username",
        "email",
        "role",
        "is_verified",
        "is_staff",
    )

    list_filter = (
        "role",
        "is_verified",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Additional Information",
            {
                "fields": (
                    "role",
                    "phone_number",
                    "profile_picture",
                    "is_verified",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(OrganizerProfile)
class OrganizerProfileAdmin(admin.ModelAdmin):

    list_display = (
        "organization_name",
        "user",
        "approval_status",
    )

    list_filter = (
        "approval_status",
    )

    search_fields = (
        "organization_name",
        "address",
        "description",
        "user__username",
        "user__email",
    )