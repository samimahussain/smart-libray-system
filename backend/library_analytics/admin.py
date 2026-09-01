from django.contrib import admin
from .models import Book, UserBookActivity, UserMonthlyAnalytics, UserActivity


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'event_type', 'timestamp', 'ip_address']
    list_filter = ['event_type', 'timestamp']
    search_fields = ['user__username', 'event_type']
    readonly_fields = ['timestamp', 'ip_address', 'user_agent']
    date_hierarchy = 'timestamp'


admin.site.register(Book)
admin.site.register(UserBookActivity)
admin.site.register(UserMonthlyAnalytics)
