import { useEffect, useState } from 'react'
import axios from '../../lib/axios'

export default function UserVerification() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, active, blocked
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users/all/')
      setUsers(res.data)
      console.log('Users from API:', res.data)
      setError('')
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users from server')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (userId, currentStatus) => {
    const action = currentStatus ? 'block' : 'unblock'
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      await axios.post(`/users/${userId}/toggle-block/`, {
        is_active: !currentStatus
      })
      alert(`User ${action}ed successfully`)
      fetchUsers()
    } catch (err) {
      alert(`Failed to ${action} user`)
    }
  }

  const filteredUsers = users
    .filter(user => {
      if (filter === 'active') return user.is_active
      if (filter === 'blocked') return !user.is_active
      return true
    })
    .filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (loading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Verification</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage user access
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          className="btn-outline text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.is_active).length}
          </p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => !u.is_active).length}
          </p>
          <p className="text-sm text-gray-600">Blocked</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active' ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`px-4 py-2 rounded ${
              filter === 'blocked' ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            Blocked
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input flex-1"
        />
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No users found</p>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="card p-6 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    user.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                </div>
                
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>📧 {user.email}</p>
                  {user.phone && <p>📱 {user.phone}</p>}
                  {user.institution && <p>🏫 {user.institution}</p>}
                  <p>📅 Joined: {new Date(user.date_joined).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleToggleBlock(user.id, user.is_active)}
                  className={`whitespace-nowrap ${
                    user.is_active 
                      ? 'btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white' 
                      : 'btn-primary'
                  }`}
                >
                  {user.is_active ? '🚫 Block' : '✅ Unblock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  )
}
