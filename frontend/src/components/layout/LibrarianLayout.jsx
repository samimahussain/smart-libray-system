import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function LibrarianLayout({ children }) {
  const { logout } = useAuthStore()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">EduVault – Librarian</h2>
        <nav className="flex flex-col gap-3 text-sm">
          <Link to="/librarian">Dashboard</Link>
          <Link to="/librarian/requests">Offline Requests</Link>
          <Link to="/librarian/inventory">Inventory</Link>
          <Link to="/librarian/attendance">Attendance</Link>
          <Link to="/librarian/verify">User Verification</Link>
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
