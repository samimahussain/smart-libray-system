import { Link } from 'react-router-dom'

export default function HamburgerMenu({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">

      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* PANEL */}
      <aside className="absolute right-0 top-0 h-full w-80 bg-[#F5F1E4] shadow-xl p-6 overflow-y-auto">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="text-xl mb-6"
        >
          ✕
        </button>

        {/* SECTIONS */}
        <Section title="Browse">
          <Item>Subjects</Item>
          <Item>Trending</Item>
          <Item>Library Explorer</Item>
          <Item>Lists</Item>
          <Item>Collections</Item>
          <Item>K-12 Student Library</Item>
          <Item>Advanced Search</Item>
        </Section>

        <Section title="Contribute">
          <Item>Add a Book</Item>
          <Item>Recent Community Edits</Item>
        </Section>

        <Section title="Resources">
          <Item>Help & Support</Item>
          
        </Section>

        <Section title="Account">
          <LinkItem to="/login">Log In</LinkItem>
          <LinkItem to="/register">Sign Up</LinkItem>
          <LinkItem to="/librarian-register">Librarian Register</LinkItem>
        </Section>
      </aside>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}

function Item({ children }) {
  return (
    <div className="hover:underline cursor-pointer">
      {children}
    </div>
  )
}

function LinkItem({ to, children }) {
  return (
    <Link to={to} className="block hover:underline">
      {children}
    </Link>
  )
}
