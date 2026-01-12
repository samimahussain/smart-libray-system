export default function Moderation() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Content Moderation</h1>

      <div className="card p-6 flex justify-between">
        <div>
          <p className="font-semibold">Operating Systems</p>
          <p className="text-sm opacity-70">AI summary flagged</p>
        </div>

        <div className="flex gap-2">
          <button className="btn-outline">Review</button>
          <button className="btn-primary">Remove</button>
        </div>
      </div>
    </div>
  )
}
