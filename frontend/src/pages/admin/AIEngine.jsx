import { useAdminStore } from '../../store/adminStore'

export default function AIEngine() {
  const { systemConfig, updateConfig } = useAdminStore()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Engine Management</h1>

      <div className="card p-6 flex justify-between">
        <div>
          <p className="font-semibold">Enable AI Features</p>
          <p className="text-sm opacity-70">Summaries, chat, recommendations</p>
        </div>
        <input
          type="checkbox"
          checked={systemConfig.aiEnabled}
          onChange={(e) => updateConfig('aiEnabled', e.target.checked)}
        />
      </div>

      <div className="card p-6">
        <p className="font-semibold">Prompt Tuning</p>
        <textarea className="input mt-3" placeholder="System prompt..." />
      </div>
    </div>
  )
}
