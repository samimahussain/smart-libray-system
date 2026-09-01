from django.urls import path,include
from .views import IssueBookView

urlpatterns = [
    path('books/<int:book_id>/issue/', IssueBookView.as_view()),
    path('api/', include('books.urls')),

]
