import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const hamburgerCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .hm-overlay {
    position: fixed; inset: 0;
    background: rgba(28,25,23,0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 50;
    animation: hmOverlayIn 0.25s ease both;
  }
  @keyframes hmOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .hm-panel {
    position: fixed;
    right: 0; top: 0; bottom: 0;
    width: 320px;
    background: #F2ECD8;
    box-shadow: -20px 0 60px rgba(28,25,23,0.18);
    z-index: 51;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    animation: hmSlideIn 0.3s cubic-bezier(0.32,0.72,0,1) both;
  }
  @keyframes hmSlideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  .hm-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(28,25,23,0.10);
  }

  .hm-logo {
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 700;
    color: #1C1917;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .hm-logo-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #B5883A;
  }

  .hm-close {
    width: 34px; height: 34px;
    border-radius: 8px;
    border: 1.5px solid rgba(28,25,23,0.14);
    background: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 14px;
    color: #57534E;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .hm-close:hover {
    background: rgba(28,25,23,0.06);
    border-color: rgba(28,25,23,0.28);
    color: #1C1917;
  }

  .hm-body { padding: 16px 16px 24px; flex: 1; }

  .hm-section { margin-bottom: 4px; }

  .hm-section-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    padding: 14px 8px 6px;
    display: block;
  }

  .hm-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #57534E;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
  }
  .hm-item:hover {
    background: rgba(28,25,23,0.06);
    color: #1C1917;
  }
  .hm-item-icon {
    font-size: 13px;
    opacity: 0.45;
    width: 18px;
    text-align: center;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }
  .hm-item:hover .hm-item-icon { opacity: 0.75; }

  .hm-footer {
    padding: 20px 24px;
    border-top: 1px solid rgba(28,25,23,0.10);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hm-btn-signup {
    display: block;
    text-align: center;
    padding: 11px;
    background: #1C1917;
    color: #FFF;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.2s;
  }
  .hm-btn-signup:hover { background: #3D3630; }

  .hm-btn-login {
    display: block;
    text-align: center;
    padding: 10px;
    border: 1.5px solid rgba(28,25,23,0.14);
    color: #57534E;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }
  .hm-btn-login:hover {
    border-color: rgba(28,25,23,0.4);
    color: #1C1917;
    background: rgba(28,25,23,0.04);
  }

  .hm-accent-link {
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #B5883A;
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.15s;
    display: block;
    margin-top: 4px;
  }
  .hm-accent-link:hover { opacity: 1; text-decoration: underline; }
`

function HamburgerStyleInjector() {
  useEffect(() => {
    const id = 'hm-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = hamburgerCSS
      document.head.appendChild(style)
    }
  }, [])
  return null
}

const browseItems = [
  { icon: '✦', label: 'Subjects' },
  { icon: '↑', label: 'Trending' },
  { icon: '◎', label: 'Library Explorer' }
]

export default function HamburgerMenu({ open, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      <HamburgerStyleInjector />
      <div className="hm-overlay" onClick={onClose} />

      <aside className="hm-panel">
        <div className="hm-top">
          <Link to="/" className="hm-logo" onClick={onClose}>
            <span className="hm-logo-dot" />
            EduVault
          </Link>
          <button className="hm-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        <div className="hm-body">
          <div className="hm-section">
            <span className="hm-section-label">Browse</span>
            {browseItems.map(item => (
              <div key={item.label} className="hm-item" onClick={onClose}>
                <span className="hm-item-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="hm-footer">
          <Link to="/register" className="hm-btn-signup" onClick={onClose}>Sign up — it's free</Link>
          <Link to="/login" className="hm-btn-login" onClick={onClose}>Log in</Link>
          
          <Link to="/librarian-register" className="hm-accent-link" onClick={onClose}>
            Librarian registration →
          </Link>
          <Link to="/admin-login" className="hm-accent-link" onClick={onClose}>
            Admin login →
          </Link>
        </div>
      </aside>
    </>
  )
}