# Complete Issues URL Configuration
# File: backend/issues/urls.py (if you have a separate issues app)
# OR add these to backend/books/urls.py if combined

from django.urls import path
# Import from books app where the views are
import sys
import os
# Add books app to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'books'))
from books import views

# These URLs are under /api/issues/ from main urls.py
urlpatterns = [
    # Online book issues
    path('my-books/', views.my_online_books, name='my-online-books'),
    path('online/', views.issue_online_book, name='issue-online-book'),
    path('verify-token/', views.verify_access_token, name='verify-token'),
    path('read/<int:book_id>/', views.read_book_pdf, name='read-book-pdf'),
    path('return/<int:issue_id>/', views.return_online_book, name='return-online-book'),
]
