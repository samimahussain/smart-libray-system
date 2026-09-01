from django.urls import path
from .views import (
    BookRequestCreateView,
    AllRequestsView,
    ApproveRequestView,
    RejectRequestView
)

urlpatterns = [
    path('', BookRequestCreateView.as_view()),  # POST student
    path('all/', AllRequestsView.as_view()),    # GET librarian
    path('<int:pk>/approve/', ApproveRequestView.as_view()),
    path('<int:pk>/reject/', RejectRequestView.as_view()),
]
