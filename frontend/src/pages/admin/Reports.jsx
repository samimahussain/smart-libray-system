import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function Section({ title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      {children}
    </div>
  )
}

function BarRow({ label, value, max, color = 'bg-black' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Reports() {
  const accessToken = useAuthStore(s => s.accessToken)

  const [userGrowth,   setUserGrowth]   = useState([])
  const [issueTrends,  setIssueTrends]  = useState([])
  const [bookUsage,    setBookUsage]    = useState([])
  const [issues,       setIssues]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      try {
        const headers = { Authorization: `Bearer ${accessToken}` }
        const [ugRes, itRes, buRes, issRes] = await Promise.all([
          fetch(`${API_URL}/admin/analytics/user-growth/`,   { headers }),
          fetch(`${API_URL}/admin/analytics/issue-trends/`,  { headers }),
          fetch(`${API_URL}/admin/analytics/book-usage/`,    { headers }),
          fetch(`${API_URL}/admin/issues/?ordering=-issued_at`, { headers }),
        ])
        if (!ugRes.ok || !itRes.ok || !buRes.ok) throw new Error('Failed to fetch analytics')
        setUserGrowth(await ugRes.json())
        setIssueTrends(await itRes.json())
        setBookUsage(await buRes.json())
        const issData = await issRes.json()
        setIssues(Array.isArray(issData) ? issData.slice(0, 10) : (issData.results ?? []).slice(0, 10))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [accessToken])

  function downloadCSV() {
    const headers = ['ID', 'User', 'Email', 'Book', 'Issued At', 'Due Date', 'Status']
    const rows = issues.map(i => [
      i.id, i.user_name, i.user_email, i.book_title,
      new Date(i.issued_at).toLocaleDateString(),
      new Date(i.due_date).toLocaleDateString(),
      i.status,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `eduvault-issues-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const maxUsers   = Math.max(...userGrowth.map(d => d.users), 1)
  const maxIssued  = Math.max(...issueTrends.map(d => d.issued), 1)
  const maxBooks   = Math.max(...bookUsage.map(d => d.count), 1)

  if (loading) return <p className="text-sm opacity-60 p-6">Loading reports...</p>
  if (error)   return <p className="text-red-500 text-sm p-6">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-sm opacity-70 mt-1">Live data from the last 6 months</p>
        </div>
        <button onClick={downloadCSV} className="btn-primary">Download CSV</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* User Growth */}
        <Section title="User Growth (6 months)">
          <div className="space-y-3">
            {userGrowth.map(d => (
              <BarRow key={d.month} label={d.month} value={d.users} max={maxUsers} color="bg-black" />
            ))}
          </div>
        </Section>

        {/* Issue Trends */}
        <Section title="Issue Trends (6 months)">
          <div className="space-y-3">
            {issueTrends.map(d => (
              <div key={d.month} className="space-y-1">
                <p className="text-sm font-medium">{d.month}</p>
                <BarRow label="Issued"   value={d.issued}   max={maxIssued} color="bg-blue-500" />
                <BarRow label="Returned" value={d.returned} max={maxIssued} color="bg-green-500" />
                <BarRow label="Overdue"  value={d.overdue}  max={maxIssued} color="bg-red-400" />
              </div>
            ))}
          </div>
        </Section>

        {/* Book Usage by Category */}
        <Section title="Books by Subject">
          <div className="space-y-3">
            {bookUsage.map(d => (
              <BarRow key={d.subject} label={d.subject || 'Uncategorised'} value={d.count} max={maxBooks} color="bg-amber-500" />
            ))}
          </div>
        </Section>

        {/* Recent Issues Table */}
        <Section title="Recent Issue Records">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left opacity-60 border-b">
                  <th className="pb-2 pr-3">User</th>
                  <th className="pb-2 pr-3">Book</th>
                  <th className="pb-2 pr-3">Due</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {issues.map(i => (
                  <tr key={i.id}>
                    <td className="py-2 pr-3">{i.user_name}</td>
                    <td className="py-2 pr-3 max-w-[140px] truncate">{i.book_title}</td>
                    <td className="py-2 pr-3">{new Date(i.due_date).toLocaleDateString()}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        i.status === 'overdue'  ? 'bg-red-100 text-red-700' :
                        i.status === 'returned' ? 'bg-green-100 text-green-700' :
                                                  'bg-blue-100 text-blue-700'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

      </div>
    </div>
  )
}