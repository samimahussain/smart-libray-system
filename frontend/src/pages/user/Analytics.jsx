import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import analyticsService from "../../services/analyticsService"

export default function Analytics() {
  const [data, setData] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState(30) // days

  useEffect(() => {
    // Track page view
    analyticsService.trackPageView('Analytics')
    
    // Fetch analytics data
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [overviewRes, insightsRes] = await Promise.all([
        axios.get(`/analytics/overview/?days=${timeRange}`),
        axios.get('/analytics/insights/')
      ])
      
      setData(overviewRes.data)
      setInsights(insightsRes.data)
    } catch (err) {
      console.error(err)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-8">No analytics data available</div>

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
          <p className="text-gray-600 mt-1">Your activity insights and patterns</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 7
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 30
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange(90)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 90
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Activities"
          value={data.summary.total_activities}
          icon="📈"
          color="purple"
        />
        <SummaryCard
          title="Active Days"
          value={data.daily_activities.filter(d => d.count > 0).length}
          icon="📅"
          color="blue"
          suffix={` of ${timeRange}`}
        />
        <SummaryCard
          title="Current Streak"
          value={insights?.streak_days || 0}
          icon="🔥"
          color="orange"
          suffix=" days"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Insights */}
          {insights?.insights && insights.insights.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Your Insights</h3>
              <div className="space-y-3">
                {insights.insights.map((insight, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 flex items-start gap-3">
                    <div className="text-3xl">{insight.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Daily Activity</h3>
            <div className="space-y-2">
              {data.daily_activities.slice(-14).map((day, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((day.count / Math.max(...data.daily_activities.map(d => d.count))) * 100, 2)}%` }}
                    >
                      {day.count > 0 && (
                        <span className="text-xs text-white font-semibold">{day.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity by Type */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📌 Activity Breakdown</h3>
            <div className="space-y-3">
              {data.activities_by_type.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(activity.event_type)}</span>
                    <span className="font-medium text-gray-900">
                      {formatEventType(activity.event_type)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{activity.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⏱️ Recent Activity</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.recent_activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="text-xl">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Most Active Time */}
          {data.most_active_day && data.most_active_day.count > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🗓️ Most Active Day</h3>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {new Date(data.most_active_day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {data.most_active_day.count} activities
                </p>
              </div>
            </div>
          )}

          {/* Top Books */}
          {data.top_books && data.top_books.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Most Viewed Books</h3>
              <div className="space-y-3">
                {data.top_books.slice(0, 5).map((book, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                      <p className="text-xs text-gray-600">{book.views} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Pages */}
          {data.top_pages && data.top_pages.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌐 Most Visited Pages</h3>
              <div className="space-y-3">
                {data.top_pages.slice(0, 5).map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{page.page}</span>
                    <span className="text-sm font-bold text-purple-600">{page.views}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hourly Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🕐 Activity by Hour</h3>
            <div className="space-y-1">
              {data.hourly_distribution.map((count, hour) => (
                count > 0 && (
                  <div key={hour} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-12">{hour}:00</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
                        style={{ width: `${(count / Math.max(...data.hourly_distribution)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8">{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon, color, suffix = "" }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600",
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">
        {value}{suffix}
      </p>
    </div>
  )
}

function getActivityIcon(eventType) {
  const icons = {
    page_view: '👁️',
    book_view: '📖',
    book_search: '🔍',
    book_issue: '📚',
    book_return: '📥',
    study_plan_create: '📅',
    study_plan_update: '✏️',
    task_complete: '✅',
    attendance_mark: '✓',
    login: '🔐',
    logout: '👋',
  }
  return icons[eventType] || '📌'
}

function formatEventType(eventType) {
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
