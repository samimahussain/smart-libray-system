import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,

      // 🔐 LOGIN
      login: ({ email, role, accessToken, refreshToken }) => {
        set({
          user: { email },
          role,
          accessToken,
          refreshToken,
        })
      },

      // 🚪 LOGOUT
      logout: () => {
  localStorage.removeItem('auth') // ✅ keep
  set({
    user: null,
    role: null,
    accessToken: null,
    refreshToken: null,
  })
},

    }),
    {
      name: 'auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
