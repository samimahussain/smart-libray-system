import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function AIEngine() {
  const accessToken = useAuthStore(s => s.accessToken)

  const [aiEnabled, setAiEnabled]   = useState(true)
  const [prompt, setPrompt]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState('')

  // Load current config from backend
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`${API_URL}/admin/system-config/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          setAiEnabled(data.ai_enabled ?? true)
          setPrompt(data.ai_system_prompt ?? '')
        }
      } catch {
        // Falls back to defaults silently
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [accessToken])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch(`${API_URL}/admin/system-config/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ai_enabled: aiEnabled, ai_system_prompt: prompt }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Engine Management</h1>
        <p className="text-sm opacity-70 mt-1">Control AI features and behaviour</p>
      </div>

      {loading && <p className="text-sm opacity-60">Loading config...</p>}

      {/* Toggle */}
      <div className="card p-6 flex justify-between items-center">
        <div>
          <p className="font-semibold">Enable AI Features</p>
          <p className="text-sm opacity-70">Summaries, chat, recommendations</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={aiEnabled}
            onChange={e => setAiEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-black transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* Prompt tuning */}
      <div className="card p-6 space-y-3">
        <div>
          <p className="font-semibold">System Prompt Tuning</p>
          <p className="text-sm opacity-70">Customise how the AI responds to users</p>
        </div>
        <textarea
          className="input w-full h-40 resize-y font-mono text-sm"
          placeholder="Enter system prompt for the AI assistant..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Saved successfully</span>}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  )
}