from rest_framework import serializers
from .models import Book, UserBookActivity, UserMonthlyAnalytics, UserActivity


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class UserBookActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBookActivity
        fields = '__all__'


class UserMonthlyAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMonthlyAnalytics
        fields = '__all__'


class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = '__all__'
        read_only_fields = ['user', 'timestamp']


class TrackEventSerializer(serializers.Serializer):
    """Serializer for tracking events"""
    event_type = serializers.ChoiceField(choices=UserActivity.EVENT_TYPES)
    event_data = serializers.JSONField(required=False, default=dict)
