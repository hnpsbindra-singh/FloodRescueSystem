import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'

function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-media">
        <img
          src="/rescue-hero.png"
          alt="Flood Rescue"
          className="auth-media__image"
        />

        <div className="auth-media__overlay" />

        <div className="auth-media__copy">
          <div className="auth-eyebrow">
            FLOOD RESCUE SYSTEM
          </div>

          <h1>
            Coordinated
            <br />
            Disaster Response
          </h1>

          <p>
            Real-time flood reporting, NGO coordination, geo-tracking,
            emergency response and disaster resource management in one unified
            platform.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          {children}
        </div>
      </div>
    </div>
  )
}

export { AuthLayout }

export default function Login() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  }

  const ROLE_PATHS = {
    ADMIN: '/admin/dashboard',
    DONOR: '/donor/dashboard',
    NGO: '/ngo/dashboard',
    VICTIM: '/victim/dashboard',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const res = await authAPI.login(form)

      const token = res.data

      login(token)

      const payload = parseJwt(token)

      navigate(ROLE_PATHS[payload?.role] || '/login')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {/* HEADER */}
      <div style={{ marginBottom: '1.7rem' }}>
        <div
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.04em',
            marginBottom: '0.45rem',
          }}
        >
          Welcome Back
        </div>

        <div
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
        >
          Sign in to access emergency operations dashboard.
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            padding: '0.85rem',
            borderRadius: '12px',
            marginBottom: '1.2rem',
            color: '#f87171',
            fontSize: '0.84rem',
          }}
        >
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        {/* USERNAME */}
        <div style={{ marginBottom: '1rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.84rem',
            }}
          >
            Email / Username
          </label>

          <input
            type="text"
            placeholder="operator@domain.com"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
            style={{
              width: '100%',
              background: '#101915',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              outline: 'none',
              fontSize: '0.92rem',
            }}
          />
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.84rem',
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
            style={{
              width: '100%',
              background: '#101915',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              padding: '0.9rem 1rem',
              borderRadius: '14px',
              outline: 'none',
              fontSize: '0.92rem',
            }}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            border: 'none',
            padding: '0.95rem',
            borderRadius: '14px',
            background:
              'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: '0.25s',
            boxShadow: '0 10px 30px rgba(34,197,94,0.25)',
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* FOOTER */}
      <div
        style={{
          marginTop: '1.2rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
        }}
      >
        <Link
          to="/register"
          style={{
            color: '#4ade80',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Create account
        </Link>

        <Link
          to="/forgot-password"
          style={{
            color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none',
          }}
        >
          Forgot password?
        </Link>
      </div>

      {/* ALERT */}
      <div
        style={{
          marginTop: '1.5rem',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.16)',
          padding: '0.9rem',
          borderRadius: '14px',
          color: 'rgba(255,255,255,0.58)',
          fontSize: '0.74rem',
          lineHeight: 1.6,
        }}
      >
        ⚠ For life-threatening emergencies, contact local authorities
        immediately instead of waiting for digital response systems.
      </div>
    </AuthLayout>
  )
}
