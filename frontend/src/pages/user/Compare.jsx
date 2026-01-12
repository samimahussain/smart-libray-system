import { useLibraryStore } from '../../store/libraryStore'


export function Compare() {
const { compare } = useLibraryStore()


return (
<div className="p-8">
<h1 className="text-2xl font-bold">Compare Books</h1>
{compare.length === 0 && <p className="opacity-70 mt-4">No books selected</p>}
<div className="grid md:grid-cols-3 gap-6 mt-6">
{compare.map(b => (
<div key={b.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
<h3 className="font-semibold">{b.title}</h3>
<p>Read Time: {b.readTime}h</p>
<p>Mode: {b.mode}</p>
</div>
))}
</div>
</div>
)
}