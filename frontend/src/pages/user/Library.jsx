import { useEffect, useState, useRef } from 'react'
import axios from '../../lib/axios'
import BookDetails from '../../components/BookDetails'

export default function Library() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Compare functionality
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  
  // Book details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  
  // Offline modal
  const [showOfflineModal, setShowOfflineModal] = useState(false)
  const [offlineForm, setOfflineForm] = useState({
    purpose: '',
    requested_date: '',
    requested_return_date: ''
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/books/')
      const booksData = Array.isArray(res.data) ? res.data : res.data.results || []
      setBooks(booksData)
      setError('')
    } catch (err) {
      console.error('Failed to load books:', err)
      setError('Failed to load books. Please try again.')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  /**
   * Group books by genre (or subject as fallback).
   * Returns an array of { genre, books } sorted so larger sections come first.
   */
  const getBooksByGenre = () => {
    const genreMap = {}
    books.forEach(book => {
      const genre = book.genre || book.subject || 'General'
      if (!genreMap[genre]) genreMap[genre] = []
      genreMap[genre].push(book)
    })
    return Object.entries(genreMap)
      .map(([genre, books]) => ({ genre, books }))
      .sort((a, b) => b.books.length - a.books.length)
  }

  // Compare functions
  const toggleCompare = (book, e) => {
    if (e) e.stopPropagation()
    setCompareList(prev => {
      const exists = prev.find(b => b.id === book.id)
      if (exists) return prev.filter(b => b.id !== book.id)
      if (prev.length >= 3) {
        alert('You can only compare up to 3 books')
        return prev
      }
      return [...prev, book]
    })
  }

  const clearCompare = () => {
    setCompareList([])
    setShowCompare(false)
  }

  const isInCompare = (bookId) => compareList.some(b => b.id === bookId)

  const openBookDetails = (book, e) => {
    if (e) e.stopPropagation()
    setSelectedBook(book)
    setShowDetailsModal(true)
  }

  const handleOnlineIssue = async (bookId) => {
    try {
      const res = await axios.post('/issues/online/', { book_id: bookId })
      alert(res.data.message)
      setShowDetailsModal(false)
      fetchBooks()
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to issue book'
      alert(errorMsg)
    }
  }

  const openOfflineModal = (book, e) => {
    if (e) e.stopPropagation()
    setSelectedBook(book)
    setShowOfflineModal(true)
    setShowDetailsModal(false)

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)

    setOfflineForm({
      purpose: '',
      requested_date: tomorrow.toISOString().split('T')[0],
      requested_return_date: twoWeeksLater.toISOString().split('T')[0]
    })
  }

  const handleOfflineRequest = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('/requests/create/', {
        book_id: selectedBook.id,
        purpose: offlineForm.purpose,
        requested_date: offlineForm.requested_date,
        requested_return_date: offlineForm.requested_return_date
      })
      alert(res.data.message || 'Request submitted successfully')
      setShowOfflineModal(false)
      setSelectedBook(null)
    } catch (err) {
      console.error(err)
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to submit request'
      alert(errorMsg)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-40">
        <div className="flex items-center gap-3 text-gray-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Loading library...
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  const genreSections = getBooksByGenre()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 Library</h1>
        
        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            ⚖️ Compare ({compareList.length})
          </button>
        )}
      </div>

      {/* Compare Panel */}
      {showCompare && compareList.length > 0 && (
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📊 Compare Books</h2>
            <button onClick={clearCompare} className="text-sm text-red-600 hover:text-red-700">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {compareList.map(book => (
              <div key={book.id} className="border rounded-lg p-4 bg-gray-50 relative">
                <button
                  onClick={() => toggleCompare(book)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center"
                >
                  ×
                </button>
                <h3 className="font-semibold mb-2">{book.title}</h3>
                <div className="space-y-1 text-sm">
                  <p>👤 Author: {book.author}</p>
                  <p>📚 Genre: {book.genre || 'General'}</p>
                  <p>📦 Stock: {book.available_copies} copies</p>
                  <p>📖 ISBN: {book.isbn || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">📊 Quick Insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Most Available</p>
                <p className="font-bold text-sm">{compareList.reduce((max, b) => b.available_copies > max.available_copies ? b : max).title}</p>
                <p className="text-xs text-green-700">{Math.max(...compareList.map(b => b.available_copies))} copies</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Unique Genres</p>
                <p className="text-2xl font-bold">{new Set(compareList.map(b => b.genre || 'General')).size}</p>
                <p className="text-xs">{[...new Set(compareList.map(b => b.genre || 'General'))].join(', ')}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Unique Authors</p>
                <p className="text-2xl font-bold">{new Set(compareList.map(b => b.author)).size}</p>
                <p className="text-xs">{[...new Set(compareList.map(b => b.author))].slice(0, 2).join(', ')}</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Comparing</p>
                <p className="text-2xl font-bold">{compareList.length}</p>
                <p className="text-xs">{compareList.reduce((sum, b) => sum + b.available_copies, 0)} total copies</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GENRE SECTIONS (horizontal scroll rows) ── */}
      {books.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No books found</p>
        </div>
      ) : (
        <div className="space-y-10">
          {genreSections.map(({ genre, books: genreBooks }) => (
            <GenreRow
              key={genre}
              genre={genre}
              books={genreBooks}
              isInCompare={isInCompare}
              toggleCompare={toggleCompare}
              openBookDetails={openBookDetails}
              handleOnlineIssue={handleOnlineIssue}
              openOfflineModal={openOfflineModal}
            />
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {showDetailsModal && selectedBook && (
        <BookDetails
          book={selectedBook}
          onClose={() => setShowDetailsModal(false)}
          onIssue={() => handleOnlineIssue(selectedBook.id)}
          isIssued={false}
        />
      )}

      {/* Offline Request Modal */}
      {showOfflineModal && selectedBook && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOfflineModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Request Physical Book</h3>
              <button
                onClick={() => setShowOfflineModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleOfflineRequest} className="p-4 space-y-4">
              <div>
                <p className="font-semibold">{selectedBook.title}</p>
                <p className="text-sm text-gray-600">{selectedBook.author}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Available: {selectedBook.available_copies} copies
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={offlineForm.purpose}
                  onChange={(e) => setOfflineForm({...offlineForm, purpose: e.target.value})}
                  placeholder="Why do you need this book?"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Pickup Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={offlineForm.requested_date}
                  onChange={(e) => setOfflineForm({...offlineForm, requested_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expected Return Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={offlineForm.requested_return_date}
                  onChange={(e) => setOfflineForm({...offlineForm, requested_return_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={offlineForm.requested_date || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfflineModal(false)}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Submit Request
                </button>
              </div>

              <p className="text-xs text-gray-500">
                * Your request will be reviewed by a librarian
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   GenreRow — one horizontal scrollable row per genre
──────────────────────────────────────────────────────────── */
function GenreRow({ genre, books, isInCompare, toggleCompare, openBookDetails, handleOnlineIssue, openOfflineModal }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
    <section>
      {/* Genre heading */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>{genreEmoji(genre)}</span>
          {genre}
          <span className="text-sm font-normal text-gray-400">({books.length})</span>
        </h2>

        {/* Scroll arrows — only shown when there are enough books */}
        {books.length > 3 && (
          <div className="flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {books.map(book => (
          <div
            key={book.id}
            className="card p-5 relative hover:shadow-lg transition-shadow flex-shrink-0 bg-white border border-gray-100 rounded-xl"
            style={{ width: '220px' }}
          >
            {/* Compare Checkbox */}
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => toggleCompare(book, e)}
                className={`w-7 h-7 rounded border-2 flex items-center justify-center text-xs ${
                  isInCompare(book.id)
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {isInCompare(book.id) && '✓'}
              </button>
            </div>

            {/* Stock Badge */}
            {book.is_available_offline && (
              <div className="absolute top-3 left-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  book.available_copies > 3
                    ? 'bg-green-100 text-green-700'
                    : book.available_copies > 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {book.available_copies} left
                </span>
              </div>
            )}

            {/* Book Icon */}
            <div className="mt-6 mb-3 text-center text-3xl">📖</div>

            {/* Book Info */}
            <h3 className="font-semibold text-sm mb-1 leading-tight line-clamp-2">{book.title}</h3>
            <p className="text-xs text-gray-500 mb-3 truncate">{book.author}</p>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleOnlineIssue(book.id)}
                className="w-full py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 text-xs transition-colors"
              >
                Issue Book
              </button>

              <div className="flex gap-1.5">
                <button
                  onClick={(e) => openBookDetails(book, e)}
                  className="flex-1 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-xs transition-colors"
                >
                  Details
                </button>
                <button
                  onClick={(e) => toggleCompare(book, e)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isInCompare(book.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ⚖️
                </button>
              </div>

              {book.is_available_offline && (
                <button
                  onClick={(e) => openOfflineModal(book, e)}
                  className="w-full py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs transition-colors"
                >
                  Physical Copy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Returns a relevant emoji for common genre names */
function genreEmoji(genre) {
  const g = genre.toLowerCase()
  if (g.includes('fiction') || g.includes('novel')) return '📖'
  if (g.includes('science') || g.includes('sci-fi')) return '🔬'
  if (g.includes('history')) return '🏛️'
  if (g.includes('math')) return '📐'
  if (g.includes('computer') || g.includes('programming') || g.includes('tech')) return '💻'
  if (g.includes('philosophy')) return '🤔'
  if (g.includes('psychology')) return '🧠'
  if (g.includes('art') || g.includes('design')) return '🎨'
  if (g.includes('business') || g.includes('economics')) return '💼'
  if (g.includes('biography')) return '👤'
  if (g.includes('mystery') || g.includes('thriller')) return '🔍'
  if (g.includes('romance')) return '💕'
  if (g.includes('poetry')) return '✍️'
  if (g.includes('children')) return '🧒'
  if (g.includes('self')) return '🌱'
  return '📚'
}