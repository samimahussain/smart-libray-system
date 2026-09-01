from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance
from .serializers import AttendanceSerializer
from django.utils import timezone
from django.conf import settings
import qrcode
import qrcode.image.svg
import io
import base64


# ──────────────────────────────────────────────
#  QR Code Generator (called once, codes are static)
# ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_qr_codes(request):
    """
    Returns base64-encoded QR images for ENTRY and EXIT.
    Stick these printed copies in the library.
    The QR simply encodes a deep-link URL to the attendance page.
    """
    base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

    codes = {
        'entry': f"{base_url}/attendance/scan?action=entry",
        'exit':  f"{base_url}/attendance/scan?action=exit",
    }

    result = {}
    for key, url in codes.items():
        img = qrcode.make(url)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        result[key] = base64.b64encode(buf.getvalue()).decode()

    return Response(result)


# ──────────────────────────────────────────────
#  Student: Mark Entry via email (from QR scan)
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def scan_entry(request):
    """
    Body: { "email": "student@example.com" }
    Creates a new Attendance record with check_in = now.
    Rejects if there's already an open session (no check_out) today.
    """
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"error": "Email is required."}, status=400)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "No account found with this email."}, status=404)

    # Check for already open session today
    today = timezone.now().date()
    open_session = Attendance.objects.filter(
        user=user,
        check_in__date=today,
        check_out__isnull=True
    ).first()

    if open_session:
        return Response({
            "error": "You already have an open session today. Please scan EXIT first.",
            "session_id": open_session.id
        }, status=400)

    record = Attendance.objects.create(user=user, check_in=timezone.now())

    return Response({
        "message": f"Entry recorded! Welcome, {user.get_username()}.",
        "session_id": record.id,
        "check_in": record.check_in,
        "user_name": user.get_username(),
    }, status=201)


# ──────────────────────────────────────────────
#  Student: Mark Exit via email (from QR scan)
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def scan_exit(request):
    """
    Body: { "email": "student@example.com" }
    Closes the most recent open Attendance record for this user today.
    """
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"error": "Email is required."}, status=400)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "No account found with this email."}, status=404)

    today = timezone.now().date()
    record = Attendance.objects.filter(
        user=user,
        check_in__date=today,
        check_out__isnull=True
    ).order_by('-check_in').first()

    if not record:
        return Response({
            "error": "No open session found for today. Please scan ENTRY first."
        }, status=404)

    record.check_out = timezone.now()
    record.save()  # duration_minutes auto-computed in model.save()

    return Response({
        "message": f"Exit recorded! You studied for {record.duration_minutes} minutes. See you next time!",
        "session_id": record.id,
        "check_in": record.check_in,
        "check_out": record.check_out,
        "duration_minutes": record.duration_minutes,
    })


# ──────────────────────────────────────────────
#  Librarian: Manual entry/exit on behalf of student
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def librarian_mark_entry(request):
    """
    Librarian manually marks entry for a student.
    Body: { "email": "student@example.com" }
    """
    if not (request.user.is_staff or getattr(request.user, 'role', None) == 'librarian'):
        return Response({"error": "Librarian access required."}, status=403)

    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"error": "Student email is required."}, status=400)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "No student found with this email."}, status=404)

    today = timezone.now().date()
    open_session = Attendance.objects.filter(
        user=user,
        check_in__date=today,
        check_out__isnull=True
    ).first()

    if open_session:
        return Response({
            "error": f"{user.get_username()} already has an open session today.",
            "session_id": open_session.id
        }, status=400)

    record = Attendance.objects.create(user=user, check_in=timezone.now())

    return Response({
        "message": f"Entry marked for {user.get_username()}.",
        "session_id": record.id,
        "check_in": record.check_in,
        "user_name": user.get_username(),
        "marked_by": "librarian",
    }, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def librarian_mark_exit(request):
    """
    Librarian manually marks exit for a student.
    Body: { "email": "student@example.com" }
    """
    if not (request.user.is_staff or getattr(request.user, 'role', None) == 'librarian'):
        return Response({"error": "Librarian access required."}, status=403)

    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"error": "Student email is required."}, status=400)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"error": "No student found with this email."}, status=404)

    today = timezone.now().date()
    record = Attendance.objects.filter(
        user=user,
        check_in__date=today,
        check_out__isnull=True
    ).order_by('-check_in').first()

    if not record:
        return Response({
            "error": f"No open session found for {user.get_username()} today."
        }, status=404)

    record.check_out = timezone.now()
    record.save()

    return Response({
        "message": f"Exit recorded for {user.get_username()}. Duration: {record.duration_minutes} mins.",
        "session_id": record.id,
        "duration_minutes": record.duration_minutes,
        "marked_by": "librarian",
    })


# ──────────────────────────────────────────────
#  Shared: List attendance records
# ──────────────────────────────────────────────

class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Librarian/staff sees all; students see only their own
        if user.is_staff or getattr(user, 'role', None) == 'librarian':
            return Attendance.objects.select_related('user').order_by('-check_in')
        return Attendance.objects.filter(user=user).order_by('-check_in')


# ──────────────────────────────────────────────
#  Legacy endpoints (kept for compatibility)
# ──────────────────────────────────────────────

@api_view(['POST'])
def mark_entry(request):
    """Legacy: accepts user ID. Use scan_entry for email-based flow."""
    from django.contrib.auth import get_user_model
    User = get_user_model()

    user_id = request.data.get("user")
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    record = Attendance.objects.create(user=user, check_in=timezone.now())
    return Response(AttendanceSerializer(record).data)


@api_view(['POST'])
def mark_exit(request, pk):
    """Legacy: accepts record ID."""
    try:
        record = Attendance.objects.get(id=pk)
    except Attendance.DoesNotExist:
        return Response({"error": "Record not found"}, status=404)

    record.check_out = timezone.now()
    record.save()
    return Response({"message": "Exit recorded"})
