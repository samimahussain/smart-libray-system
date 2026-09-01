import { useLibraryStore } from '../../store/libraryStore'


export function MyBooks() {
const { issuedBooks, returnBook } = useLibraryStore()


return (
<div className="p-8">
<h1 className="text-2xl font-bold">My Issued Books</h1>
{issuedBooks.length === 0 && <p className="opacity-70 mt-4">No books issued</p>}
<div className="grid md:grid-cols-3 gap-6 mt-6">
{issuedBooks.map(b => (
<div key={b.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
<h3 className="font-semibold">{b.title}</h3>
<p className="text-sm opacity-70">{b.mode}</p>
<button onClick={() => returnBook(b.id)} className="btn-primary w-full mt-3">Return</button>
</div>
))}
</div>
</div>
)
}