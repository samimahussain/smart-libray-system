from rest_framework import serializers
from .models import User, InviteCode
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
import secrets
import string

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "password", "name", "phone", "institution")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# 🆕 UPDATED: Librarian Registration - Sends email with invite code
class LibrarianRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['name', 'email', 'phone', 'institution', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        
        # Generate unique invite code
        invite_code = self._generate_invite_code()
        
        # Create invite code in database
        InviteCode.objects.create(
            code=invite_code,
            is_active=True,
            max_uses=100,  # One-time use per librarian
            current_uses=0
        )
        
        # Create user with librarian role (not activated until they use invite code)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            institution=validated_data.get('institution', ''),
            role='librarian',
            is_active=False,  # Will be activated on first login with invite code
            invite_code_used=invite_code
        )
        
        # Send email with invite code
        self._send_invite_email(user.email, user.name, invite_code)
        
        return user
    
    def _generate_invite_code(self):
        """Generate a unique 8-character invite code"""
        while True:
            code = 'LIB-' + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
            if not InviteCode.objects.filter(code=code).exists():
                return code
    
    def _send_invite_email(self, email, name, invite_code):
        """Send email with invite code"""
        subject = 'EduVault - Your Librarian Invite Code'
        message = f"""
Hello {name},

Welcome to EduVault Library Management System!

Your librarian account has been created. To complete the setup and access your dashboard, 
please use the following invite code when you login:

INVITE CODE: {invite_code}

This code is unique to your account and should be kept secure.

To login:
1. Go to the librarian login page
2. Enter your email and password
3. Enter the invite code above

If you didn't request this account, please ignore this email.

Best regards,
EduVault Team
"""
        
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,  # From email
                [email],  # To email
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {e}")
            # Don't fail registration if email fails


# 🆕 NEW: Librarian Login with invite code validation
class LibrarianLoginSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    invite_code = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        invite_code = attrs.get('invite_code')
        
        # Authenticate using email
        user = authenticate(
            request=self.context.get('request'), 
            email=email, 
            password=password
        )
        
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        
        if user.role != 'librarian':
            raise serializers.ValidationError("This login is for librarians only.")
        
        # Validate invite code
        if user.invite_code_used != invite_code:
            raise serializers.ValidationError("Invalid invite code.")
        
        # Check if invite code is still valid in database
        try:
            invite = InviteCode.objects.get(code=invite_code)
            if not invite.is_valid():
                raise serializers.ValidationError("This invite code has expired or been used.")
            
            # Activate user on first successful login
            if not user.is_active:
                user.is_active = True
                user.save()
            
            # Mark invite code as used
            invite.use_code()
            
        except InviteCode.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code.")
        
        # Get JWT tokens
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'email': user.email,
            'role': user.role,
            'name': user.name,
            'phone': user.phone,
            'institution': user.institution,
        }
        
        return data


class LoginSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add extra user info
        data['email'] = self.user.email
        data['role'] = self.user.role

        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "role", "name", "phone", "institution", "date_joined",  "is_active")
        read_only_fields = ["id", "date_joined"]
