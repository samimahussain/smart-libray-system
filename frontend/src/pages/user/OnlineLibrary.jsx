import { useLibraryStore } from '../../store/libraryStore'

export function Library() {
  const { books, issueBook, toggleCompare } = useLibraryStore()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Online Library</h1>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {books.map(book => (
          <div key={book.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
            <h3 className="font-semibold">{book.title}</h3>
            <p className="text-sm opacity-70">
              {book.subject} • {book.readTime}h • {book.mode}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                disabled={book.issued}
                onClick={() => issueBook(book.id)}
                className="btn-primary w-full"
              >
                {book.issued ? 'Issued' : 'Issue'}
              </button>

              <button
                onClick={() => toggleCompare(book)}
                className="btn-primary"
              >
                ⇄
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
