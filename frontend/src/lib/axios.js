import axios from "axios"
import { useAuthStore } from "../store/authStore"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
})

// Request interceptor - add token to every request
api.interceptors.request.use(
  (config) => {
    const auth = useAuthStore.getState()
    const token = auth?.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const auth = useAuthStore.getState()
        const refreshToken = auth?.refreshToken

        if (refreshToken) {
          console.log('Token expired, refreshing...')
          
          // Try to refresh the access token
          const response = await axios.post(
            'http://127.0.0.1:8000/api/users/token/refresh/',
            { refresh: refreshToken }
          )

          const newAccessToken = response.data.access

          // Update the store with new token
          auth.login({
            ...auth,
            accessToken: newAccessToken,
            refreshToken: auth.refreshToken
          })

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } else {
          // No refresh token, logout
          console.log('No refresh token, logging out')
          auth.logout()
          window.location.href = '/login'
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        console.error('Token refresh failed:', refreshError)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
