from django.urls import path
from .views import track_event, track_batch, analytics_overview, user_insights

app_name = 'analytics'

urlpatterns = [
    path('track/', track_event, name='track_event'),
    path('track/batch/', track_batch, name='track_batch'),
    path('overview/', analytics_overview, name='analytics_overview'),
    path('insights/', user_insights, name='user_insights'),
]
