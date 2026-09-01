import { useAuthStore } from '../../store/authStore'
import { useState, useEffect } from 'react'
import axios from '@/lib/axios'
import {
  Eye,
  EyeOff,
  Save,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'

export default function Profile() {
  const { user, setUser } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Fetch profile from database on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true)
        const res = await axios.get('/users/profile/')
        const data = res.data
        setForm({
          name: data.name || data.username || '',
          email: data.email || '',
        })
        // Sync auth store with fresh data
        setUser({ name: data.name || data.username || '', email: data.email || '' })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        // Fallback to store values if fetch fails
        setForm({
          name: user?.name || '',
          email: user?.email || '',
        })
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss messages
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty.' })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const res = await axios.put('/users/profile/update/', {
        name: form.name,
      })

      // Update store with response data or submitted value
      const updatedName = res.data?.name || form.name
      setUser({ name: updatedName, email: form.email })
      setForm(prev => ({ ...prev, name: updatedName }))

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error(error)
      setMessage({
        type: 'error',
        text:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          'Failed to update profile. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters'
      })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await axios.put('/user/change-password/', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setShowPasswordModal(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error(error)
      setMessage({
        type: 'error',
        text:
          error.response?.data?.message ||
          error.response?.data?.detail ||
          'Failed to change password. Please check your current password.'
      })
    } finally {
      setLoading(false)
    }
  }

  const dismissMessage = () => {
    setMessage({ type: '', text: '' })
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Profile & Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your personal information and security
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <p className="flex-1">{message.text}</p>
          <button onClick={dismissMessage}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Profile Information */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </h2>

        {profileLoading ? (
          <div className="flex items-center gap-2 text-gray-500 py-4">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Loading profile...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                  value={form.email}
                  disabled
                  placeholder="Email address"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        )}
      </section>

      {/* Security */}
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Security
        </h2>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-5 py-2.5 border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        >
          Change Password
        </button>
      </section>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold dark:text-white">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Current Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  className="w-full px-4 py-2 border rounded-lg pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })
                }
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg py-2 transition-colors"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}