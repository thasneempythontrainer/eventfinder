from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from .models import User, OrganizerProfile, ProfileEditRequest

from notifications_app.email import send_adhoc_email
from notifications_app.models import Notification

from .serializers import (
    UserRegistrationSerializer,
    OrganizerRegistrationSerializer,
    LoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    OrganizerApprovalSerializer,
    ProfileEditRequestSerializer,
    ProfileEditRequestListSerializer,
    AdminUserDetailSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)


class RegisterUserView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = UserRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            Notification.objects.create(
                user=user,
                notification_type='WELCOME',
                title='Welcome to EventFinder',
                message=(
                    'Your EventFinder account has been created. '
                    'You can now browse events and book tickets.'
                ),
            )

            return Response(
                {
                    "message": "User registered successfully."
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class RegisterOrganizerView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = OrganizerRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            new_user = serializer.save()

            from accounts.models import User
            admin_users = User.objects.filter(role='ADMIN', is_active=True)
            for admin in admin_users:
                Notification.objects.create(
                    user=admin,
notification_type='ORGANIZER_APPROVAL',
                title='New Organizer Registration',
                message=f'{new_user.first_name or new_user.username} ({new_user.email}) registered as an organizer and is waiting for approval.',
                requires_action=True,
            )

            Notification.objects.create(
                user=new_user,
                notification_type='ORGANIZER_APPLICATION_RECEIVED',
                title='Organizer application received',
                message=(
                    'Thanks for applying to organise events on EventFinder. '
                    'An administrator is reviewing your application and you '
                    'will hear from us shortly.'
                ),
            )

            return Response(
                {
                    "message": (
                        "Organizer registered successfully. "
                        "Waiting for admin approval."
                    )
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)

        agent = request.META.get('HTTP_USER_AGENT', 'Unknown device')
        ip = request.META.get('HTTP_X_FORWARDED_FOR', '')
        ip = ip.split(',')[0].strip() if ip else request.META.get('REMOTE_ADDR', 'Unknown')
        Notification.objects.create(
            user=user,
            notification_type='ACCOUNT_LOGIN',
            title='New login to your account',
            message=(
                f'Your account was signed in from {ip} using {agent}.'
            ),
        )

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            }
        )


class PasswordResetRequestView(APIView):

    permission_classes = []

    def post(self, request):
        """Send a password reset link to the given email (all user types)."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(
            email__iexact=email, is_active=True
        ).order_by("pk").first()

        if user is not None:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
            )

            subject = "Reset your EventFinder password"
            message = (
                f"Hello {user.first_name or user.username},\n\n"
                "You requested a password reset for your EventFinder account.\n\n"
                f"Click the link below to choose a new password:\n{reset_url}\n\n"
                "This link expires in "
                f"{int(settings.PASSWORD_RESET_TIMEOUT.total_seconds() // 3600)} hours and "
                "can only be used once.\n\n"
                "If you did not request this, you can safely ignore this email. "
                "Your password has not changed.\n\n"
                "Best regards,\nEvent Finder Team\nEventFinder"
            )

            # Recorded so a failed send is visible instead of silently lost.
            notification = Notification.objects.create(
                user=user,
                notification_type='PASSWORD_RESET_REQUESTED',
                title='Password reset requested',
                message='A password reset link was sent to your email address.',
            )
            send_adhoc_email(
                user.email, subject, message, notification=notification
            )

        return Response(
            {
                "message": (
                    "If an account exists with this email, "
                    "a password reset link has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):

    permission_classes = []

    def post(self, request):
        """Validate the reset token and set a new password (all user types)."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "The password reset link is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"detail": "The password reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        Notification.objects.create(
            user=user,
            notification_type='PASSWORD_CHANGED',
            title='Your password has been changed',
            message=(
                'The password for your EventFinder account was reset. '
                'If this was not you, reset it again and contact support.'
            ),
        )

        return Response(
            {"message": "Your password has been reset successfully. You can now sign in."},
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)

        return Response(serializer.data)

    def put(self, request):
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(serializer.instance).data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        # Users can only see themselves or all organizers for admin
        if self.request.user.role == 'ADMIN':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['GET'])
    def me(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['PUT'])
    def update_profile(self, request):
        """Update user profile"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(serializer.instance).data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def organizers(self, request):
        """Get all organizers (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        organizers = User.objects.filter(role='ORGANIZER')
        serializer = self.get_serializer(organizers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def all_users(self, request):
        """Get all users with details (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        role_filter = request.query_params.get('role', None)
        search = request.query_params.get('search', None)

        users = User.objects.all()
        if role_filter:
            users = users.filter(role=role_filter.upper())
        if search:
            from django.db.models import Q
            users = users.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )

        users = users.order_by('-created_at')
        serializer = AdminUserDetailSerializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def user_detail(self, request, id=None):
        """Get detailed user info (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        user = self.get_object()
        serializer = AdminUserDetailSerializer(user)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def toggle_active(self, request, id=None):
        """Toggle user active status (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        user = self.get_object()
        if user.role == 'ADMIN' and user.id == request.user.id:
            return Response(
                {"detail": "Cannot deactivate your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save()

        if user.is_active:
            Notification.objects.create(
                user=user,
                notification_type='ACCOUNT_ACTIVATED',
                title='Your account has been activated',
                message='An administrator has reactivated your EventFinder account. You can sign in again.',
            )
        else:
            Notification.objects.create(
                user=user,
                notification_type='ACCOUNT_DEACTIVATED',
                title='Your account has been deactivated',
                message='An administrator has deactivated your EventFinder account. You can no longer sign in or book tickets.',
            )

        return Response({
            'is_active': user.is_active,
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully'
        })

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def approve_organizer(self, request, id=None):
        """Approve organizer registration (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        user = self.get_object()

        if user.role != 'ORGANIZER':
            return Response(
                {"detail": "User is not an organizer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            organizer_profile = user.organizer_profile
            serializer = OrganizerApprovalSerializer(
                organizer_profile,
                data={'approval_status': 'APPROVED'},
                partial=True
            )

            if serializer.is_valid():
                serializer.save()

                from notifications_app.models import Notification
                Notification.objects.create(
                    user=user,
                    notification_type='ORGANIZER_APPROVAL',
                    title='Account Approved',
                    message=(
                        f'Congratulations {user.first_name or user.username}! '
                        f'Your organizer account has been approved. '
                        f'You can now create and manage events.'
                    )
                )

                return Response({
                    'status': 'Organizer approved successfully'
                })

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except OrganizerProfile.DoesNotExist:
            return Response(
                {"detail": "Organizer profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def reject_organizer(self, request, id=None):
        """Reject organizer registration (admin only)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can access this"},
                status=status.HTTP_403_FORBIDDEN
            )

        user = self.get_object()

        if user.role != 'ORGANIZER':
            return Response(
                {"detail": "User is not an organizer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            organizer_profile = user.organizer_profile
            serializer = OrganizerApprovalSerializer(
                organizer_profile,
                data={'approval_status': 'REJECTED'},
                partial=True
            )

            if serializer.is_valid():
                serializer.save()

                from notifications_app.models import Notification
                Notification.objects.create(
                    user=user,
                    notification_type='ORGANIZER_REJECTED',
                    title='Account Rejected',
                    message=(
                        f'Sorry {user.first_name or user.username}, '
                        f'your organizer account application has been rejected. '
                        f'Please contact support for more information.'
                    )
                )

                return Response({
                    'status': 'Organizer rejected'
                })

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        except OrganizerProfile.DoesNotExist:
            return Response(
                {"detail": "Organizer profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class ProfileEditRequestViewSet(viewsets.ModelViewSet):
    """Manage profile edit requests"""
    serializer_class = ProfileEditRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return ProfileEditRequest.objects.all()
        return ProfileEditRequest.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProfileEditRequestListSerializer
        return ProfileEditRequestSerializer

    def perform_create(self, serializer):
        edit_request = serializer.save(user=self.request.user)

        admin_users = User.objects.filter(role='ADMIN', is_active=True)
        fields = ', '.join(edit_request.proposed_data.keys())
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                notification_type='PROFILE_EDIT_REQUEST',
                title='Profile Edit Request',
                message=(
                    f'{self.request.user.first_name or self.request.user.username} '
                    f'({self.request.user.role}) requested changes to: {fields}'
                ),
                requires_action=True,
            )

        Notification.objects.create(
            user=self.request.user,
            notification_type='PROFILE_EDIT_REQUEST',
            title='Profile change request received',
            message=(
                f'We received your request to update: {fields}. '
                'An administrator will review it shortly.'
            ),
        )

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Admin approves a profile edit request and applies changes"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can approve edit requests"},
                status=status.HTTP_403_FORBIDDEN
            )

        edit_request = self.get_object()

        if edit_request.status != 'PENDING':
            return Response(
                {"detail": "This request has already been reviewed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = edit_request.user
        proposed = edit_request.proposed_data

        profile_fields = {'organization_name', 'address', 'description'}
        user_fields = proposed.keys() - profile_fields

        if 'email' in user_fields:
            new_email = (proposed['email'] or '').strip()
            if not new_email:
                return Response(
                    {"detail": "Failed to update user: email is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            clash = User.objects.filter(email__iexact=new_email).exclude(pk=user.pk)
            if clash.exists():
                return Response(
                    {
                        "detail": (
                            "Failed to update user: an account with this email "
                            "already exists. Please use another email."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        for field in user_fields:
            value = proposed[field]
            if field == 'phone_number' and value == '':
                value = None
            setattr(user, field, value)

        if user_fields:
            try:
                user.full_clean()
                user.save()
            except Exception as e:
                return Response(
                    {"detail": f"Failed to update user: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if user.role == 'ORGANIZER' and profile_fields.intersection(proposed):
            try:
                op = user.organizer_profile
                for field in profile_fields:
                    if field in proposed:
                        setattr(op, field, proposed[field])
                op.save()
            except OrganizerProfile.DoesNotExist:
                pass

        edit_request.status = 'APPROVED'
        edit_request.reviewed_by = request.user
        edit_request.save()

        from notifications_app.models import Notification
        Notification.objects.create(
            user=user,
            notification_type='PROFILE_EDIT_APPROVED',
            title='Profile Changes Approved',
            message='Your profile changes have been approved and applied.'
        )

        return Response({"detail": "Profile changes approved and applied."})

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Admin rejects a profile edit request"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only admins can reject edit requests"},
                status=status.HTTP_403_FORBIDDEN
            )

        edit_request = self.get_object()

        if edit_request.status != 'PENDING':
            return Response(
                {"detail": "This request has already been reviewed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        notes = request.data.get('admin_notes', '')
        edit_request.status = 'REJECTED'
        edit_request.admin_notes = notes
        edit_request.reviewed_by = request.user
        edit_request.save()

        from notifications_app.models import Notification
        Notification.objects.create(
            user=edit_request.user,
            notification_type='PROFILE_EDIT_REJECTED',
            title='Profile Changes Rejected',
            message=(
                f'Your profile changes have been rejected.'
                + (f' Reason: {notes}' if notes else '')
            )
        )

        return Response({"detail": "Profile edit request rejected."})