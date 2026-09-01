import { create } from 'zustand'
import { API_BASE_URL, getAuthHeaders } from '../api'

export const useLibraryStore = create((set) => ({
  books: [],
  issuedBooks: [],
  compare: [],

  fetchBooks: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/books/`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      })

      if (!res.ok) {
        console.error("Failed to fetch books", res.status)
        set({ books: [] })
        return
      }

      const data = await res.json()
      set({ books: Array.isArray(data) ? data : [] })
    } catch (err) {
      console.error("Fetch books error", err)
      set({ books: [] })
    }
  },

  issueBook: (book) => {
    set(state => ({
      issuedBooks: [...state.issuedBooks, book],
    }))
  },

  toggleCompare: (book) => {
    set(state => ({
      compare: state.compare.find(b => b.id === book.id)
        ? state.compare.filter(b => b.id !== book.id)
        : [...state.compare, book]
    }))
  },
}))
