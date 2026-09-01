export default function BookDetails({ book, onClose, onIssue, isIssued }) {
  // Calculate estimated read times based on average reading speeds
  // Fast: 400 wpm, Average: 250 wpm, Slow: 200 wpm
  // Assuming ~300 words per page
  const calculateReadTime = (pages, wordsPerMinute) => {
    const totalWords = pages * 300;
    const minutes = Math.round(totalWords / wordsPerMinute);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Default to 250 pages if not provided
  const pages = book.pages || 250;
  const readTimes = {
    fast: calculateReadTime(pages, 400),
    average: calculateReadTime(pages, 250),
    slow: calculateReadTime(pages, 200)
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
              <p className="text-indigo-100 text-lg">{book.author}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Book Cover */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-8 flex items-center justify-center aspect-[3/4] mb-4">
                <div className="text-8xl">📖</div>
              </div>
              
              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Genre</span>
                  <span className="font-semibold text-gray-900">{book.genre || 'General'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available</span>
                  <span className="font-semibold text-gray-900">{book.available_copies} copies</span>
                </div>
                {book.pages && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pages</span>
                    <span className="font-semibold text-gray-900">{book.pages}</span>
                  </div>
                )}
                {!book.pages && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pages</span>
                    <span className="font-semibold text-gray-900">{pages} (est.)</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ISBN</span>
                    <span className="font-semibold text-gray-900 text-xs">{book.isbn}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Publisher</span>
                    <span className="font-semibold text-gray-900 text-sm">{book.publisher}</span>
                  </div>
                )}
                {book.published_year && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Year</span>
                    <span className="font-semibold text-gray-900">{book.published_year}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">📝 About this Book</h3>
                <p className="text-gray-700 leading-relaxed">
                  {book.description || `${book.title} by ${book.author}. A comprehensive guide covering essential topics in ${book.genre || 'General'}. This book provides in-depth knowledge and practical insights for readers interested in the subject matter.`}
                </p>
              </div>

              {/* Estimated Read Time */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">⏱️ Estimated Read Time</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">🚀</span>
                        <p className="text-xs font-medium text-gray-600">Fast Reader</p>
                      </div>
                      <p className="text-2xl font-bold text-indigo-600">{readTimes.fast}</p>
                      <p className="text-xs text-gray-500 mt-1">400 words/min</p>
                    </div>
                    
                    <div className="text-center border-x border-indigo-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">📖</span>
                        <p className="text-xs font-medium text-gray-600">Average Reader</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{readTimes.average}</p>
                      <p className="text-xs text-gray-500 mt-1">250 words/min</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl">🐢</span>
                        <p className="text-xs font-medium text-gray-600">Slow Reader</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{readTimes.slow}</p>
                      <p className="text-xs text-gray-500 mt-1">200 words/min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">📋 Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                        👤
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Author</p>
                        <p className="font-semibold text-gray-900">{book.author}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                        🏷️
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Category</p>
                        <p className="font-semibold text-gray-900">{book.genre || 'General'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                        📚
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Availability</p>
                        <p className="font-semibold text-gray-900">
                          {book.available_copies > 0 ? `${book.available_copies} Available` : 'Not Available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">
                        ⭐
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Rating</p>
                        <p className="font-semibold text-gray-900">{book.rating || '4.5'} / 5.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags/Keywords */}
              {book.tags && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">🏷️ Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">About Borrowing</h4>
                    <p className="text-sm text-gray-700">
                      • Books can be issued for up to 14 days<br/>
                      • You'll receive an email with access details<br/>
                      • Read online anytime during your issue period<br/>
                      • Late returns may affect future borrowing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={onIssue}
              disabled={isIssued || book.available_copies === 0}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
                isIssued
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : book.available_copies === 0
                  ? "bg-red-100 text-red-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isIssued ? "✓ Already Issued" : book.available_copies === 0 ? "Not Available" : "📚 Issue This Book"}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
