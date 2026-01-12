import { useLibrarianStore } from '../../store/librarianStore'

export default function LibrarianAttendance() {
  const { attendanceLogs, addAttendance } = useLibrarianStore()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">QR Attendance Monitor</h1>

      <button onClick={addAttendance} className="btn-primary">
        Manual Entry
      </button>

      <ul className="mt-4 text-sm">
        {attendanceLogs.map((l, i) => (
          <li key={i}>{l.time}</li>
        ))}
      </ul>
    </div>
  )
}
