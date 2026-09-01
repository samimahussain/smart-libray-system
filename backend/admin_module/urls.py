from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminUserViewSet, AdminBookViewSet, AdminIssueViewSet, AdminAnalyticsView

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'books', AdminBookViewSet, basename='admin-books')
router.register(r'issues', AdminIssueViewSet, basename='admin-issues')

# FIX: AdminAnalyticsView is a ViewSet with no list() method.
# Register separately with manual URL prefix so custom actions work correctly.
# Endpoints become:
#   GET /api/admin/analytics/overview/
#   GET /api/admin/analytics/user-growth/
#   GET /api/admin/analytics/issue-trends/
#   GET /api/admin/analytics/book-usage/
analytics_router = DefaultRouter()
analytics_router.register(r'analytics', AdminAnalyticsView, basename='admin-analytics')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(analytics_router.urls)),
]