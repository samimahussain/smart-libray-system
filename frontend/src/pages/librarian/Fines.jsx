import { useState } from 'react'
import { useLibrarianStore } from '../../store/librarianStore'

export default function Fines() {
  const { offlineRequests } = useLibrarianStore()
  const [payments, setPayments] = useState({})

  // derive fine-eligible records
  const finedUsers = offlineRequests.filter(
    r => r.status === 'Approved' || r.status === 'Returned'
  )

  function markPaid(id) {
    setPayments(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Fines & Penalties</h1>
        <p className="text-sm opacity-70 mt-1">
          Manage overdue fines and payment status
        </p>
      </div>

      {finedUsers.length === 0 ? (
        <p className="text-sm opacity-70">
          No fine records available
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {finedUsers.map(r => {
            const fineAmount = r.fine || 50 // mock auto-fine

            return (
              <div key={r.id} className="card p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{r.student}</p>
                    <p className="text-sm opacity-70">{r.book}</p>
                    <p className="text-sm mt-1">
                      Fine Amount: <b>₹{fineAmount}</b>
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      payments[r.id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {payments[r.id] ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    className="btn-outline"
                    onClick={() => alert('Manual fine edit (mock)')}
                  >
                    Edit Fine
                  </button>

                  {!payments[r.id] && (
                    <button
                      onClick={() => markPaid(r.id)}
                      className="btn-primary"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
