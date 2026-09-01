import { useEffect } from 'react'
import LandingHeader from './LandingHeader'
import { Link } from 'react-router-dom'

const privacyCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .pv-root {
    min-height: 100vh;
    background: #F2ECD8;
    color: #1C1917;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── HERO ── */
  .pv-hero {
    background: #E8E0C8;
    border-bottom: 1px solid rgba(28,25,23,0.10);
    padding: 64px 32px 56px;
    position: relative;
    overflow: hidden;
  }
  .pv-hero-inner { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
  .pv-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pv-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px; height: 1px;
    background: #B5883A;
  }
  .pv-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5vw, 58px);
    font-weight: 700;
    color: #1C1917;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .pv-hero-meta {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #57534E;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
  }
  .pv-hero-meta-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #B5883A;
    display: inline-block;
  }

  /* ── LAYOUT ── */
  .pv-body {
    max-width: 1280px;
    margin: 0 auto;
    padding: 64px 32px;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 64px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .pv-body { grid-template-columns: 1fr; gap: 32px; }
    .pv-toc { display: none; }
  }

  /* ── TABLE OF CONTENTS ── */
  .pv-toc {
    position: sticky;
    top: 88px;
  }
  .pv-toc-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    margin-bottom: 14px;
  }
  .pv-toc-item {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #57534E;
    padding: 8px 12px;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    border-left: 2px solid transparent;
    margin-bottom: 2px;
  }
  .pv-toc-item:hover {
    background: rgba(28,25,23,0.05);
    color: #1C1917;
    border-left-color: #B5883A;
  }

  /* ── CONTENT ── */
  .pv-content {}
  .pv-intro {
    background: #FAF6EC;
    border: 1px solid rgba(28,25,23,0.10);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 40px;
  }
  .pv-intro-text {
    font-family: 'Lora', serif;
    font-size: 16px;
    line-height: 1.85;
    color: #57534E;
  }

  .pv-section {
    margin-bottom: 48px;
    padding-bottom: 48px;
    border-bottom: 1px solid rgba(28,25,23,0.09);
  }
  .pv-section:last-of-type { border-bottom: none; }

  .pv-section-num {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    color: #B5883A;
    margin-bottom: 8px;
  }
  .pv-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    color: #1C1917;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .pv-section-text {
    font-family: 'Lora', serif;
    font-size: 15px;
    line-height: 1.85;
    color: #57534E;
  }
  .pv-section-text p + p { margin-top: 16px; }

  .pv-bullet-list {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .pv-bullet {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-family: 'Lora', serif;
    font-size: 15px;
    line-height: 1.7;
    color: #57534E;
  }
  .pv-bullet-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #B5883A;
    flex-shrink: 0;
    margin-top: 9px;
  }

  /* ── HIGHLIGHT BOX ── */
  .pv-highlight {
    background: rgba(181,136,58,0.07);
    border: 1px solid rgba(181,136,58,0.20);
    border-radius: 14px;
    padding: 20px 24px;
    margin-top: 20px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .pv-highlight-icon {
    font-size: 16px;
    color: #B5883A;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .pv-highlight-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    line-height: 1.65;
    color: #57534E;
  }

  /* ── CONTACT CARD ── */
  .pv-contact-card {
    background: #1C1917;
    border-radius: 20px;
    padding: 32px;
    color: #fff;
    margin-top: 48px;
  }
  .pv-contact-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .pv-contact-card-text {
    font-family: 'Lora', serif;
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255,255,255,0.65);
    margin-bottom: 20px;
  }
  .pv-contact-card-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.10);
    border: 1.5px solid rgba(255,255,255,0.18);
    color: #fff;
    padding: 10px 22px;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    text-decoration: none;
    transition: background 0.2s;
  }
  .pv-contact-card-link:hover { background: rgba(255,255,255,0.18); }
