from django.contrib import admin
from .models import UserDashboardCache


@admin.register(UserDashboardCache)
class UserDashboardCacheAdmin(admin.ModelAdmin):
    list_display = ['user', 'books_issued_count', 'study_days_count', 'current_streak', 'last_updated']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['last_updated']
    list_filter = ['last_updated']
