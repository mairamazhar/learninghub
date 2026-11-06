import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './AdminLayout.css'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/students', label: 'Students', icon: 'students' },
  { to: '/courses', label: 'Courses', icon: 'courses' },
]

const TITLES = Object.fromEntries(NAV.map((n) => [n.to, n.label]))

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer only
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close on Escape; close user menu on outside click
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        setMenuOpen(false)
      }
    }
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <aside id="sidebar" className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Primary">
        <div className="sidebar__brand">
          <Icon name="cap" size={26} />
          <span>Northfield<small>Admin Portal</small></span>
          <button
            type="button"
            className="icon-btn sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__label">Menu</p>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className="sidebar__link" onClick={() => setSidebarOpen(false)}>
              <Icon name={icon} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button type="button" className="sidebar__link" onClick={handleLogout}>
            <Icon name="logout" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="shell__scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <div className="shell__body">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn topbar__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <Icon name="menu" />
          </button>

          <h2 className="topbar__title">{TITLES[pathname] ?? 'Admin'}</h2>

          <div className="topbar__search">
            <Icon name="search" size={18} />
            <input type="search" placeholder="Search students, courses…" aria-label="Search" />
          </div>

          <button type="button" className="icon-btn topbar__bell" aria-label="Notifications (3 unread)">
            <Icon name="bell" />
            <span className="topbar__dot" aria-hidden="true" />
          </button>

          <div className="usermenu" ref={menuRef}>
            <button
              type="button"
              className="usermenu__trigger"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="usermenu__avatar" aria-hidden="true">{getInitials(user.name)}</span>
              <span className="usermenu__who">
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </span>
            </button>
            {menuOpen && (
              <div className="usermenu__panel" role="menu">
                <p className="usermenu__email">{user.email}</p>
                <button type="button" role="menuitem" onClick={handleLogout}>
                  <Icon name="logout" size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        <main id="main" className="shell__main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
