export default function IssueBookModal({
  book,
  onClose,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">
          Issue "{book.title}"
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          Select duration:
        </p>

        <div className="flex gap-3 mb-6">
          {[3, 7, 15].map(days => (
            <button
              key={days}
              onClick={() => onConfirm(days)}
              className="flex-1 py-2 rounded-lg border hover:bg-indigo-600 hover:text-white"
            >
              {days} days
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
