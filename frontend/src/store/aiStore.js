import { create } from 'zustand'
import { differenceInDays } from 'date-fns'


export const useAIStore = create((set, get) => ({
chats: [],
studyPlan: null,


askAI: (message, issuedBooks = []) => {
let reply = ''


const lower = message.toLowerCase()


if (lower.includes('study plan')) {
reply = 'Sure! Go to the Study Planner page and I will generate a detailed schedule for you.'
} else if (lower.includes('suggest')) {
reply = issuedBooks.length
? `Based on your reading, I suggest revising ${issuedBooks[0].title}.`
: 'Try starting with DBMS or Data Structures.'
} else if (lower.includes('explain')) {
reply = 'Here is a simple explanation of the concept in easy terms...'
} else {
reply = 'I am here to help you with studies, books, and planning 📘'
}


set({ chats: [...get().chats, { user: message, ai: reply }] })
},


generateStudyPlan: ({ course, exam, hours, targetDate }) => {
const days = differenceInDays(new Date(targetDate), new Date()) || 7
const dailyHours = Number(hours)


const plan = Array.from({ length: days }, (_, i) => ({
day: `Day ${i + 1}`,
task: `Study ${course} (${dailyHours}h) + Revision`
}))


set({ studyPlan: { course, exam, days, plan } })
}
}))