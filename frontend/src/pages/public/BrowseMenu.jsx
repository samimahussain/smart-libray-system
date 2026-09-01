import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const browseCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  .bm-panel {
    width: 220px;
    background: #FAF6EC;
    border: 1px solid rgba(28,25,23,0.10);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(28,25,23,0.14), 0 4px 16px rgba(28,25,23,0.08);
    overflow: hidden;
    padding: 8px;
  }

  .bm-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #B5883A;
    padding: 10px 12px 6px;
    display: block;
  }

  .bm-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: #57534E;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    text-decoration: none;
  }
  .bm-item:hover {
    background: rgba(28,25,23,0.06);
    color: #1C1917;
  }
  .bm-item:hover .bm-item-icon { opacity: 1; }

  .bm-item-icon {
    font-size: 14px;
    opacity: 0.4;
    transition: opacity 0.15s;
    flex-shrink: 0;
    width: 18px;
    text-align: center;
  }

  .bm-item-badge {
    margin-left: auto;
    font-size: 10px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    background: rgba(181,136,58,0.15);
    color: #B5883A;
    padding: 2px 7px;
    border-radius: 100px;
  }
`

function BrowseStyleInjector() {
  useEffect(() => {
    const id = 'bm-styles'
    if (!document.getElementById(id)) {
      const style = document.createElement('style')
      style.id = id
      style.textContent = browseCSS
      document.head.appendChild(style)
    }
  }, [])
  return null
}

const browseItems = [
  { icon: '✦', label: 'Subjects',          to: '/library?filter=subjects' },
  { icon: '↑', label: 'Trending',          to: '/library?filter=trending', badge: 'Hot' },
  { icon: '◎', label: 'Library Explorer',  to: '/library' },
]

export default function BrowseMenu() {
  return (
    <>
      <BrowseStyleInjector />
      <div className="bm-panel">
        <span className="bm-label">Browse</span>
        {browseItems.map(item => (
          <Link key={item.label} to={item.to} className="bm-item">
            <span className="bm-item-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="bm-item-badge">{item.badge}</span>}
          </Link>
        ))}
      </div>
    </>
  )
}