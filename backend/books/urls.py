from django.urls import path
from .views import BookListCreateView, BookRetrieveUpdateDeleteView
from .views import IssueBookView
urlpatterns = [
    path('', BookListCreateView.as_view(), name='book-list-create'),
    path('<int:pk>/', BookRetrieveUpdateDeleteView.as_view(), name='book-detail'),
    path('<int:book_id>/issue/', IssueBookView.as_view(), name='issue-book'),
]

