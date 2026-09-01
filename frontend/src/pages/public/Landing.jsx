import { useAuthStore } from '../../store/authStore'
import { Navigate } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import LandingHeader from './LandingHeader'
import { API_BASE_URL } from "../../api"

const HEADER_OFFSET = 96

// ─── Inline styles & keyframes injected once ───────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --parchment:   #F2ECD8;
    --parchment-2: #E8E0C8;
    --ink:         #1C1917;
    --ink-soft:    #57534E;
    --gold:        #B5883A;
    --gold-light:  #D4A853;
    --cream-card:  #FAF6EC;
    --border:      rgba(28,25,23,0.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--parchment);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
  }

  /* scrollbar */
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

  /* animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .fade-up { animation: fadeUp 0.7s ease both; }
  .fade-up-1 { animation-delay: 0.1s; }
  .fade-up-2 { animation-delay: 0.22s; }
  .fade-up-3 { animation-delay: 0.38s; }

  /* ── BOOK CARD ── */
  .book-card {
    min-width: 180px;
    max-width: 180px;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    scroll-snap-align: start;
    position: relative;
    transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.32s ease;
    box-shadow: 0 4px 16px rgba(28,25,23,0.10);
    background: #fff;
  }
  .book-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 24px 56px rgba(28,25,23,0.22);
  }
  .book-card:hover .book-cover-overlay { opacity: 1; }
  .book-card:hover .book-action-btn { transform: translateY(0); opacity: 1; }

  .book-cover {
    height: 230px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 14px;
  }
  .book-cover::after {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
    mix-blend-mode: overlay;
  }
  .book-cover::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 10px;
    background: linear-gradient(to right, rgba(0,0,0,0.28), transparent);
    z-index: 2;
  }

  .book-cover-title {
    position: relative; z-index: 3;
    font-family: 'Playfair Display', serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
    color: rgba(255,255,255,0.92);
    text-shadow: 0 1px 8px rgba(0,0,0,0.5);
    transition: opacity 0.25s ease, transform 0.25s ease;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  .book-cover-author {
    position: relative; z-index: 3;
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 400;
    color: rgba(255,255,255,0.62);
    margin-top: 3px;
    letter-spacing: 0.04em;
  }

  .book-cover-deco {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.25;
    z-index: 1;
  }

  .book-cover-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.46);
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 0.25s ease;
    z-index: 4;
  }
  .book-action-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.55);
    border-radius: 100px;
    padding: 9px 20px;
    text-decoration: none;
    backdrop-filter: blur(6px);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease;
    transform: translateY(10px);
    opacity: 0;
    display: inline-block;
  }

  .book-meta { padding: 12px 14px 14px; background: #fff; }
  .book-title {
    font-family: 'Lora', serif;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--ink);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .book-author { font-size: 11px; color: var(--ink-soft); margin-top: 3px; font-family: 'DM Sans', sans-serif; }
  .book-stars { display: flex; align-items: center; gap: 3px; margin-top: 8px; }
  .star { color: #D4A853; font-size: 10px; }
  .star-empty { color: #D4C9A8; font-size: 10px; }
  .book-rating-count { font-size: 10px; color: var(--ink-soft); margin-left: 4px; }

  .btn-primary {
    background: var(--ink);
    color: #FFF;
    border: none;
    padding: 11px 28px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { background: #3D3630; transform: translateY(-1px); }

  .btn-secondary {
    background: transparent;
    color: var(--ink);
    border: 1.5px solid var(--border);
    padding: 10px 24px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    text-decoration: none;
    display: inline-flex; align-items: center;
  }
  .btn-secondary:hover { border-color: var(--ink); background: rgba(28,25,23,0.04); }

  .section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 6px;
  }

  .divider { border: none; border-top: 1px solid var(--border); }

  .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
  .marquee-item {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 13px;
    color: var(--ink-soft);
    padding: 0 28px;
  }

  .arrow-btn {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: var(--cream-card);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 18px;
    transition: background 0.2s;
  }
  .arrow-btn:hover { background: var(--ink); color: #FFF; }

  .hero-circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(181,136,58,0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .admin-footer-link {
    font-size: 11px;
    color: var(--ink-soft);
    text-decoration: none;
    opacity: 0.5;
    transition: opacity 0.2s, color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .admin-footer-link:hover { opacity: 1; color: var(--ink); }
`

function StyleInjector() {
  useEffect(() => {
    const id = 'eduvault-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = globalCSS
      document.head.appendChild(style)
    }
  }, [])
  return null
}

const coverThemes = [
  { bg: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)', deco1: { bg: 'rgba(100,160,255,0.35)', size: 110, top: -30, right: -20 }, deco2: { bg: 'rgba(50,80,200,0.2)', size: 70, bottom: 20, left: 10 } },
  { bg: 'linear-gradient(160deg, #2d1b00 0%, #6b3a1f 50%, #c17f3c 100%)', deco1: { bg: 'rgba(255,190,80,0.3)', size: 120, top: -40, right: -30 }, deco2: { bg: 'rgba(180,80,0,0.2)', size: 60, bottom: 10, left: 20 } },
  { bg: 'linear-gradient(160deg, #0d1f0f 0%, #1e4d2b 45%, #2e7d42 100%)', deco1: { bg: 'rgba(80,220,120,0.25)', size: 100, top: -20, right: -10 }, deco2: { bg: 'rgba(30,120,60,0.2)', size: 80, bottom: 30, left: -10 } },
  { bg: 'linear-gradient(160deg, #1f0d1f 0%, #4a1942 50%, #8b2f8b 100%)', deco1: { bg: 'rgba(220,100,220,0.28)', size: 130, top: -50, right: -20 }, deco2: { bg: 'rgba(150,30,150,0.18)', size: 65, bottom: 15, left: 15 } },
]

function StarRating({ seed }) {
  const rating = 3 + (seed % 3)
  return (
    <div className="book-stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= rating ? 'star' : 'star-empty'}>★</span>
      ))}
      <span className="book-rating-count">({(80 + seed * 37) % 900 + 50})</span>
    </div>
  )
}

function BookCard({ book, idx }) {
  const theme = coverThemes[idx % coverThemes.length]
  const isLoggedIn = !!localStorage.getItem("accessToken")
  const actionLabel = isLoggedIn ? 'Go to Library' : 'Login to Read'
  const actionHref  = isLoggedIn ? '/library' : '/login'

  return (
    <div className="book-card">
      <div className="book-cover" style={{ background: theme.bg }}>
        <div className="book-cover-deco" style={{ width: theme.deco1.size, height: theme.deco1.size, background: theme.deco1.bg, top: theme.deco1.top, right: theme.deco1.right, filter: 'blur(28px)' }} />
        <div className="book-cover-overlay">
          <Link to={actionHref} className="book-action-btn">{actionLabel}</Link>
        </div>
        <p className="book-cover-title">{book.title}</p>
        <p className="book-cover-author">{book.author}</p>
      </div>
      <div className="book-meta">
        <p className="book-title">{book.title}</p>
        <p className="book-author">{book.author}</p>
        <StarRating seed={idx} />
      </div>
    </div>
  )
}

function BookRow({ title, books, index = 0 }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  if (!books.length) return null

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '44px 32px' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.15em', opacity: 0.7 }}>{String(index + 1).padStart(2, '0')}</span>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 6, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>
          <button className="arrow-btn" onClick={() => ref.current.scrollBy({ left: -400, behavior: 'smooth' })}>‹</button>
          <button className="arrow-btn" onClick={() => ref.current.scrollBy({ left: 400, behavior: 'smooth' })}>›</button>
        </div>
      </div>
      <div ref={ref} className="scrollbar-hide" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory' }}>
        {books.map((book, i) => <BookCard key={book.id} book={book} idx={i} />)}
      </div>
    </section>
  )
}

function MarqueeStrip() {
  const genres = ['Fiction', 'Science', 'History', 'Philosophy', 'Biographies', 'Fantasy', 'Romance', 'Classics', 'Thrillers', 'Poetry', 'Self-Help', 'Science Fiction']
  const items = [...genres, ...genres]
  return (
    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden', padding: '14px 0', background: 'var(--parchment-2)' }}>
      <div className="marquee-track">
        {items.map((g, i) => (
          <span key={i} className="marquee-item">{g} <span style={{ color: 'var(--gold)', marginLeft: 6 }}>✦</span></span>
        ))}
      </div>
    </div>
  )
}

function FeatureBadges() {
  const features = [{ icon: '✦', label: 'AI-Powered Discovery' }, { icon: '◈', label: 'Physical & Digital' }, { icon: '◉', label: 'Study Tracking' }, { icon: '◇', label: 'Smart Analytics' }]
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32, justifyContent: 'center' }}>
      {features.map(f => (
        <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(28,25,23,0.06)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 14px', fontSize: 12, color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--gold)', fontSize: 10 }}>{f.icon}</span>{f.label}
        </span>
      ))}
    </div>
  )
}

export default function Landing() {
  const location = useLocation()
  const [popular, setPopular]     = useState([])
  const [trending, setTrending]   = useState([])
  const [kids, setKids]           = useState([])
  const [romance, setRomance]     = useState([])
  const [thrillers, setThrillers] = useState([])
  const [scifi, setScifi]         = useState([])
  const [fantasy, setFantasy]     = useState([])

  useEffect(() => {
    const fetchBooks = async (query, setter) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/books/?${query}`)
        if (!res.ok) return
        const data = await res.json()
        setter(Array.isArray(data) ? data : (data.results ?? []))
      } catch (err) { console.error(err) }
    }
    const runAll = async () => {
      await fetchBooks("popular=true", setPopular)
      await fetchBooks("trending=true", setTrending)
      await fetchBooks("category=Kids", setKids)
      await fetchBooks("category=Romance", setRomance)
      await fetchBooks("category=Thrillers", setThrillers)
      await fetchBooks("category=Science Fiction", setScifi)
      await fetchBooks("category=Fantasy", setFantasy)
    }
    runAll()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('scroll') === 'library') {
      const section = document.getElementById('library-section')
      if (section) {
        window.scrollTo({ top: section.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET, behavior: 'smooth' })
        window.history.replaceState({}, '', '/')
      }
    }
  }, [location])

  return (
    <>
      <StyleInjector />
      <div style={{ minHeight: '100vh', background: 'var(--parchment)', color: 'var(--ink)' }}>
        <LandingHeader />

        {/* ── CENTERED HERO ── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 32px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div className="hero-circle" style={{ width: 600, height: 600, top: -100, left: '50%', transform: 'translateX(-50%)', opacity: 0.6 }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
            <p className="section-label fade-up fade-up-1">Welcome to EduVault</p>
            <h2 className="fade-up fade-up-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
              Read more.<br /><span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Learn deeper.</span>
            </h2>
            <p className="fade-up fade-up-3" style={{ marginTop: 24, fontSize: 18, lineHeight: 1.7, color: 'var(--ink-soft)', fontFamily: "'Lora', serif" }}>
              EduVault is an AI-powered smart library that helps you discover, study, track, and manage books — digital and physical — in one elegant place.
            </p>

            <FeatureBadges />

            <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center' }} className="fade-up fade-up-3">
              <button onClick={() => document.getElementById('library-section').scrollIntoView({ behavior: 'smooth' })} className="btn-primary">Explore Library ↓</button>
              <Link to="/login" className="btn-secondary">Learn more</Link>
            </div>
          </div>
        </section>

        <MarqueeStrip />

        <div id="library-section">
          <BookRow title="Popular This Month" books={popular} index={0} />
          <hr className="divider" style={{ maxWidth: 1280, margin: '0 auto' }} />
          <BookRow title="Trending Now" books={trending} index={1} />
          <hr className="divider" style={{ maxWidth: 1280, margin: '0 auto' }} />
          <BookRow title="For Young Readers" books={kids} index={2} />
          <hr className="divider" style={{ maxWidth: 1280, margin: '0 auto' }} />
          <BookRow title="Romance" books={romance} index={3} />
          <hr className="divider" style={{ maxWidth: 1280, margin: '0 auto' }} />
          <BookRow title="Thrillers" books={thrillers} index={4} />
          <hr className="divider" style={{ maxWidth: 1280, margin: '0 auto' }} />
          <BookRow title="Science Fiction" books={scifi} index={5} />
          <hr className="divider" style={{ maxWidth: 1280, margin: '0 auto' }} />
          <BookRow title="Fantasy" books={fantasy} index={6} />
        </div>

        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--parchment-2)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600 }}>EduVault</span>
              <span style={{ marginLeft: 16, fontSize: 12, color: 'var(--ink-soft)' }}>© 2025 All rights reserved</span>
            </div>

          </div>
        </footer>
      </div>
    </>
  )
}