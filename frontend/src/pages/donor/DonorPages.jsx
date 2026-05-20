import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import HeatmapTable from '../../components/HeatmapTable'
import { donorAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export function DonorDashboard() {
  const { username } = useAuth()
  const [donations, setDonations] = useState(null)
  const [requests, setRequests] = useState(null)

  useEffect(() => {
    if (username) donorAPI.myDonations(username).then(r => setDonations(r.data)).catch(() => setDonations([]))
    donorAPI.requests().then(r => setRequests(r.data)).catch(() => setRequests([]))
  }, [username])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">⚡ DONOR COMMAND</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green)' }}>ID: {username}</div>
      </div>
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="My Donations" value={donations?.length} icon="▲" color="var(--green)" />
        <StatCard label="Open Requests" value={requests?.filter(r => r.status === 'OPEN').length} icon="◆" color="var(--orange)" sublabel="Awaiting donors" />
        <StatCard label="Delivered" value={donations?.filter(d => d.status === 'DELIVERED').length} icon="✓" color="var(--green)" sublabel="Confirmed" />
      </div>
      <div className="card">
        <div className="section-header">
          <span className="section-title">Recent My Donations</span>
          <div className="section-line" />
        </div>
        {donations === null ? <div style={{ textAlign: 'center', padding: '1rem' }}><span className="spinner" /></div> :
          donations.length === 0 ? <div className="empty-state">[ NO DONATIONS YET — START DONATING ]</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Item</th><th>Qty</th><th>Status</th><th>Request ID</th></tr></thead>
                <tbody>
                  {donations.slice(0, 5).map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{d.itemName}</td>
                      <td>{d.quantity}</td>
                      <td><span className={`badge badge-${d.status?.toLowerCase()}`}>{d.status}</span></td>
                      <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem' }}>{d.ngoRequestId?.slice(-8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </Layout>
  )
}

export function DonorRequests() {
  const { username } = useAuth()
  const [requests, setRequests] = useState(null)
  const [modal, setModal] = useState(null) // selected request
  const [form, setForm] = useState({ itemName: '', quantity: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { donorAPI.requests().then(r => setRequests(r.data)).catch(() => setRequests([])) }, [])

  const handleDonate = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      await donorAPI.donate(modal.id, username, { itemName: form.itemName, quantity: parseInt(form.quantity), status: 'PENDING', donatedAt: Date.now() })
      setMsg('✓ Donation submitted successfully!')
      setForm({ itemName: '', quantity: '' })
      setModal(null)
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.message || 'Donation failed.'))
    } finally { setLoading(false) }
  }

  const remaining = modal ? modal.quantityNeeded - modal.quantityReceived : 0

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◆ AID REQUESTS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>
          {requests ? `${requests.length} ACTIVE` : '...'}
        </div>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {/* Donate modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--black-2)', border: '1px solid var(--green)', borderTop: '3px solid var(--green)', padding: '2rem', width: '100%', maxWidth: 400, animation: 'fadeInUp 0.2s ease both' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--green)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>SUBMIT DONATION</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(57,255,20,0.5)', marginBottom: '1.25rem' }}>
              Request: <span style={{ color: 'var(--green)' }}>{modal.title}</span><br />
              Needs: {modal.resourceNeeded} · Remaining: <span style={{ color: 'var(--orange)' }}>{remaining}</span>
            </div>
            <form onSubmit={handleDonate}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input className="form-input" placeholder="e.g. Rice bags" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity (max {remaining})</label>
                <input className="form-input" type="number" min={1} max={remaining} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? 'SUBMITTING...' : '⚡ DONATE'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {requests === null ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">[ NO ACTIVE REQUESTS ]</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {requests.map((r, i) => {
            const pct = r.quantityNeeded ? Math.min((r.quantityReceived / r.quantityNeeded) * 100, 100) : 0
            return (
              <div key={i} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--green)', flex: 1 }}>{r.title}</div>
                  <span className={`badge badge-${r.status?.toLowerCase().replace('_', '-')}`}>{r.status}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(57,255,20,0.5)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                  {r.description?.slice(0, 80)}{r.description?.length > 80 ? '...' : ''}<br />
                  Resource: <span style={{ color: 'var(--green)' }}>{r.resourceNeeded}</span>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(57,255,20,0.45)', marginBottom: '0.3rem' }}>
                    <span>Progress</span><span>{r.quantityReceived}/{r.quantityNeeded}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--black-4)', borderRadius: '2px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setModal(r); setMsg('') }}>
                  ⚡ DONATE NOW
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}

export function DonorMyDonations() {
  const { username } = useAuth()
  const [data, setData] = useState(null)
  useEffect(() => {
    if (username) donorAPI.myDonations(username).then(r => setData(r.data)).catch(() => setData([]))
  }, [username])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">▲ MY DONATIONS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>
          {data ? `${data.length} TOTAL` : '...'}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">[ NO DONATIONS YET ]</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Item</th><th>Quantity</th><th>Status</th><th>Request ID</th><th>Donated At</th></tr></thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.itemName}</td>
                    <td>{d.quantity}</td>
                    <td><span className={`badge badge-${d.status?.toLowerCase()}`}>{d.status}</span></td>
                    <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem' }}>{d.ngoRequestId?.slice(-8)}</td>
                    <td style={{ fontSize: '0.72rem', color: 'rgba(57,255,20,0.5)' }}>
                      {d.donatedAt ? new Date(d.donatedAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export function DonorHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    donorAPI.heatmap().then(r => { setData(r.data); setLoading(false) }).catch(() => { setData([]); setLoading(false) })
  }, [])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◎ SEVERITY HEATMAP</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', animation: 'statusPulse 2s infinite' }}>● LIVE</div>
      </div>
      <div className="card"><HeatmapTable data={data} loading={loading} /></div>
    </Layout>
  )
}
