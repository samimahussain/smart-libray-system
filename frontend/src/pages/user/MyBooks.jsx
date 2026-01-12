export function MyBooks() {
return (
<div className="p-8">
<h1 className="text-2xl font-bold">My Issued Books</h1>
<div className="flex gap-4 mt-4">
<button className="btn-primary">Online</button>
<button className="btn-primary">Offline</button>
<button className="btn-primary">History</button>
</div>
</div>
)
}