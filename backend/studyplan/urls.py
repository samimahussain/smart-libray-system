from django.urls import path
from .views import (
    generate_study_plan,
    my_study_plans,
    get_plan_details,
    toggle_task,
    toggle_plan_active,
    delete_plan,
)

urlpatterns = [
    path("generate/", generate_study_plan),
    path("my-plans/", my_study_plans),
    path("plan/<int:plan_id>/", get_plan_details),  # NEW: Get full plan details
    path("task/<int:task_id>/toggle/", toggle_task),
    path("plan/<int:plan_id>/toggle-active/", toggle_plan_active),  # NEW: Toggle active status
    path("plan/<int:plan_id>/delete/", delete_plan),
]
