import { useEffect } from 'react'
import LandingHeader from './LandingHeader'
import { Link } from 'react-router-dom'

const aboutCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .about-root {
    min-height: 100vh;
    background: #F2ECD8;
    color: #1C1917;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── HERO ── */
  .about-hero {
    border-bottom: 1px solid rgba(28,25,23,0.10);
    background: #E8E0C8;
    padding: 80px 32px 72px;
    position: relative;
    overflow: hidden;
  }
  .about-hero-inner {
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 48px;
  }
  @media (max-width: 768px) {
    .about-hero-inner { grid-template-columns: 1fr; }
    .about-hero-logo-wrap { display: none; }
  }
  .about-hero-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  .about-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .about-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px; height: 1px;
    background: #B5883A;
  }
  .about-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(42px, 6vw, 72px);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: #1C1917;
    max-width: 760px;
  }
  .about-hero-title em {
    font-style: italic;
    color: #B5883A;
  }
  .about-hero-lead {
    font-family: 'Lora', serif;
    font-size: 18px;
    line-height: 1.75;
    color: #57534E;
    max-width: 560px;
    margin-top: 24px;
  }

  /* ── STATS BAND ── */
  .about-stats {
    background: #1C1917;
    padding: 0 32px;
  }
  .about-stats-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
  .about-stat {
    padding: 36px 32px;
    border-right: 1px solid rgba(255,255,255,0.08);
  }
  .about-stat:last-child { border-right: none; }
  .about-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 42px;
    font-weight: 700;
    color: #D4A853;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .about-stat-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    margin-top: 6px;
    letter-spacing: 0.02em;
  }

  /* ── VALUES ── */
  .about-values {
    max-width: 1280px;
    margin: 0 auto;
    padding: 80px 32px;
  }
  .about-section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    margin-bottom: 12px;
  }
  .about-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 700;
    color: #1C1917;
    margin-bottom: 48px;
    letter-spacing: -0.01em;
  }
  .about-values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 900px) {
    .about-values-grid { grid-template-columns: 1fr; }
    .about-stats-inner { grid-template-columns: repeat(2, 1fr); }
    .about-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
  }

  .about-value-card {
    background: #FAF6EC;
    border: 1px solid rgba(28,25,23,0.10);
    border-radius: 20px;
    padding: 32px;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    position: relative;
    overflow: hidden;
  }
  .about-value-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 20px 20px 0 0;
  }
  .about-value-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 16px 48px rgba(28,25,23,0.12);
  }
  .about-value-icon {
    width: 48px; height: 48px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    margin-bottom: 20px;
  }
  .about-value-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
    color: #1C1917;
    margin-bottom: 10px;
  }
  .about-value-text {
    font-family: 'Lora', serif;
    font-size: 14px;
    line-height: 1.75;
    color: #57534E;
  }

  /* ── STORY ── */
  .about-story {
    background: #E8E0C8;
    border-top: 1px solid rgba(28,25,23,0.10);
    border-bottom: 1px solid rgba(28,25,23,0.10);
    padding: 80px 32px;
  }
  .about-story-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  @media (max-width: 768px) {
    .about-story-inner { grid-template-columns: 1fr; gap: 32px; }
  }
  .about-story-text {
    font-family: 'Lora', serif;
    font-size: 16px;
    line-height: 1.85;
    color: #57534E;
  }
  .about-story-text p + p { margin-top: 20px; }
  .about-pull-quote {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-style: italic;
    font-weight: 600;
    color: #1C1917;
    line-height: 1.4;
    padding-left: 24px;
    border-left: 3px solid #B5883A;
  }

  /* ── CTA ── */
  .about-cta {
    max-width: 1280px;
    margin: 0 auto;
    padding: 80px 32px;
    text-align: center;
  }
  .about-cta-title {
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    font-weight: 700;
    color: #1C1917;
    letter-spacing: -0.01em;
    margin-bottom: 16px;
  }
  .about-cta-sub {
    font-family: 'Lora', serif;
    font-size: 16px;
    color: #57534E;
    margin-bottom: 36px;
  }
  .about-cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .about-btn-primary {
    background: #1C1917;
    color: #FFF;
    padding: 13px 32px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    display: inline-block;
  }
  .about-btn-primary:hover { background: #3D3630; transform: translateY(-1px); }
  .about-btn-secondary {
    background: transparent;
    color: #1C1917;
    padding: 12px 28px;
    border-radius: 100px;
    border: 1.5px solid rgba(28,25,23,0.20);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    text-decoration: none;
    transition: border-color 0.2s, background 0.2s;
    display: inline-block;
  }
  .about-btn-secondary:hover { border-color: #1C1917; background: rgba(28,25,23,0.04); }

  /* fade-up */
  @keyframes fadeUpAbout {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .au-fade { animation: fadeUpAbout 0.65s ease both; }
  .au-d1 { animation-delay: 0.08s; }
  .au-d2 { animation-delay: 0.18s; }
  .au-d3 { animation-delay: 0.30s; }

  .about-hero-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

function AboutStyleInjector() {
  useEffect(() => {
    const id = 'about-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = aboutCSS
      document.head.appendChild(style)
    }
  }, [])
  return null
}

const values = [
  {
    icon: '✦',
    iconBg: 'rgba(181,136,58,0.12)',
    accentColor: '#B5883A',
    title: 'AI-Driven Learning',
    text: 'Personalized study plans, reading recommendations, and performance analytics powered by intelligent algorithms that adapt to every learner.',
  },
  {
    icon: '◎',
    iconBg: 'rgba(28,25,23,0.07)',
    accentColor: '#57534E',
    title: 'Smart Library',
    text: 'Online and offline book issue with real-time tracking, copy management, and deep insights into your institution\'s reading ecosystem.',
  },
  {
    icon: '◈',
    iconBg: 'rgba(90,120,180,0.10)',
    accentColor: '#5A78B4',
    title: 'Enterprise Ready',
    text: 'Role-based access for students, librarians, and administrators. Audit trails, fine management, and attendance tracking built in.',
  },
]

export default function About() {
  return (
    <>
      <AboutStyleInjector />
      <div className="about-root">
        <LandingHeader />

        {/* ── HERO ── */}
        <section className="about-hero">
          <div className="about-hero-blob" style={{
            width: 480, height: 480,
            top: -160, right: -80,
            background: 'radial-gradient(circle, rgba(181,136,58,0.09) 0%, transparent 70%)',
          }} />
          <div className="about-hero-inner">
            <div>
              <p className="about-eyebrow au-fade au-d1">Our mission</p>
              <h1 className="about-hero-title au-fade au-d2">
                Built for those who believe<br />
                <em>knowledge changes everything.</em>
              </h1>
              <p className="about-hero-lead au-fade au-d3">
                EduVault is an AI-powered smart library platform designed to modernize how
                students discover, read, and manage learning resources — both digital and physical.
              </p>
            </div>
            <div className="about-hero-logo-wrap">
              {/* Logo removed */}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <div className="about-values">
          <p className="about-section-label">What we stand for</p>
          <h2 className="about-section-title">Three pillars of EduVault</h2>
          <div className="about-values-grid">
            {values.map(v => (
              <div key={v.title} className="about-value-card">
                <div className="about-value-card-accent" style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3, background: v.accentColor, borderRadius: '20px 20px 0 0'
                }} />
                <div className="about-value-icon" style={{ background: v.iconBg }}>
                  <span style={{ color: v.accentColor }}>{v.icon}</span>
                </div>
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-text">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── STORY ── */}
        <section className="about-story">
          <div className="about-story-inner">
            <div>
              <p className="about-section-label">Our story</p>
              <h2 className="about-section-title" style={{ marginBottom: 24 }}>
                Why we built EduVault
              </h2>
              <div className="about-story-text">
                <p>
                  EduVault was born from a simple frustration: students spending more time hunting
                  for books than actually reading them. Library queues, lost records, and
                  disconnected systems were stealing time from learning.
                </p>
                <p>
                  We set out to build the library management platform we always wished existed —
                  one that treats knowledge access as a right, not a bureaucratic obstacle.
                </p>
                <p>
                  Today EduVault serves institutions across the country, helping hundreds of
                  thousands of students read more, learn faster, and never lose a book again.
                </p>
              </div>
            </div>
            <div>
              <blockquote className="about-pull-quote">
                "A library is not a luxury but one of the necessities of life — we just
                made it smarter."
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="about-cta">
          <h2 className="about-cta-title">Ready to transform your library?</h2>
          <p className="about-cta-sub">Join hundreds of institutions already using EduVault.</p>
          <div className="about-cta-btns">
            <Link to="/register" className="about-btn-primary">Get started free</Link>
            <Link to="/contact" className="about-btn-secondary">Talk to us →</Link>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(28,25,23,0.10)', background: '#E8E0C8' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: '#1C1917' }}>EduVault</span>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#57534E' }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
              <Link to="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</Link>
              <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}