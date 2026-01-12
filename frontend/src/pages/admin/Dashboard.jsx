import { useAdminStore } from '../../store/adminStore'

export default function AdminDashboard() {
  const { users, issuedBooks, revenue, aiUsage } = useAdminStore()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm opacity-70 mt-1">Enterprise overview</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat title="Total Users" value={users.length} />
        <Stat title="Issued Books" value={issuedBooks} />
        <Stat title="Revenue" value={`₹${revenue}`} />
        <Stat title="AI Usage" value={aiUsage} />
      </section>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div className="card p-6">
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
