from django.http import HttpResponse

def home(request):
    return HttpResponse("Smart E-Library Home")
