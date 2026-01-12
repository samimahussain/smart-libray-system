from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings

from books.models import Book
from .models import IssueRecord
from django.http import FileResponse


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def online_issue_book(request):
    user = request.user

    book_id = request.data.get("book_id")
    email = request.data.get("email")
    days = int(request.data.get("days"))

    # 1️⃣ Check book exists
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=404)

    # 2️⃣ Calculate due date
    due_date = now() + timedelta(days=days)

    # 3️⃣ Create issue record
    issue = IssueRecord.objects.create(
        user=user,
        book=book,
        issue_type="ONLINE",
        email=email,
        due_date=due_date
    )

    # 4️⃣ Send email (INSIDE function)
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

    # 5️⃣ Response
    return Response({
        "message": "Book issued successfully. Token sent to email.",
        "book": book.title,
        "due_date": due_date,
    })
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
