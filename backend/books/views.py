from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import FileResponse 
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Book, OnlineIssue, OfflineRequest, PhysicalInventory, Attendance
from .serializers import (
    BookSerializer, OnlineIssueSerializer, IssueOnlineBookSerializer,
    OfflineRequestSerializer, CreateOfflineRequestSerializer,
    ApproveOfflineRequestSerializer, IssuePhysicalBookSerializer,
    ReturnPhysicalBookSerializer, PhysicalInventorySerializer,
    AttendanceSerializer
)
from users.permissions import IsLibrarian


# ==================== BOOK VIEWS ====================

class BookViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve books
    GET /api/books/ - List all books
    GET /api/books/{id}/ - Get book details
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Book.objects.all()

        # Filter by book type (online/offline/both)
        book_type = self.request.query_params.get('type', None)
        if book_type in ['online', 'offline', 'both']:
            queryset = queryset.filter(book_type=book_type)

        # Filter by subject
        subject = self.request.query_params.get('subject', None)
        if subject:
            queryset = queryset.filter(subject__icontains=subject)

        # Filter by genre/category — frontend sends ?category=Romance
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(genre__iexact=category)

        # Popular — top 20 by rating (descending), excluding unrated
        popular = self.request.query_params.get('popular', None)
        if popular == 'true':
            queryset = queryset.filter(
                rating__isnull=False
            ).order_by('-rating')[:20]

        # Trending — 20 most recently added books
        trending = self.request.query_params.get('trending', None)
        if trending == 'true':
            queryset = queryset.order_by('-created_at')[:20]

        # Search across title and author
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                author__icontains=search
            )

        return queryset


# ==================== ONLINE ISSUE VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_online_books(request):
    """
    Get user's issued online books
    GET /api/issues/my-books/
    """
    issues = OnlineIssue.objects.filter(
        user=request.user
    ).select_related('book')
    
    serializer = OnlineIssueSerializer(issues, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def issue_online_book(request):
    """
    Issue an online book
    POST /api/issues/online/
    Body: { "book_id": 1 }
    """
    serializer = IssueOnlineBookSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        issue = serializer.save()
        return Response({
            'message': 'Book issued successfully! Check your email for the access token.',
            'issue': OnlineIssueSerializer(issue).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_access_token(request):
    """
    Verify access token before opening PDF
    POST /api/issues/verify-token/
    Body: { "book_id": 1, "token": "uuid" }
    """
    book_id = request.data.get('book_id')
    token = request.data.get('token')
    
    try:
        issue = OnlineIssue.objects.get(
            user=request.user,
            book_id=book_id,
            access_token=token,
            is_active=True
        )
        
        return Response({
            'message': 'Access granted',
            'issue_id': issue.id
        })
    
    except OnlineIssue.DoesNotExist:
        return Response({
            'error': 'Invalid or expired access token'
        }, status=status.HTTP_403_FORBIDDEN)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def read_book_pdf(request, book_id):
    """
    Get PDF file for reading
    GET /api/issues/read/{book_id}/
    """
    # Verify user has active issue
    issue = get_object_or_404(
        OnlineIssue,
        user=request.user,
        book_id=book_id,
        is_active=True
    )
    
    if not issue.book.pdf_file:
        return Response({
            'error': 'PDF not available for this book'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Serve PDF file
    response = FileResponse(
        issue.book.pdf_file.open('rb'),
        content_type='application/pdf'
    )
    response['Content-Disposition'] = f'inline; filename="{issue.book.title}.pdf"'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def return_online_book(request, issue_id):
    """
    Return an online book
    POST /api/issues/return/{issue_id}/
    """
    issue = get_object_or_404(
        OnlineIssue,
        id=issue_id,
        user=request.user,
        is_active=True
    )
    
    from django.utils import timezone
    issue.is_active = False
    issue.returned_at = timezone.now()
    issue.save()
    
    return Response({
        'message': 'Book returned successfully'
    })


# ==================== OFFLINE REQUEST VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_offline_requests(request):
    """
    Get user's offline requests
    GET /api/requests/my-requests/
    """
    requests = OfflineRequest.objects.filter(
        user=request.user
    ).select_related('book', 'approved_by')
    
    serializer = OfflineRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_offline_request(request):
    """
    Create offline book request
    POST /api/requests/create/
    Body: {
        "book_id": 1,
        "purpose": "Study for exams",
        "requested_date": "2026-02-20",
        "requested_return_date": "2026-03-05"
    }
    """
    serializer = CreateOfflineRequestSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        offline_request = serializer.save()
        return Response({
            'message': 'Request submitted successfully! Awaiting librarian approval.',
            'request': OfflineRequestSerializer(offline_request).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== LIBRARIAN VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLibrarian])
def pending_requests(request):
    """
    Get all pending offline requests (Librarian only)
    GET /api/librarian/requests/pending/
    """
    requests = OfflineRequest.objects.filter(
        status='pending'
    ).select_related('user', 'book').order_by('created_at')
    
    serializer = OfflineRequestSerializer(requests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLibrarian])
def all_requests(request):
    """
    Get all offline requests with filters (Librarian only)
    GET /api/librarian/requests/all/?status=pending
    """
    status_filter = request.query_params.get('status', None)
    
    queryset = OfflineRequest.objects.all().select_related('user', 'book', 'approved_by')
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    serializer = OfflineRequestSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLibrarian])
def approve_request(request):
    """
    Approve/Reject offline request (Librarian only)
    POST /api/librarian/requests/approve/
    Body: {
        "request_id": 1,
        "action": "approve",  # or "reject"
        "remarks": "Optional remarks"
    }
    """
    serializer = ApproveOfflineRequestSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        request_obj = serializer.save()
        return Response({
            'message': f'Request {serializer.validated_data["action"]}d successfully',
            'request': OfflineRequestSerializer(request_obj).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLibrarian])
def issue_physical_book(request):
    """
    Issue physical book (after approval) (Librarian only)
    POST /api/librarian/requests/issue/
    Body: {
        "request_id": 1,
        "due_date": "2026-03-05"
    }
    """
    serializer = IssuePhysicalBookSerializer(data=request.data)
    
    if serializer.is_valid():
        request_obj = serializer.save()
        return Response({
            'message': 'Book issued successfully',
            'request': OfflineRequestSerializer(request_obj).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLibrarian])
def return_physical_book(request):
    """
    Return physical book (Librarian only)
    POST /api/librarian/requests/return/
    Body: {
        "request_id": 1,
        "fine_amount": 50  # optional
    }
    """
    serializer = ReturnPhysicalBookSerializer(data=request.data)
    
    if serializer.is_valid():
        request_obj = serializer.save()
        return Response({
            'message': 'Book returned successfully',
            'request': OfflineRequestSerializer(request_obj).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLibrarian])
def inventory_list(request):
    """
    Get physical inventory (Librarian only)
    GET /api/librarian/inventory/
    """
    inventory = PhysicalInventory.objects.all().select_related('book')
    serializer = PhysicalInventorySerializer(inventory, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLibrarian])
def fines_list(request):
    """
    Get all requests with fines (Librarian only)
    GET /api/librarian/fines/
    """
    fines = OfflineRequest.objects.filter(
        fine_amount__gt=0
    ).select_related('user', 'book').order_by('-fine_amount')
    
    serializer = OfflineRequestSerializer(fines, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsLibrarian])
