import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import BookRow from '../../components/books/BookRow'

export function Library() {
  const accessToken = useAuthStore(s => s.accessToken)

  const [books, setBooks] = useState([])

  useEffect(() => {
    api.get('/books/')
      .then(res => {
        console.log('BOOKS:', res.data)
        setBooks(res.data)
      })
      .catch(err => {
        console.error('BOOK FETCH ERROR:', err)
      })
  }, [])

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  // 🔥 CATEGORY ID MAP (MATCH YOUR DB)
  const CATEGORY_MAP = {
    1: 'Self Help',
    2: 'Science Fiction',
    3: 'Thrillers',
    4: 'Romance',
    5: 'Kids',
  }

  // 🔥 GROUP BOOKS BY CATEGORY ID
  const grouped = books.reduce((acc, book) => {
    const label = CATEGORY_MAP[book.category] || 'Others'
    acc[label] ??= []
    acc[label].push(book)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#E9E4D0] text-slate-900">
      {Object.entries(grouped).map(([category, books]) => (
        <BookRow
          key={category}
          title={category}
          books={books}
        />
      ))}
    </div>
  )
}
