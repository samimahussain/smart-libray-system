import { useState, useEffect } from "react"
import axios from "@/lib/axios"

export default function StudyPlan() {
  const [form, setForm] = useState({
    course: "",
    examType: "",
    dailyHours: "",
    targetDate: "",
    topics: ""
  })

  const [plans, setPlans] = useState([])
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [showNotification, setShowNotification] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    axios.get("/study-plan/my-plans/")
      .then(res => setPlans(res.data))
      .catch(() => {})
  }, [])

  const generatePlan = async () => {
    setLoading(true)
    try {
      const res = await axios.post("/study-plan/generate/", form)
      setPlan(res.data)
      setPlans(prev => [res.data, ...prev])
      setForm({
        course: "",
        examType: "",
        dailyHours: "",
        targetDate: "",
        topics: ""
      })
      showSuccessNotification()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = async (id) => {
    const res = await axios.patch(`/study-plan/task/${id}/toggle/`)
    setPlan(p => ({
      ...p,
      weeklyPlan: p.weeklyPlan.map(w =>
        w.map(d => d.id === id ? { ...d, completed: res.data.completed } : d)
      )
    }))
    
    // Update progress in plans list
    if (plan) {
      const updatedPlans = await axios.get("/study-plan/my-plans/")
      setPlans(updatedPlans.data)
    }
  }

  const deletePlan = async (id) => {
    if (!confirm("Are you sure you want to delete this study plan?")) return
    
    await axios.delete(`/study-plan/plan/${id}/delete/`)
    setPlans(plans.filter(p => p.id !== id))
    if (plan?.planId === id) setPlan(null)
  }

  const togglePlanActive = async (planId, currentStatus) => {
    // You'll need to add this endpoint to your backend
    try {
      await axios.patch(`/study-plan/plan/${planId}/toggle-active/`)
      setPlans(plans.map(p => 
        p.id === planId ? { ...p, isActive: !currentStatus } : p
      ))
    } catch (err) {
      console.error(err)
    }
  }

  const loadPlanDetails = async (planId) => {
    try {
      const res = await axios.get(`/study-plan/plan/${planId}/`)
      setPlan(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const showSuccessNotification = () => {
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const exportToCalendar = (plan) => {
    // Generate ICS file
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Study Planner//EN
CALNAME:${plan.course} Study Plan
`
    
    plan.weeklyPlan.flat().forEach(day => {
      const dateStr = day.date.replace(/-/g, '')
      icsContent += `BEGIN:VEVENT
UID:${day.id}@studyplanner
DTSTAMP:${dateStr}T120000Z
DTSTART:${dateStr}T120000Z
DTEND:${dateStr}T140000Z
SUMMARY:${day.task}
DESCRIPTION:Study session for ${plan.course}
END:VEVENT
`
    })
    
    icsContent += 'END:VCALENDAR'
    
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${plan.course.replace(/\s+/g, '_')}_study_plan.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTodaysTasks = () => {
    if (!plan) return []
    return plan.weeklyPlan.flat().filter(day => day.date === today)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce z-50">
          ✅ Study plan generated successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">📚 AI Study Planner</h2>
        {plan && (
          <button
            onClick={() => exportToCalendar(plan)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            📅 Export to Calendar
          </button>
        )}
      </div>

      {/* Today's Tasks Highlight */}
      {getTodaysTasks().length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-3">📌 Today's Tasks</h3>
          <div className="space-y-2">
            {getTodaysTasks().map(task => (
              <div key={task.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className={task.completed ? "line-through opacity-75" : "font-medium"}>
                  {task.task}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6 space-y-4 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
              Generate New Plan
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course/Subject
                </label>
                <input
                  name="course"
                  type="text"
                  placeholder="e.g., 10th ICSE"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.course}
                  onChange={e => setForm({ ...form, course: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <input
                  name="examType"
                  type="text"
                  placeholder="e.g., boards"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.examType}
                  onChange={e => setForm({ ...form, examType: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Hours
                </label>
                <input
                  name="dailyHours"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.dailyHours}
                  onChange={e => setForm({ ...form, dailyHours: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  name="targetDate"
                  type="date"
                  min={today}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.targetDate}
                  onChange={e => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (comma separated)
                </label>
                <textarea
                  name="topics"
                  placeholder="e.g., history, geography"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  value={form.topics}
                  onChange={e => setForm({ ...form, topics: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={loading || !form.course || !form.targetDate}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </span>
              ) : (
                "✨ Generate Plan"
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Plans List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Your Study Plans</h3>
          
          {plans.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-lg">No study plans yet. Create your first plan!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map(p => (
                <div
                  key={p.id}
                  className="bg-white shadow-lg rounded-xl p-5 hover:shadow-xl transition-all border border-gray-100 cursor-pointer"
                  onClick={() => loadPlanDetails(p.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{p.course}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {p.isActive ? '✓ Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{p.examType}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePlanActive(p.id, p.isActive)
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        {p.isActive ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePlan(p.id)
                        }}
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-bold text-gray-900">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(p.progress)}`}
                        style={{ width: `${p.progress}%` }}
                      >
                        <div className="h-full w-full bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plan Details View */}
      {plan && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">
              📅 {plan.course} - Weekly Schedule
            </h3>
            <button
              onClick={() => setPlan(null)}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ✕ Close
            </button>
          </div>

          {plan.weeklyPlan.map((week, i) => (
            <div key={i} className="bg-white shadow-lg rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="text-lg font-bold text-gray-800">Week {i + 1}</h4>
                <span className="text-sm text-gray-600">
                  {week.filter(d => d.completed).length} / {week.length} completed
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {week.map(day => {
                  const isPast = day.date < today
                  const isToday = day.date === today
                  const dayOfWeek = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })

                  return (
                    <div
                      key={day.id}
                      className={`relative p-4 rounded-xl border-2 text-sm flex flex-col justify-between transition-all transform hover:scale-105
                        ${day.completed 
                          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400 shadow-md" 
                          : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-lg"}
                        ${isToday ? "ring-2 ring-blue-500 border-blue-500" : ""}
                        ${isPast && !day.completed ? "opacity-60" : ""}
                      `}
                    >
                      {isToday && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Today
                        </div>
                      )}
                      
                      <div>
                        <p className="font-bold text-gray-900 mb-1">{dayOfWeek}</p>
                        <p className="text-xs text-gray-600 mb-2">{day.date}</p>
                        <p className={`text-sm ${day.completed ? 'line-through text-gray-600' : 'text-gray-800 font-medium'}`}>
                          {day.task}
                        </p>
                      </div>
                      
                      <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          disabled={isPast && !day.completed}
                          checked={day.completed}
                          onChange={() => toggleTask(day.id)}
                          className="w-5 h-5 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                        />
                        <span className="text-xs text-gray-600 group-hover:text-indigo-600 transition-colors">
                          {day.completed ? 'Completed' : 'Mark done'}
                        </span>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
