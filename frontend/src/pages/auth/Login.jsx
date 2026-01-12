import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from '../../lib/axios' // we’ll confirm this file next


export function Login() {
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
      const res = await axios.post('/auth/login/', {
        email,
        password,
      })

      const { access, refresh, role } = res.data

      // store in zustand + localStorage
      login({
        email,
        role,
        accessToken: access,
        refreshToken: refresh,
      })

      // role-based redirect (REAL, from backend)
    if (role?.toLowerCase() === 'user') navigate('/user')
if (role?.toLowerCase() === 'librarian') navigate('/librarian')
if (role?.toLowerCase() === 'admin') navigate('/admin')

    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid email or password'
      )
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
            Welcome back
          </h1>
          <p className="mt-4 text-sm opacity-80">
            Sign in to access your smart library, AI study tools, and insights.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm"
        >
          <h2 className="text-2xl font-medium">Sign in</h2>

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

          <div className="mt-6">
            <label className="label">Email</label>
            <input
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

          <div className="flex justify-between mt-4 text-sm">
            <Link to="/forgot-password" className="text-slate-600 hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="hover:underline">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