`

function PrivacyStyleInjector() {
  useEffect(() => {
    const id = 'pv-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = privacyCSS
      document.head.appendChild(style)
    }
  }, [])
  return null
}

const sections = [
  {
    num: '01',
    id: 'collection',
    title: 'Information We Collect',
    content: (
      <>
        <p>We collect only the information necessary to provide you with a great library experience. This includes:</p>
        <div className="pv-bullet-list">
          {[
            'Account information — your name, email address, and institution name provided at registration.',
            'Reading activity — books you view, borrow, or add to your reading list, and your reading progress.',
            'Device and usage data — browser type, pages visited, and interaction patterns to improve performance.',
            'Physical library interactions — book requests, due dates, and return records.',
          ].map(t => (
            <div key={t} className="pv-bullet">
              <span className="pv-bullet-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: '02',
    id: 'use',
    title: 'How We Use Your Data',
    content: (
      <>
        <p>Your data powers the core features of EduVault and helps us improve over time. Specifically, we use it to:</p>
        <div className="pv-bullet-list">
          {[
            'Authenticate your account and control access to books and platform features.',
            'Generate personalized book recommendations and study suggestions.',
            'Track reading progress, due dates, and library inventory accurately.',
            'Provide institutional administrators with anonymous, aggregated usage metrics.',
            'Diagnose technical issues and improve platform reliability.',
          ].map(t => (
            <div key={t} className="pv-bullet">
              <span className="pv-bullet-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="pv-highlight">
          <span className="pv-highlight-icon">✦</span>
          <span className="pv-highlight-text">
            Your personal reading data is never used for advertising purposes and is never shared with third-party marketers.
          </span>
        </div>
      </>
    ),
  },
  {
    num: '03',
    id: 'sharing',
    title: 'Data Sharing',
    content: (
      <div className="pv-section-text">
        <p>
          We do not sell your personal data. Period. We may share limited information
          only in the following circumstances:
        </p>
        <div className="pv-bullet-list">
          {[
            'With your institution — librarians and administrators can view book issue records and attendance logs for academic management.',
            'With service providers — trusted vendors who help operate our platform (e.g. cloud hosting) under strict data processing agreements.',
            'When required by law — in response to valid legal requests, court orders, or to protect the rights and safety of our users.',
          ].map(t => (
            <div key={t} className="pv-bullet">
              <span className="pv-bullet-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '04',
    id: 'rights',
    title: 'Your Rights',
    content: (
      <div className="pv-section-text">
        <p>You have meaningful control over your data. At any time, you may:</p>
        <div className="pv-bullet-list">
          {[
            'Request a copy of all personal data we hold about you.',
            'Correct inaccurate or incomplete information in your profile.',
            'Request deletion of your account and associated data, subject to any outstanding library obligations.',
            'Opt out of non-essential communications such as newsletters and recommendations.',
          ].map(t => (
            <div key={t} className="pv-bullet">
              <span className="pv-bullet-dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
        <div className="pv-highlight">
          <span className="pv-highlight-icon">◎</span>
          <span className="pv-highlight-text">
            To exercise any of these rights, email us at <strong>eduvault2026@gmail.com</strong>. We will respond within 30 days.
          </span>
        </div>
      </div>
    ),
  },
  {
    num: '05',
    id: 'security',
    title: 'Security',
    content: (
      <div className="pv-section-text">
        <p>
          We take security seriously. Your data is encrypted in transit using TLS and at rest
          using AES-256. Access to production databases is restricted, logged, and audited regularly.
        </p>
        <p>
          In the event of a data breach that affects your personal information, we will notify
          you and the relevant authorities within 72 hours in accordance with applicable law.
        </p>
      </div>
    ),
  },
  {
    num: '06',
    id: 'cookies',
    title: 'Cookies',
    content: (
      <div className="pv-section-text">
        <p>
          EduVault uses strictly necessary cookies to maintain your session and keep you logged in.
          We do not use advertising cookies or third-party tracking pixels.
        </p>
        <p>
          You can disable cookies in your browser settings, though this will prevent you from
          staying logged in to the platform.
        </p>
      </div>
    ),
  },
]

export default function Privacy() {
  return (
    <>
      <PrivacyStyleInjector />
      <div className="pv-root">
        <LandingHeader />

        {/* ── HERO ── */}
        <section className="pv-hero">
          <div style={{
            position: 'absolute', width: 360, height: 360,
            top: -100, right: -60, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(181,136,58,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="pv-hero-inner">
            <p className="pv-eyebrow">Legal</p>
            <h1 className="pv-hero-title">Privacy Policy</h1>
            <div className="pv-hero-meta">
              <span>Effective: January 1, 2025</span>
              <span className="pv-hero-meta-dot" />
              <span>Last updated: February 2026</span>
              <span className="pv-hero-meta-dot" />
              <span>Version 2.1</span>
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="pv-body">

          {/* TOC */}
          <aside className="pv-toc">
            <p className="pv-toc-label">On this page</p>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="pv-toc-item">
                {s.num} — {s.title}
              </a>
            ))}
          </aside>

          {/* Content */}
          <main className="pv-content">
            <div className="pv-intro">
              <p className="pv-intro-text">
                EduVault respects your privacy and is committed to protecting your personal data.
                This policy explains clearly what we collect, how we use it, and the rights you
                have over your information. We believe transparency is fundamental to trust.
              </p>
            </div>

            {sections.map(s => (
              <div key={s.id} id={s.id} className="pv-section">
                <div className="pv-section-num">{s.num}</div>
                <h2 className="pv-section-title">{s.title}</h2>
                <div className="pv-section-text">{s.content}</div>
              </div>
            ))}

            {/* Contact card */}
            <div className="pv-contact-card">
              <div className="pv-contact-card-title">Questions about this policy?</div>
              <p className="pv-contact-card-text">
                If you have any questions or concerns about how we handle your data,
                our privacy team is happy to help.
              </p>
              <Link to="/contact" className="pv-contact-card-link">
                Contact us →
              </Link>
            </div>
          </main>

        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(28,25,23,0.10)', background: '#E8E0C8' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: '#1C1917' }}>EduVault</span>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#57534E' }}>
              {['/', '/about', '/contact'].map((href, i) => (
                <Link key={href} to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {['Home', 'About', 'Contact'][i]}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
