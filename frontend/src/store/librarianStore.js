import { create } from 'zustand'

export const useLibrarianStore = create((set, get) => ({
  offlineRequests: [
    {
      id: 1,
      student: 'Samima',
      book: 'DBMS',
      pickup: '2025-02-10',
      status: 'Pending',
      fine: 0,
      remarks: ''
    }
  ],

  inventory: [
    { id: 1, title: 'DBMS', stock: 5, shelf: 'A1', condition: 'Good' },
    { id: 2, title: 'OS', stock: 1, shelf: 'B2', condition: 'Low' }
  ],

  attendanceLogs: [],
  fines: [],

  approveRequest: (id, dueDate, remarks) =>
    set({
      offlineRequests: get().offlineRequests.map(r =>
        r.id === id
          ? { ...r, status: 'Approved', dueDate, remarks }
          : r
      )
    }),

  rejectRequest: (id, remarks) =>
    set({
      offlineRequests: get().offlineRequests.map(r =>
        r.id === id
          ? { ...r, status: 'Rejected', remarks }
          : r
      )
    }),

  markDamaged: (id) =>
    set({
      inventory: get().inventory.map(b =>
        b.id === id ? { ...b, condition: 'Damaged' } : b
      )
    }),

  addAttendance: () =>
    set({
      attendanceLogs: [
        ...get().attendanceLogs,
        { time: new Date().toLocaleTimeString() }
      ]
    })
}))
