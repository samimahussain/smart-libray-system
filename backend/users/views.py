from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import get_object_or_404
from .permissions import IsLibrarian
from .serializers import (
    LoginSerializer, 
    UserSerializer, 
    RegisterSerializer,
    LibrarianRegisterSerializer,
    LibrarianLoginSerializer
)
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        # This ensures every new user is "Active" by default
        serializer.save(is_active=True)
class LibrarianRegisterView(generics.CreateAPIView):
    """
    Register a new librarian with invite code
    
    POST /api/users/librarian/register/
    Body: {
        "name": "John Doe",
        "email": "john@library.com",
        "phone": "1234567890",
        "institution": "Central Library",
        "invite_code": "LIB-EDUVAULT",
        "password": "securepass123"
    }
    """
    queryset = User.objects.all()
    serializer_class = LibrarianRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Registration successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


class LibrarianLoginView(TokenObtainPairView):
    """
    Login librarian and return JWT tokens
    
    POST /api/users/librarian/login/
    Body: {
        "email": "john@library.com",
        "password": "securepass123"
    }
    """
    serializer_class = LibrarianLoginSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        
        if 'name' in request.data:
            user.name = request.data.get('name')
        
        if 'phone' in request.data:
            user.phone = request.data.get('phone')
        
        if 'institution' in request.data:
            user.institution = request.data.get('institution')
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'message': 'Profile updated successfully',
            'user': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        user = request.user
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')
        
        if not check_password(current_password, user.password):
            return Response(
                {'message': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.password = make_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# 🆕 User Verification Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLibrarian])
def all_users(request):
    """Get all users with their details"""
    users = User.objects.filter(role='user').order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLibrarian])
def toggle_block(request, user_id):
    """Block or unblock a user"""
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Toggle the is_active status
        is_active = request.data.get('is_active')
        
        if is_active is None:
            return Response(
                {'message': 'is_active field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = is_active
        user.save()
        
        action = 'unblocked' if is_active else 'blocked'
        
        return Response({
            'message': f'User {action} successfully',
            'is_active': user.is_active
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
