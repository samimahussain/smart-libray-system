import { useLibraryStore } from '../../store/libraryStore'
import { useAIStore } from '../../store/aiStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useAnalyticsStore } from '../../store/analyticsStore'


export function Analytics() {
const { issuedBooks } = useLibraryStore()
const { studyPlan } = useAIStore()
const { logs } = useAttendanceStore()
const { compute } = useAnalyticsStore()


const stats = compute({ issuedBooks, studyPlan, attendance: logs })


return (
<div className="p-8">
<h1 className="text-2xl font-bold">Monthly Insights</h1>


<div className="grid md:grid-cols-3 gap-6 mt-6">
<Stat title="Books Read" value={stats.booksRead} />
<Stat title="Study Days" value={stats.studyDays} />
<Stat title="Attendance" value={stats.attendanceCount} />
</div>


<div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
<h3 className="font-semibold">AI Feedback</h3>
<p className="mt-2 opacity-80">{stats.feedback}</p>
</div>
</div>
)
}


function Stat({ title, value }) {
return (
<div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
<p className="text-sm opacity-70">{title}</p>
<p className="text-2xl font-bold">{value}</p>
</div>
)
}