import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', institution: '', password: ''
  })

async function submit(e) {
  e.preventDefault()

  const res = await fetch("http://127.0.0.1:8000/api/users/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  })

  if (res.ok) {
    navigate("/login")
  } else {
    alert("Registration failed")
  }
}  


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E9E4D0] p-8">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-sm"
      >
        <h2 className="text-2xl font-medium">Create account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Your QR code will be generated automatically
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <input className="input" placeholder="Full name"
            onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email"
            onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone"
            onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="Institution ID "
            onChange={e => setForm({ ...form, institution: e.target.value })} />
        </div>

        <input
          type="password"
          className="input mt-4"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button className="btn-primary w-full mt-6">
          Create account
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
