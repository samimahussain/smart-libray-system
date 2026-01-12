import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'

export function Profile() {
  const { user } = useAuthStore()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    language: 'English',
    notifications: true
  })

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold">Profile & Settings</h1>
      <p className="opacity-70 mt-1">
        Manage your personal information and preferences
      </p>

      {/* ---------------- PROFILE INFO ---------------- */}
      <section className="card p-6 mt-8">
        <h2 className="text-xl font-semibold">Profile Information</h2>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input mt-1"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input mt-1"
              value={form.email}
              disabled
            />
          </div>
        </div>

        <button className="btn-primary mt-6">
          Save changes
        </button>
      </section>

      {/* ---------------- PREFERENCES ---------------- */}
      <section className="card p-6 mt-8">
        <h2 className="text-xl font-semibold">Preferences</h2>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="label">Language</label>
            <select
              className="input mt-1"
              value={form.language}
              onChange={(e) =>
                setForm({ ...form, language: e.target.value })
              }
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </div>

          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={() =>
                setForm({
                  ...form,
                  notifications: !form.notifications
                })
              }
            />
            <span className="text-sm">
              Enable notifications
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- SECURITY ---------------- */}
      <section className="card p-6 mt-8">
        <h2 className="text-xl font-semibold">Security</h2>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm opacity-70">
              Last updated recently
            </p>
          </div>

          <button className="btn-outline">
            Change password
          </button>
        </div>

        <div className="mt-6">
          <p className="font-medium">Active Sessions</p>
          <p className="text-sm opacity-70">
            Session management will appear here
          </p>
        </div>
      </section>
    </div>
  )
}
