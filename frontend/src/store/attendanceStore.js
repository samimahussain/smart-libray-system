import { create } from 'zustand'


export const useAttendanceStore = create((set, get) => ({
logs: [],


scanQR: () => {
const now = new Date()
set({ logs: [...get().logs, { date: now.toDateString(), time: now.toLocaleTimeString() }] })
}
}))