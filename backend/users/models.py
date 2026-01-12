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

    # 🔹 NEW profile fields
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    institution = models.CharField(max_length=150, blank=True, null=True)

    # 🔹 Role & permissions
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="user"
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # keep empty (email is enough)

    def __str__(self):
        return self.email