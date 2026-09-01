from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from datetime import date, timedelta

from issues.models import IssueRecord
from attendance.models import Attendance
from books.models import Book

# Try to import from the correct app name
try:
    from studyplan.models import StudyPlan, StudyTask
except ModuleNotFoundError:
    try:
        from studyplan.models import StudyPlan, StudyTask
    except ModuleNotFoundError:
        try:
            from study_planner.models import StudyPlan, StudyTask
        except ModuleNotFoundError:
            StudyPlan = None
            StudyTask = None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """
    Main dashboard endpoint for Dashboard.jsx
    Returns comprehensive user dashboard data
    """
    user = request.user
    today = date.today()

    # ============================================
    # USER-SPECIFIC STATS
    # ============================================
    
    # Books currently issued to user
    user_active_books = IssueRecord.objects.filter(
        user=user,
        is_active=True
    ).select_related('book')
    
    books_issued_count = user_active_books.count()
    
    # User's attendance count
    user_attendance = Attendance.objects.filter(user=user).count()
    
    # User's study plan stats
    user_study_plans = StudyPlan.objects.filter(user=user) if StudyPlan else []
    active_study_plan = user_study_plans.filter(is_active=True).first() if user_study_plans else None
    
    # Calculate study days (days with completed tasks)
    study_days = 0
    current_streak = 0
    
    if user_study_plans:
        completed_task_dates = StudyTask.objects.filter(
            plan__user=user,
            completed=True
        ).values_list('date', flat=True).distinct()
        study_days = len(completed_task_dates)
        
        # Calculate streak
        current_streak = calculate_streak(user)
    
    # ============================================
    # ACTIVE STUDY PLAN DETAILS
    # ============================================
    
    active_plan_data = None
    if active_study_plan:
        tasks = active_study_plan.tasks.all()
        completed = tasks.filter(completed=True).count()
        total = tasks.count()
        progress = round((completed / total) * 100, 1) if total else 0
        
        # Today's tasks
        todays_tasks = tasks.filter(date=today)
        
        active_plan_data = {
            "course": active_study_plan.course,
            "exam_type": active_study_plan.exam_type,
            "progress": progress,
            "todays_tasks": [
                {
                    "task": task.task,
                    "completed": task.completed
                }
                for task in todays_tasks
            ]
        }
    
    # ============================================
    # CURRENTLY READING BOOKS
    # ============================================
    
    current_books = []
    for issue in user_active_books:
        current_books.append({
            "id": issue.id,
            "title": issue.book.title,
            "author": issue.book.author,
            "due_date": issue.due_date.strftime("%b %d, %Y") if issue.due_date else "N/A",
            "book_id": issue.book.id
        })
    
    # ============================================
    # RECENT ACTIVITY
    # ============================================
    
    recent_activity = []
    
    # Recent book issues
    recent_issues = IssueRecord.objects.filter(user=user).order_by('-issued_at')[:3]
    for issue in recent_issues:
        recent_activity.append({
            "icon": "📚",
            "description": f"Issued '{issue.book.title}'",
            "time": format_time_ago(issue.issued_at)
        })
    
    # Recent study tasks completed
    if StudyTask:
        recent_tasks = StudyTask.objects.filter(
            plan__user=user,
            completed=True
        ).order_by('-date')[:3]
        
        for task in recent_tasks:
            recent_activity.append({
                "icon": "✅",
                "description": f"Completed: {task.task}",
                "time": format_time_ago(task.date)
            })
    
    # Sort by most recent
    recent_activity = sorted(recent_activity, key=lambda x: x['time'])[:5]
    
    # ============================================
    # POPULAR BOOKS
    # ============================================
    
    # Popular books (most issued)
    popular_books = Book.objects.annotate(
        issue_count=Count('issuerecord')
    ).order_by('-issue_count')[:5]
    
    popular_books_data = [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
        }
        for b in popular_books
    ]
    
    # ============================================
    # ACHIEVEMENTS
    # ============================================
    
    achievements = []
    
    # Book reader achievements
    if books_issued_count >= 5:
        achievements.append({
            "icon": "📚",
            "title": "Book Lover",
            "description": f"Issued {books_issued_count} books"
        })
    
    # Study streak achievements
    if current_streak >= 7:
        achievements.append({
            "icon": "🔥",
            "title": "Week Warrior",
            "description": f"{current_streak} day study streak!"
        })
    
    if current_streak >= 30:
        achievements.append({
            "icon": "💪",
            "title": "Consistency King",
            "description": f"{current_streak} day streak!"
        })
    
    # Study completion achievements
    if study_days >= 30:
        achievements.append({
            "icon": "⭐",
            "title": "Dedicated Learner",
            "description": f"Studied for {study_days} days"
        })
    
    # ============================================
    # RESPONSE
    # ============================================
    
    return Response({
        "user_stats": {
            "books_issued": books_issued_count,
            "study_days": study_days,
            "attendance_count": user_attendance,
            "current_streak": current_streak,
        },
        "active_plan": active_plan_data,
        "current_books": current_books,
        "recent_activity": recent_activity,
        "popular_books": popular_books_data,
        "achievements": achievements,
    })


def calculate_streak(user):
    """
    Calculate the user's current study streak
    (consecutive days with completed tasks)
    """
    if not StudyTask:
        return 0
        
    completed_dates = StudyTask.objects.filter(
        plan__user=user,
        completed=True
    ).values_list('date', flat=True).distinct().order_by('-date')
    
    if not completed_dates:
        return 0
    
    completed_dates_list = sorted(completed_dates, reverse=True)
    today = date.today()
    streak = 0
    
    # Check if there's activity today or yesterday (to keep streak alive)
    if completed_dates_list[0] not in [today, today - timedelta(days=1)]:
        return 0
    
    expected_date = completed_dates_list[0]
    
    for task_date in completed_dates_list:
        if task_date == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)
        else:
            break
    
    return streak


def format_time_ago(dt):
    """
    Format a date/datetime as 'X days ago', 'Today', etc.
    """
    from datetime import datetime
    
    # Handle both date and datetime objects
    if isinstance(dt, date) and not isinstance(dt, datetime):
        dt = datetime.combine(dt, datetime.min.time())
    
    now = datetime.now()
    if dt.tzinfo:
        from django.utils import timezone
        now = timezone.now()
    
    diff = now - dt
    
    if diff.days == 0:
        if diff.seconds < 3600:
            minutes = diff.seconds // 60
            return f"{minutes} min ago" if minutes > 0 else "Just now"
        else:
            hours = diff.seconds // 3600
            return f"{hours} hr ago"
    elif diff.days == 1:
        return "Yesterday"
    elif diff.days < 7:
        return f"{diff.days} days ago"
    elif diff.days < 30:
        weeks = diff.days // 7
        return f"{weeks} week{'s' if weeks > 1 else ''} ago"
    else:
        months = diff.days // 30
        return f"{months} month{'s' if months > 1 else ''} ago"
