# Complete URL Configuration for Books Module
# File: backend/books/urls.py
# Replace your entire books/urls.py with this

from django.urls import path
from . import views

# These URLs are already under /api/ from main urls.py
# So /api/ + books/ = /api/books/

urlpatterns = [
    # ==================== BOOKS (Public/User Access) ====================
    path('books/', views.BookViewSet.as_view({'get': 'list'}), name='book-list'),
    path('books/<int:pk>/', views.BookViewSet.as_view({'get': 'retrieve'}), name='book-detail'),
    
    # ==================== ONLINE ISSUES (User) ====================
    path('issues/my-books/', views.my_online_books, name='my-online-books'),
    path('issues/online/', views.issue_online_book, name='issue-online-book'),
    path('issues/verify-token/', views.verify_access_token, name='verify-token'),
    path('issues/read/<int:book_id>/', views.read_book_pdf, name='read-book-pdf'),
    path('issues/return/<int:issue_id>/', views.return_online_book, name='return-online-book'),
    
    # ==================== OFFLINE REQUESTS (User) ====================
    path('requests/my-requests/', views.my_offline_requests, name='my-offline-requests'),
    path('requests/create/', views.create_offline_request, name='create-offline-request'),
    
    # ==================== LIBRARIAN - Dashboard ====================
    path('librarian/dashboard/', views.dashboard_stats, name='dashboard-stats'),
    
    # ==================== LIBRARIAN - Request Management ====================
    path('librarian/requests/pending/', views.pending_requests, name='pending-requests'),
    path('librarian/requests/all/', views.all_requests, name='all-requests'),
    path('librarian/requests/approve/', views.approve_request, name='approve-request'),
    path('librarian/requests/issue/', views.issue_physical_book, name='issue-physical-book'),
    path('librarian/requests/return/', views.return_physical_book, name='return-physical-book'),
    
    # ==================== LIBRARIAN - Inventory ====================
    path('librarian/inventory/', views.inventory_list, name='inventory-list'),
    
    # ==================== LIBRARIAN - Fines ====================
    path('librarian/fines/', views.fines_list, name='fines-list'),
    path('librarian/fines/<int:request_id>/paid/', views.mark_fine_paid, name='mark-fine-paid'),
    
    # ==================== ATTENDANCE ====================
    path('attendance/check-in/', views.check_in, name='check-in'),
    path('attendance/check-out/', views.check_out, name='check-out'),
]
