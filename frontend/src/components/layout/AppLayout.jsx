import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useState } from 'react'
import HamburgerMenu from '../../pages/public/HamburgerMenu'

export default function AppLayout({ children }) {
  const location = useLocation()

  // ---------- ROUTE MODE ----------
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/librarian-register',
    '/browse-menu'
  ]

  const isPublic = publicRoutes.includes(location.pathname)

  // ---------- STATE ----------
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)

  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const navItems = [
    { label: 'Dashboard', path: '/user' },
    { label: 'Library', path: '/library' },
    { label: 'My Books', path: '/my-books' },
    { label: 'AI Assistant', path: '/ai-chat' },
    { label: 'Study Plan', path: '/study-plan' },
    { label: 'Attendance', path: '/attendance' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Profile', path: '/profile' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ================= PUBLIC UI ================= */}
      {isPublic && (
        <>
          <HamburgerMenu
            open={hamburgerOpen}
            onClose={() => setHamburgerOpen(false)}
          />

          <header className="flex items-center justify-between px-6 py-4 bg-[#F5F1E4] border-b">
            <h1 className="text-xl font-serif font-semibold">EduVault</h1>

            <div className="flex items-center gap-6">
              {/* Browse */}
              <div className="relative">
                <button
                  onClick={() => setBrowseOpen(!browseOpen)}
                  className="flex items-center gap-1"
                >
                  Browse <span>▾</span>
                </button>

                {browseOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow rounded p-3 w-48 z-50">
                    <Link to="/browse-menu" className="block py-1">All Books</Link>
                    <Link to="/subjects" className="block py-1">Subjects</Link>
                    <Link to="/trending" className="block py-1">Trending</Link>
                  </div>
                )}
              </div>

              <Link to="/login">Log in</Link>
              <Link to="/register" className="px-4 py-1 bg-black text-white rounded-full">
                Sign up
              </Link>

              <button onClick={() => setHamburgerOpen(true)}>☰</button>
            </div>
          </header>
        </>
      )}

      {/* ================= USER UI ================= */}
      {!isPublic && (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside
            className={`
              fixed md:static z-40 inset-y-0 left-0 w-64
              bg-slate-900 text-white p-6
              transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:translate-x-0 transition-transform duration-200
            `}
          >
            <h2 className="text-2xl font-serif font-semibold mb-8">EduVault</h2>

            <nav className="flex flex-col gap-2 text-sm">
              {navItems.map(item => {
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      px-3 py-2 rounded-lg transition
                      ${active
                        ? 'bg-white text-slate-900 font-medium'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-slate-800">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                ☰
              </button>

              <span className="text-sm text-slate-600 dark:text-slate-300">
                Welcome, <b>{user?.name}</b>
              </span>

              <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="btn-outline">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </button>
                <button onClick={logout} className="btn-primary">
                  Logout
                </button>
              </div>
            </header>

            <div className="flex-1 p-6">{children}</div>
          </main>
        </div>
      )}

      {/* PUBLIC PAGE CONTENT */}
      {isPublic && <main>{children}</main>}
    </div>
  )
}
