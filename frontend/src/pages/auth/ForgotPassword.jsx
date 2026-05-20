import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { AuthLayout } from './Login'

export default function ForgotPassword() {
  const [step, setStep] = useState('email')
  const [username, setUsername] = useState('')
  const [form, setForm] = useState({ OTP: '', newpassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await authAPI.sendResetOtp(username)
      setStep('reset')
      setSuccess('Reset code sent to your email.')
    } catch { setError('Could not send reset code. Check the email address.') }
    finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await authAPI.resetPassword({ username, ...form })
      setSuccess('Password updated successfully!')
      setTimeout(() => navigate('/login'), 1500)
    } catch { setError('Invalid or expired code.') }
    finally { setLoading(false) }
  }

  return (
    <AuthLayout>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
          Reset password
        </div>
        <div style={{ fontSize: '0.84rem', color: 'rgba(212,237,216,0.4)' }}>
          {step === 'email' ? "We'll send a reset code to your email" : `Code sent to ${username}`}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {step === 'email' ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.88rem' }}>
            {loading ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Sending...</> : 'Send Reset Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <div className="form-group">
            <label className="form-label">Reset Code</label>
            <input className="form-input" placeholder="000000" maxLength={6} value={form.OTP}
              onChange={e => setForm({ ...form, OTP: e.target.value })} required
              style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.2rem', padding: '0.65rem' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.newpassword} onChange={e => setForm({ ...form, newpassword: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '0.88rem' }}>
            {loading ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Updating...</> : 'Update Password'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(212,237,216,0.35)' }}>
        <Link to="/login" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>← Back to sign in</Link>
      </div>
    </AuthLayout>
  )
}
