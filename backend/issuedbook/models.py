from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string

def generate_issue_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class IssuedBook(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey('books.Book', on_delete=models.CASCADE)

    issue_code = models.CharField(max_length=10, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    def is_valid(self):
        return self.is_active and timezone.now() <= self.expires_at
