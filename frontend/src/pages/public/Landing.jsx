import { useAuthStore } from '../../store/authStore'
import { Navigate } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import LandingHeader from './LandingHeader'
import { API_BASE_URL } from "../../api"

const isLoggedIn = !!localStorage.getItem("accessToken")

const HEADER_OFFSET = 96

const horizontalScroll =
  'flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth snap-x snap-mandatory'

// helper
const scrollByAmount = (ref, amount) => {
  if (ref.current) {
    ref.current.scrollBy({
      left: amount,
      behavior: 'smooth',
    })
  }
}

function HorizontalSection({ title, children }) {
  const ref = useRef(null)

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-2xl">{title}</h3>

        <div className="hidden group-hover:flex gap-2">
          <button
            onClick={() => scrollByAmount(ref, -300)}
            className="w-8 h-8 rounded-full bg-white shadow hover:bg-slate-100"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByAmount(ref, 300)}
            className="w-8 h-8 rounded-full bg-white shadow hover:bg-slate-100"
          >
            ›
          </button>
        </div>
      </div>

      <div ref={ref} className={horizontalScroll}>
        {children}
      </div>
    </section>
  )
}

/* 🔹 UPDATED BookRow */
function BookRow({ title, books }) {
  return (
    <HorizontalSection title={title}>
      {books.map(book => (
        <div
          key={book.id}
          className="min-w-[160px] bg-[#F6F1DB] rounded-lg p-3"
        >
          <div className="h-48 bg-slate-300 rounded-md mb-3" />
          <p className="text-sm font-medium">{book.title}</p>
          <p className="text-xs text-slate-500">{book.author}</p>

          {isLoggedIn ? (
            <Link
              to="/library"
              className="block mt-3 w-full text-center text-sm py-1.5 rounded-md bg-indigo-600 text-white"
            >
              Go to Library
            </Link>
          ) : (
            <Link
              to="/login"
              className="block mt-3 w-full text-center text-sm py-1.5 rounded-md bg-gray-300 text-gray-600"
            >
              Login to Read
            </Link>
          )}
        </div>
      ))}
    </HorizontalSection>
  )
}

export default function Landing() {
  const location = useLocation()
  const accessToken = useAuthStore(s => s.accessToken)
  if (accessToken) {
    return <Navigate to="/user" replace />
  }
  // 🔹 category states
  const [popular, setPopular] = useState([])
  const [trending, setTrending] = useState([])
  const [kids, setKids] = useState([])
  const [romance, setRomance] = useState([])
  const [thrillers, setThrillers] = useState([])
  const [scifi, setScifi] = useState([])
  const [fantasy, setFantasy] = useState([])

  // 🔹 fetch by category
  useEffect(() => {
    const fetchBooks = async (query, setter) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/books/?${query}`
    )
    const data = await res.json()
    setter(data)
  } catch (err) {
    console.error(`Error fetching ${query}`, err)
  }
}


    fetchBooks("popular=true", setPopular)
fetchBooks("trending=true", setTrending)

fetchBooks("category=Kids", setKids)
fetchBooks("category=Romance", setRomance)
fetchBooks("category=Thrillers", setThrillers)
fetchBooks("category=Science Fiction", setScifi)
fetchBooks("category=Fantasy", setFantasy)

  }, [])

  // auto-scroll
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const scrollTarget = params.get('scroll')

    if (scrollTarget === 'library') {
      const section = document.getElementById('library-section')
      if (!section) return

      const y =
        section.getBoundingClientRect().top +
        window.pageYOffset -
        HEADER_OFFSET

      window.scrollTo({ top: y, behavior: 'smooth' })
      window.history.replaceState({}, '', '/')
    }
  }, [location])

  return (
    <div className="min-h-screen bg-[#E9E4D0] text-slate-900">
      <LandingHeader />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h2 className="font-serif text-5xl font-semibold leading-tight">
            A smarter way to <br />
            <span className="italic">read & learn</span>
          </h2>

          <p className="mt-6 text-slate-600 max-w-md">
            EduVault is an AI-powered smart library that helps you discover,
            study, track, and manage books — digital and physical — in one place.
          </p>

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => {
                const section = document.getElementById('library-section')
                if (!section) return

                const y =
                  section.getBoundingClientRect().top +
                  window.pageYOffset -
                  HEADER_OFFSET

                window.scrollTo({ top: y, behavior: 'smooth' })
              }}
              className="btn-primary"
            >
              Explore Library
            </button>

            <Link to="/login" className="btn-secondary">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <div id="library-section">
        <BookRow title="Popular this month" books={popular} />
      </div>

      <BookRow title="Trending Books" books={trending} />
      <BookRow title="Kids" books={kids} />
      <BookRow title="Romance" books={romance} />
      <BookRow title="Thrillers" books={thrillers} />
      <BookRow title="Science Fiction" books={scifi} />
      <BookRow title="Fantasy" books={fantasy} />

      <footer className="border-t border-slate-300/40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between text-sm text-slate-500">
          <span>© 2025 EduVault</span>
          <div className="flex gap-4">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
