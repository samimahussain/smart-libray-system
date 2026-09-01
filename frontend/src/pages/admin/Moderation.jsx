import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export default function Moderation() {
  const accessToken = useAuthStore(s => s.accessToken)

  const [books, setBooks]         = useState([])
  const [overdueIssues, setOverdueIssues] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [actionMsg, setActionMsg] = useState('')

  async function fetchData() {
    setLoading(true)
    try {
      const [booksRes, overdueRes] = await Promise.all([
        fetch(`${API_URL}/admin/books/?search=${search}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/admin/issues/?status=overdue`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ])
      if (!booksRes.ok || !overdueRes.ok) throw new Error('Failed to fetch data')
      const booksData   = await booksRes.json()
      const overdueData = await overdueRes.json()
      setBooks(Array.isArray(booksData) ? booksData : booksData.results ?? [])
      setOverdueIssues(Array.isArray(overdueData) ? overdueData : overdueData.results ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [search])

  async function handleDeleteBook(bookId, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`${API_URL}/admin/books/${bookId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Delete failed')
      setBooks(prev => prev.filter(b => b.id !== bookId))
      setActionMsg(`"${title}" removed.`)
      setTimeout(() => setActionMsg(''), 3000)
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleForceReturn(issueId) {
    try {
      const res = await fetch(`${API_URL}/admin/issues/${issueId}/force_return/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Force return failed')
      setOverdueIssues(prev => prev.filter(i => i.id !== issueId))
      setActionMsg('Book marked as returned.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <p className="text-sm opacity-70 mt-1">Manage books and resolve overdue issues</p>
      </div>

      {actionMsg && <p className="text-green-600 text-sm">{actionMsg}</p>}
      {error     && <p className="text-red-500 text-sm">{error}</p>}

      {/* ── Overdue Issues ── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">
          Overdue Issues
          {overdueIssues.length > 0 && (
            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {overdueIssues.length}
            </span>
          )}
        </h2>

        {loading
          ? <p className="text-sm opacity-60">Loading...</p>
          : overdueIssues.length === 0
            ? <p className="text-sm opacity-60">No overdue issues. 🎉</p>
            : overdueIssues.map(issue => (
              <div key={issue.id} className="card p-5 flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold">{issue.book_title}</p>
                  <p className="text-sm opacity-70">
                    {issue.user_name} ({issue.user_email})
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Due: {new Date(issue.due_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleForceReturn(issue.id)}
                  className="btn-primary"
                >
                  Force Return
                </button>
              </div>
            ))
        }
      </section>

      {/* ── Book Management ── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-lg">Book Catalogue</h2>
        <input
          className="input max-w-sm"
          placeholder="Search books..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading
          ? <p className="text-sm opacity-60">Loading books...</p>
          : books.length === 0
            ? <p className="text-sm opacity-60">No books found.</p>
            : books.map(book => (
              <div key={book.id} className="card p-5 flex justify-between items-center gap-4">
                <div>
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-sm opacity-70">{book.author}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {book.category} · {book.available_copies}/{book.total_copies} available
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBook(book.id, book.title)}
                  className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))
        }
      </section>
    </div>
  )
}