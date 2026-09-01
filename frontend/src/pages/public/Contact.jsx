import { useEffect, useState } from 'react'
import LandingHeader from './LandingHeader'
import { Link } from 'react-router-dom'

const contactCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .ct-root {
    min-height: 100vh;
    background: #F2ECD8;
    color: #1C1917;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── HERO ── */
  .ct-hero {
    background: #E8E0C8;
    border-bottom: 1px solid rgba(28,25,23,0.10);
    padding: 72px 32px 64px;
    position: relative;
    overflow: hidden;
  }
  .ct-hero-inner { max-width: 1280px; margin: 0 auto; position: relative; z-index: 1; }
  .ct-eyebrow {
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
  .ct-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px; height: 1px;
    background: #B5883A;
  }
  .ct-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(36px, 5vw, 60px);
    font-weight: 700;
    color: #1C1917;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .ct-hero-sub {
    font-family: 'Lora', serif;
    font-size: 16px;
    color: #57534E;
    line-height: 1.7;
    max-width: 480px;
  }

  /* ── LAYOUT ── */
  .ct-body {
    max-width: 1280px;
    margin: 0 auto;
    padding: 64px 32px;
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 64px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .ct-body { grid-template-columns: 1fr; gap: 40px; }
  }

  /* ── SIDEBAR ── */
  .ct-sidebar {}
  .ct-sidebar-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    margin-bottom: 20px;
  }
  .ct-contact-method {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid rgba(28,25,23,0.08);
  }
  .ct-contact-method:last-of-type { border-bottom: none; }
  .ct-method-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: rgba(28,25,23,0.06);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    color: #B5883A;
  }
  .ct-method-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #1C1917;
    margin-bottom: 3px;
  }
  .ct-method-value {
    font-family: 'Lora', serif;
    font-size: 14px;
    color: #57534E;
    line-height: 1.5;
  }

  .ct-hours {
    margin-top: 32px;
    background: #FAF6EC;
    border: 1px solid rgba(28,25,23,0.10);
    border-radius: 16px;
    padding: 24px;
  }
  .ct-hours-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: #1C1917;
    margin-bottom: 14px;
  }
  .ct-hours-row {
    display: flex;
    justify-content: space-between;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #57534E;
    padding: 6px 0;
    border-bottom: 1px solid rgba(28,25,23,0.06);
  }
  .ct-hours-row:last-child { border-bottom: none; }
  .ct-hours-day { font-weight: 500; color: #1C1917; }

  /* ── FORM ── */
  .ct-form-card {
    background: #FAF6EC;
    border: 1px solid rgba(28,25,23,0.10);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 4px 24px rgba(28,25,23,0.06);
  }
  .ct-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    color: #1C1917;
    margin-bottom: 6px;
  }
  .ct-form-subtitle {
    font-family: 'Lora', serif;
    font-size: 14px;
    color: #57534E;
    margin-bottom: 32px;
  }
  .ct-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (max-width: 500px) {
    .ct-field-row { grid-template-columns: 1fr; }
    .ct-form-card { padding: 24px; }
  }
  .ct-field { display: flex; flex-direction: column; margin-bottom: 16px; }
  .ct-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #57534E;
    letter-spacing: 0.04em;
    margin-bottom: 7px;
  }
  .ct-input {
    background: #fff;
    border: 1.5px solid rgba(28,25,23,0.12);
    border-radius: 12px;
    padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1C1917;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    resize: none;
    width: 100%;
  }
  .ct-input::placeholder { color: #A8A29E; }
  .ct-input:focus {
    border-color: #B5883A;
    box-shadow: 0 0 0 3px rgba(181,136,58,0.12);
  }
  .ct-select-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .ct-select {
    background: #fff;
    border: 1.5px solid rgba(28,25,23,0.12);
    border-radius: 12px;
    padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1C1917;
    outline: none;
    transition: border-color 0.2s;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%2357534E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .ct-select:focus { border-color: #B5883A; }

  .ct-submit {
    width: 100%;
    padding: 14px;
    background: #1C1917;
    color: #FFF;
    border: none;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.2s, transform 0.15s;
    letter-spacing: 0.02em;
  }
  .ct-submit:hover { background: #3D3630; transform: translateY(-1px); }
  .ct-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .ct-success {
    text-align: center;
    padding: 40px 20px;
    animation: fadeUpAbout 0.5s ease both;
  }
  .ct-success-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: rgba(181,136,58,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin: 0 auto 20px;
    color: #B5883A;
  }
  .ct-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    color: #1C1917;
    margin-bottom: 10px;
  }
  .ct-success-text {
    font-family: 'Lora', serif;
    font-size: 15px;
    color: #57534E;
    line-height: 1.7;
  }

  @keyframes fadeUpAbout {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function ContactStyleInjector() {
  useEffect(() => {
    const id = 'ct-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = contactCSS
      document.head.appendChild(style)
    }
  }, [])
  return null
}

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1200)
  }

  return (
    <>
      <ContactStyleInjector />
      <div className="ct-root">
        <LandingHeader />

        {/* ── HERO ── */}
        <section className="ct-hero">
          <div style={{
            position: 'absolute', width: 400, height: 400,
            top: -120, right: -60, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(181,136,58,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="ct-hero-inner">
            <p className="ct-eyebrow">Get in touch</p>
            <h1 className="ct-hero-title">We'd love to hear<br />from you.</h1>
            <p className="ct-hero-sub">
              Have questions about EduVault or want to bring it to your institution?
              Reach out — we typically respond within one business day.
            </p>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="ct-body">

          {/* Sidebar */}
          <div className="ct-sidebar">
            <p className="ct-sidebar-label">Ways to reach us</p>

            {[
              { icon: '✉', title: 'Email', value: 'eduvault2026@gmail.com' },
              { icon: '◎', title: 'Institutions', value: 'eduvault2026@gmail.com' },
              { icon: '⊞', title: 'Support', value: '+91 9888879232' },
            ].map(m => (
              <div key={m.title} className="ct-contact-method">
                <div className="ct-method-icon">{m.icon}</div>
                <div>
                  <div className="ct-method-title">{m.title}</div>
                  <div className="ct-method-value">{m.value}</div>
                </div>
              </div>
            ))}

            <div className="ct-hours">
              <div className="ct-hours-title">Support Hours</div>
              {[
                ['Monday – Friday', '9am – 6pm'],
                ['Saturday', '10am – 4pm'],
                ['Sunday', 'Closed'],
              ].map(([day, time]) => (
                <div key={day} className="ct-hours-row">
                  <span className="ct-hours-day">{day}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="ct-form-card">
            {sent ? (
              <div className="ct-success">
                <div className="ct-success-icon">✦</div>
                <div className="ct-success-title">Message sent!</div>
                <p className="ct-success-text">
                  Thanks for reaching out. We'll get back to you within one business day.
                </p>
              </div>
            ) : (
              <>
                <div className="ct-form-title">Send us a message</div>
                <div className="ct-form-subtitle">Fill out the form and we'll be in touch shortly.</div>

                <form onSubmit={handleSubmit}>
                  <div className="ct-field-row">
                    <div className="ct-field">
                      <label className="ct-label">First name</label>
                      <input className="ct-input" placeholder="Jane" required />
                    </div>
                    <div className="ct-field">
                      <label className="ct-label">Last name</label>
                      <input className="ct-input" placeholder="Smith" required />
                    </div>
                  </div>

                  <div className="ct-field">
                    <label className="ct-label">Email address</label>
                    <input type="email" className="ct-input" placeholder="jane@school.edu" required />
                  </div>

                  <div className="ct-select-row">
                    <div className="ct-field" style={{ marginBottom: 0 }}>
                      <label className="ct-label">I am a…</label>
                      <select className="ct-select">
                        <option>Student</option>
                        <option>Librarian</option>
                        <option>Administrator</option>
                        <option>Researcher</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="ct-field" style={{ marginBottom: 0 }}>
                      <label className="ct-label">Topic</label>
                      <select className="ct-select">
                        <option>General inquiry</option>
                        <option>Partnership</option>
                        <option>Technical support</option>
                        <option>Pricing</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="ct-field" style={{ marginTop: 16 }}>
                    <label className="ct-label">Message</label>
                    <textarea
                      className="ct-input"
                      rows={5}
                      placeholder="Tell us how we can help…"
                      required
                    />
                  </div>

                  <button type="submit" className="ct-submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send message →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(28,25,23,0.10)', background: '#E8E0C8' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: '#1C1917' }}>EduVault</span>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#57534E' }}>
              {['/', '/about', '/privacy'].map((href, i) => (
                <Link key={href} to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {['Home', 'About', 'Privacy'][i]}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
