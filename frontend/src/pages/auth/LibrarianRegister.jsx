import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function LibrarianRegister() {
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // Form validation
  function validateForm() {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:8000/api/users/librarian/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          institution: form.institution,
          password: form.password
        })
      })

      const data = await res.json()

      if (res.ok) {
        alert('Registration successful! Check your email for the invite code, then login.')
        navigate('/librarian-login')
      } else {
        if (data.email) {
          setErrors({ ...errors, email: data.email[0] })
        } else if (data.error) {
          setGeneralError(data.error)
        } else if (data.non_field_errors) {
          setGeneralError(data.non_field_errors[0])
        } else {
          setGeneralError('Registration failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setGeneralError('Unable to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E4D0] p-8">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-sm"
      >
        <h2 className="text-2xl font-medium">
          Librarian Registration
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Register to receive your invite code via email
        </p>

        {generalError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {generalError}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <input
              className={`input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Full name"
              value={form.name}
              onChange={e => {
                setForm({ ...form, name: e.target.value })
                setErrors({ ...errors, name: '' })
              }}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Email"
              value={form.email}
              onChange={e => {
                setForm({ ...form, email: e.target.value })
                setErrors({ ...errors, email: '' })
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <input
            className="input"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <input
            className="input"
            placeholder="Institution (optional)"
            value={form.institution}
            onChange={e => setForm({ ...form, institution: e.target.value })}
          />
        </div>

        <div className="mt-4">
          <input
            type="password"
            className={`input ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Password (min. 6 characters)"
            value={form.password}
            onChange={e => {
              setForm({ ...form, password: e.target.value })
              setErrors({ ...errors, password: '' })
            }}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          disabled={loading}
          className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center mt-4 text-slate-600">
          After registration, you'll receive an invite code via email. Use it to login.
        </p>

        <p className="text-sm text-center mt-2">
          Already have an invite code?{' '}
          <Link to="/librarian-login" className="hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
