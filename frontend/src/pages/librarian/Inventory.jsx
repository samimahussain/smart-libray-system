import { useEffect, useState } from 'react'
import axios from '../../lib/axios'

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('books') // 'books' or 'detailed'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch both books list and detailed inventory
      const [booksRes, inventoryRes] = await Promise.all([
        axios.get('/books/'),
        axios.get('/librarian/inventory/')
      ])

      const booksData = Array.isArray(booksRes.data) 
        ? booksRes.data 
        : booksRes.data.results || []
      
      setBooks(booksData)
      setInventory(inventoryRes.data)
      setError('')
    } catch (err) {
      console.error('Failed to load inventory:', err)
      setError('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading inventory...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Physical Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('books')}
            className={`px-4 py-2 rounded ${
              viewMode === 'books' ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            By Books
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded ${
              viewMode === 'detailed' ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            Detailed View
          </button>
        </div>
      </div>

      {viewMode === 'books' ? (
        // Books Overview
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books
            .filter(book => book.book_type === 'offline' || book.book_type === 'both')
            .map(book => (
              <div key={book.id} className="card p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                  {book.available_copies <= 2 && (
                    <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                      Low Stock
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shelf Location:</span>
                    <span className="font-medium">{book.shelf_location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Copies:</span>
                    <span className="font-medium">{book.total_copies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className={`font-medium ${
                      book.available_copies === 0 ? 'text-red-600' :
                      book.available_copies <= 2 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {book.available_copies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currently Issued:</span>
                    <span className="font-medium">
                      {book.total_copies - book.available_copies}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        book.available_copies / book.total_copies < 0.3
                          ? 'bg-red-500'
                          : book.available_copies / book.total_copies < 0.6
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${(book.available_copies / book.total_copies) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round((book.available_copies / book.total_copies) * 100)}% available
                  </p>
                </div>
              </div>
            ))}
        </div>
      ) : (
        // Detailed Inventory View
        <div className="space-y-4">
          {inventory.length === 0 ? (
            <p className="text-gray-500">No detailed inventory records found</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {inventory.map(item => (
                <div key={item.id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.book_title}</h4>
                      <p className="text-xs text-gray-500">Copy #{item.copy_number}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.condition === 'new' ? 'bg-green-100 text-green-700' :
                      item.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                      item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                      item.condition === 'poor' ? 'bg-orange-100 text-orange-700' :
                      item.condition === 'damaged' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.condition}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <p><strong>Shelf:</strong> {item.shelf_location}</p>
                    <p><strong>Last Checked:</strong> {new Date(item.last_checked).toLocaleDateString()}</p>
                    {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">
            {books.filter(b => b.book_type === 'offline' || b.book_type === 'both').length}
          </p>
          <p className="text-sm text-gray-600">Physical Books</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">
            {books.reduce((sum, b) => sum + (b.total_copies || 0), 0)}
          </p>
          <p className="text-sm text-gray-600">Total Copies</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {books.reduce((sum, b) => sum + (b.available_copies || 0), 0)}
          </p>
          <p className="text-sm text-gray-600">Available</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {books.filter(b => b.available_copies <= 2).length}
          </p>
          <p className="text-sm text-gray-600">Low Stock</p>
        </div>
      </div>
    </div>
  )
}
