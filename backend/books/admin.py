from django.contrib import admin
from .models import Book, OnlineIssue, OfflineRequest, PhysicalInventory, Attendance


# Updated BookAdmin - Replace only this class in admin.py
# All other admin classes stay EXACTLY the same

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'book_type', 'subject', 'genre', 'total_copies', 'available_copies', 'created_at']  # ⭐ Added 'genre'
    list_filter = ['book_type', 'subject', 'genre', 'language']  # ⭐ Added 'genre'
    search_fields = ['title', 'author', 'isbn', 'tags']  # ⭐ Added 'tags'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'author', 'isbn', 'subject', 'description', 'cover_image')
        }),
        ('Availability', {
            'fields': ('book_type',)
        }),
        ('Online Book Details', {
            'fields': ('pdf_file', 'read_time_hours'),
            'classes': ('collapse',)
        }),
        ('Offline Book Details', {
            'fields': ('total_copies', 'available_copies', 'shelf_location'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('published_year', 'publisher', 'language', 'pages', 'genre', 'rating', 'tags'),  # ⭐ Added genre, rating, tags
            'classes': ('collapse',)
        }),
    )


@admin.register(OnlineIssue)
class OnlineIssueAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'issued_at', 'due_date', 'is_active', 'is_overdue']
    list_filter = ['is_active', 'issued_at']
    search_fields = ['user__email', 'book__title']
    readonly_fields = ['access_token', 'issued_at']
    ordering = ['-issued_at']


@admin.register(OfflineRequest)
class OfflineRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'status', 'requested_date', 'due_date', 'fine_amount', 'fine_paid', 'created_at']
    list_filter = ['status', 'fine_paid', 'created_at']
    search_fields = ['user__email', 'book__title']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('user', 'book', 'purpose', 'requested_date', 'requested_return_date')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Librarian Actions', {
            'fields': ('approved_by', 'approved_at', 'librarian_remarks')
        }),
        ('Issue Details', {
            'fields': ('actual_issue_date', 'actual_return_date', 'due_date')
        }),
        ('Fines', {
            'fields': ('fine_amount', 'fine_paid')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_fine_paid', 'approve_requests']
    
    def mark_fine_paid(self, request, queryset):
        count = queryset.update(fine_paid=True)
        self.message_user(request, f'{count} fine(s) marked as paid.')
    mark_fine_paid.short_description = 'Mark selected fines as paid'
    
    def approve_requests(self, request, queryset):
        from django.utils import timezone
        count = queryset.filter(status='pending').update(
            status='approved',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{count} request(s) approved.')
    approve_requests.short_description = 'Approve selected pending requests'


@admin.register(PhysicalInventory)
class PhysicalInventoryAdmin(admin.ModelAdmin):
    list_display = ['book', 'copy_number', 'condition', 'shelf_location', 'last_checked']
    list_filter = ['condition', 'last_checked']
    search_fields = ['book__title']
    ordering = ['book', 'copy_number']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'check_in', 'check_out', 'verified_by']
    list_filter = ['check_in']
    search_fields = ['user__email']
    ordering = ['-check_in']
