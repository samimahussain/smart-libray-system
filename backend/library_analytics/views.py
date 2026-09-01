from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q, Avg
from datetime import date, timedelta, datetime
from django.utils import timezone

from .models import UserActivity
from .serializers import TrackEventSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_event(request):
    """
    Track user activity events
    POST /api/analytics/track/
    Body: {
        "event_type": "page_view",
        "event_data": {"page": "dashboard"}
    }
    """
    serializer = TrackEventSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create activity
        activity = UserActivity.objects.create(
            user=request.user,
            event_type=serializer.validated_data['event_type'],
            event_data=serializer.validated_data.get('event_data', {}),
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return Response({
            'success': True,
            'activity_id': activity.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_batch(request):
    """
    Track multiple events at once
    POST /api/analytics/track/batch/
    Body: {
        "events": [
            {"event_type": "page_view", "event_data": {"page": "home"}},
            {"event_type": "book_view", "event_data": {"book_id": 123}}
        ]
    }
    """
    events = request.data.get('events', [])
    
    if not events or not isinstance(events, list):
        return Response({
            'success': False,
            'error': 'events must be a non-empty array'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get IP and user agent once
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        created_count = 0
        errors = []
        
        for event in events:
            serializer = TrackEventSerializer(data=event)
            if serializer.is_valid():
                UserActivity.objects.create(
                    user=request.user,
                    event_type=serializer.validated_data['event_type'],
                    event_data=serializer.validated_data.get('event_data', {}),
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                created_count += 1
            else:
                errors.append(serializer.errors)
        
        return Response({
            'success': True,
            'tracked_count': created_count,
            'errors': errors if errors else None
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_overview(request):
    """
    Get analytics overview for Analytics.jsx
    Returns user's activity statistics and insights
    """
    user = request.user
    
    # Get date range (last 30 days by default)
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    # Get user activities
    activities = UserActivity.objects.filter(
        user=user,
        timestamp__gte=start_date
    )
    
    # Total activities
    total_activities = activities.count()
    
    # Activities by type
    activities_by_type = activities.values('event_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Daily activity counts (for chart)
    daily_activities = []
    for i in range(days):
        day = timezone.now().date() - timedelta(days=i)
        count = activities.filter(timestamp__date=day).count()
        daily_activities.append({
            'date': day.strftime('%Y-%m-%d'),
            'count': count
        })
    daily_activities.reverse()
    
    # Most viewed books
    book_views = activities.filter(event_type='book_view')
    top_books = book_views.values(
        'event_data__book_title'
    ).annotate(
        views=Count('id')
    ).order_by('-views')[:10]
    
    # Most viewed pages
    page_views = activities.filter(event_type='page_view')
    top_pages = page_views.values(
        'event_data__page'
    ).annotate(
        views=Count('id')
    ).order_by('-views')[:10]
    
    # Recent activities
    recent_activities = activities.order_by('-timestamp')[:20]
    recent_list = [
        {
            'id': activity.id,
            'event_type': activity.event_type,
            'event_data': activity.event_data,
            'timestamp': activity.timestamp.isoformat(),
            'icon': get_activity_icon(activity.event_type),
            'description': get_activity_description(activity)
        }
        for activity in recent_activities
    ]
    
    # Activity by hour of day
    hourly_distribution = [0] * 24
    for activity in activities:
        hour = activity.timestamp.hour
        hourly_distribution[hour] += 1
    
    # Most active day
    most_active_day = activities.values('timestamp__date').annotate(
        count=Count('id')
    ).order_by('-count').first()
    
    return Response({
        'summary': {
            'total_activities': total_activities,
            'date_range_days': days,
            'start_date': start_date.date().isoformat(),
            'end_date': timezone.now().date().isoformat(),
        },
        'activities_by_type': list(activities_by_type),
        'daily_activities': daily_activities,
        'top_books': [
            {
                'title': book.get('event_data__book_title', 'Unknown'),
                'views': book['views']
            }
            for book in top_books if book.get('event_data__book_title')
        ],
        'top_pages': [
            {
                'page': page.get('event_data__page', 'Unknown'),
                'views': page['views']
            }
            for page in top_pages if page.get('event_data__page')
        ],
        'recent_activities': recent_list,
        'hourly_distribution': hourly_distribution,
        'most_active_day': {
            'date': most_active_day['timestamp__date'].isoformat() if most_active_day else None,
            'count': most_active_day['count'] if most_active_day else 0
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_insights(request):
    """
    Get personalized insights for the user
    Returns patterns, streaks, and recommendations
    """
    user = request.user
    
    # Get activities from last 90 days
    start_date = timezone.now() - timedelta(days=90)
    activities = UserActivity.objects.filter(
        user=user,
        timestamp__gte=start_date
    )
    
    insights = []
    
    # 1. Most active time of day
    hourly_counts = {}
    for activity in activities:
        hour = activity.timestamp.hour
        hourly_counts[hour] = hourly_counts.get(hour, 0) + 1
    
    if hourly_counts:
        most_active_hour = max(hourly_counts, key=hourly_counts.get)
        time_period = "morning" if most_active_hour < 12 else "afternoon" if most_active_hour < 18 else "evening"
        insights.append({
            'type': 'time_pattern',
            'title': f'You\'re most active in the {time_period}',
            'description': f'Most of your activity happens around {most_active_hour}:00',
            'icon': '🕐'
        })
    
    # 2. Reading habits
    book_views = activities.filter(event_type='book_view').count()
    book_searches = activities.filter(event_type='book_search').count()
    
    if book_views > 20:
        insights.append({
            'type': 'reading_habit',
            'title': 'Active Reader',
            'description': f'You\'ve viewed {book_views} books in the last 90 days',
            'icon': '📚'
        })
    
    # 3. Study consistency
    study_activities = activities.filter(
        event_type__in=['study_plan_create', 'study_plan_update', 'task_complete']
    )
    study_days = study_activities.values('timestamp__date').distinct().count()
    
    if study_days > 0:
        consistency_rate = (study_days / 90) * 100
        if consistency_rate > 50:
            insights.append({
                'type': 'study_consistency',
                'title': 'Consistent Learner',
                'description': f'You studied on {study_days} different days',
                'icon': '⭐'
            })
    
    # 4. Activity streak
    dates_with_activity = activities.values_list('timestamp__date', flat=True).distinct()
    dates_list = sorted(set(dates_with_activity), reverse=True)
    
    current_streak = 0
    if dates_list:
        today = timezone.now().date()
        if dates_list[0] in [today, today - timedelta(days=1)]:
            expected_date = dates_list[0]
            for activity_date in dates_list:
                if activity_date == expected_date:
                    current_streak += 1
                    expected_date -= timedelta(days=1)
                else:
                    break
    
    if current_streak >= 7:
        insights.append({
            'type': 'streak',
            'title': f'{current_streak} Day Streak!',
            'description': 'Keep up the great work!',
            'icon': '🔥'
        })
    
    return Response({
        'insights': insights,
        'streak_days': current_streak,
        'total_activities_90d': activities.count()
    })


def get_activity_icon(event_type):
    """Get emoji icon for event type"""
    icons = {
        'page_view': '👁️',
        'book_view': '📖',
        'book_search': '🔍',
        'book_issue': '📚',
        'book_return': '📥',
        'study_plan_create': '📅',
        'study_plan_update': '✏️',
        'task_complete': '✅',
        'attendance_mark': '✓',
        'login': '🔐',
        'logout': '👋',
    }
    return icons.get(event_type, '📌')


def get_activity_description(activity):
    """Generate human-readable description from activity"""
    event_type = activity.event_type
    data = activity.event_data
    
    descriptions = {
        'page_view': f"Viewed {data.get('page', 'page')}",
        'book_view': f"Viewed '{data.get('book_title', 'a book')}'",
        'book_search': f"Searched for '{data.get('query', 'books')}'",
        'book_issue': f"Issued '{data.get('book_title', 'a book')}'",
        'book_return': f"Returned '{data.get('book_title', 'a book')}'",
        'study_plan_create': f"Created study plan for {data.get('course', 'course')}",
        'study_plan_update': f"Updated study plan",
        'task_complete': f"Completed: {data.get('task', 'a task')}",
        'attendance_mark': "Marked attendance",
        'login': "Logged in",
        'logout': "Logged out",
    }
    
    return descriptions.get(event_type, f"{event_type.replace('_', ' ').title()}")

    """
    Track user activity events
    POST /api/analytics/track/
    Body: {
        "event_type": "page_view",
        "event_data": {"page": "dashboard"}
    }
    """
    serializer = TrackEventSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create activity
        activity = UserActivity.objects.create(
            user=request.user,
            event_type=serializer.validated_data['event_type'],
            event_data=serializer.validated_data.get('event_data', {}),
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return Response({
            'success': True,
            'activity_id': activity.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_batch(request):
    """
    Track multiple events at once
    POST /api/analytics/track/batch/
    Body: {
        "events": [
            {"event_type": "page_view", "event_data": {"page": "home"}},
            {"event_type": "book_view", "event_data": {"book_id": 123}}
        ]
    }
    """
    events = request.data.get('events', [])
    
    if not events or not isinstance(events, list):
        return Response({
            'success': False,
            'error': 'events must be a non-empty array'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get IP and user agent once
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        created_count = 0
        errors = []
        
        for event in events:
            serializer = TrackEventSerializer(data=event)
            if serializer.is_valid():
                UserActivity.objects.create(
                    user=request.user,
                    event_type=serializer.validated_data['event_type'],
                    event_data=serializer.validated_data.get('event_data', {}),
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                created_count += 1
            else:
                errors.append(serializer.errors)
        
        return Response({
            'success': True,
            'tracked_count': created_count,
            'errors': errors if errors else None
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
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
    user_study_plans = StudyPlan.objects.filter(user=user)
    active_study_plan = user_study_plans.filter(is_active=True).first()
    
    # Calculate study days (days with completed tasks)
    study_days = 0
    current_streak = 0
    
    if user_study_plans.exists():
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
    
    # Get recent activities from UserActivity model
    recent_activities = UserActivity.objects.filter(user=user).order_by('-timestamp')[:10]
    
    for activity in recent_activities:
        icon = get_activity_icon(activity.event_type)
        description = get_activity_description(activity)
        
        recent_activity.append({
            "icon": icon,
            "description": description,
            "time": format_time_ago(activity.timestamp)
        })
    
    # Fallback to old method if no UserActivity records
    if not recent_activity:
        # Recent book issues
        recent_issues = IssueRecord.objects.filter(user=user).order_by('-issued_at')[:3]
        for issue in recent_issues:
            recent_activity.append({
                "icon": "📚",
                "description": f"Issued '{issue.book.title}'",
                "time": format_time_ago(issue.issued_at)
            })
        
        # Recent study tasks completed
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
        "recent_activity": recent_activity[:5],
        "popular_books": popular_books_data,
        "achievements": achievements,
    })


def get_activity_icon(event_type):
    """Get emoji icon for event type"""
    icons = {
        'page_view': '👁️',
        'book_view': '📖',
        'book_search': '🔍',
        'book_issue': '📚',
        'book_return': '📥',
        'study_plan_create': '📅',
        'study_plan_update': '✏️',
        'task_complete': '✅',
        'attendance_mark': '✓',
        'login': '🔐',
        'logout': '👋',
    }
    return icons.get(event_type, '📌')


def get_activity_description(activity):
    """Generate human-readable description from activity"""
    event_type = activity.event_type
    data = activity.event_data
    
    descriptions = {
        'page_view': f"Viewed {data.get('page', 'page')}",
        'book_view': f"Viewed '{data.get('book_title', 'a book')}'",
        'book_search': f"Searched for '{data.get('query', 'books')}'",
        'book_issue': f"Issued '{data.get('book_title', 'a book')}'",
        'book_return': f"Returned '{data.get('book_title', 'a book')}'",
        'study_plan_create': f"Created study plan for {data.get('course', 'course')}",
        'study_plan_update': f"Updated study plan",
        'task_complete': f"Completed: {data.get('task', 'a task')}",
        'attendance_mark': "Marked attendance",
        'login': "Logged in",
        'logout': "Logged out",
    }
    
    return descriptions.get(event_type, f"{event_type.replace('_', ' ').title()}")


def calculate_streak(user):
    """
    Calculate the user's current study streak
    (consecutive days with completed tasks)
    """
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
    user_study_plans = StudyPlan.objects.filter(user=user)
    active_study_plan = user_study_plans.filter(is_active=True).first()
    
    # Calculate study days (days with completed tasks)
    study_days = 0
    current_streak = 0
    
    if user_study_plans.exists():
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
