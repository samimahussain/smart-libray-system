import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function StatCard({ title, value, loading }) {
  return (
    <div className="card p-6">
      <p className="text-sm opacity-70">{title}</p>
      {loading
        ? <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-2" />
        : <p className="text-2xl font-bold mt-2">{value ?? '—'}</p>
      }
    </div>
  )
}

export default function AdminDashboard() {
  const accessToken = useAuthStore(s => s.accessToken)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch(`${API_URL}/admin/analytics/overview/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) throw new Error('Failed to fetch overview')
        const data = await res.json()
        setOverview(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [accessToken])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-70 mt-1">Live system overview</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Users"      value={overview?.total_users}       loading={loading} />
        <StatCard title="Total Librarians" value={overview?.total_librarians}  loading={loading} />
        <StatCard title="Total Books"      value={overview?.total_books}       loading={loading} />
        <StatCard title="Books Issued"     value={overview?.books_issued}      loading={loading} />
        <StatCard title="Overdue Books"    value={overview?.overdue_books}     loading={loading} />
        <StatCard title="Active Users"     value={overview?.active_users}      loading={loading} />
      </section>
    </div>
  )
}