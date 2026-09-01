export function OfflineIssue() {
return (
<div className="p-8 max-w-xl">
<h1 className="text-2xl font-bold">Offline Book Request</h1>
<input className="input mt-4" placeholder="Book ID" />
<input className="input mt-3" type="date" />
<input className="input mt-3" type="date" />
<textarea className="input mt-3" placeholder="Purpose" />
<button className="btn-primary mt-6">Submit Request</button>
</div>
)
}