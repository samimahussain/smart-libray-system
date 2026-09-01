from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True)
    genre = models.CharField(max_length=100)

    def __str__(self):
        return self.title


class UserBookActivity(models.Model):
    STATUS_CHOICES = (
        ('READING', 'Reading'),
        ('COMPLETED', 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'book')


class UserMonthlyAnalytics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month_year = models.CharField(max_length=7)
    books_completed = models.IntegerField(default=0)
    streak_count = models.IntegerField(default=0)
    reward_unlocked = models.BooleanField(default=False)
    extra_books = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'month_year')


class UserActivity(models.Model):
    """Track all user activities for analytics"""
    EVENT_TYPES = (
        ('page_view', 'Page View'),
        ('book_view', 'Book View'),
        ('book_search', 'Book Search'),
        ('book_issue', 'Book Issue'),
        ('book_return', 'Book Return'),
        ('study_plan_create', 'Study Plan Created'),
        ('study_plan_update', 'Study Plan Updated'),
        ('task_complete', 'Task Completed'),
        ('attendance_mark', 'Attendance Marked'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    event_data = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['event_type', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event_type} at {self.timestamp}"
