from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User, OrganizerProfile


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
            'approval_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    organization_name = serializers.CharField(write_only=True)
    government_id = serializers.FileField(write_only=True)
    address = serializers.CharField(write_only=True, required=False, default="")

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
        ]
        extra_kwargs = {
            "username": {"required": False},
            "phone_number": {"required": False},
        }

    def create(self, validated_data):
        organization_name = validated_data.pop("organization_name")
        government_id = validated_data.pop("government_id")
        address = validated_data.pop("address", "")
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
