from .views import home
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('', home),  # root URL
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/books/', include('books.urls')),
    path("api/auth/", include("users.urls")),
    path('api/issues/', include('issues.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/analytics/', include('library_analytics.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
	