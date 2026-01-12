
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BrowseMenu from './BrowseMenu'
import HamburgerMenu from './HamburgerMenu'

export default function LandingHeader() {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const browseRef = useRef(null)
useEffect(() => {
  function handleClickOutside(event) {
    if (
      browseRef.current &&
      !browseRef.current.contains(event.target)
    ) {
      setBrowseOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])

  return (
    <>
      <header className="border-b border-slate-300/40 bg-[#E9E4D0]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6 relative">

          {/* LOGO */}
          <h1 className="font-serif text-2xl font-semibold whitespace-nowrap">
            EduVault
          </h1>

          {/* NAV */}
          <nav className="hidden md:flex items-center gap-6 text-sm relative">
           <div ref={browseRef} className="relative">
           <button
  onClick={() => setBrowseOpen(prev => !prev)}
  className="cursor-pointer select-none"
>
  Browse ▾
</button>

{browseOpen && (
  <div className="absolute left-0 top-full mt-2">
    <BrowseMenu />
  </div>
)}
</div>

            <span className="cursor-pointer hover:underline">
              My Books
            </span>
          </nav>

          {/* SEARCH */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full bg-white border rounded-md overflow-hidden">
              <select className="px-3 text-sm bg-transparent border-r outline-none">
                <option>All</option>
                <option>Title</option>
                <option>Author</option>
                <option>Subject</option>
              </select>

              <input
                placeholder="Search"
                className="flex-1 px-3 py-2 text-sm outline-none"
              />

              <button className="px-4">🔍</button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link to="/login" className="hover:underline">
              Log in
            </Link>
            <Link to="/register" className="btn-primary">
              Sign up
            </Link>

            <button
              className="text-2xl"
              onClick={() => setHamburgerOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <HamburgerMenu
        open={hamburgerOpen}
        onClose={() => setHamburgerOpen(false)}
      />
    </>
  )
}
