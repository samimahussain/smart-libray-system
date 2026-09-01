from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Count
from .models import StudyPlan, StudyTask


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_study_plan(request):
    data = request.data

    course = data.get("course")
    if not course:
        return Response({"error": "Course is required"}, status=400)

    # ✅ Deactivate previous plans for the same course
    StudyPlan.objects.filter(user=request.user, course=course, is_active=True).update(is_active=False)

    # ✅ Create new plan
    plan = StudyPlan.objects.create(
        user=request.user,
        course=course,
        exam_type=data.get("examType", ""),
        daily_hours=float(data.get("dailyHours", 1)),
        target_date=date.fromisoformat(data.get("targetDate")),
        is_active=True
    )

    # Process topics
    topics = [t.strip() for t in data.get("topics", "").split(",") if t.strip()]
    if not topics:
        topics = [course]  # fallback to course name if no topics

    days_left = max((plan.target_date - date.today()).days, 1)

    weeks, week = [], []
    current_day = date.today()
    topic_index = 0

    for _ in range(days_left):
        topic = topics[topic_index % len(topics)]

        task = StudyTask.objects.create(
            plan=plan,
            date=current_day,
            task=f"{topic} – {plan.daily_hours} hrs"
        )

        week.append({
            "id": task.id,
            "date": task.date.isoformat(),
            "task": task.task,
            "completed": task.completed
        })

        if len(week) == 7:
            weeks.append(week)
            week = []

        current_day += timedelta(days=1)
        topic_index += 1

    if week:
        weeks.append(week)

    return Response({
        "planId": plan.id,
        "course": plan.course,
        "examType": plan.exam_type,
        "weeklyPlan": weeks
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_study_plans(request):
    plans = StudyPlan.objects.filter(user=request.user).order_by("-created_at")
    data = []

    for plan in plans:
        tasks = plan.tasks.all()
        completed = tasks.filter(completed=True).count()
        total = tasks.count()

        data.append({
            "id": plan.id,
            "course": plan.course,
            "examType": plan.exam_type,
            "progress": round((completed / total) * 100, 1) if total else 0,
            "isActive": plan.is_active
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_plan_details(request, plan_id):
    """
    New endpoint to get full plan details with all tasks
    """
    try:
        plan = StudyPlan.objects.get(id=plan_id, user=request.user)
    except StudyPlan.DoesNotExist:
        return Response({"error": "Plan not found"}, status=404)

    tasks = plan.tasks.all().order_by("date")
    
    weeks, week = [], []
    for task in tasks:
        week.append({
            "id": task.id,
            "date": task.date.isoformat(),
            "task": task.task,
            "completed": task.completed
        })
        
        if len(week) == 7:
            weeks.append(week)
            week = []
    
    if week:
        weeks.append(week)

    return Response({
        "planId": plan.id,
        "course": plan.course,
        "examType": plan.exam_type,
        "weeklyPlan": weeks
    })


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_task(request, task_id):
    try:
        task = StudyTask.objects.get(id=task_id, plan__user=request.user)
    except StudyTask.DoesNotExist:
        return Response({"error": "Task not found"}, status=404)

    task.completed = not task.completed
    task.save()
    return Response({"completed": task.completed})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_plan_active(request, plan_id):
    """
    New endpoint to toggle plan active status
    """
    try:
        plan = StudyPlan.objects.get(id=plan_id, user=request.user)
    except StudyPlan.DoesNotExist:
        return Response({"error": "Plan not found"}, status=404)

    plan.is_active = not plan.is_active
    plan.save()
    return Response({"isActive": plan.is_active})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_plan(request, plan_id):
    try:
        plan = StudyPlan.objects.get(id=plan_id, user=request.user)
    except StudyPlan.DoesNotExist:
        return Response({"error": "Plan not found"}, status=404)

    plan.delete()
    return Response({"success": True})
