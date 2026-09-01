from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Dashboard app doesn't need its own models since it aggregates data from other apps
# It will query from: issues.IssueRecord, attendance.Attendance, studyplan.StudyPlan, etc.
# This file can remain minimal or be used for dashboard-specific cached data in the future

class UserDashboardCache(models.Model):
    """Optional: Cache computed dashboard stats for performance"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard_cache')
    books_issued_count = models.IntegerField(default=0)
    study_days_count = models.IntegerField(default=0)
    attendance_count = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Dashboard Cache"
        verbose_name_plural = "Dashboard Caches"
    
    def __str__(self):
        return f"Dashboard cache for {self.user.username}"
