from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta, date
import calendar

from books.models import Book
from issues.models import IssueRecord
from .serializers import (
    AdminUserSerializer, AdminUserCreateSerializer, AdminUserUpdateSerializer,
    AdminBookSerializer, AdminIssueSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin: Full CRUD on users with role management."""
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'name']                          # FIX 1: was first_name, last_name
    ordering_fields = ['date_joined', 'email', 'name']        # FIX 1: was last_name
    ordering = ['-date_joined']

    def get_queryset(self):
        qs = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'detail': 'Cannot deactivate your own account.'}, status=400)
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active})

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        user = self.get_object()
        issues = IssueRecord.objects.filter(user=user).order_by('-issued_at')[:10]  # FIX 2: was issue_date
        data = AdminIssueSerializer(issues, many=True).data
        return Response({'recent_issues': data, 'total_issues': IssueRecord.objects.filter(user=user).count()})


class AdminBookViewSet(viewsets.ModelViewSet):
    """Admin: Full CRUD on books."""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminBookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'isbn']
    ordering_fields = ['title', 'author', 'available_copies']
    ordering = ['title']

    def get_queryset(self):
        qs = Book.objects.all()
        subject = self.request.query_params.get('category')
        if subject:
            qs = qs.filter(subject=subject)
        return qs


class AdminIssueViewSet(viewsets.ModelViewSet):
    """Admin: View and manage all issue records."""
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AdminIssueSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__email', 'user__name', 'book__title']  # FIX 3: was user__first_name
    ordering = ['-issued_at']                                      # FIX 4: was -issue_date

    def get_queryset(self):
        qs = IssueRecord.objects.select_related('user', 'book').all()
        status_filter = self.request.query_params.get('status')
        today = date.today()

        # FIX 5: was using return_date__isnull — now uses is_active + returned_at
        if status_filter == 'overdue':
            qs = qs.filter(is_active=True, due_date__lt=today)
        elif status_filter == 'active':
            qs = qs.filter(is_active=True, due_date__gte=today)
        elif status_filter == 'returned':
            qs = qs.filter(is_active=False)

        return qs

    @action(detail=True, methods=['post'])
    def force_return(self, request, pk=None):
        issue = self.get_object()
        # FIX 6: was checking return_date, now uses is_active
        if not issue.is_active:
            return Response({'detail': 'Book already returned.'}, status=400)
        issue.returned_at = timezone.now()   # FIX 6: was return_date
        issue.is_active = False              # FIX 6: mark as returned
        issue.save()
        # Restore book availability
        issue.book.available_copies = min(issue.book.available_copies + 1, issue.book.total_copies)
        issue.book.save()
        return Response({'detail': 'Book marked as returned.'})


class AdminAnalyticsView(viewsets.ViewSet):
    """Admin: System analytics and charts."""
    permission_classes = [IsAuthenticated, IsAdmin]

    # FIX 7: url_path='' breaks router — renamed to 'overview'
    @action(detail=False, methods=['get'], url_path='overview')
    def overview(self, request):
        today = date.today()
        total_users = User.objects.filter(role='user').count()
        total_librarians = User.objects.filter(role='librarian').count()
        total_books = Book.objects.count()
        books_issued = IssueRecord.objects.filter(is_active=True).count()          # FIX 8
        overdue_books = IssueRecord.objects.filter(
            is_active=True, due_date__lt=today                                     # FIX 8
        ).count()
        # Active users: issued a book in last 30 days
        thirty_days_ago = today - timedelta(days=30)
        active_users = IssueRecord.objects.filter(
            issued_at__date__gte=thirty_days_ago                                   # FIX 8: was issue_date
        ).values('user').distinct().count()

        return Response({
            'total_users': total_users,
            'total_librarians': total_librarians,
            'total_books': total_books,
            'books_issued': books_issued,
            'overdue_books': overdue_books,
            'active_users': active_users,
        })

    @action(detail=False, methods=['get'], url_path='user-growth')
    def user_growth(self, request):
        today = date.today()
        data = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=i * 30)
            month_start = month_date.replace(day=1)
            month_name = month_date.strftime('%b')
            total = User.objects.filter(date_joined__date__lte=month_date, role='user').count()
            new = User.objects.filter(
                date_joined__date__gte=month_start,
                date_joined__date__lte=month_date,
                role='user',
            ).count()
            data.append({'month': month_name, 'users': total, 'new': new})
        return Response(data)

    @action(detail=False, methods=['get'], url_path='issue-trends')
    def issue_trends(self, request):
        today = date.today()
        data = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=i * 30)
            month_start = month_date.replace(day=1)
            month_name = month_date.strftime('%b')
            # FIX 8: was issue_date / return_date → issued_at / returned_at
            issued = IssueRecord.objects.filter(
                issued_at__date__gte=month_start, issued_at__date__lte=month_date
            ).count()
            returned = IssueRecord.objects.filter(
                returned_at__date__gte=month_start, returned_at__date__lte=month_date
            ).count()
            overdue = IssueRecord.objects.filter(
                due_date__lt=month_date, is_active=True,
                issued_at__date__lte=month_date
            ).count()
            data.append({'month': month_name, 'issued': issued, 'returned': returned, 'overdue': overdue})
        return Response(data)

    @action(detail=False, methods=['get'], url_path='book-usage')
    def book_usage(self, request):
        data = (
            Book.objects
            .values('subject')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response([{'subject': d['subject'], 'count': d['count']} for d in data])