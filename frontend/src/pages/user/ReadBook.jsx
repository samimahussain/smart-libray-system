import { useParams } from "react-router-dom"
import { useState } from "react"
import { API_BASE_URL } from "../../api"

export default function ReadBook() {
  const { bookId } = useParams()
  const [token, setToken] = useState("")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")

  const verifyToken = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/issues/verify-token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId, token }),
      })

      if (!res.ok) {
        setError("Invalid or expired token")
        return
      }

      setVerified(true)
    } catch {
      setError("Verification failed")
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      {!verified ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Enter Access Token</h2>

          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter token from email"
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <button
            onClick={verifyToken}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Verify Token
          </button>

          {error && <p className="text-red-600 mt-3">{error}</p>}
        </div>
      ) : (
        <iframe
          src={`${API_BASE_URL}/api/issues/read/${bookId}/`}
          className="w-full h-[90vh] border"
          title="Book Reader"
        />
      )}
    </div>
  )
}
