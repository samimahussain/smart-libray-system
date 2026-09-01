import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ children, role }) {
  const { accessToken, role: userRole } = useAuthStore()

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (role && userRole?.toLowerCase() !== role.toLowerCase()) {
  return <Navigate to="/login" replace />
}

  return children
}
