#Mark entry (time_in)
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance
from .serializers import AttendanceSerializer
from users.models import User
from django.utils import timezone

@api_view(['POST'])
def mark_entry(request):
    user_id = request.data.get("user")

    try:
        user = User.objects.get(id=user_id)
    except:
        return Response({"error": "User not found"}, status=404)

    record = Attendance.objects.create(user=user)

    return Response(AttendanceSerializer(record).data)




#Mark exit (time_out)
@api_view(['POST'])
def mark_exit(request, pk):
    try:
        record = Attendance.objects.get(id=pk)
    except:
        return Response({"error": "Record not found"}, status=404)

    record.time_out = timezone.now()
    record.save()

    return Response({"message": "Exit recorded"})




#List all attendance

class AttendanceListView(generics.ListAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer