// frontend/services/analyticsService.js
import axios from "@/lib/axios"

class AnalyticsService {
  /**
   * Track a page view
   */
  trackPageView(pageName) {
    return this.track('page_view', { page: pageName })
  }

  /**
   * Track book interactions
   */
  trackBookView(bookId, bookTitle) {
    return this.track('book_view', { 
      book_id: bookId, 
      book_title: bookTitle 
    })
  }

  trackBookSearch(query, resultsCount = 0) {
    return this.track('book_search', { 
      query, 
      results_count: resultsCount 
    })
  }

  trackBookIssue(bookId, bookTitle) {
    return this.track('book_issue', { 
      book_id: bookId, 
      book_title: bookTitle 
    })
  }

  trackBookReturn(bookId, bookTitle) {
    return this.track('book_return', { 
      book_id: bookId, 
      book_title: bookTitle 
    })
  }

  /**
   * Track study plan interactions
   */
  trackStudyPlanCreate(planData) {
    return this.track('study_plan_create', {
      course: planData.course,
      exam_type: planData.exam_type,
      duration_weeks: planData.duration_weeks
    })
  }

  trackStudyPlanUpdate(planId) {
    return this.track('study_plan_update', { 
      plan_id: planId 
    })
  }

  trackTaskComplete(taskData) {
    return this.track('task_complete', {
      task: taskData.task,
      plan_id: taskData.plan_id
    })
  }

  /**
   * Track attendance
   */
  trackAttendance() {
    return this.track('attendance_mark', {})
  }

  /**
   * Track authentication
   */
  trackLogin() {
    return this.track('login', {})
  }

  trackLogout() {
    return this.track('logout', {})
  }

  /**
   * Generic track method - sends event to backend
   */
  async track(eventType, eventData = {}) {
    try {
      const payload = {
        event_type: eventType,
        event_data: eventData
      }

      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Tracking:', payload)
      }

      const response = await axios.post('/analytics/track/', payload)
      return response.data
    } catch (error) {
      // Analytics should never break the app
      console.error('❌ Analytics tracking failed:', error.response?.data || error.message)
      return null
    }
  }

  /**
   * Batch tracking for performance
   * Use when you need to track multiple events at once
   */
  async trackBatch(events) {
    try {
      const formattedEvents = events.map(e => ({
        event_type: e.type,
        event_data: e.data || {}
      }))

      const response = await axios.post('/analytics/track/batch/', {
        events: formattedEvents
      })
      
      return response.data
    } catch (error) {
      console.error('❌ Batch analytics tracking failed:', error.response?.data || error.message)
      return null
    }
  }
}

// Export singleton instance
export default new AnalyticsService()
