export default function Reports() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics & Reports</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="font-semibold">Most Read Books</p>
          <p className="text-sm opacity-70">DBMS, OS, DSA</p>
        </div>

        <div className="card p-6">
          <p className="font-semibold">User Engagement</p>
          <p className="text-sm opacity-70">High engagement this month</p>
        </div>
      </div>

      <button className="btn-primary">Download CSV</button>
    </div>
  )
}
