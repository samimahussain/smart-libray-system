from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    MeView, 
    update_profile, 
    change_password,
    LibrarianRegisterView,
    LibrarianLoginView,
    all_users,
    toggle_block,
)

urlpatterns = [
    # Existing routes
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("me/", MeView.as_view(), name="me"),
    path("user/profile", update_profile, name="update_profile"),
    path("user/change-password", change_password, name="change_password"),
    
    # Librarian routes
    path("librarian/register/", LibrarianRegisterView.as_view(), name="librarian-register"),
    path("librarian/login/", LibrarianLoginView.as_view(), name="librarian-login"),
    
    # 🆕 User Verification routes (for librarian dashboard)
    path("all/", all_users, name="all-users"),
    path("<int:user_id>/toggle-block/", toggle_block, name="toggle-block"),
]
