# admin_module/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from books.models import Book
from issues.models import IssueRecord

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role',
            'is_active', 'date_joined', 'last_login',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'role', 'is_active']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'role', 'is_active']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AdminBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class AdminIssueSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    book_title = serializers.SerializerMethodField()
    book_author = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = IssueRecord
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'book', 'book_title', 'book_author',
            'issued_at', 'due_date', 'returned_at',
            'is_active', 'issue_type', 'status',
        ]
        read_only_fields = ['user', 'book', 'issued_at']

    def get_user_name(self, obj):
        return obj.user.name or obj.user.email

    def get_user_email(self, obj):
        return obj.user.email

    def get_book_title(self, obj):
        return obj.book.title

    def get_book_author(self, obj):
        return obj.book.author

    def get_status(self, obj):
        if not obj.is_active:
            return 'returned'
        from django.utils.timezone import now
        if now() > obj.due_date:
            return 'overdue'
        return 'active'
