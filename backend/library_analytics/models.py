from django.db import models

class MonthlyReport(models.Model):
    month = models.CharField(max_length=20)  # e.g., "January 2025"
    total_issues = models.IntegerField(default=0)
    total_returns = models.IntegerField(default=0)
    most_read_category = models.CharField(max_length=200, blank=True, null=True)
    peak_hour = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Report - {self.month}"
