import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Typing indicator dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-blue-400"
          style={{
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// Markdown component styles
const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-gray-100 text-blue-700 rounded px-1 py-0.5 text-sm font-mono">{children}</code>
    ) : (
      <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto mb-2">
        <code className="text-sm font-mono text-gray-800">{children}</code>
      </pre>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-300 pl-3 italic text-gray-600 mb-2">{children}</blockquote>
  ),
  h1: ({ children }) => <h1 className="text-lg font-bold mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
  hr: () => <hr className="border-gray-200 my-2" />,
}

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setMessages(prev => [...prev, { role: "user", content: trimmed }])
    setInput("")
    setLoading(true)

    const auth = JSON.parse(localStorage.getItem("auth"))
    const token = auth?.state?.accessToken

    try {
      const res = await fetch("/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">EduVault AI Assistant</h2>
            <p className="text-xs text-gray-400">Ask me anything about your studies</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">How can I help you today?</p>
              <p className="text-sm text-gray-400">Ask about books, study plans, concepts, or anything academic.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["Suggest a book", "Create a study plan", "Explain recursion"].map(hint => (
                <button
                  key={hint}
                  onClick={() => { setInput(hint); textareaRef.current?.focus() }}
                  className="text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7H3a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3 22v-1a5 5 0 015-5h8a5 5 0 015 5v1H3z"/>
                </svg>
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
              {msg.role === "user" ? (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7H3a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM3 22v-1a5 5 0 015-5h8a5 5 0 015 5v1H3z"/>
              </svg>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 py-1.5 max-h-32"
            placeholder="Ask something... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = e.target.scrollHeight + "px"
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-1.5 text-center">EduVault AI · Powered by Claude</p>
      </div>
    </div>
  )
}