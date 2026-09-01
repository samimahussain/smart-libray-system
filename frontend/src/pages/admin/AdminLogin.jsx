import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function AdminLogin() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const tokenRes = await axios.post(`${API_URL}/token/`, { email, password })
      const { access, refresh } = tokenRes.data

      const userRes = await axios.get(`${API_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      })
      const user = userRes.data

      if (user.role?.toLowerCase() !== 'admin') {
        setError('Access denied. Admin credentials required.')
        setLoading(false)
        return
      }

      login({ email, name: user.name, role: user.role, accessToken: access, refreshToken: refresh })
      navigate('/admin')

    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#E9E4D0]">

      {/* BRAND PANEL */}
      <div className="hidden md:flex items-center justify-center bg-black text-white p-14">
        <div className="max-w-sm">
          <h1 className="font-serif text-4xl font-semibold">
            Admin Panel
          </h1>
          <p className="mt-4 text-sm opacity-80">
            Sign in to manage users, books, issues, and system analytics for EduVault.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm"
        >
          <h2 className="text-2xl font-medium">Admin sign in</h2>

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

          <div className="mt-6">
            <label className="label">Email</label>
            <input
              type="email"
              className="input mt-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="label">Password</label>
            <input
              type="password"
              className="input mt-1"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>

    </div>
  )
}
