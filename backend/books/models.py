from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

# Updated Book model - Add these fields to your existing models.py
# backend/books/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Book(models.Model):
    """Main book catalog - both online and offline books"""
    BOOK_TYPE_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('both', 'Both'),
    ]
    
    # Basic Info (EXISTING - DON'T CHANGE)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, default='')
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    subject = models.CharField(max_length=100, blank=True, default='General')
    description = models.TextField(blank=True, default='')
    cover_image = models.URLField(blank=True, null=True)
    
    # Availability (EXISTING - DON'T CHANGE)
    book_type = models.CharField(max_length=10, choices=BOOK_TYPE_CHOICES, default='both')
    
    # Online Book Info (EXISTING - DON'T CHANGE)
    pdf_file = models.FileField(upload_to='books/pdfs/', blank=True, null=True)
    read_time_hours = models.IntegerField(default=0, help_text="Estimated reading time in hours")
    
    # Offline Book Info (EXISTING - DON'T CHANGE)
    total_copies = models.IntegerField(default=0, help_text="Total physical copies")
    available_copies = models.IntegerField(default=0, help_text="Currently available")
    shelf_location = models.CharField(max_length=50, blank=True, default='')
    
    # Metadata (EXISTING - DON'T CHANGE)
    published_year = models.IntegerField(blank=True, null=True)
    publisher = models.CharField(max_length=255, blank=True, default='')
    language = models.CharField(max_length=50, default='English')
    pages = models.IntegerField(blank=True, null=True)
    
    # ⭐ NEW FIELDS - ADD THESE THREE LINES ⭐
    genre = models.CharField(max_length=100, blank=True, default='General')
    rating = models.DecimalField(max_digits=3, decimal_places=1, blank=True, null=True, default=4.5)
    tags = models.TextField(blank=True, default='', help_text='Comma-separated tags')
    
    # Timestamps (EXISTING - DON'T CHANGE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Book'
        verbose_name_plural = 'Books'
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
    @property
    def is_available_online(self):
        return self.book_type in ['online', 'both'] and self.pdf_file
    
    @property
    def is_available_offline(self):
        return self.book_type in ['offline', 'both'] and self.available_copies > 0


# Keep all other models (OnlineIssue, OfflineRequest, etc.) EXACTLY as they are
# Don't change anything else!

class OnlineIssue(models.Model):
    """Online book issues - instant access"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='online_issues')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='online_issues')
    
    # Access Control
    access_token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    issued_at = models.DateTimeField(default=timezone.now)  # Changed from auto_now_add
    due_date = models.DateTimeField()
    returned_at = models.DateTimeField(blank=True, null=True)
    
    # Reading Progress
    last_page_read = models.IntegerField(default=0)
    reading_progress = models.IntegerField(default=0, help_text="Percentage")
    
    class Meta:
        ordering = ['-issued_at']
        verbose_name = 'Online Issue'
        verbose_name_plural = 'Online Issues'
    
    def __str__(self):
        return f"{self.user.email} - {self.book.title}"
    
    def save(self, *args, **kwargs):
        if not self.due_date:
            # Default: 14 days from now
            self.due_date = timezone.now() + timezone.timedelta(days=14)
        super().save(*args, **kwargs)
    
    @property
    def is_overdue(self):
        return self.is_active and timezone.now() > self.due_date
    
    @property
    def days_until_due(self):
        if not self.is_active:
            return 0
        delta = self.due_date - timezone.now()
        return delta.days


class OfflineRequest(models.Model):
    """Offline book requests - requires librarian approval"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('issued', 'Issued'),
        ('returned', 'Returned'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offline_requests')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='offline_requests')
    
    # Request Details
    purpose = models.TextField(help_text="Why user needs this book")
    requested_date = models.DateField(help_text="When user wants to pick up")
    requested_return_date = models.DateField(help_text="Expected return date")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Librarian Actions
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_requests'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    librarian_remarks = models.TextField(blank=True, default='')
    
    # Issue Details (filled when approved and issued)
    actual_issue_date = models.DateField(blank=True, null=True)
    actual_return_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    
    # Fine Management
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fine_paid = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)  # Changed from auto_now_add
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Offline Request'
        verbose_name_plural = 'Offline Requests'
    
    def __str__(self):
        return f"{self.user.email} - {self.book.title} ({self.status})"
    
    def approve(self, librarian, remarks=''):
        """Approve the request"""
        self.status = 'approved'
        self.approved_by = librarian
        self.approved_at = timezone.now()
        self.librarian_remarks = remarks
        self.save()
    
    def reject(self, librarian, remarks=''):
        """Reject the request"""
        self.status = 'rejected'
        self.approved_by = librarian
        self.approved_at = timezone.now()
        self.librarian_remarks = remarks
        self.save()
    
    def issue_book(self, due_date):
        """Mark as issued (physical handover)"""
        if self.status != 'approved':
            raise ValueError("Can only issue approved requests")
        
        self.status = 'issued'
        self.actual_issue_date = timezone.now().date()
        self.due_date = due_date
        
        # Reduce available copies
        if self.book.available_copies > 0:
            self.book.available_copies -= 1
            self.book.save()
        
        self.save()
    
    def return_book(self, fine=0):
        """Mark as returned"""
        self.status = 'returned'
        self.actual_return_date = timezone.now().date()
        self.fine_amount = fine
        
        # Increase available copies
        self.book.available_copies += 1
        self.book.save()
        
        self.save()
    
    @property
    def is_overdue(self):
        if self.status != 'issued' or not self.due_date:
            return False
        return timezone.now().date() > self.due_date
    
    @property
    def days_overdue(self):
        if not self.is_overdue:
            return 0
        delta = timezone.now().date() - self.due_date
        return delta.days
    
    def calculate_fine(self, per_day_fine=10):
        """Calculate fine based on days overdue"""
        if self.is_overdue:
            return self.days_overdue * per_day_fine
        return 0


class PhysicalInventory(models.Model):
    """Track physical book conditions"""
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('damaged', 'Damaged'),
        ('lost', 'Lost'),
    ]
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='inventory_records')
    copy_number = models.IntegerField(help_text="Copy #1, #2, etc.")
    
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    shelf_location = models.CharField(max_length=50, default='')
    
    last_checked = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, default='')
    
    class Meta:
        ordering = ['book', 'copy_number']
        verbose_name = 'Physical Inventory'
        verbose_name_plural = 'Physical Inventories'
        unique_together = ['book', 'copy_number']
    
    def __str__(self):
        return f"{self.book.title} - Copy #{self.copy_number} ({self.condition})"


class Attendance(models.Model):
    """Track library attendance via QR scan"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_logs')
    
    check_in = models.DateTimeField(default=timezone.now)  # Changed from auto_now_add
    check_out = models.DateTimeField(blank=True, null=True)
    
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_attendance'
    )
    
    class Meta:
        ordering = ['-check_in']
        verbose_name = 'Attendance'
        verbose_name_plural = 'Attendance Records'
    
    def __str__(self):
        return f"{self.user.email} - {self.check_in.date()}"
