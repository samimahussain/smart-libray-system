export function BookDetails() {
return (
<div className="p-8 grid md:grid-cols-3 gap-8">
<div className="md:col-span-2">
<h1 className="text-3xl font-bold">Operating Systems</h1>
<p className="mt-2 opacity-70">AI generated summary goes here...</p>
<button className="btn-primary mt-4">Read Online</button>
</div>
<aside className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
<p><b>Author:</b> Silberschatz</p>
<p><b>Read Time:</b> 10h</p>
</aside>
</div>
)
}