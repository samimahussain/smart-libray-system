from django.db import models
from django.conf import settings
from django.utils import timezone


class Attendance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.check_in and self.check_out:
            delta = self.check_out - self.check_in
            self.duration_minutes = int(delta.total_seconds() // 60)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.check_in.date() if self.check_in else 'No Check-in'}"
