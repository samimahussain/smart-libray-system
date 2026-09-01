import { useState, useEffect } from "react"
import axios from "@/lib/axios"

export default function Attendance() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalDays: 0,
    totalMinutes: 0,
    currentStreak: 0,
    thisMonth: 0,
  })

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await axios.get("/attendance/")
      const data = res.data
      setLogs(data)
      computeStats(data)
    } catch (err) {
      setError("Failed to load attendance records.")
    } finally {
      setLoading(false)
    }
  }

  const computeStats = (data) => {
    const completed = data.filter((l) => l.check_out)
    const totalMinutes = completed.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

    const now = new Date()
    const thisMonth = data.filter((l) => {
      const d = new Date(l.check_in)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    // Streak: count consecutive days going back from today
    const uniqueDays = [
      ...new Set(data.map((l) => new Date(l.check_in).toDateString())),
    ].map((d) => new Date(d)).sort((a, b) => b - a)

    let streak = 0
    let check = new Date()
    check.setHours(0, 0, 0, 0)
    for (const day of uniqueDays) {
      const d = new Date(day)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() === check.getTime()) {
        streak++
        check.setDate(check.getDate() - 1)
      } else {
        break
      }
    }

    setStats({
      totalDays: uniqueDays.length,
      totalMinutes,
      currentStreak: streak,
      thisMonth,
    })
  }

  const formatTime = (dt) => {
    if (!dt) return "—"
    return new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dt) => {
    if (!dt) return "—"
    return new Date(dt).toLocaleDateString([], {
      weekday: "short", month: "short", day: "numeric"
    })
  }

  const formatDuration = (mins) => {
    if (!mins) return "—"
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m}m`
    return `${h}h ${m}m`
  }

  const formatTotalTime = (mins) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  return (
    <div className="att-root">

      {/* ── Header ── */}
      <div className="att-header">
        <div>
          <h1 className="att-title">My Attendance</h1>
          <p className="att-sub">Your library visit history</p>
        </div>
        <button className="refresh-btn" onClick={fetchAttendance}>↻ Refresh</button>
      </div>

      {/* ── Stats row ── */}
      <div className="stats-grid">
        <StatCard
          icon="📅"
          label="Total Days"
          value={stats.totalDays}
          color="blue"
        />
        <StatCard
          icon="⏱️"
          label="Total Study Time"
          value={formatTotalTime(stats.totalMinutes)}
          color="green"
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          color="orange"
        />
        <StatCard
          icon="🗓️"
          label="This Month"
          value={`${stats.thisMonth} visits`}
          color="purple"
        />
      </div>

      {/* ── Log table ── */}
      <div className="table-card">
        <div className="table-header-row">
          <h2 className="table-title">Visit History</h2>
          <span className="table-count">{logs.length} records</span>
        </div>

        {loading ? (
          <div className="state-box">
            <div className="spinner" />
            <p>Loading your records…</p>
          </div>
        ) : error ? (
          <div className="state-box error-state">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="state-box empty-state">
            <span className="empty-icon">📭</span>
            <p>No attendance records yet.</p>
            <p className="empty-hint">Scan the QR code at the library entrance to get started.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="att-table">
              <thead>
                <tr>
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
                    <td className="td-date">{formatDate(log.check_in)}</td>
                    <td className="td-time">{formatTime(log.check_in)}</td>
                    <td className="td-time">{formatTime(log.check_out)}</td>
                    <td className="td-dur">{formatDuration(log.duration_minutes)}</td>
                    <td>
                      {log.check_out ? (
                        <span className="badge badge-done">✓ Completed</span>
                      ) : (
                        <span className="badge badge-open">● In Library</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Lato:wght@300;400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .att-root {
          font-family: 'Lato', sans-serif;
          padding: 32px;
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: #1a2035;
        }

        /* ── Header ── */
        .att-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .att-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #1a2035;
        }
        .att-sub { font-size: 14px; color: #6b7898; margin-top: 4px; }
        .refresh-btn {
          padding: 9px 18px;
          background: #fff;
          border: 1.5px solid #e5e9f0;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #3b4fd8;
          cursor: pointer;
          transition: all 0.15s;
        }
        .refresh-btn:hover { background: #eef1ff; border-color: #c7d0f8; }

        /* ── Stats ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 400px) { .stats-grid { grid-template-columns: 1fr; } }

        .stat-card {
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
        .stat-icon { font-size: 24px; }
        .stat-label { font-size: 12px; color: #6b7898; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
        }
        .stat-blue   .stat-value { color: #3b82f6; }
        .stat-green  .stat-value { color: #22c55e; }
        .stat-orange .stat-value { color: #f59e0b; }
        .stat-purple .stat-value { color: #8b5cf6; }

        /* ── Table card ── */
        .table-card {
          background: #fff;
          border: 1px solid #e5e9f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .table-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f4f8;
        }
        .table-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #1a2035;
        }
        .table-count {
          font-size: 12px;
          color: #8892a4;
          background: #f5f7fa;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
        }

        /* ── States ── */
        .state-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 48px 24px;
          color: #6b7898;
          font-size: 15px;
        }
        .error-state { color: #dc2626; }
        .empty-icon { font-size: 40px; }
        .empty-hint { font-size: 13px; color: #9ca3af; text-align: center; }
        .spinner {
          width: 24px; height: 24px;
          border: 2.5px solid #e5e9f0;
          border-top-color: #3b4fd8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Table ── */
        .table-wrap { overflow-x: auto; }
        .att-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .att-table th {
          padding: 11px 20px;
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
        .att-table td {
          padding: 14px 20px;
          border-bottom: 1px solid #f1f4f8;
          color: #2d3748;
        }
        .att-table tr:last-child td { border-bottom: none; }
        .att-table tr:hover td { background: #fafbff; }

        .td-date { font-weight: 700; color: #1a2035; }
        .td-time { font-family: monospace; font-size: 13px; color: #4a5568; }
        .td-dur  { font-weight: 700; color: #3b4fd8; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
        }
        .badge-done { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-open { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }

        @media (max-width: 600px) {
          .att-root { padding: 20px 16px; }
          .att-table th, .att-table td { padding: 10px 12px; }
        }
      `}</style>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}
