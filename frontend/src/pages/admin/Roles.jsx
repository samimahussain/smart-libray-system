import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function Roles() {
  const accessToken = useAuthStore(s => s.accessToken)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Create librarian form
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'librarian' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter) params.set('role', roleFilter)
      if (search) params.set('search', search)
      const res = await fetch(`${API_URL}/admin/users/?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : data.results ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [roleFilter, search])

  async function handleToggle(userId, currentActive) {
    try {
      await fetch(`${API_URL}/admin/users/${userId}/toggle_active/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u))
    } catch {
      alert('Failed to toggle user status.')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const res = await fetch(`${API_URL}/admin/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err))
      }
      setCreateSuccess(`${form.role} account created successfully.`)
      setForm({ name: '', email: '', password: '', role: 'librarian' })
      fetchUsers()
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Roles & Staff</h1>
        <p className="text-sm opacity-70 mt-1">Manage users and staff accounts</p>
      </div>

      {/* ── Create User Form ── */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Create New Account</h2>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <select
            className="input"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="btn-primary sm:col-span-2 lg:col-span-4 w-fit"
          >
            {creating ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        {createSuccess && <p className="text-green-600 text-sm">{createSuccess}</p>}
        {createError   && <p className="text-red-500 text-sm">{createError}</p>}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* ── User List ── */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading
        ? <p className="text-sm opacity-60">Loading users...</p>
        : (
          <div className="grid md:grid-cols-2 gap-4">
            {users.length === 0
              ? <p className="text-sm opacity-60">No users found.</p>
              : users.map(u => (
                <div key={u.id} className="card p-5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{u.name || '—'}</p>
                    <p className="text-sm opacity-70">{u.email}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                      u.role === 'admin'     ? 'bg-red-100 text-red-700' :
                      u.role === 'librarian' ? 'bg-blue-100 text-blue-700' :
                                              'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle(u.id, u.is_active)}
                    className={u.is_active ? 'btn-outline' : 'btn-primary'}
                  >
                    {u.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
}