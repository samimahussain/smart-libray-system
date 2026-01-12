import { useAIStore } from '../../store/aiStore'
import { useState } from 'react'


export function StudyPlan() {
const { studyPlan, generateStudyPlan } = useAIStore()
const [form, setForm] = useState({ course: '', exam: '', hours: '', targetDate: '' })


return (
<div className="p-8 max-w-2xl">
<h1 className="text-2xl font-bold">AI Study Program Builder</h1>


<input className="input mt-4" placeholder="Course" onChange={e => setForm({ ...form, course: e.target.value })} />
<input className="input mt-3" placeholder="Exam Type" onChange={e => setForm({ ...form, exam: e.target.value })} />
<input className="input mt-3" placeholder="Daily Study Hours" onChange={e => setForm({ ...form, hours: e.target.value })} />
<input className="input mt-3" type="date" onChange={e => setForm({ ...form, targetDate: e.target.value })} />


<button
onClick={() => generateStudyPlan(form)}
className="btn-primary mt-6"
>
Generate Plan
</button>


{studyPlan && (
<div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
<h2 className="font-semibold">{studyPlan.course} — {studyPlan.exam}</h2>
<ul className="mt-4 list-disc pl-6">
{studyPlan.plan.map(p => (
<li key={p.day}>{p.day}: {p.task}</li>
))}
</ul>
</div>
)}
</div>
)
}