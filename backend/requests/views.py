from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from books.models import OfflineRequest, Book
from django.utils import timezone


# STUDENT: Create request
class BookRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            book = Book.objects.get(id=request.data.get("book_id"))

            if book.available_copies <= 0:
                return Response(
                    {"error": "No copies available"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            OfflineRequest.objects.create(
                user=request.user,
                book=book,
                purpose=request.data.get("purpose"),
                requested_date=request.data.get("requested_date"),
                requested_return_date=request.data.get("requested_return_date"),
            )

            return Response(
                {"message": "Request submitted successfully"},
                status=status.HTTP_201_CREATED
            )

        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found"},
                status=status.HTTP_404_NOT_FOUND
            )


# LIBRARIAN: View all requests
class AllRequestsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        requests = OfflineRequest.objects.all()

        data = [
            {
                "id": r.id,
                "user": r.user.email,
                "book": r.book.title,
                "status": r.status,
                "purpose": r.purpose,
                "requested_date": r.requested_date,
                "requested_return_date": r.requested_return_date,
            }
            for r in requests
        ]

        return Response(data)


# LIBRARIAN: Approve
class ApproveRequestView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            req = OfflineRequest.objects.get(id=pk)
            req.approve(request.user)
            return Response({"message": "Request approved"})
        except OfflineRequest.DoesNotExist:
            return Response(status=404)


# LIBRARIAN: Reject
class RejectRequestView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            req = OfflineRequest.objects.get(id=pk)
            req.reject(request.user)
            return Response({"message": "Request rejected"})
        except OfflineRequest.DoesNotExist:
            return Response(status=404)
