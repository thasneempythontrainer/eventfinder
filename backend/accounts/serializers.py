from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, OrganizerProfile, ProfileEditRequest


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "password",
            "profile_picture",
        ]
        extra_kwargs = {
            "username": {"required": False},
            "phone_number": {"required": False},
        }

    def create(self, validated_data):
        if not validated_data.get("phone_number"):
            validated_data.pop("phone_number", None)

        if "username" not in validated_data or not validated_data["username"]:
            base = validated_data["email"].split("@")[0]
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1
            validated_data["username"] = username

        password = validated_data.pop("password")
        user = User(**validated_data)
        user.role = "USER"
        user.set_password(password)
        user.save()
        return user


class OrganizerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerProfile
        fields = [
            'id', 'organization_name', 'government_id', 'address',
            'description', 'approval_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    organization_name = serializers.CharField(write_only=True)
    government_id = serializers.FileField(write_only=True)
    address = serializers.CharField(write_only=True, required=False, default="")
    description = serializers.CharField(write_only=True, required=False, default="")

    class Meta:
        model = User

        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "password",
            "profile_picture",
            "organization_name",
            "government_id",
            "address",
            "description",
        ]
        extra_kwargs = {
            "username": {"required": False},
            "phone_number": {"required": False},
        }

    def create(self, validated_data):
        organization_name = validated_data.pop("organization_name")
        government_id = validated_data.pop("government_id")
        address = validated_data.pop("address", "")
        description = validated_data.pop("description", "")
        password = validated_data.pop("password")

        if not validated_data.get("phone_number"):
            validated_data.pop("phone_number", None)

        if "username" not in validated_data or not validated_data["username"]:
            base = validated_data["email"].split("@")[0]
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1
            validated_data["username"] = username

        user = User(**validated_data)
        user.role = "ORGANIZER"
        user.set_password(password)
        user.save()

        OrganizerProfile.objects.create(
            user=user,
            organization_name=organization_name,
            government_id=government_id,
            address=address,
            description=description,
        )

        return user


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(write_only=True)

    def validate(self, attrs):

        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is disabled."
            )

        if user.role == "ORGANIZER":
            try:
                profile = user.organizer_profile
                if profile.approval_status == "PENDING":
                    raise serializers.ValidationError(
                        "Your organizer account is pending admin approval. "
                        "Please wait for approval before logging in."
                    )
                if profile.approval_status == "REJECTED":
                    raise serializers.ValidationError(
                        "Your organizer account has been rejected. "
                        "Please contact support."
                    )
            except OrganizerProfile.DoesNotExist:
                pass

        attrs["user"] = user

        return attrs


class UserSerializer(serializers.ModelSerializer):
    organizer_profile = OrganizerProfileSerializer(read_only=True)

    class Meta:
        model = User

        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'phone_number',
            'role', 'profile_picture', 'is_verified', 'organizer_profile',
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'profile_picture'
        ]


class OrganizerApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizerProfile
        fields = ['approval_status']


class ProfileEditRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileEditRequest
        fields = [
            'id', 'proposed_data', 'status', 'admin_notes',
            'reviewed_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'admin_notes', 'reviewed_by',
            'created_at', 'updated_at'
        ]

    def validate_proposed_data(self, value):
        allowed_fields = {
            'first_name', 'last_name', 'username',
            'email', 'phone_number', 'profile_picture',
            'organization_name', 'address', 'description'
        }
        if not isinstance(value, dict):
            raise serializers.ValidationError("Proposed data must be a JSON object.")
        for key in value:
            if key not in allowed_fields:
                raise serializers.ValidationError(
                    f"Field '{key}' cannot be edited. "
                    f"Allowed fields: {', '.join(sorted(allowed_fields))}"
                )
        if not value:
            raise serializers.ValidationError("At least one field must be provided.")
        return value


class ProfileEditRequestListSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    reviewed_by_username = serializers.CharField(
        source='reviewed_by.username', read_only=True, default=None
    )

    class Meta:
        model = ProfileEditRequest
        fields = [
            'id', 'user', 'user_username', 'user_email', 'user_role',
            'proposed_data', 'status', 'admin_notes',
            'reviewed_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


class AdminUserDetailSerializer(serializers.ModelSerializer):
    organizer_profile = OrganizerProfileSerializer(read_only=True)
    total_bookings = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    total_events = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    pending_edit_requests = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'phone_number', 'role', 'profile_picture', 'is_verified',
            'is_active', 'organizer_profile',
            'total_bookings', 'total_spent',
            'total_events', 'total_revenue',
            'pending_edit_requests',
            'created_at', 'updated_at'
        ]

    def get_total_bookings(self, obj):
        if obj.role != 'USER':
            return None
        return obj.bookings.count() if hasattr(obj, 'bookings') else 0

    def get_total_spent(self, obj):
        if obj.role != 'USER':
            return None
        if not hasattr(obj, 'bookings'):
            return 0
        from django.db.models import Sum
        result = obj.bookings.filter(status='CONFIRMED').aggregate(
            total=Sum('total_price')
        )
        return float(result['total'] or 0)

    def get_total_events(self, obj):
        if obj.role != 'ORGANIZER':
            return None
        if not hasattr(obj, 'events'):
            return 0
        return obj.events.count()

    def get_total_revenue(self, obj):
        if obj.role != 'ORGANIZER':
            return None
        if not hasattr(obj, 'events'):
            return 0
        from django.db.models import Sum
        result = obj.events.filter(status__in=['COMPLETED', 'ONGOING']).aggregate(
            total=Sum('ticket_price')
        )
        return float(result['total'] or 0)

    def get_pending_edit_requests(self, obj):
        pending = obj.profile_edit_requests.filter(status='PENDING')
        return ProfileEditRequestListSerializer(pending, many=True).data
