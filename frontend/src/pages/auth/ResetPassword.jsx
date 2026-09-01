import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ResetPassword() {
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E4D0] p-8">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm">
        <h2 className="text-2xl font-medium">Create new password</h2>

        <input
          type="password"
          className="input mt-6"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password"
        />

        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full mt-6"
        >
          Update password
        </button>
      </div>
    </div>
  )
}
