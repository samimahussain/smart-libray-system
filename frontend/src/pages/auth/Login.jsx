import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from '../../lib/axios'

const ERROR_DISPLAY_MS = 50000 // error stays visible for 5 seconds

export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const errorTimerRef = useRef(null)

  // Always show error for at least ERROR_DISPLAY_MS ms
  const showError = useCallback((msg) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    setError(msg)
    errorTimerRef.current = setTimeout(() => setError(''), ERROR_DISPLAY_MS)
  }, [])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await axios.post('/auth/login/', { email, password })
      const { access, refresh, role } = res.data

      login({ email, role, accessToken: access, refreshToken: refresh })

      if (role?.toLowerCase() === 'user') navigate('/user')
      if (role?.toLowerCase() === 'librarian') navigate('/librarian')
      if (role?.toLowerCase() === 'admin') navigate('/admin')

    } catch (err) {
  const msg = err.response?.data?.detail || 'Invalid email or password'
  sessionStorage.setItem('login_error', msg)
  setError(msg)
  setTimeout(() => {
    setError('')
    sessionStorage.removeItem('login_error')
  }, 5000)
}
  }
useEffect(() => {
  const saved = sessionStorage.getItem('login_error')
  if (saved) {
    setError(saved)
    setTimeout(() => {
      setError('')
      sessionStorage.removeItem('login_error')
    }, 50000)
  }
}, [])

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

          {/* Error — min-height reserves space so the form doesn't jump */}
          <div style={{ minHeight: 44, marginTop: 8 }}>
            {error && (
              <>
                <style>{`
                  @keyframes errorFadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
                <p style={{
                  color: '#DC2626',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(220,38,38,0.07)',
                  border: '1px solid rgba(220,38,38,0.18)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  animation: 'errorFadeIn 0.2s ease both',
                }}>
                  <span style={{ fontSize: 14 }}>⚠</span>
                  {error}
                </p>
              </>
            )}
          </div>

          <div className="mt-2">
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
