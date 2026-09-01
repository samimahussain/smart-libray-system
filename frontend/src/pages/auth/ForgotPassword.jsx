import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ForgotPassword() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E4D0] p-8">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm">
        <h2 className="text-2xl font-medium">Reset password</h2>
        <p className="text-sm text-slate-500 mt-1">
          We’ll send a reset link to your email
        </p>

        <input
          className="input mt-6"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
        />

        <button className="btn-primary w-full mt-6">
          Send reset link
        </button>

        <p className="text-sm text-center mt-4">
          <Link to="/login" className="hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
