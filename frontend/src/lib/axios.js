import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

// 🔐 Attach JWT from localStorage (NOT zustand state)
api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('auth'))

    const token = auth?.state?.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

export default api
