import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import HeatmapTable from '../../components/HeatmapTable'
import LocationPicker from '../../components/LocationPicker'
import { victimAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export function VictimDashboard() {
  const { username } = useAuth()
  const [reports, setReports] = useState(null)

  useEffect(() => {
    if (username) victimAPI.myReports(username).then(r => setReports(r.data)).catch(() => setReports([]))
  }, [username])

  const avgSeverity = reports?.length
    ? (reports.reduce((a, b) => a + (b.severityScore || 0), 0) / reports.length).toFixed(1)
    : 0

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">⚠ VICTIM PORTAL</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--orange)' }}>ID: {username}</div>
      </div>

      <div style={{
        background: 'rgba(255,45,45,0.06)',
        border: '1px solid rgba(255,45,45,0.4)',
        borderLeft: '4px solid var(--red)',
        padding: '0.85rem 1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--red)',
        marginBottom: '1.5rem',
        lineHeight: 1.6,
      }}>
        ⚠ EMERGENCY: If you are in immediate danger, please contact local authorities.<br />
        Use this portal to report flood incidents and help coordinate rescue operations.
      </div>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="My Reports" value={reports?.length} icon="◉" color="var(--orange)" />
        <StatCard label="Avg Severity" value={avgSeverity} icon="▲" color={avgSeverity >= 8 ? 'var(--red)' : avgSeverity >= 5 ? 'var(--orange)' : 'var(--green)'} sublabel="Out of 10" />
        <StatCard label="Critical Reports" value={reports?.filter(r => r.severityScore >= 8).length} icon="⚠" color="var(--red)" />
      </div>

      <div className="card">
        <div className="section-header">
          <span className="section-title">My Recent Reports</span>
          <div className="section-line" />
        </div>
        {reports === null ? <div style={{ textAlign: 'center', padding: '1rem' }}><span className="spinner" /></div> :
          reports.length === 0 ? <div className="empty-state">[ NO REPORTS FILED ]</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reports.slice(0, 5).map((r, i) => (
                <div key={i} style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--black-3)',
                  border: '1px solid var(--green-dark)',
                  borderLeft: `3px solid ${r.severityScore >= 8 ? 'var(--red)' : r.severityScore >= 5 ? 'var(--orange)' : 'var(--green)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(57,255,20,0.45)', marginTop: '0.2rem' }}>
                      {r.description?.slice(0, 60)}...
                    </div>
                  </div>
                  <span className={`badge ${r.severityScore >= 8 ? 'badge-critical' : r.severityScore >= 6 ? 'badge-high' : r.severityScore >= 4 ? 'badge-medium' : 'badge-low'}`}>
                    {r.severityScore}/10
                  </span>
                </div>
              ))}
            </div>
          )}
      </div>
    </Layout>
  )
}

export function VictimReport() {
  const { username } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', latitude: '', longitude: '', severityScore: 5 })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLocationChange = (lat, lng) => {
    setForm(f => ({ ...f, latitude: lat, longitude: lng }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      await victimAPI.createReport(username, {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        severityScore: parseInt(form.severityScore),
      })
      setMsg('✓ Flood report submitted! Rescue teams have been notified.')
      setForm({ title: '', description: '', latitude: '', longitude: '', severityScore: 5 })
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.message || 'Failed to submit report.'))
    } finally { setLoading(false) }
  }

  const severityColor = form.severityScore >= 8 ? 'var(--red)' : form.severityScore >= 5 ? 'var(--orange)' : 'var(--green)'
  const severityLabel = form.severityScore >= 8 ? 'CRITICAL' : form.severityScore >= 6 ? 'HIGH' : form.severityScore >= 4 ? 'MEDIUM' : 'LOW'

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">⚠ REPORT FLOOD INCIDENT</div>
      </div>

      <div style={{ maxWidth: 640 }}>
        {msg && <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        <div className="card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>
            &gt; EMERGENCY INCIDENT REPORT — PROVIDE ACCURATE INFORMATION
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Incident Title</label>
              <input className="form-input" placeholder="e.g. Severe flooding in sector 4" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Describe the flood situation in detail..." rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} required />
            </div>

            {/* GPS + Map Location Picker */}
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={handleLocationChange}
              label="INCIDENT LOCATION — GPS / MAP PIN / MANUAL"
            />

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Severity Score (1–10)</span>
                <span style={{ color: severityColor, fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700 }}>
                  {form.severityScore}/10 — {severityLabel}
                </span>
              </label>
              <input
                type="range" min={1} max={10} step={1}
                value={form.severityScore}
                onChange={e => setForm({ ...form, severityScore: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: severityColor, cursor: 'pointer', height: '20px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(57,255,20,0.3)', marginTop: '0.2rem' }}>
                <span>1 — LOW</span><span>5 — MEDIUM</span><span>8 — HIGH</span><span>10 — CRITICAL</span>
              </div>
            </div>

            <button type="submit" className="btn btn-danger" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> SUBMITTING...</> : '🚨 SUBMIT EMERGENCY REPORT'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export function VictimMyReports() {
  const { username } = useAuth()
  const [data, setData] = useState(null)
  useEffect(() => {
    if (username) victimAPI.myReports(username).then(r => setData(r.data)).catch(() => setData([]))
  }, [username])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◆ MY FLOOD REPORTS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>{data ? `${data.length} FILED` : '...'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1' }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>[ NO REPORTS FILED ]</div>
        ) : data.map((r, i) => (
          <div key={i} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green)', flex: 1 }}>{r.title}</div>
              <span className={`badge ${r.severityScore >= 8 ? 'badge-critical' : r.severityScore >= 6 ? 'badge-high' : r.severityScore >= 4 ? 'badge-medium' : 'badge-low'}`}>
                {r.severityScore}/10
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(57,255,20,0.5)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
              {r.description?.slice(0, 100)}{r.description?.length > 100 ? '...' : ''}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(57,255,20,0.3)' }}>
              ID: {r.id?.slice(-10)}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export function VictimHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    victimAPI.heatmap().then(r => { setData(r.data); setLoading(false) }).catch(() => { setData([]); setLoading(false) })
  }, [])
  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◎ DANGER ZONE MAP</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', animation: 'statusPulse 2s infinite' }}>● LIVE</div>
      </div>
      <div className="card"><HeatmapTable data={data} loading={loading} /></div>
    </Layout>
  )
}
