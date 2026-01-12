export default function UserVerification() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Verification</h1>

      <div className="card p-6 flex justify-between">
        <div>
          <p className="font-semibold">Student: Samima</p>
          <p className="text-sm opacity-70">QR Status: Active</p>
        </div>

        <div className="flex gap-2">
          <button className="btn-outline">Reset QR</button>
          <button className="btn-primary">Block</button>
        </div>
      </div>
    </div>
  )
}