def mark_fine_paid(request, request_id):
    """
    Mark fine as paid (Librarian only)
    POST /api/librarian/fines/{request_id}/paid/
    """
    offline_request = get_object_or_404(OfflineRequest, id=request_id)
    offline_request.fine_paid = True
    offline_request.save()
    
    return Response({
        'message': 'Fine marked as paid',
        'request': OfflineRequestSerializer(offline_request).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsLibrarian])
def dashboard_stats(request):
    """
    Get dashboard statistics (Librarian only)
    GET /api/librarian/dashboard/
    """
    from django.db.models import Sum, Count
    
    stats = {
        'pending_requests': OfflineRequest.objects.filter(status='pending').count(),
        'approved_requests': OfflineRequest.objects.filter(status='approved').count(),
        'issued_books': OfflineRequest.objects.filter(status='issued').count(),
        'overdue_books': OfflineRequest.objects.filter(
            status='issued',
            due_date__lt=timezone.now().date()
        ).count(),
        'total_fines': OfflineRequest.objects.filter(
            fine_paid=False
        ).aggregate(Sum('fine_amount'))['fine_amount__sum'] or 0,
        'total_inventory': Book.objects.aggregate(Sum('total_copies'))['total_copies__sum'] or 0,
        'available_books': Book.objects.aggregate(Sum('available_copies'))['available_copies__sum'] or 0,
        'low_stock_books': Book.objects.filter(available_copies__lte=2).count(),
    }
    
    return Response(stats)


# ==================== ATTENDANCE ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in(request):
    """
    User check-in via QR
    POST /api/attendance/check-in/
    """
    from django.utils import timezone
    
    # Check if already checked in today
    today = timezone.now().date()
    existing = Attendance.objects.filter(
        user=request.user,
        check_in__date=today,
        check_out__isnull=True
    ).first()
    
    if existing:
        return Response({
            'message': 'Already checked in',
            'attendance': AttendanceSerializer(existing).data
        })
    
    attendance = Attendance.objects.create(user=request.user)
    
    return Response({
        'message': 'Checked in successfully',
        'attendance': AttendanceSerializer(attendance).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request):
    """
    User check-out
    POST /api/attendance/check-out/
    """
    from django.utils import timezone
    
    today = timezone.now().date()
    attendance = Attendance.objects.filter(
        user=request.user,
        check_in__date=today,
        check_out__isnull=True
    ).first()
    
    if not attendance:
        return Response({
            'error': 'No active check-in found'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    attendance.check_out = timezone.now()
    attendance.save()
    
    return Response({
        'message': 'Checked out successfully',
        'attendance': AttendanceSerializer(attendance).data
    })
