import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function AdminLayout({ children }) {
  const { logout } = useAuthStore()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">EduVault – Admin</h2>

        <nav className="flex flex-col gap-3 text-sm">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/roles">Roles & Staff</Link>
          <Link to="/admin/system">System Config</Link>
          <Link to="/admin/ai">AI Engine</Link>
          <Link to="/admin/moderation">Content Moderation</Link>
          <Link to="/admin/reports">Reports</Link>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="p-4 border-b flex justify-end">
          <button onClick={logout} className="btn-primary">Logout</button>
        </header>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
