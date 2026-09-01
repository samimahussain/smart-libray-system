import { useEffect, useState } from "react"
import axios from "../../lib/axios"

export default function MyBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Token modal state
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [currentBookId, setCurrentBookId] = useState(null)
  const [accessToken, setAccessToken] = useState("")
  const [tokenError, setTokenError] = useState("")
  const [tokenSuccess, setTokenSuccess] = useState("")
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const res = await axios.get("/issues/my-books/")
        console.log("API Response:", res.data)
        setBooks(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error("Error:", err)
        if (err.response?.status === 401) {
          setError("Authentication required. Please log in.")
        } else {
          setError("Failed to load issued books")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchMyBooks()
  }, [])

  // Open token modal
  const openTokenModal = (bookId) => {
    setCurrentBookId(bookId)
    setShowTokenModal(true)
    setAccessToken("")
    setTokenError("")
    setTokenSuccess("")
  }

  // Close token modal
  const closeTokenModal = () => {
    setShowTokenModal(false)
    setCurrentBookId(null)
    setAccessToken("")
    setTokenError("")
    setTokenSuccess("")
  }

  // Verify token and open PDF
  const handleVerifyAndOpenPDF = async () => {
    if (!accessToken.trim()) {
      setTokenError("Please enter the access token.")
      return
    }

    setVerifying(true)
    setTokenError("")
    setTokenSuccess("")

    try {
      const verifyRes = await axios.post("/issues/verify-token/", {
        book_id: currentBookId,
        token: accessToken
      })

      if (verifyRes.status === 200) {
        setTokenSuccess("Access granted! Opening PDF...")
        
        setTimeout(async () => {
          try {
            const response = await axios.get(`/issues/read/${currentBookId}/`, {
              responseType: 'blob',
            })

            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            
            window.open(url, '_blank')
            
            setTimeout(() => window.URL.revokeObjectURL(url), 100)
            
            closeTokenModal()
          } catch (err) {
            console.error("Failed to open PDF:", err)
            setTokenError("Failed to open PDF. Please try again.")
          }
        }, 1000)
      }
    } catch (err) {
      console.error("Token verification failed:", err)
      if (err.response?.status === 403) {
        setTokenError(err.response?.data?.error || "Invalid or expired token.")
      } else if (err.response?.status === 401) {
        setTokenError("Authentication required. Please log in.")
      } else {
        setTokenError("Verification failed. Please check your token.")
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !verifying) {
      handleVerifyAndOpenPDF()
    }
  }

  /**
   * Returns an object with:
   *  - label: human-readable due date string
   *  - isOverdue: boolean — true if the book is past its due date
   */
  const getDueDateInfo = (dateString) => {
    if (!dateString) return { label: "No due date", isOverdue: false }
    const date = new Date(dateString)
    const today = new Date()
    // Zero out time portion for accurate day diff
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { label: "Due today", isOverdue: false }
    if (diffDays === 1) return { label: "Due in 1 day", isOverdue: false }
    if (diffDays > 1) return { label: `Due in ${diffDays} days`, isOverdue: false }
    if (diffDays === -1) return { label: "Overdue by 1 day", isOverdue: true }
    return { label: `Overdue by ${Math.abs(diffDays)} days`, isOverdue: true }
  }

  if (loading) return <p className="p-6">Loading your books…</p>
  if (error) return <p className="p-6 text-red-600">{error}</p>

  if (books.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📚 My Books</h1>
        <p className="text-gray-500">No issued books found</p>
      </div>
    )
  }

  const activeBooks = books.filter(b => b.is_active)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📚 My Books</h1>

      {/* CURRENTLY ISSUED BOOKS */}
      {activeBooks.length === 0 ? (
        <p className="text-gray-500">No active issued books</p>
      ) : (
        <div className="space-y-3">
          {activeBooks.map(issue => {
            const { label: dueDateLabel, isOverdue } = getDueDateInfo(issue.due_date)

            return (
              <div
                key={issue.id}
                className="bg-white border rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-900">
                    {issue.book_title || issue.title || "Unknown title"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {issue.book_author || issue.author || "Unknown author"}
                  </p>
                  <p className={`text-sm mt-1 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                    {dueDateLabel}
                  </p>
                </div>

                {/* Only show "Open PDF" if the book is NOT overdue */}
                {isOverdue ? (
                  <div className="text-right">
                    <span className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                      Access Revoked
                    </span>
                    <p className="text-xs text-red-400 mt-1">Return book to restore access</p>
                  </div>
                ) : (
                  <button
                    onClick={() => openTokenModal(issue.book_id || issue.book)}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Open PDF
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* TOKEN VALIDATION MODAL */}
      {showTokenModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeTokenModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                🔐 Enter Access Token
              </h3>
              <button
                onClick={closeTokenModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Please enter the access token sent to your email to access this book.
              </p>

              <div className="mb-4">
                <label 
                  htmlFor="accessToken" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Access Token:
                </label>
                <input
                  type="text"
                  id="accessToken"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 342fefaa-1fa8-478b-9b8d-af9410a85f21"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <small className="text-gray-500 text-xs mt-1 block">
                  Check your email for the access token
                </small>
              </div>

              {tokenError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{tokenError}</p>
                </div>
              )}

              {tokenSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{tokenSuccess}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeTokenModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAndOpenPDF}
                disabled={verifying}
                className={`px-4 py-2 rounded-md font-medium ${
                  verifying
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Open PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}