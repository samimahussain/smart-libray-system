import { useState, useEffect } from "react"
import axios from "@/lib/axios"

export default function LibrarianAttendance() {
  const [tab, setTab] = useState("manual") // manual | logs | qr
  const [action, setAction] = useState("entry")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")
  const [msgType, setMsgType] = useState("success") // success | error
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [qrCodes, setQrCodes] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    if (tab === "logs") fetchLogs()
    if (tab === "qr") fetchQR()
  }, [tab])

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await axios.get("/attendance/")
      setLogs(res.data)
    } catch {
      setLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  const fetchQR = async () => {
    if (qrCodes) return // cached
    setQrLoading(true)
    try {
      const res = await axios.get("/attendance/qr-codes/")
      setQrCodes(res.data)
    } catch {
      setQrCodes(null)
    } finally {
      setQrLoading(false)
    }
  }

  const handleManual = async () => {
    if (!email.trim()) {
      setMsgType("error")
      setMessage("Please enter the student's email.")
      setStatus("done")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const endpoint =
        action === "entry"
          ? "/attendance/librarian/entry/"
          : "/attendance/librarian/exit/"

      const res = await axios.post(endpoint, { email: email.trim().toLowerCase() })
      setMsgType("success")
      setMessage(res.data.message)
      setEmail("")
    } catch (err) {
      setMsgType("error")
      setMessage(err.response?.data?.error || "Something went wrong.")
    } finally {
      setStatus("done")
    }
  }

  const formatDuration = (mins) => {
    if (!mins) return "—"
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const formatTime = (dt) => {
    if (!dt) return "—"
    return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dt) => {
    if (!dt) return "—"
    return new Date(dt).toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="lib-root">
      {/* ── Sidebar/Header ── */}
      <div className="lib-header">
        <div className="lib-title">
          <span className="lib-title-icon">📋</span>
          <div>
            <h1>Attendance Monitor</h1>
            <p>QR tracking &amp; manual overrides</p>
          </div>
        </div>

        <div className="tab-row">
          {[
            { id: "manual", label: "Manual Entry", icon: "✏️" },
            { id: "logs",   label: "View Logs",    icon: "📊" },
            { id: "qr",     label: "QR Codes",     icon: "⬛" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "tab-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────── Manual Tab ────────────── */}
      {tab === "manual" && (
        <div className="panel">
          <div className="panel-info">
            <span className="panel-info-icon">ℹ️</span>
            <p>
              Use this form when a student is unable to scan the QR code themselves.
              Select the appropriate action, enter their email, and confirm.
            </p>
          </div>

          {/* Action toggle */}
          <div className="action-toggle">
            <button
              className={`action-btn ${action === "entry" ? "action-active-entry" : ""}`}
              onClick={() => { setAction("entry"); setStatus("idle"); setMessage("") }}
            >
              🚪 Mark Entry
            </button>
            <button
              className={`action-btn ${action === "exit" ? "action-active-exit" : ""}`}
              onClick={() => { setAction("exit"); setStatus("idle"); setMessage("") }}
            >
              👋 Mark Exit
            </button>
          </div>

          {/* Email input */}
          <div className="field-row">
            <label className="field-label">Student Email</label>
            <div className="field-wrap">
              <input
                type="email"
                className="field-input"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManual()}
                autoFocus
              />
              <button
                className={`field-btn ${action === "entry" ? "fbtn-entry" : "fbtn-exit"}`}
                onClick={handleManual}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className="mini-spinner" />
                ) : action === "entry" ? (
                  "✅ Confirm Entry"
                ) : (
                  "🏁 Confirm Exit"
                )}
              </button>
            </div>
          </div>

          {/* Feedback */}
          {status === "done" && message && (
            <div className={`feedback-bar ${msgType === "success" ? "fb-success" : "fb-error"}`}>
              <span>{msgType === "success" ? "✅" : "⚠️"}</span>
              <p>{message}</p>
            </div>
          )}

          {/* Quick guide */}
          <div className="guide-card">
            <h3>How to use</h3>
            <ol>
              <li>Student approaches the desk and gives their email address.</li>
              <li>Select <strong>Entry</strong> if they are arriving, <strong>Exit</strong> if they are leaving.</li>
              <li>Type their email and click confirm. The record is saved instantly.</li>
              <li>The student can verify their attendance in their own dashboard.</li>
            </ol>
          </div>
        </div>
      )}

      {/* ────────────── Logs Tab ────────────── */}
      {tab === "logs" && (
        <div className="panel">
          <div className="logs-header-row">
            <h2>Today's Attendance Logs</h2>
            <button className="refresh-btn" onClick={fetchLogs}>↻ Refresh</button>
          </div>

          {logsLoading ? (
            <div className="loading-row">
              <div className="loader" />
              <span>Fetching records…</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No attendance records yet.</p>
            </div>
          ) : (
            <div className="logs-table-wrap">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className="student-name">{log.user_name || `User #${log.user}`}</span>
                      </td>
                      <td className="td-meta">{formatDate(log.check_in)}</td>
                      <td className="td-time">{formatTime(log.check_in)}</td>
                      <td className="td-time">{formatTime(log.check_out)}</td>
                      <td className="td-dur">{formatDuration(log.duration_minutes)}</td>
                      <td>
                        {log.check_out ? (
                          <span className="badge badge-done">Completed</span>
                        ) : (
                          <span className="badge badge-open">In Library</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ────────────── QR Tab ────────────── */}
      {tab === "qr" && (
        <div className="panel">
          <div className="panel-info">
            <span className="panel-info-icon">📌</span>
            <p>
              Print these QR codes and place them at the library entrance.
              The <strong>Entry QR</strong> goes by the door as students arrive;
              the <strong>Exit QR</strong> goes near the exit. Students simply
              open their camera, scan, and enter their email.
            </p>
          </div>

          {qrLoading ? (
            <div className="loading-row">
              <div className="loader" />
              <span>Generating QR codes…</span>
            </div>
          ) : !qrCodes ? (
            <div className="empty-state">
              <span className="empty-icon">⚠️</span>
              <p>Failed to load QR codes. Check your connection.</p>
              <button className="refresh-btn" onClick={() => { setQrCodes(null); fetchQR() }}>
                Try again
              </button>
            </div>
          ) : (
            <div className="qr-grid">
              {/* Entry QR */}
              <div className="qr-card qr-entry">
                <div className="qr-label-row">
                  <span className="qr-dot qr-dot-green" />
                  <h3>Entry QR Code</h3>
                </div>
                <p className="qr-sub">Place at the library entrance</p>
                <div className="qr-img-wrap">
                  <img
                    src={`data:image/png;base64,${qrCodes.entry}`}
                    alt="Entry QR Code"
                    className="qr-img"
                  />
                </div>
                <a
                  href={`data:image/png;base64,${qrCodes.entry}`}
                  download="library-entry-qr.png"
                  className="qr-download qr-dl-entry"
                >
                  ⬇ Download Entry QR
                </a>
              </div>

              {/* Exit QR */}
              <div className="qr-card qr-exit">
                <div className="qr-label-row">
                  <span className="qr-dot qr-dot-amber" />
                  <h3>Exit QR Code</h3>
                </div>
                <p className="qr-sub">Place near the exit / checkout desk</p>
                <div className="qr-img-wrap">
                  <img
                    src={`data:image/png;base64,${qrCodes.exit}`}
                    alt="Exit QR Code"
                    className="qr-img"
                  />
                </div>
                <a
                  href={`data:image/png;base64,${qrCodes.exit}`}
                  download="library-exit-qr.png"
                  className="qr-download qr-dl-exit"
                >
                  ⬇ Download Exit QR
                </a>
              </div>
            </div>
          )}

          <div className="guide-card">
            <h3>QR Flow Summary</h3>
            <ol>
              <li>Student arrives → scans the <strong>Entry QR</strong> with their phone camera.</li>
              <li>The camera opens the EduVault attendance page automatically.</li>
              <li>Student types their email and taps <em>Mark Entry</em>.</li>
              <li>On leaving → scans the <strong>Exit QR</strong> → same process.</li>
              <li>Duration is computed automatically and visible on both sides.</li>
            </ol>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lato:wght@300;400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .lib-root {
          font-family: 'Lato', sans-serif;
          min-height: 100vh;
          background: #f5f7fa;
          color: #1a2035;
        }

        /* ── Header ── */
        .lib-header {
          background: #fff;
          border-bottom: 1px solid #e5e9f0;
          padding: 28px 32px 0;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .lib-title {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .lib-title-icon { font-size: 28px; }
        .lib-title h1 {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #1a2035;
        }
        .lib-title p { font-size: 13px; color: #6b7898; margin-top: 2px; }

        .tab-row {
          display: flex;
          gap: 4px;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border: none;
          background: transparent;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #8892a4;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.15s;
          border-radius: 4px 4px 0 0;
        }
        .tab-btn:hover { color: #3b4fd8; background: #f0f3ff; }
        .tab-active { color: #3b4fd8 !important; border-bottom-color: #3b4fd8 !important; }

        /* ── Panel ── */
        .panel {
          max-width: 900px;
          margin: 32px auto;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .panel-info {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          background: #eef1ff;
          border: 1px solid #c7d0f8;
          border-radius: 12px;
          font-size: 14px;
          color: #3b4a6b;
          line-height: 1.6;
        }
        .panel-info-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

        /* ── Manual form ── */
        .action-toggle {
          display: flex;
          gap: 10px;
        }
        .action-btn {
          flex: 1;
          padding: 14px;
          border: 2px solid #e5e9f0;
          background: #fff;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #6b7898;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover { border-color: #c0c8f0; }
        .action-active-entry {
          border-color: #22c55e !important;
          background: #f0fdf4 !important;
          color: #166534 !important;
          box-shadow: 0 0 0 4px rgba(34,197,94,0.1);
        }
        .action-active-exit {
          border-color: #f59e0b !important;
          background: #fffbeb !important;
          color: #92400e !important;
          box-shadow: 0 0 0 4px rgba(245,158,11,0.1);
        }

        .field-row { display: flex; flex-direction: column; gap: 8px; }
        .field-label {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #4a5568;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .field-wrap { display: flex; gap: 10px; }
        .field-input {
          flex: 1;
          padding: 13px 16px;
          border: 1.5px solid #e5e9f0;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'Lato', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          color: #1a2035;
          background: #fff;
        }
        .field-input:focus { border-color: #3b4fd8; box-shadow: 0 0 0 3px rgba(59,79,216,0.08); }
        .field-btn {
          padding: 13px 22px;
          border: none;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .fbtn-entry {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          box-shadow: 0 4px 16px rgba(34,197,94,0.25);
        }
        .fbtn-entry:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.35); }
        .fbtn-exit {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          box-shadow: 0 4px 16px rgba(245,158,11,0.25);
        }
        .fbtn-exit:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.35); }

        .feedback-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.5;
        }
        .fb-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .fb-error   { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

        .guide-card {
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 14px;
          padding: 22px 24px;
        }
        .guide-card h3 {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7898;
          margin-bottom: 14px;
        }
        .guide-card ol {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          color: #4a5568;
          line-height: 1.6;
        }

        /* ── Logs ── */
        .logs-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logs-header-row h2 {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #1a2035;
        }
        .refresh-btn {
          padding: 8px 16px;
          background: #fff;
          border: 1.5px solid #e5e9f0;
          border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #3b4fd8;
          cursor: pointer;
          transition: all 0.15s;
        }
        .refresh-btn:hover { background: #eef1ff; border-color: #c7d0f8; }

        .loading-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 32px;
          justify-content: center;
          color: #6b7898;
          font-size: 14px;
        }
        .loader {
          width: 20px; height: 20px;
          border: 2px solid #e5e9f0;
          border-top-color: #3b4fd8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 48px;
          color: #6b7898;
        }
        .empty-icon { font-size: 40px; }
        .empty-state p { font-size: 15px; }

        .logs-table-wrap {
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 14px;
          overflow: hidden;
          overflow-x: auto;
        }
        .logs-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .logs-table th {
          padding: 12px 16px;
          text-align: left;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #8892a4;
          background: #f9fafb;
          border-bottom: 1px solid #e5e9f0;
        }
        .logs-table td {
          padding: 13px 16px;
          border-bottom: 1px solid #f1f4f8;
          color: #2d3748;
        }
        .logs-table tr:last-child td { border-bottom: none; }
        .logs-table tr:hover td { background: #fafbff; }
        .student-name { font-weight: 700; color: #1a2035; }
        .td-meta { color: #6b7898; }
        .td-time { font-family: monospace; font-size: 13px; }
        .td-dur { font-weight: 700; color: #3b4fd8; }
        .badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
        }
        .badge-done { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-open { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }

        /* ── QR codes ── */
        .qr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 600px) { .qr-grid { grid-template-columns: 1fr; } }
        .qr-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border: 2px solid;
        }
        .qr-entry { border-color: #bbf7d0; }
        .qr-exit  { border-color: #fde68a; }
        .qr-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
        }
        .qr-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .qr-dot-green { background: #22c55e; }
        .qr-dot-amber { background: #f59e0b; }
        .qr-label-row h3 {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #1a2035;
        }
        .qr-sub {
          align-self: flex-start;
          font-size: 12px;
          color: #6b7898;
        }
        .qr-img-wrap {
          padding: 12px;
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 12px;
        }
        .qr-img { width: 200px; height: 200px; display: block; }
        .qr-download {
          display: block;
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          text-align: center;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
        }
        .qr-dl-entry {
          background: #f0fdf4;
          color: #16a34a;
          border: 1.5px solid #bbf7d0;
        }
        .qr-dl-entry:hover { background: #dcfce7; }
        .qr-dl-exit {
          background: #fffbeb;
          color: #92400e;
          border: 1.5px solid #fde68a;
        }
        .qr-dl-exit:hover { background: #fef3c7; }

        .mini-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}
