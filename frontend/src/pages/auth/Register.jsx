import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { AuthLayout } from './Login'

export default function Register() {
  const [form, setForm] = useState({ Name: '', username: '', password: '', role: 'VICTIM' })
  const [step, setStep] = useState('register')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await authAPI.register(form)
      await authAPI.sendOtp(form.username)
      setStep('verify')
      setSuccess('Account created. Check your email for the verification code.')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await authAPI.verifyOtp(form.username, otp)
      setSuccess('Email verified! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally { setLoading(false) }
  }

  const ROLES = [
    { value: 'VICTIM', label: 'Victim', desc: 'Report flood incidents' },
    { value: 'DONOR', label: 'Donor', desc: 'Donate resources' },
    { value: 'NGO', label: 'NGO', desc: 'Coordinate relief' },
    { value: 'ADMIN', label: 'ADMIN', desc: 'View All operations' }
  ]

  return (
    <AuthLayout>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          {step === 'register' ? 'Create account' : 'Verify email'}
        </div>
        <div style={{ fontSize: '0.84rem', color: 'rgba(212,237,216,0.4)' }}>
          {step === 'register' ? 'Join the flood relief network' : `Code sent to ${form.username}`}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {step === 'register' ? (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="John Doe" value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: '0.95rem' }}>
            <label className="form-label">I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.45rem' }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    padding: '0.48rem 0.45rem',
                    background: form.role === r.value ? 'rgba(61,220,110,0.12)' : 'var(--black-3)',
                    border: `1px solid ${form.role === r.value ? 'var(--green-dim)' : 'var(--green-dark)'}`,
                    borderRadius: '7px', cursor: 'pointer', textAlign: 'center',
                    color: form.role === r.value ? 'var(--green)' : 'rgba(212,237,216,0.45)',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: '0.62rem', opacity: 0.7, lineHeight: 1.25 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.88rem' }}>
            {loading ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Creating...</> : 'Create Account'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Verification Code</label>
            <input className="form-input" placeholder="000000" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value)} required
              style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.3rem', padding: '0.7rem' }} />
            <div style={{ fontSize: '0.72rem', color: 'rgba(212,237,216,0.3)', marginTop: '0.3rem' }}>
              Enter the 6-digit code from your email
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.88rem' }}>
            {loading ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Verifying...</> : 'Verify Email'}
          </button>
          <button type="button" onClick={() => authAPI.sendOtp(form.username)}
            style={{ background: 'none', border: 'none', color: 'rgba(212,237,216,0.35)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.75rem', width: '100%', textAlign: 'center' }}>
            Resend code
          </button>
        </form>
      )}

      <div style={{ marginTop: '0.8rem', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(212,237,216,0.35)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
      </div>
    </AuthLayout>
  )
}
