from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models import Book, IssuedBook, generate_issue_code

class IssueBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        days = int(request.data.get("days", 0))

        if days not in [3, 7, 15]:
            return Response({"error": "Invalid duration"}, status=400)

        book = get_object_or_404(Book, id=book_id)

        issue = IssuedBook.objects.create(
            user=request.user,
            book=book,
            issue_code=generate_issue_code(),
            expires_at=timezone.now() + timedelta(days=days)
        )

        # 📧 Email will be added next
        return Response({
            "message": "Book issued successfully",
            "expires_at": issue.expires_at,
        })
