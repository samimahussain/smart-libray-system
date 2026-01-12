from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    pdf_file = models.FileField(upload_to="books/pdfs/", null=True, blank=True)

    # ✅ NEW FLAGS
    is_popular = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)

    def __str__(self):
        return self.title
