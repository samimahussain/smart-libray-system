from django.contrib import admin
from .models import User, InviteCode

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "name", "role", "institution", "is_staff", "is_active", "date_joined")
    search_fields = ("email", "name", "institution")
    ordering = ("-date_joined",)
    list_filter = ("role", "is_active", "is_staff", "date_joined")
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('name', 'phone', 'institution')
        }),
        ('Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Librarian Info', {
            'fields': ('invite_code_used',),
            'classes': ('collapse',)  # Collapsible section
        }),
        ('Important Dates', {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']


@admin.register(InviteCode)
class InviteCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'is_active', 'current_uses', 'max_uses', 'created_at', 'expires_at', 'is_valid_display']
    list_filter = ['is_active', 'created_at']
    search_fields = ['code']
    readonly_fields = ['current_uses', 'created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Code Details', {
            'fields': ('code', 'is_active', 'max_uses', 'current_uses')
        }),
        ('Management', {
            'fields': ('created_by', 'expires_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def is_valid_display(self, obj):
        """Show if invite code is currently valid"""
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = 'Valid'
    
    actions = ['deactivate_codes', 'activate_codes']
    
    def deactivate_codes(self, request, queryset):
        """Bulk deactivate invite codes"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} invite code(s) deactivated.')
    deactivate_codes.short_description = 'Deactivate selected codes'
    
    def activate_codes(self, request, queryset):
        """Bulk activate invite codes"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} invite code(s) activated.')
    activate_codes.short_description = 'Activate selected codes'
