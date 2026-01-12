from rest_framework import serializers
from .models import IssueRecord

class IssueRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueRecord
        fields = ['id', 'user', 'book', 'issued_at', 'due_date']  # exclude returned_at
