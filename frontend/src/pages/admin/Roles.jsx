import { useAdminStore } from '../../store/adminStore'
import { useState } from 'react'

export default function Roles() {
  const { users, createLibrarian, toggleUserStatus } = useAdminStore()
  const [name, setName] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Roles & Staff</h1>

      <div className="flex gap-2 max-w-md">
        <input className="input" placeholder="Librarian name" value={name}
          onChange={e => setName(e.target.value)} />
        <button onClick={() => createLibrarian(name)} className="btn-primary">
          Create
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {users.map(u => (
          <div key={u.id} className="card p-6 flex justify-between">
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm opacity-70">{u.role}</p>
            </div>

            <button
              onClick={() => toggleUserStatus(u.id)}
              className="btn-outline"
            >
              {u.active ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
