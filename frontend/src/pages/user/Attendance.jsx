import { useAttendanceStore } from '../../store/attendanceStore'


export function Attendance() {
const { logs, scanQR } = useAttendanceStore()


return (
<div className="p-8">
<h1 className="text-2xl font-bold">QR Attendance</h1>


<button onClick={scanQR} className="btn-primary mt-4">Scan QR</button>


<div className="mt-6">
{logs.map((l, i) => (
<div key={i} className="text-sm opacity-80">{l.date} — {l.time}</div>
))}
</div>
</div>
)
}