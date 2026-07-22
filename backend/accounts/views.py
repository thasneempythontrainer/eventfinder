from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OrganizerProfile

from .serializers import (
    UserRegistrationSerializer,
    OrganizerRegistrationSerializer,
    LoginSerializer,
    UserSerializer,
    UserUpdateSerializer,
    OrganizerApprovalSerializer,
)


class RegisterUserView(APIView):

    permission_classes = []

    def post(self, request):

        serializer = UserRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

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
            from notifications_app.models import Notification
            admin_users = User.objects.filter(role='ADMIN', is_active=True)
            for admin in admin_users:
                Notification.objects.create(
                    user=admin,
                    notification_type='ORGANIZER_APPROVAL',
                    title='New Organizer Registration',
                    message=f'{new_user.first_name or new_user.username} ({new_user.email}) registered as an organizer and is waiting for approval.',
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

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
            }
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