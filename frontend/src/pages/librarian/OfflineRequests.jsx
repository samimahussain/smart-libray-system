import { useEffect, useState } from 'react'
import axios from '../../lib/axios'

export default function OfflineRequests() {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Track remarks for each request
  const [remarksMap, setRemarksMap] = useState({})
  const [dueDateMap, setDueDateMap] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const endpoint = filter === 'all' 
        ? '/librarian/requests/all/' 
        : `/librarian/requests/all/?status=${filter}`
      
      const res = await axios.get(endpoint)
      setRequests(res.data)
      setError('')
    } catch (err) {
      console.error('Failed to load requests:', err)
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      await axios.post('/librarian/requests/approve/', {
        request_id: requestId,
        action: 'approve',
        remarks: remarksMap[requestId] || ''
      })

      alert('Request approved successfully!')
      fetchRequests()
      setRemarksMap({ ...remarksMap, [requestId]: '' })
    } catch (err) {
      console.error('Approve failed:', err)
      alert(err.response?.data?.error || 'Failed to approve request')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await axios.post('/librarian/requests/approve/', {
        request_id: requestId,
        action: 'reject',
        remarks: remarksMap[requestId] || 'Rejected'
      })

      alert('Request rejected')
      fetchRequests()
      setRemarksMap({ ...remarksMap, [requestId]: '' })
    } catch (err) {
      console.error('Reject failed:', err)
      alert(err.response?.data?.error || 'Failed to reject request')
    }
  }

  const handleIssue = async (requestId) => {
    const dueDate = dueDateMap[requestId]
    if (!dueDate) {
      alert('Please select a due date')
      return
    }

    try {
      await axios.post('/librarian/requests/issue/', {
        request_id: requestId,
        due_date: dueDate
      })

      alert('Book issued successfully!')
      fetchRequests()
      setDueDateMap({ ...dueDateMap, [requestId]: '' })
    } catch (err) {
      console.error('Issue failed:', err)
      alert(err.response?.data?.error || 'Failed to issue book')
    }
  }

  const handleReturn = async (requestId) => {
    const fineAmount = window.prompt('Enter fine amount (if any):', '0')
    if (fineAmount === null) return

    try {
      await axios.post('/librarian/requests/return/', {
        request_id: requestId,
        fine_amount: parseFloat(fineAmount) || 0
      })

      alert('Book returned successfully!')
      fetchRequests()
    } catch (err) {
      console.error('Return failed:', err)
      alert(err.response?.data?.error || 'Failed to return book')
    }
  }

  if (loading) {
    return <div className="p-6">Loading requests...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Offline Book Requests</h1>
        <button 
          onClick={fetchRequests}
          className="btn-outline text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['pending', 'approved', 'issued', 'returned', 'rejected', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded capitalize ${
              filter === status ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <p className="text-gray-500">No requests found</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{req.book_title}</h3>
                  <p className="text-sm text-gray-600">{req.book_author}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Student:</strong> {req.user_name} ({req.user_email})</p>
                    <p><strong>Purpose:</strong> {req.purpose}</p>
                    <p><strong>Requested Date:</strong> {req.requested_date}</p>
                    <p><strong>Return Date:</strong> {req.requested_return_date}</p>
                    {req.due_date && <p><strong>Due Date:</strong> {req.due_date}</p>}
                    {req.librarian_remarks && (
                      <p><strong>Remarks:</strong> {req.librarian_remarks}</p>
                    )}
                    {req.fine_amount > 0 && (
                      <p className="text-red-600">
                        <strong>Fine:</strong> ₹{req.fine_amount} 
                        {req.fine_paid && <span className="text-green-600 ml-2">(Paid)</span>}
                      </p>
                    )}
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full ml-4 ${
                  req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  req.status === 'approved' ? 'bg-green-100 text-green-700' :
                  req.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                  req.status === 'returned' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {req.status}
                </span>
              </div>

              {/* Actions based on status */}
              <div className="mt-4">
                {req.status === 'pending' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Remarks (optional)"
                      value={remarksMap[req.id] || ''}
                      onChange={(e) => setRemarksMap({ ...remarksMap, [req.id]: e.target.value })}
                      className="input w-full"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="btn-primary"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="btn-outline"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {req.status === 'approved' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dueDateMap[req.id] || ''}
                      onChange={(e) => setDueDateMap({ ...dueDateMap, [req.id]: e.target.value })}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <button
                      onClick={() => handleIssue(req.id)}
                      className="btn-primary"
                    >
                      Issue Book
                    </button>
                  </div>
                )}

                {req.status === 'issued' && (
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleReturn(req.id)}
                      className="btn-primary"
                    >
                      Mark as Returned
                    </button>
                    {req.is_overdue && (
                      <span className="text-red-600 text-sm font-medium">
                        Overdue by {req.days_overdue} days
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
