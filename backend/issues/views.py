from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from django.http import FileResponse
from .serializers import IssueRecordSerializer
from books.models import Book
from .models import IssueRecord


# =========================================================
# 🔹 CORE ISSUE LOGIC (REUSED)
# =========================================================
def _issue_book_logic(request, book_id, email, days):
    user = request.user

    # 1️⃣ Check book exists
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=404)

    # 2️⃣ Check availability (optional but good)
    if hasattr(book, "available_copies") and book.available_copies <= 0:
        return Response({"error": "No copies available"}, status=400)

    # 3️⃣ Calculate due date
    due_date = now() + timedelta(days=days)

    # 4️⃣ Create issue record
    issue = IssueRecord.objects.create(
        user=user,
        book=book,
        issue_type="ONLINE",
        email=email,
        due_date=due_date
    )

    # 5️⃣ Reduce available copies (if field exists)
    if hasattr(book, "available_copies"):
        book.available_copies -= 1
        book.save()

    # 6️⃣ Send email
    send_mail(
        subject="Your Smart Library Book Access",
        message=f"""
Hello,

Your book "{book.title}" has been issued successfully.

Access Token: {issue.access_token}
Valid till: {issue.due_date.strftime('%d %B %Y')}

Use this token to read the book inside the Smart Library.

Thank you.
""",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
    )

    return Response(
        {
            "message": "Book issued successfully",
            "book": book.title,
            "due_date": due_date,
            "access_token": issue.access_token
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# 🔹 ISSUE VIA BODY (POST /api/online-issue/)
# =========================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def online_issue_book(request):
    book_id = request.data.get("book_id")
    email = request.data.get("email")
    days = int(request.data.get("days", 7))

    if not book_id or not email:
        return Response(
            {"error": "book_id and email are required"},
            status=400
        )

    return _issue_book_logic(request, book_id, email, days)


# =========================================================
# 🔹 ISSUE VIA URL (POST /api/books/<id>/issue/)
# =========================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def issue_book_by_id(request, book_id):
    email = request.data.get("email")
    days = int(request.data.get("days", 7))

    if not email:
        return Response({"error": "email is required"}, status=400)

    return _issue_book_logic(request, book_id, email, days)


# =========================================================
# 🔹 VERIFY TOKEN
# =========================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_book_token(request):
    book_id = request.data.get("book_id")
    token = request.data.get("token")

    issue = IssueRecord.objects.filter(
        user=request.user,
        book_id=book_id,
        access_token=token,
        is_active=True
    ).first()

    if not issue:
        return Response({"error": "Invalid token"}, status=403)

    if issue.is_expired():
        issue.is_active = False
        issue.save()
        return Response({"error": "Access expired"}, status=403)

    return Response({"message": "Token verified"})


# =========================================================
# 🔹 READ BOOK (PDF)
# =========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def read_book(request, book_id):
    issue = IssueRecord.objects.filter(
        user=request.user,
        book_id=book_id,
        is_active=True
    ).first()

    if not issue or issue.is_expired():
        return Response({"error": "Access denied"}, status=403)

    pdf = issue.book.pdf_file

    return FileResponse(
        pdf.open("rb"),
        content_type="application/pdf"
    )


# =========================================================
# 🔹 MY ISSUED BOOKS
# =========================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_issued_books(request):
    issues = IssueRecord.objects.filter(
        user=request.user
    ).select_related("book")

    serializer = IssueRecordSerializer(issues, many=True)
    return Response(serializer.data)