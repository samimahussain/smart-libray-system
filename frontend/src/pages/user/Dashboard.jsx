import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import analyticsService from "@/services/analyticsService"

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track page view when component mounts
    analyticsService.trackPageView('Dashboard')

    // Fetch dashboard data from new dashboard endpoint
    axios.get("/dashboard/data/")
      .then(res => {
        console.log("DASHBOARD DATA:", res.data)
        setData(res.data)
      })
      .catch(err => {
        console.error(err)
        setError("Failed to load dashboard data")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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

  if (!data) return <div className="p-8">No data available</div>

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}! 👋</h1>
        <p className="text-indigo-100">Here's your learning overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Books Issued"
          value={data.user_stats?.books_issued ?? 0}
          icon="📚"
          color="blue"
          trend={data.user_stats?.books_trend}
        />
        <StatCard
          title="Study Days"
          value={data.user_stats?.study_days ?? 0}
          icon="📖"
          color="green"
          trend={data.user_stats?.study_trend}
        />
        <StatCard
          title="Attendance"
          value={data.user_stats?.attendance_count ?? 0}
          icon="✅"
          color="purple"
          trend={data.user_stats?.attendance_trend}
        />
        <StatCard
          title="Study Streak"
          value={data.user_stats?.current_streak ?? 0}
          icon="🔥"
          color="orange"
          suffix=" days"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Study Plan */}
          {data.active_plan ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">📅 Active Study Plan</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{data.active_plan.course}</p>
                  <p className="text-sm text-gray-600">{data.active_plan.exam_type}</p>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-gray-900">{data.active_plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${data.active_plan.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Today's Tasks */}
                {data.active_plan.todays_tasks?.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📌 Today's Tasks:</p>
                    <div className="space-y-2">
                      {data.active_plan.todays_tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            readOnly 
                            className="w-4 h-4" 
                          />
                          <span className={task.completed ? "line-through text-gray-600" : "text-gray-800"}>
                            {task.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Active Study Plan</h3>
              <p className="text-gray-600 mb-4">Create a study plan to stay organized</p>
              <button 
                onClick={() => {
                  analyticsService.trackPageView('Create Study Plan')
                  window.location.href = '/study-plan'
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Study Plan
              </button>
            </div>
          )}

          {/* Currently Reading */}
          {data.current_books?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📖 Currently Reading</h3>
              <div className="space-y-3">
                {data.current_books.map(book => (
                  <div 
                    key={book.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{book.title}</p>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <p className="text-xs text-gray-500 mt-1">Due: {book.due_date}</p>
                    </div>
                    <button 
                      onClick={() => {
                        analyticsService.trackBookView(book.book_id, book.title)
                        window.location.href = `/book/${book.book_id}`
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      Read →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {data.recent_activity?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Recent Activity</h3>
              <div className="space-y-3">
                {data.recent_activity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
            <div className="space-y-3">
              <QuickAction icon="📚" text="Browse Books" href="/library" pageName="Library" />
              <QuickAction icon="📖" text="My Books" href="/my-books" pageName="My Books" />
              <QuickAction icon="📅" text="Study Plan" href="/study-plan" pageName="Study Plan" />
              <QuickAction icon="✅" text="Mark Attendance" href="/attendance" pageName="Attendance" />
            </div>
          </div>

          {/* Popular Books */}
          {data.popular_books?.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌟 Popular Books</h3>
              <div className="space-y-3">
                {data.popular_books.slice(0, 5).map((book, i) => (
                  <div 
                    key={book.id} 
                    className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      analyticsService.trackBookView(book.id, book.title)
                      window.location.href = `/book/${book.id}`
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                      <p className="text-xs text-gray-600 truncate">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {data.achievements?.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Achievements</h3>
              <div className="space-y-2">
                {data.achievements.map((achievement, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{achievement.title}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, trend, suffix = "" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600"
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">
        {value}{suffix}
      </p>
    </div>
  )
}

function QuickAction({ icon, text, href, pageName }) {
  return (
    <a
      href={href}
      onClick={() => analyticsService.trackPageView(pageName)}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="text-2xl">{icon}</div>
      <span className="text-gray-700 group-hover:text-indigo-600 transition-colors font-medium">
        {text}
      </span>
      <span className="ml-auto text-gray-400 group-hover:text-indigo-600 transition-colors">→</span>
    </a>
  )
}
