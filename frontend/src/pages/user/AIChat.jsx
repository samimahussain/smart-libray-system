import { useAIStore } from '../../store/aiStore'
import { useLibraryStore } from '../../store/libraryStore'
import { useState } from 'react'


export function AIChat() {
const { chats, askAI } = useAIStore()
const { issuedBooks } = useLibraryStore()
const [msg, setMsg] = useState('')


return (
<div className="p-8 h-screen flex flex-col">
<h1 className="text-2xl font-bold">EduVault AI Assistant</h1>


<div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl p-4 mt-4">
{chats.map((c, i) => (
<div key={i} className="mb-4">
<p className="font-semibold">You:</p>
<p>{c.user}</p>
<p className="font-semibold mt-2">AI:</p>
<p className="opacity-80">{c.ai}</p>
</div>
))}
</div>


<form
onSubmit={(e) => {
e.preventDefault()
askAI(msg, issuedBooks)
setMsg('')
}}
className="mt-4 flex gap-2"
>
<input
className="input flex-1"
value={msg}
onChange={(e) => setMsg(e.target.value)}
placeholder="Ask about books, exams, or plans"
/>
<button className="btn-primary">Send</button>
</form>
</div>
)
}