import { useRef, useState } from 'react'
import IssueBookModal from './IssueBookModal'
import api from '../../lib/axios'

const horizontalScroll =
  'flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth snap-x snap-mandatory'

const scrollByAmount = (ref, amount) => {
  if (ref.current) {
    ref.current.scrollBy({ left: amount, behavior: 'smooth' })
  }
}

export default function BookRow({ title, books }) {
  const ref = useRef(null)

  // 🔹 NEW STATE
  const [selectedBook, setSelectedBook] = useState(null)
  const [loading, setLoading] = useState(false)

  // 🔹 ISSUE HANDLER
  async function handleIssue(days) {
    if (!selectedBook) return

    try {
      setLoading(true)

      await api.post(`/books/${selectedBook.id}/issue/`, {
        days,
      })

      alert('Book issued successfully. Check your email for the access code.')
      setSelectedBook(null)
    } catch (err) {
      console.error(err)
      alert('Failed to issue book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-12 group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-2xl">{title}</h3>

          <div className="hidden group-hover:flex gap-2">
            <button
              onClick={() => scrollByAmount(ref, -300)}
              className="w-8 h-8 rounded-full bg-white shadow"
            >
              ‹
            </button>
            <button
              onClick={() => scrollByAmount(ref, 300)}
              className="w-8 h-8 rounded-full bg-white shadow"
            >
              ›
            </button>
          </div>
        </div>

        <div ref={ref} className={horizontalScroll}>
          {books.map(book => (
            <div
              key={book.id}
              className="min-w-[160px] bg-[#F6F1DB] rounded-lg p-3"
            >
              <div className="h-48 bg-slate-300 rounded-md mb-3" />
              <p className="text-sm font-medium">{book.title}</p>
              <p className="text-xs text-slate-500">{book.author}</p>

              <button
                onClick={() => setSelectedBook(book)}
                disabled={loading}
                className="block mt-3 w-full text-center text-sm py-1.5 rounded-md bg-indigo-600 text-white disabled:opacity-50"
              >
                Issue
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🔹 ISSUE MODAL */}
      {selectedBook && (
        <IssueBookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onConfirm={handleIssue}
        />
      )}
    </>
  )
}
