import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

import { useLibraryStore } from '../../store/libraryStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useAIStore } from '../../store/aiStore'

export default function Dashboard() {
  const { issuedBooks } = useLibraryStore()
  const { logs } = useAttendanceStore()
  const { studyPlan } = useAIStore()
  const readingData = [
  { day: 'Mon', minutes: 40 },
  { day: 'Tue', minutes: 55 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 60 },
  { day: 'Fri', minutes: 45 },
  { day: 'Sat', minutes: 70 },
  { day: 'Sun', minutes: 50 },
]

const attendanceData = [
  { month: 'Jan', days: 20 },
  { month: 'Feb', days: 18 },
  { month: 'Mar', days: 22 },
]

  return (
    <div className="p-8 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm opacity-70 mt-1">
          Your learning overview for this month
        </p>
      </div>

      {/* KPI STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          title="Books Issued"
          value={issuedBooks.length}
          hint="Online + Offline"
        />
        <Stat
          title="Attendance"
          value={logs.length}
          hint="QR scans"
        />
        <Stat
          title="Study Days"
          value={studyPlan?.days || 0}
          hint="Planned"
        />
        <Stat
          title="AI Plan"
          value={studyPlan ? 'Active' : 'Not Set'}
          hint="Personalized"
        />
      </section>

      {/* MAIN GRID */}
      <section className="grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          <Panel title="Currently Issued Books">
            {issuedBooks.length === 0 ? (
              <Empty text="No books issued yet" />
            ) : (
              <ul className="space-y-2 text-sm">
                {issuedBooks.map(b => (
                  <li key={b.id} className="flex justify-between">
                    <span>{b.title}</span>
                    <span className="opacity-60">{b.mode}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent Attendance">
            {logs.length === 0 ? (
              <Empty text="No attendance records" />
            ) : (
              <ul className="space-y-2 text-sm">
                {logs.slice(-5).reverse().map((l, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{l.date}</span>
                    <span className="opacity-60">{l.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Panel title="AI Study Plan">
            {studyPlan ? (
              <>
                <p className="text-sm">
                  Course: <b>{studyPlan.course}</b>
                </p>
                <p className="text-sm mt-1">
                  Days planned: <b>{studyPlan.days}</b>
                </p>
              </>
            ) : (
              <Empty text="No AI study plan created" />
            )}
          </Panel>
          <Panel title="Monthly Attendance">
  <div className="h-56">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={attendanceData}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="days" fill="#4f46e5" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</Panel>

          <Panel title="Weekly Reading Activity">
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={readingData}>
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="#6366f1"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
</Panel>

        </div>
      </section>
    </div>
  )
}

/* ----------------- REUSABLE ----------------- */

function Stat({ title, value, hint }) {
  return (
    <div className="card p-6">
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs opacity-50 mt-1">{hint}</p>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return (
    <p className="text-sm opacity-60">
      {text}
    </p>
  )
}
