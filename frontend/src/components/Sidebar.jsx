import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '⊞' },
    { label: 'Flood Reports', path: '/admin/reports', icon: '◉' },
    { label: 'NGO Requests', path: '/admin/ngo-requests', icon: '◆' },
    { label: 'Donations', path: '/admin/donations', icon: '▲' },
    { label: 'Heatmap', path: '/admin/heatmap', icon: '◎' },
  ],
  DONOR: [
    { label: 'Dashboard', path: '/donor/dashboard', icon: '⊞' },
    { label: 'Aid Requests', path: '/donor/requests', icon: '◆' },
    { label: 'My Donations', path: '/donor/my-donations', icon: '▲' },
    { label: 'Heatmap', path: '/donor/heatmap', icon: '◎' },
  ],
  NGO: [
    { label: 'Dashboard', path: '/ngo/dashboard', icon: '⊞' },
    { label: 'Create Request', path: '/ngo/create-request', icon: '◉' },
    { label: 'My Requests', path: '/ngo/my-requests', icon: '◆' },
    { label: 'Incoming Donations', path: '/ngo/donations', icon: '▲' },
    { label: 'Heatmap', path: '/ngo/heatmap', icon: '◎' },
  ],
  VICTIM: [
    { label: 'Dashboard', path: '/victim/dashboard', icon: '⊞' },
    { label: 'Report Flood', path: '/victim/report', icon: '⚠' },
    { label: 'My Reports', path: '/victim/my-reports', icon: '◆' },
    { label: 'Heatmap', path: '/victim/heatmap', icon: '◎' },
  ],
}

const ROLE_COLORS = { ADMIN: '#e05252', DONOR: '#3ddc6e', NGO: '#c9b84a', VICTIM: '#d4854a' }

export default function Sidebar() {
  const { role, username, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const items = NAV_ITEMS[role] || []
  const roleColor = ROLE_COLORS[role] || 'var(--green)'

  return (
    <div className="sidebar" style={{ paddingTop: '28px' }}>
      {/* Brand */}
      <div style={{ padding: '1.2rem 1.25rem 1rem', borderBottom: '1px solid var(--green-dark)' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          Flood Rescue
        </div>
        <div style={{ fontSize: '0.65rem', color: 'rgba(212,237,216,0.3)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          {time.toLocaleTimeString('en-IN', { hour12: false })}
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--green-dark)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: roleColor, flexShrink: 0 }} />
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: roleColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{role}</div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(212,237,216,0.4)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {username}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0' }}>
        {items.map(item => {
          const active = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                width: '100%', padding: '0.62rem 1.25rem',
                background: active ? 'rgba(61,220,110,0.07)' : 'transparent',
                border: 'none',
                borderLeft: active ? '2px solid var(--green)' : '2px solid transparent',
                color: active ? 'var(--white)' : 'rgba(212,237,216,0.4)',
                fontSize: '0.83rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.12s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(212,237,216,0.75)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(212,237,216,0.4)' }}
            >
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--green-dark)' }}>
        <button onClick={() => { logout(); navigate('/login') }}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center', color: 'rgba(212,237,216,0.45)', borderColor: 'var(--green-dark)' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
