import uuid
from django.db import models
from django.conf import settings
from books.models import Book
from django.utils.timezone import now

class IssueRecord(models.Model):
    ISSUE_TYPE_CHOICES = (
        ("ONLINE", "Online"),
        ("PHYSICAL", "Physical"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)

    issue_type = models.CharField(
        max_length=10,
        choices=ISSUE_TYPE_CHOICES,
        default="PHYSICAL"
    )

    email = models.EmailField(null=True, blank=True)

    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()

    access_token = models.UUIDField(default=uuid.uuid4, null=True, blank=True)

    is_active = models.BooleanField(default=True)

    returned_at = models.DateTimeField(null=True, blank=True)

    def is_expired(self):
        return now() > self.due_date

    def __str__(self):
        return f"{self.user} - {self.book} ({self.issue_type})"
