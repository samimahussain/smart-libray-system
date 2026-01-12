from rest_framework.decorators import api_view
from rest_framework.response import Response

from issues.models import IssueRecord
from attendance.models import Attendance
from books.models import Book

@api_view(['GET'])
def dashboard_data(request):

    total_books = Book.objects.count()
    total_issues = IssueRecord.objects.count()
    total_visitors = Attendance.objects.count()

    popular_books = Book.objects.all().order_by('-available_copies')[:5]

    return Response({
        "total_books": total_books,
        "total_issues": total_issues,
        "total_visitors": total_visitors,
        "popular_books": [b.title for b in popular_books]
    })
