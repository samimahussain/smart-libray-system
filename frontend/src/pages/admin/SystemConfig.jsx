import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ── Fallback local config if no backend endpoint exists yet ──
const DEFAULT_CONFIG = {
  max_borrow_days:    14,
  max_books_per_user: 3,
  fine_per_day:       5,
  ai_enabled:         true,
  allow_registration: true,
  maintenance_mode:   false,
}

export default function SystemConfig() {
  const accessToken = useAuthStore(s => s.accessToken)
  const [config, setConfig]   = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  // Try to load from backend — gracefully falls back to defaults if endpoint missing
  useEffect(() => {
    async function fetchConfig() {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/admin/system-config/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        }
        // If 404, just use defaults silently
      } catch {
        // Network error — use defaults
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [accessToken])

  async function handleSave() {
    setSaved(false)
    setError('')
    try {
      const res = await fetch(`${API_URL}/admin/system-config/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Failed to save config')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  function updateField(key, value) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const LABELS = {
    max_borrow_days:    { label: 'Max Borrow Days',      desc: 'How many days a book can be borrowed', type: 'number' },
    max_books_per_user: { label: 'Max Books Per User',   desc: 'Maximum concurrent borrows per user',  type: 'number' },
    fine_per_day:       { label: 'Fine Per Day (₹)',     desc: 'Overdue fine charged per day',          type: 'number' },
    ai_enabled:         { label: 'AI Features Enabled',  desc: 'Toggle AI recommendations & chat',     type: 'boolean' },
    allow_registration: { label: 'Allow Registration',   desc: 'Let new users sign up',                type: 'boolean' },
    maintenance_mode:   { label: 'Maintenance Mode',     desc: 'Take the system offline for users',    type: 'boolean' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <p className="text-sm opacity-70 mt-1">Manage global system rules and settings</p>
      </div>

      {loading && <p className="text-sm opacity-60">Loading config...</p>}

      <div className="space-y-3">
        {Object.entries(config).map(([key, value]) => {
          const meta = LABELS[key] || { label: key, desc: '', type: typeof value === 'boolean' ? 'boolean' : 'number' }
          return (
            <div key={key} className="card p-5 flex justify-between items-center gap-4">
              <div>
                <p className="font-medium">{meta.label}</p>
                {meta.desc && <p className="text-sm opacity-60">{meta.desc}</p>}
              </div>
              {meta.type === 'boolean' ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!value}
                    onChange={e => updateField(key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
              ) : (
                <input
                  type="number"
                  className="input w-24 text-right"
                  value={value}
                  min={0}
                  onChange={e => updateField(key, Number(e.target.value))}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} className="btn-primary">Save Changes</button>
        {saved  && <span className="text-green-600 text-sm">✓ Saved successfully</span>}
        {error  && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  )
}