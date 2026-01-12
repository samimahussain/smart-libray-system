from django.urls import path
from .views import (
    mark_entry,
    mark_exit,
    AttendanceListView
)

urlpatterns = [
    path('', AttendanceListView.as_view(), name='attendance-list'),
    path('entry/', mark_entry, name='mark-entry'),
    path('exit/<int:pk>/', mark_exit, name='mark-exit'),
]
