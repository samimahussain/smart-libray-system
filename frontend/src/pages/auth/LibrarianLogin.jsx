import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from '../../lib/axios'

export function LibrarianLogin() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/users/librarian/login/', {
        email,
        password,
        invite_code: inviteCode,
      })

      const { access, refresh, role } = res.data

      // store in zustand + localStorage
      login({
        email,
        role,
        accessToken: access,
        refreshToken: refresh,
      })

      // Redirect to librarian dashboard
      navigate('/librarian')

    } catch (err) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.invite_code?.[0] ||
        'Invalid credentials or invite code'
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
            Librarian Portal
          </h1>
          <p className="mt-4 text-sm opacity-80">
            Sign in with your email, password, and invite code to access the librarian dashboard.
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-8">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm"
        >
          <h2 className="text-2xl font-medium">Librarian Sign In</h2>

          {error && (
            <p className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          <div className="mt-6">
            <label className="label">Email</label>
            <input
              type="email"
              className="input mt-1"
              placeholder="librarian@example.com"
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
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="label">Invite Code</label>
            <input
              type="text"
              className="input mt-1"
              placeholder="Enter invite code from email"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Check your email for the invite code
            </p>
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
            <Link to="/librarian-register" className="hover:underline">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
