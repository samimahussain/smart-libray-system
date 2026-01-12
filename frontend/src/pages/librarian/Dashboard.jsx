import { useLibrarianStore } from '../../store/librarianStore'

export default function LibrarianDashboard() {
  const { offlineRequests, inventory, attendanceLogs } = useLibrarianStore()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Librarian Dashboard</h1>
        <p className="text-sm opacity-70 mt-1">Daily operations overview</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Pending Requests" value={offlineRequests.filter(r => r.status === 'Pending').length} />
        <Card title="Today Attendance" value={attendanceLogs.length} />
        <Card title="Total Inventory" value={inventory.length} />
        <Card title="Low Stock" value={inventory.filter(b => b.stock <= 1).length} />
      </section>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="card p-6">
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
