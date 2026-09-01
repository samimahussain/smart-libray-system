import { useState } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from './HamburgerMenu';

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <>
      <header style={{ 
        height: '80px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 32px',
        background: 'var(--parchment)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        {/* LEFT: Brand */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '22px', 
            fontWeight: '700', 
            color: 'var(--ink)',
            letterSpacing: '-0.02em'
          }}>
            EduVault
          </span>
        </Link>

        {/* MIDDLE: Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/login" style={navLinkStyle}>My Books</Link>
          
          {/* Browse Dropdown/Link Concept */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setIsMenuOpen(true)}>
            <span style={navLinkStyle}>Browse</span>
            <span style={{ fontSize: '10px', color: 'var(--ink-soft)' }}>▼</span>
          </div>

          <Link to="/about" style={navLinkStyle}>About</Link>
          <Link to="/contact" style={navLinkStyle}>Contact</Link>
          <Link to="/privacy" style={navLinkStyle}>Privacy</Link>
        </nav>

        {/* RIGHT: Auth & Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={navLinkStyle}>Log In</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                Sign Up
              </Link>
            </>
          ) : (
            <Link to="/user" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              Dashboard
            </Link>
          )}

          {/* Hamburger Trigger */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            style={{
              background: 'none',
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              marginLeft: '8px'
            }}
          >
            <span style={hamburgerBarStyle} />
            <span style={hamburgerBarStyle} />
            <span style={hamburgerBarStyle} />
          </button>
        </div>
      </header>

      <HamburgerMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

const navLinkStyle = {
  textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--ink-soft)',
  transition: 'color 0.2s'
};

const hamburgerBarStyle = {
  display: 'block',
  width: '20px',
  height: '2px',
  background: 'var(--ink)',
  borderRadius: '1px'
};