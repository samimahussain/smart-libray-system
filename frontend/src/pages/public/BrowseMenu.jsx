export default function BrowseMenu() {
  return (
    <div className="absolute top-full left-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50 text-sm">
      {[
        'Subjects',
        'Trending',
        'Library Explorer',
        'Lists',
        'Collections',
        'K-12 Student Library',
        'Book Talks',
        'Random Book',
        'Advanced Search'
      ].map(item => (
        <div
          key={item}
          className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
        >
          {item}
        </div>
      ))}
    </div>
  )
}
