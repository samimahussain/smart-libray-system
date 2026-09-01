from .views import home
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", home),  # root URL
    path('admin/', admin.site.urls),
    path('api/admin/', include('admin_module.urls')),
    

    # Auth / Users
    path("api/users/", include("users.urls")),
    path("api/auth/", include("users.urls")),
    
    # Books System (books, issues, requests, librarian - ALL IN ONE)
    path("api/", include("books.urls")),

    # Attendance & Analytics
    path("api/attendance/", include("attendance.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/analytics/", include("library_analytics.urls")),

    # AI
    path("api/ai/", include("ai.urls")),

    # Study Plan
    path("api/study-plan/", include("studyplan.urls")),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )