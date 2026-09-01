from rest_framework import serializers
from .models import IssueRecord

class IssueRecordSerializer(serializers.ModelSerializer):
    book_id = serializers.IntegerField(source="book.id", read_only=True)
    title = serializers.CharField(source="book.title", read_only=True)
    author = serializers.CharField(source="book.author", read_only=True)

    class Meta:
        model = IssueRecord
        fields = [
            "id",
            "book_id",
            "title",
            "author",
            "issued_at",
            "due_date",
            "is_active",  # Add this field
        ]