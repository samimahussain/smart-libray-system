from django.db import models
from django.conf import settings

class StudyPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.CharField(max_length=200)
    exam_type = models.CharField(max_length=100)
    daily_hours = models.IntegerField()
    target_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)  # <- make sure this is here

    def __str__(self):
        return f"{self.course} ({self.exam_type})"


class StudyTask(models.Model):
    plan = models.ForeignKey(
        StudyPlan,
        related_name="tasks",
        on_delete=models.CASCADE
    )
    date = models.DateField()
    task = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.date} - {self.task}"
