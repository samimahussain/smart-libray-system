from django.urls import path
from .views import online_issue_book, verify_book_token,read_book

urlpatterns = [
    path("online-issue/", online_issue_book),
    path("verify-token/", verify_book_token),
    path("read/<int:book_id>/", read_book),

]

