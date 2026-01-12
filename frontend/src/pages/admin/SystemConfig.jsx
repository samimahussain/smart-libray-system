import { useAdminStore } from '../../store/adminStore'

export default function SystemConfig() {
  const { systemConfig, updateConfig } = useAdminStore()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Configuration</h1>

      {Object.entries(systemConfig).map(([key, value]) => (
        <div key={key} className="card p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{key}</p>
            <p className="text-sm opacity-70">System rule</p>
          </div>

          <input
            type={typeof value === 'boolean' ? 'checkbox' : 'number'}
            checked={typeof value === 'boolean' ? value : undefined}
            value={typeof value !== 'boolean' ? value : undefined}
            onChange={(e) =>
              updateConfig(
                key,
                typeof value === 'boolean'
                  ? e.target.checked
                  : Number(e.target.value)
              )
            }
          />
        </div>
      ))}
    </div>
  )
}
