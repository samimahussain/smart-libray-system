import { useEffect, useState } from 'react'
import axios from '../../lib/axios'

export default function LibrarianDashboard() {
  const [stats, setStats] = useState({
    pending_requests: 0,
    approved_requests: 0,
    issued_books: 0,
    overdue_books: 0,
    total_fines: 0,
    total_inventory: 0,
    available_books: 0,
    low_stock_books: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/librarian/dashboard/')
      setStats(res.data)
      setError('')
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Librarian Dashboard</h1>
        <p className="text-sm opacity-70 mt-1">Daily operations overview</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Pending Requests" 
          value={stats.pending_requests}
          color="yellow"
        />
        <Card 
          title="Currently Issued" 
          value={stats.issued_books}
          color="blue"
        />
        <Card 
          title="Overdue Books" 
          value={stats.overdue_books}
          color="red"
        />
        <Card 
          title="Low Stock" 
          value={stats.low_stock_books}
          color="orange"
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <Card 
          title="Total Inventory" 
          value={stats.total_inventory}
          subtitle="Total copies"
        />
        <Card 
          title="Available Books" 
          value={stats.available_books}
          subtitle="Ready to issue"
        />
        
      </section>
    </div>
  )
}

function Card({ title, value, subtitle, color = 'gray' }) {
  const colorClasses = {
    yellow: 'border-l-yellow-500',
    blue: 'border-l-blue-500',
    red: 'border-l-red-500',
    orange: 'border-l-orange-500',
    gray: 'border-l-gray-500'
  }

  return (
    <div className={`card p-6 border-l-4 ${colorClasses[color]}`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
    </div>
  )
}
