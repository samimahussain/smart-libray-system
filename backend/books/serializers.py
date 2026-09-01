from rest_framework import serializers
from .models import Book, OnlineIssue, OfflineRequest, PhysicalInventory, Attendance
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import uuid


# Updated BookSerializer - Replace only this class in serializers.py
# All other serializers stay EXACTLY the same

class BookSerializer(serializers.ModelSerializer):
    """Complete book information"""
    is_available_online = serializers.BooleanField(read_only=True)
    is_available_offline = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'subject', 'description',
            'cover_image', 'book_type', 'read_time_hours', 'total_copies',
            'available_copies', 'shelf_location', 'published_year',
            'publisher', 'language', 'pages', 
            'genre', 'rating', 'tags',  # ⭐ ADDED THESE THREE
            'is_available_online', 'is_available_offline', 'created_at'
        ]
        read_only_fields = ['created_at']


class OnlineIssueSerializer(serializers.ModelSerializer):
    """Online book issue with access token"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    book_id = serializers.IntegerField(source='book.id', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_until_due = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = OnlineIssue
        fields = [
            'id', 'book_id', 'book_title', 'book_author', 'access_token',
            'is_active', 'issued_at', 'due_date', 'returned_at',
            'is_overdue', 'days_until_due', 'reading_progress'
        ]
        read_only_fields = ['access_token', 'issued_at']


class IssueOnlineBookSerializer(serializers.Serializer):
    """Issue an online book to user"""
    book_id = serializers.IntegerField()
    
    def validate_book_id(self, value):
        try:
            book = Book.objects.get(id=value)
            if not book.is_available_online:
                raise serializers.ValidationError("This book is not available online.")
            return value
        except Book.DoesNotExist:
            raise serializers.ValidationError("Book not found.")
    
    def create(self, validated_data):
        user = self.context['request'].user
        book = Book.objects.get(id=validated_data['book_id'])
        
        # Check if user already has this book
        existing = OnlineIssue.objects.filter(
            user=user,
            book=book,
            is_active=True
        ).exists()
        
        if existing:
            raise serializers.ValidationError("You already have this book issued.")
        
        # Create issue with unique access token
        issue = OnlineIssue.objects.create(
            user=user,
            book=book,
            access_token=uuid.uuid4()
        )
        
        # Send email with access token
        self._send_access_token_email(user, book, issue.access_token)
        
        return issue
    
    def _send_access_token_email(self, user, book, token):
        """Send email with access token for PDF access"""
        subject = f'Access Token for "{book.title}"'
        message = f"""
Hello {user.name},

Your request to access "{book.title}" has been approved!

ACCESS TOKEN: {token}

Use this token to open the PDF in your library dashboard.

Valid until: {timezone.now() + timezone.timedelta(days=14)}

Happy reading!

EduVault Team
"""
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send access token email: {e}")


class OfflineRequestSerializer(serializers.ModelSerializer):
    """Offline book request details"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True, allow_null=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_overdue = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = OfflineRequest
        fields = [
            'id', 'book', 'book_title', 'book_author', 'user_name', 'user_email',
            'purpose', 'requested_date', 'requested_return_date', 'status',
            'approved_by', 'approved_by_name', 'approved_at', 'librarian_remarks',
            'actual_issue_date', 'actual_return_date', 'due_date',
            'fine_amount', 'fine_paid', 'is_overdue', 'days_overdue',
            'created_at'
        ]
        read_only_fields = ['status', 'approved_by', 'approved_at', 'created_at']


class CreateOfflineRequestSerializer(serializers.Serializer):
    """Create new offline book request"""
    book_id = serializers.IntegerField()
    purpose = serializers.CharField(max_length=500)
    requested_date = serializers.DateField()
    requested_return_date = serializers.DateField()
    
    def validate_book_id(self, value):
        try:
            book = Book.objects.get(id=value)
            if not book.is_available_offline:
                raise serializers.ValidationError("This book is not available for offline issue.")
            return value
        except Book.DoesNotExist:
            raise serializers.ValidationError("Book not found.")
    
    def validate(self, data):
        if data['requested_return_date'] <= data['requested_date']:
            raise serializers.ValidationError("Return date must be after requested date.")
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        book = Book.objects.get(id=validated_data['book_id'])
        
        # Check for existing pending/approved requests
        existing = OfflineRequest.objects.filter(
            user=user,
            book=book,
            status__in=['pending', 'approved', 'issued']
        ).exists()
        
        if existing:
            raise serializers.ValidationError("You already have a pending or active request for this book.")
        
        request = OfflineRequest.objects.create(
            user=user,
            book=book,
            purpose=validated_data['purpose'],
            requested_date=validated_data['requested_date'],
            requested_return_date=validated_data['requested_return_date']
        )
        
        return request


class ApproveOfflineRequestSerializer(serializers.Serializer):
    """Approve/Reject offline request"""
    request_id = serializers.IntegerField()
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    remarks = serializers.CharField(required=False, allow_blank=True)
    due_date = serializers.DateField(required=False)
    
    def validate_request_id(self, value):
        try:
            OfflineRequest.objects.get(id=value, status='pending')
            return value
        except OfflineRequest.DoesNotExist:
            raise serializers.ValidationError("Request not found or already processed.")
    
    def save(self):
        librarian = self.context['request'].user
        request_obj = OfflineRequest.objects.get(id=self.validated_data['request_id'])
        
        if self.validated_data['action'] == 'approve':
            request_obj.approve(
                librarian=librarian,
                remarks=self.validated_data.get('remarks', '')
            )
        else:
            request_obj.reject(
                librarian=librarian,
                remarks=self.validated_data.get('remarks', '')
            )
        
        return request_obj


class IssuePhysicalBookSerializer(serializers.Serializer):
    """Issue physical book (after approval)"""
    request_id = serializers.IntegerField()
    due_date = serializers.DateField()
    
    def validate_request_id(self, value):
        try:
            OfflineRequest.objects.get(id=value, status='approved')
            return value
        except OfflineRequest.DoesNotExist:
            raise serializers.ValidationError("Request not found or not approved.")
    
    def save(self):
        request_obj = OfflineRequest.objects.get(id=self.validated_data['request_id'])
        request_obj.issue_book(due_date=self.validated_data['due_date'])
        return request_obj


class ReturnPhysicalBookSerializer(serializers.Serializer):
    """Return physical book"""
    request_id = serializers.IntegerField()
    fine_amount = serializers.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    def validate_request_id(self, value):
        try:
            OfflineRequest.objects.get(id=value, status='issued')
            return value
        except OfflineRequest.DoesNotExist:
            raise serializers.ValidationError("Request not found or not currently issued.")
    
    def save(self):
        request_obj = OfflineRequest.objects.get(id=self.validated_data['request_id'])
        request_obj.return_book(fine=self.validated_data['fine_amount'])
        return request_obj


class PhysicalInventorySerializer(serializers.ModelSerializer):
    """Physical inventory management"""
    book_title = serializers.CharField(source='book.title', read_only=True)
    
    class Meta:
        model = PhysicalInventory
        fields = ['id', 'book', 'book_title', 'copy_number', 'condition', 
                  'shelf_location', 'last_checked', 'notes']


class AttendanceSerializer(serializers.ModelSerializer):
    """Attendance tracking"""
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'user_name', 'user_email', 'check_in', 
                  'check_out', 'verified_by']
        read_only_fields = ['check_in']
