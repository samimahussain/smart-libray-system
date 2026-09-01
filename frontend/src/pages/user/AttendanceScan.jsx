import { useState, useEffect } from "react"
import axios from "@/lib/axios"

// Reads ?action=entry or ?action=exit from the QR code URL
function getActionFromURL() {
  const params = new URLSearchParams(window.location.search)
  const action = params.get("action")
  return action === "exit" ? "exit" : "entry"
}

export default function AttendanceScan() {
  const [action, setAction] = useState(getActionFromURL)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle | loading | success | error
  const [message, setMessage] = useState("")
  const [detail, setDetail] = useState(null)

  // Sync tab selection to URL so back-button works
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("action", action)
    window.history.replaceState(null, "", url.toString())
    setStatus("idle")
    setMessage("")
    setDetail(null)
  }, [action])

  const handleSubmit = async () => {
    if (!email.trim()) {
      setStatus("error")
      setMessage("Please enter your email address.")
      return
    }

    setStatus("loading")
    setMessage("")
    setDetail(null)

    try {
      const endpoint =
        action === "entry"
          ? "/attendance/scan/entry/"
          : "/attendance/scan/exit/"

      const res = await axios.post(endpoint, { email: email.trim().toLowerCase() })
      setStatus("success")
      setMessage(res.data.message)
      setDetail(res.data)
      setEmail("")
    } catch (err) {
      setStatus("error")
      setMessage(
        err.response?.data?.error || "Something went wrong. Please try again."
      )
    }
  }

  const isEntry = action === "entry"

  return (
    <div className="scan-root">
      {/* ── Ambient background ── */}
      <div className="ambient" aria-hidden="true">
        <div className={`orb orb-1 ${isEntry ? "orb-green" : "orb-amber"}`} />
        <div className={`orb orb-2 ${isEntry ? "orb-teal" : "orb-orange"}`} />
        <div className="grid-lines" />
      </div>

      <div className="card-wrap">
        <div className="logo-mark">
          <span className="logo-icon">{isEntry ? "🏛️" : "📚"}</span>
          <span className="logo-text">EduVault</span>
        </div>

        {/* ── Action toggle ── */}
        <div className="toggle-row" role="tablist">
          <button
            role="tab"
            aria-selected={isEntry}
            className={`toggle-btn ${isEntry ? "active entry" : ""}`}
            onClick={() => setAction("entry")}
          >
            <span className="toggle-icon">🚪</span>
            Entry
          </button>
          <button
            role="tab"
            aria-selected={!isEntry}
            className={`toggle-btn ${!isEntry ? "active exit" : ""}`}
            onClick={() => setAction("exit")}
          >
            <span className="toggle-icon">👋</span>
            Exit
          </button>
        </div>

        {/* ── Heading ── */}
        <div className="heading-block">
          <h1 className={`heading ${isEntry ? "heading-entry" : "heading-exit"}`}>
            {isEntry ? "Mark Your Entry" : "Mark Your Exit"}
          </h1>
          <p className="sub">
            {isEntry
              ? "Welcome! Enter your email to check in to the library."
              : "Heading out? Log your exit to record study time."}
          </p>
        </div>

        {/* ── Form ── */}
        {status !== "success" && (
          <div className="form-block">
            <div className="input-wrap">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                className="email-input"
                placeholder="your.email@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
                autoComplete="email"
              />
            </div>

            <button
              className={`submit-btn ${isEntry ? "btn-entry" : "btn-exit"} ${
                status === "loading" ? "loading" : ""
              }`}
              onClick={handleSubmit}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <span className="spinner" />
              ) : isEntry ? (
                "✅ Mark Entry"
              ) : (
                "🏁 Mark Exit"
              )}
            </button>

            {status === "error" && (
              <div className="feedback error-box">
                <span>⚠️</span>
                <p>{message}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Success state ── */}
        {status === "success" && (
          <div className={`success-block ${isEntry ? "success-entry" : "success-exit"}`}>
            <div className="success-icon">{isEntry ? "🎉" : "⭐"}</div>
            <p className="success-msg">{message}</p>
            {detail && isEntry && (
              <p className="success-meta">
                Checked in at{" "}
                <strong>
                  {new Date(detail.check_in).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </p>
            )}
            {detail && !isEntry && detail.duration_minutes !== undefined && (
              <p className="success-meta">
                Study session:{" "}
                <strong>
                  {Math.floor(detail.duration_minutes / 60)}h{" "}
                  {detail.duration_minutes % 60}m
                </strong>
              </p>
            )}
            <button
              className="reset-btn"
              onClick={() => {
                setStatus("idle")
                setMessage("")
                setDetail(null)
              }}
            >
              Mark another →
            </button>
          </div>
        )}

        <p className="help-text">
          Having trouble?{" "}
          <span className="help-link">Ask the librarian for help.</span>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lato:wght@300;400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .scan-root {
          font-family: 'Lato', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0f1a;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* ── Ambient ── */
        .ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.18;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 { width: 500px; height: 500px; top: -100px; left: -100px; }
        .orb-2 { width: 400px; height: 400px; bottom: -80px; right: -80px; animation-delay: -6s; }
        .orb-green  { background: #00e5a0; }
        .orb-teal   { background: #00b4d8; }
        .orb-amber  { background: #f59e0b; }
        .orb-orange { background: #ef4444; }
        @keyframes drift { from { transform: scale(1) translateY(0); } to { transform: scale(1.15) translateY(30px); } }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ── Card ── */
        .card-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        /* ── Logo ── */
        .logo-mark {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .logo-icon { font-size: 22px; }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #e2e8f0;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Toggle ── */
        .toggle-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 6px;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 0;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: rgba(255,255,255,0.45);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .toggle-btn.active.entry {
          background: linear-gradient(135deg, #00e5a0, #00b4d8);
          color: #0a0f1a;
          box-shadow: 0 4px 16px rgba(0,229,160,0.3);
        }
        .toggle-btn.active.exit {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: #fff;
          box-shadow: 0 4px 16px rgba(245,158,11,0.3);
        }
        .toggle-icon { font-size: 16px; }

        /* ── Heading ── */
        .heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 28px;
          line-height: 1.15;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .heading-entry { background-image: linear-gradient(135deg, #00e5a0, #00b4d8); }
        .heading-exit  { background-image: linear-gradient(135deg, #f59e0b, #ef4444); }
        .sub {
          margin-top: 8px;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }

        /* ── Form ── */
        .form-block { display: flex; flex-direction: column; gap: 14px; }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          font-size: 16px;
          pointer-events: none;
        }
        .email-input {
          width: 100%;
          padding: 14px 14px 14px 44px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-family: 'Lato', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .email-input::placeholder { color: rgba(255,255,255,0.25); }
        .email-input:focus {
          border-color: rgba(255,255,255,0.25);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
        }

        .submit-btn {
          padding: 15px;
          border: none;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-entry {
          background: linear-gradient(135deg, #00e5a0, #00b4d8);
          color: #0a0f1a;
          box-shadow: 0 6px 24px rgba(0,229,160,0.25);
        }
        .btn-entry:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,229,160,0.35); }
        .btn-exit {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          color: #fff;
          box-shadow: 0 6px 24px rgba(245,158,11,0.25);
        }
        .btn-exit:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(245,158,11,0.35); }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn.loading { opacity: 0.7; cursor: not-allowed; }
        .submit-btn:disabled { transform: none !important; }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0a0f1a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .feedback {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }
        .error-box {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }

        /* ── Success ── */
        .success-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          padding: 20px;
          border-radius: 16px;
        }
        .success-entry { background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2); }
        .success-exit  { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); }
        .success-icon { font-size: 48px; animation: pop 0.4s cubic-bezier(.36,.07,.19,.97); }
        @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .success-msg {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #e2e8f0;
          line-height: 1.5;
        }
        .success-meta {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }
        .reset-btn {
          margin-top: 8px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reset-btn:hover { background: rgba(255,255,255,0.13); color: #fff; }

        /* ── Help ── */
        .help-text {
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }
        .help-link { color: rgba(255,255,255,0.5); text-decoration: underline; cursor: pointer; }

        @media (max-width: 480px) {
          .card-wrap { padding: 28px 20px; }
          .heading { font-size: 22px; }
        }
      `}</style>
    </div>
  )
}
