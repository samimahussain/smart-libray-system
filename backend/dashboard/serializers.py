from rest_framework import serializers
from .models import UserDashboardCache


class UserDashboardCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDashboardCache
        fields = '__all__'
        read_only_fields = ['last_updated']
