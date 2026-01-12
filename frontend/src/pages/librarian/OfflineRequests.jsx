import { useLibrarianStore } from '../../store/librarianStore'
import { useState } from 'react'

export default function OfflineRequests() {
  const { offlineRequests, approveRequest, rejectRequest } = useLibrarianStore()
  const [remarks, setRemarks] = useState('')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Offline Book Requests</h1>

      {offlineRequests.map(r => (
        <div key={r.id} className="card p-6 flex justify-between items-center">
          <div>
            <p className="font-semibold">{r.book}</p>
            <p className="text-sm opacity-70">{r.student} • {r.pickup}</p>
            <p className="text-sm">Status: {r.status}</p>
          </div>

          {r.status === 'Pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => approveRequest(r.id, '2025-02-20', remarks)}
                className="btn-primary"
              >
                Approve
              </button>
              <button
                onClick={() => rejectRequest(r.id, remarks)}
                className="btn-outline"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
