from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import UserManager

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("user", "User"),
        ("librarian", "Librarian"),
        ("admin", "Admin"),
    )

    # 🔑 Core auth fields
    email = models.EmailField(unique=True)

    # 🔹 Profile fields
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    institution = models.CharField(max_length=150, blank=True, null=True)

    # 🔹 Role & permissions
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="user"
    )

    # 🔹 NEW: Librarian invite code tracking
    invite_code_used = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Invite code used for librarian registration"
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # keep empty (email is enough)

    def __str__(self):
        return self.email
    
    # 🔹 NEW: Helper property
    @property
    def is_librarian(self):
        """Check if user is a librarian"""
        return self.role == "librarian"


# 🆕 NEW MODEL: InviteCode for librarian registration
class InviteCode(models.Model):
    """Model to manage librarian invite codes"""
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    max_uses = models.IntegerField(
        default=1, 
        help_text="Maximum number of times this code can be used"
    )
    current_uses = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_invite_codes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Invite Code'
        verbose_name_plural = 'Invite Codes'

    def __str__(self):
        return f"{self.code} ({self.current_uses}/{self.max_uses})"

    def is_valid(self):
        """Check if invite code is still valid"""
        from django.utils import timezone
        
        if not self.is_active:
            return False
        
        if self.current_uses >= self.max_uses:
            return False
        
        if self.expires_at and self.expires_at < timezone.now():
            return False
        
        return True

    def use_code(self):
        """Increment usage counter"""
        if self.is_valid():
            self.current_uses += 1
            self.save()
            return True
        return False
