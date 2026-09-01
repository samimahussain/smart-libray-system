import { useState, useEffect } from "react"
import axios from "@/lib/axios"
import analyticsService from "@/services/analyticsService"

export default function CompareBooks() {
  const [selectedBooks, setSelectedBooks] = useState([])
  const [allBooks, setAllBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savedComparisons, setSavedComparisons] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    showOnlyDifferences: false,
    hiddenFields: []
  })

  useEffect(() => {
    analyticsService.trackPageView('Compare Books')
    loadBooks()
    loadSavedComparisons()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/books/')
      setAllBooks(response.data)
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedComparisons = () => {
    const saved = localStorage.getItem('savedComparisons')
    if (saved) {
      setSavedComparisons(JSON.parse(saved))
    }
  }

  const saveComparison = () => {
    if (selectedBooks.length < 2) {
      alert('Add at least 2 books to save a comparison')
      return
    }

    const comparison = {
      id: Date.now(),
      date: new Date().toISOString(),
      books: selectedBooks.map(b => ({ id: b.id, title: b.title, author: b.author }))
    }

    const updated = [...savedComparisons, comparison]
    setSavedComparisons(updated)
    localStorage.setItem('savedComparisons', JSON.stringify(updated))
    alert('Comparison saved!')
  }

  const loadSavedComparison = async (comparison) => {
    const bookIds = comparison.books.map(b => b.id)
    const books = allBooks.filter(b => bookIds.includes(b.id))
    setSelectedBooks(books)
  }

  const deleteSavedComparison = (id) => {
    const updated = savedComparisons.filter(c => c.id !== id)
    setSavedComparisons(updated)
    localStorage.setItem('savedComparisons', JSON.stringify(updated))
  }

  const addBookToCompare = (book) => {
    if (selectedBooks.length >= 4) {
      alert('You can only compare up to 4 books at a time')
      return
    }
    
    if (selectedBooks.find(b => b.id === book.id)) {
      alert('This book is already in the comparison')
      return
    }

    setSelectedBooks([...selectedBooks, book])
    setShowSearch(false)
    setSearchQuery("")
    
    analyticsService.track('book_compare_add', { 
      book_id: book.id, 
      book_title: book.title 
    })
  }

  const removeBook = (bookId) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== bookId))
  }

  const clearAll = () => {
    setSelectedBooks([])
  }

  const filteredBooks = allBooks.filter(book => 
    !selectedBooks.find(b => b.id === book.id) &&
    (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calculate reading times
  const calculateReadTime = (pages) => {
    if (!pages) return null
    return {
      fast: Math.ceil(pages / 60),
      average: Math.ceil(pages / 40),
      slow: Math.ceil(pages / 30)
    }
  }

  // Calculate recommendation score (0-100)
  const calculateRecommendationScore = (book) => {
    let score = 50 // Base score
    
    // Availability boost
    if (book.available_copies > 0) score += 20
    if (book.available_copies > 2) score += 10
    
    // Popularity boost (assuming borrow_count exists)
    if (book.borrow_count > 10) score += 10
    if (book.borrow_count > 50) score += 10
    
    return Math.min(100, score)
  }

  // Get the best book for each metric
  const getBestBook = (metric) => {
    if (selectedBooks.length === 0) return null
    
    switch(metric) {
      case 'availability':
        return selectedBooks.reduce((best, book) => 
          book.available_copies > best.available_copies ? book : best
        )
      case 'pages':
        return selectedBooks.reduce((best, book) => 
          (book.pages || 0) < (best.pages || Infinity) ? book : best
        )
      case 'recommendation':
        return selectedBooks.reduce((best, book) => 
          calculateRecommendationScore(book) > calculateRecommendationScore(best) ? book : best
        )
      default:
        return null
    }
  }

  // Check if field should be shown based on filters
  const shouldShowField = (fieldName, values) => {
    if (filters.hiddenFields.includes(fieldName)) return false
    if (filters.showOnlyDifferences) {
      const uniqueValues = [...new Set(values)]
      return uniqueValues.length > 1
    }
    return true
  }

  const toggleFilter = (fieldName) => {
    setFilters(prev => ({
      ...prev,
      hiddenFields: prev.hiddenFields.includes(fieldName)
        ? prev.hiddenFields.filter(f => f !== fieldName)
        : [...prev.hiddenFields, fieldName]
    }))
  }

  const allFieldNames = ['title', 'author', 'genre', 'isbn', 'publisher', 'year', 'pages', 'description', 'availability']

  // Calculate quick insights
  const mostAvailable = selectedBooks.length > 0 
    ? selectedBooks.reduce((prev, current) => 
        (prev.available_copies > current.available_copies) ? prev : current
      )
    : null

  const uniqueGenres = [...new Set(selectedBooks.map(b => b.genre).filter(Boolean))]
  const uniqueAuthors = [...new Set(selectedBooks.map(b => b.author).filter(Boolean))]
  const totalCopies = selectedBooks.reduce((sum, book) => sum + (book.available_copies || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📚 Compare Books</h1>
            <p className="text-gray-600 mt-1">
              Compare up to 4 books side by side with smart insights
            </p>
          </div>
          
          <div className="flex gap-2">
            {selectedBooks.length >= 2 && (
              <>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                >
                  🔍 Filters
                </button>
                <button
                  onClick={saveComparison}
                  className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                >
                  💾 Save
                </button>
              </>
            )}
            {selectedBooks.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && selectedBooks.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Filter Options</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showOnlyDifferences}
                  onChange={(e) => setFilters(prev => ({ ...prev, showOnlyDifferences: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Show only differences</span>
              </label>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Hide fields:</p>
                <div className="flex flex-wrap gap-2">
                  {allFieldNames.map(field => (
                    <button
                      key={field}
                      onClick={() => toggleFilter(field)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        filters.hiddenFields.includes(field)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filters.hiddenFields.includes(field) ? '✕ ' : ''}{field}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Comparisons */}
        {savedComparisons.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">💾 Saved Comparisons</h3>
            <div className="space-y-2">
              {savedComparisons.map(comp => (
                <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {comp.books.map(b => b.title).join(' vs ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comp.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSavedComparison(comp)}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedComparison(comp.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compare Books Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📊</span>
              Compare Books
            </h2>
            
            {selectedBooks.length > 0 && (
              <button
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearch && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              
              <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredBooks.slice(0, 10).map(book => (
                  <button
                    key={book.id}
                    onClick={() => addBookToCompare(book)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <p className="font-semibold text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author}</p>
                  </button>
                ))}
                
                {filteredBooks.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No books found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Book Cards - Show when < 2 books */}
          {selectedBooks.length < 2 && (
            <>
              {selectedBooks.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📖</div>
                  <p className="text-lg font-medium">No books selected</p>
                  <p className="text-sm mt-2">Click "Add Book" to start comparing</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedBooks.map(book => (
                  <div
                    key={book.id}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      onClick={() => removeBook(book.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                    <h3 className="font-bold text-gray-900 mb-2 pr-6">{book.title}</h3>
                    <p className="text-sm text-gray-600">✍️ Author: {book.author}</p>
                    <p className="text-sm text-gray-600">📚 Genre: {book.genre || 'N/A'}</p>
                    <p className="text-sm text-gray-600">📦 Stock: {book.available_copies} copies</p>
                  </div>
                ))}
                
                {selectedBooks.length < 4 && (
                  <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-4xl">➕</span>
                    <span className="text-sm font-medium text-gray-700">Add Book</span>
                  </button>
                )}
              </div>

              {selectedBooks.length === 1 && (
                <div className="mt-6 text-center py-8 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 font-medium">Add at least one more book to see the comparison table</p>
                </div>
              )}
            </>
          )}

          {/* Table View - Show when >= 2 books */}
          {selectedBooks.length >= 2 && (
            <>
              {/* Add Book Button */}
              {selectedBooks.length < 4 && (
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full mb-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                >
                  ➕ Add Another Book
                </button>
              )}

              {/* Comparison Table */}
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 sticky left-0 bg-gray-50 z-10">
                        Attribute
                      </th>
                      {selectedBooks.map(book => {
                        const bestReco = getBestBook('recommendation')
                        return (
                          <th
                            key={book.id}
                            className={`px-6 py-4 text-left text-sm font-bold min-w-[250px] ${
                              book.id === bestReco?.id 
                                ? 'bg-green-50 text-green-900'
                                : 'text-gray-900'
                            }`}
                          >
                            {book.id === bestReco?.id && <span className="mr-1">⭐</span>}
                            {book.title}
                            <button
                              onClick={() => removeBook(book.id)}
                              className="ml-2 text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {/* Recommendation Score Row */}
                    <tr className="bg-amber-50">
                      <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-amber-50">
                        ⭐ Recommendation
                      </td>
                      {selectedBooks.map(book => {
                        const score = calculateRecommendationScore(book)
                        const bestReco = getBestBook('recommendation')
                        return (
                          <td key={book.id} className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${
                                  book.id === bestReco?.id ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {score}%
                                </span>
                                {book.id === bestReco?.id && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                    Best Match
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    score >= 80 ? 'bg-green-500' :
                                    score >= 60 ? 'bg-blue-500' :
                                    score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Author Row */}
                    {shouldShowField('author', selectedBooks.map(b => b.author)) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          ✍️ Author
                        </td>
                        {selectedBooks.map(book => (
                          <td key={book.id} className="px-6 py-4 text-gray-900">
                            {book.author}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Genre Row */}
                    {shouldShowField('genre', selectedBooks.map(b => b.genre)) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          🎭 Genre
                        </td>
                        {selectedBooks.map(book => (
                          <td key={book.id} className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                              {book.genre || 'N/A'}
                            </span>
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Description Row */}
                    {shouldShowField('description', selectedBooks.map(b => b.description)) && selectedBooks.some(b => b.description) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          📝 Description
                        </td>
                        {selectedBooks.map(book => (
                          <td key={book.id} className="px-6 py-4 text-gray-600 text-sm">
                            {book.description ? (
                              <p className="line-clamp-3">{book.description}</p>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Pages & Read Time Row */}
                    {shouldShowField('pages', selectedBooks.map(b => b.pages)) && selectedBooks.some(b => b.pages) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          📄 Pages & Read Time
                        </td>
                        {selectedBooks.map(book => {
                          const readTime = calculateReadTime(book.pages)
                          const maxPages = Math.max(...selectedBooks.map(b => b.pages || 0))
                          const pagePercent = book.pages ? (book.pages / maxPages) * 100 : 0
                          
                          return (
                            <td key={book.id} className="px-6 py-4">
                              {book.pages ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{book.pages} pages</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${pagePercent}%` }}
                                    />
                                  </div>
                                  {readTime && (
                                    <div className="text-xs text-gray-600 space-y-0.5">
                                      <div>⚡ Fast: {readTime.fast}h</div>
                                      <div>📖 Avg: {readTime.average}h</div>
                                      <div>🐌 Slow: {readTime.slow}h</div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )}

                    {/* Availability Row */}
                    {shouldShowField('availability', selectedBooks.map(b => b.available_copies)) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          📦 Availability
                        </td>
                        {selectedBooks.map(book => {
                          const bestAvail = getBestBook('availability')
                          const maxCopies = Math.max(...selectedBooks.map(b => b.available_copies || 0))
                          const availPercent = book.available_copies ? (book.available_copies / maxCopies) * 100 : 0
                          
                          return (
                            <td key={book.id} className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    book.available_copies > 0
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {book.available_copies > 0
                                      ? `${book.available_copies} available`
                                      : 'Out of stock'}
                                  </span>
                                  {book.id === bestAvail?.id && book.available_copies > 0 && (
                                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                                      Most
                                    </span>
                                  )}
                                </div>
                                {book.available_copies > 0 && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full"
                                      style={{ width: `${availPercent}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )}

                    {/* Popularity Row */}
                    {selectedBooks.some(b => b.borrow_count) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          📈 Popularity
                        </td>
                        {selectedBooks.map(book => {
                          const maxBorrows = Math.max(...selectedBooks.map(b => b.borrow_count || 0))
                          const popularityPercent = book.borrow_count ? (book.borrow_count / maxBorrows) * 100 : 0
                          
                          return (
                            <td key={book.id} className="px-6 py-4">
                              {book.borrow_count ? (
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {book.borrow_count} borrows
                                  </span>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full"
                                      style={{ width: `${popularityPercent}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No data</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )}

                    {/* ISBN Row */}
                    {shouldShowField('isbn', selectedBooks.map(b => b.isbn)) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          🔢 ISBN
                        </td>
                        {selectedBooks.map(book => (
                          <td key={book.id} className="px-6 py-4 text-gray-600 font-mono text-sm">
                            {book.isbn || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Publisher Row */}
                    {shouldShowField('publisher', selectedBooks.map(b => b.publisher)) && selectedBooks.some(b => b.publisher) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          🏢 Publisher
                        </td>
                        {selectedBooks.map(book => (
                          <td key={book.id} className="px-6 py-4 text-gray-900">
                            {book.publisher || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Publication Year Row */}
                    {shouldShowField('year', selectedBooks.map(b => b.publication_year)) && selectedBooks.some(b => b.publication_year) && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-white">
                          📅 Year
                        </td>
                        {selectedBooks.map(book => (
                          <td key={book.id} className="px-6 py-4 text-gray-900">
                            {book.publication_year || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    )}

                    {/* Actions Row */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-700 sticky left-0 bg-gray-50">
                        ⚡ Actions
                      </td>
                      {selectedBooks.map(book => (
                        <td key={book.id} className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                analyticsService.trackBookView(book.id, book.title)
                                window.location.href = `/book/${book.id}`
                              }}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Quick Insights - Show when >= 2 books */}
        {selectedBooks.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              Quick Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Most Available */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Most Available</p>
                <p className="font-bold text-green-800 truncate">{mostAvailable?.title || 'N/A'}</p>
                <p className="text-sm text-green-700">{mostAvailable?.available_copies || 0} copies</p>
              </div>

              {/* Unique Genres */}
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Unique Genres</p>
                <p className="font-bold text-purple-800 text-2xl">{uniqueGenres.length}</p>
                <p className="text-sm text-purple-700 truncate">{uniqueGenres.join(', ') || 'N/A'}</p>
              </div>

              {/* Unique Authors */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Unique Authors</p>
                <p className="font-bold text-blue-800 text-2xl">{uniqueAuthors.length}</p>
                <p className="text-sm text-blue-700 truncate">{uniqueAuthors.join(', ')}</p>
              </div>

              {/* Total Comparing */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Comparing</p>
                <p className="font-bold text-indigo-800 text-2xl">{selectedBooks.length}</p>
                <p className="text-sm text-indigo-700">{totalCopies} total copies</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
