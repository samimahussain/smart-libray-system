import { create } from 'zustand'


export const useAnalyticsStore = create(() => ({
compute: ({ issuedBooks, studyPlan, attendance }) => {
return {
booksRead: issuedBooks.length,
studyDays: studyPlan?.days || 0,
attendanceCount: attendance.length,
bestSubject: issuedBooks[0]?.subject || 'N/A',
feedback: issuedBooks.length > 3
? 'Great consistency! Keep going.'
: 'Try to read more regularly for better results.'
}
}
}))