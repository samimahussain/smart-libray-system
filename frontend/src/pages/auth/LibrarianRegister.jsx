import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function LibrarianRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    inviteCode: '',
    password: ''
  })

  function submit(e) {
    e.preventDefault()

    // mock validation
    if (form.inviteCode !== 'LIB-EDUVAULT') {
      alert('Invalid invite code')
      return
    }

    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E4D0] p-8">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm"
      >
        <h2 className="text-2xl font-medium">
          Librarian Registration
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Invite-only access for library staff
        </p>

        <div className="mt-6">
          <label className="label">Full name</label>
          <input
            className="input mt-1"
            placeholder="Full name"
            onChange={e =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div className="mt-4">
          <label className="label">Email</label>
          <input
            className="input mt-1"
            placeholder="Email address"
            onChange={e =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <div className="mt-4">
          <label className="label">Invite code</label>
          <input
            className="input mt-1"
            placeholder="Provided by admin"
            onChange={e =>
              setForm({ ...form, inviteCode: e.target.value })
            }
          />
        </div>

        <div className="mt-4">
          <label className="label">Password</label>
          <input
            type="password"
            className="input mt-1"
            placeholder="Create password"
            onChange={e =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <button className="btn-primary w-full mt-6">
          Register librarian
        </button>

        <p className="text-sm text-center mt-4">
          Already registered?{' '}
          <Link to="/login" className="hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
