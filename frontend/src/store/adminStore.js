import { create } from 'zustand'

export const useAdminStore = create((set, get) => ({
  users: [
    { id: 1, name: 'Samima', role: 'User', active: true },
    { id: 2, name: 'Ayesha', role: 'Librarian', active: true },
  ],

  issuedBooks: 32,
  revenue: 2450,
  aiUsage: 128,

  systemConfig: {
    maxOfflineBooks: 2,
    finePerDay: 10,
    attendanceRequired: true,
    aiEnabled: true,
  },

  activityLogs: [],

  createLibrarian: (name) =>
    set({
      users: [...get().users, { id: Date.now(), name, role: 'Librarian', active: true }]
    }),

  toggleUserStatus: (id) =>
    set({
      users: get().users.map(u =>
        u.id === id ? { ...u, active: !u.active } : u
      )
    }),

  updateConfig: (key, value) =>
    set({
      systemConfig: { ...get().systemConfig, [key]: value }
    })
}))
