from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Book
from .serializers import BookSerializer
from issuedbook.models import IssuedBook


# ✅ PUBLIC
class BookListCreateView(generics.ListCreateAPIView):
    serializer_class = BookSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Book.objects.all()
        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(category__name__iexact=category)

        return queryset


# 🔒 PROTECTED
class BookRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import random
import string
def get_queryset(self):
    queryset = Book.objects.all()

    category = self.request.query_params.get("category")
    popular = self.request.query_params.get("popular")
    trending = self.request.query_params.get("trending")

    if category:
        queryset = queryset.filter(category__name__iexact=category)

    if popular == "true":
        queryset = queryset.filter(is_popular=True)

    if trending == "true":
        queryset = queryset.filter(is_trending=True)

    return queryset



def generate_issue_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class IssueBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        days = int(request.data.get("days", 0))

        if days not in [3, 7, 15]:
            return Response({"error": "Invalid duration"}, status=400)

        book = get_object_or_404(Book, id=book_id)

        issued = IssuedBook.objects.create(
            user=request.user,
            book=book,
            issue_code=generate_issue_code(),
            expires_at=timezone.now() + timedelta(days=days)
        )

        return Response({
            "message": "Book issued successfully",
            "expires_at": issued.expires_at
        })
