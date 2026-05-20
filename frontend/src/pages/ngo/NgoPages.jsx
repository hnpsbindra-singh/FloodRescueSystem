import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import HeatmapTable from '../../components/HeatmapTable'
import LocationPicker from '../../components/LocationPicker'
import { ngoAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export function NgoDashboard() {
  const { username } = useAuth()
  const [requests, setRequests] = useState(null)
  const [donations, setDonations] = useState(null)

  useEffect(() => {
    if (username) {
      ngoAPI.myRequests(username).then(r => setRequests(r.data)).catch(() => setRequests([]))
      ngoAPI.availableDonations(username).then(r => setDonations(r.data)).catch(() => setDonations([]))
    }
  }, [username])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">⚡ NGO COMMAND</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--yellow)' }}>ID: {username}</div>
      </div>
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="My Requests" value={requests?.length} icon="◆" color="var(--yellow)" />
        <StatCard label="Open Requests" value={requests?.filter(r => r.status === 'OPEN').length} icon="◉" color="var(--orange)" />
        <StatCard label="Pending Donations" value={donations?.length} icon="▲" color="var(--green)" sublabel="Awaiting action" />
        <StatCard label="Completed" value={requests?.filter(r => r.status === 'COMPLETED').length} icon="✓" color="var(--green)" />
      </div>
      <div className="card">
        <div className="section-header">
          <span className="section-title">My Active Requests</span>
          <div className="section-line" />
        </div>
        {requests === null ? <div style={{ textAlign: 'center', padding: '1rem' }}><span className="spinner" /></div> :
          requests.length === 0 ? <div className="empty-state">[ NO REQUESTS — CREATE ONE ]</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Title</th><th>Resource</th><th>Needed</th><th>Received</th><th>Status</th></tr></thead>
                <tbody>
                  {requests.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.title}</td>
                      <td>{r.resourceNeeded}</td>
                      <td>{r.quantityNeeded}</td>
                      <td style={{ color: r.quantityReceived >= r.quantityNeeded ? 'var(--green)' : 'var(--orange)' }}>{r.quantityReceived}</td>
                      <td><span className={`badge badge-${r.status?.toLowerCase().replace('_', '-')}`}>{r.status}</span></td>
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

export function NgoCreateRequest() {
  const { username } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', resourceNeeded: '', quantityNeeded: '', latitude: '', longitude: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLocationChange = (lat, lng) => {
    setForm(f => ({ ...f, latitude: lat, longitude: lng }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    try {
      await ngoAPI.createRequest(username, {
        ...form,
        quantityNeeded: parseInt(form.quantityNeeded),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      })
      setMsg('✓ Request created successfully!')
      setForm({ title: '', description: '', resourceNeeded: '', quantityNeeded: '', latitude: '', longitude: '' })
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.message || 'Failed to create request.'))
    } finally { setLoading(false) }
  }

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◉ CREATE RESOURCE REQUEST</div>
      </div>
      <div style={{ maxWidth: 640 }}>
        {msg && <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Request Title</label>
              <input className="form-input" placeholder="e.g. Emergency Food Supply" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Describe the situation and needs..." rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Resource Needed</label>
                <input className="form-input" placeholder="e.g. Rice, Water, Medicine" value={form.resourceNeeded} onChange={e => setForm({ ...form, resourceNeeded: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Needed</label>
                <input className="form-input" type="number" min={1} placeholder="e.g. 500" value={form.quantityNeeded} onChange={e => setForm({ ...form, quantityNeeded: e.target.value })} required />
              </div>
            </div>

            {/* GPS + Map Location Picker */}
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              onChange={handleLocationChange}
              label="REQUEST LOCATION — GPS / MAP PIN / MANUAL"
            />

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> SUBMITTING...</> : '⚡ SUBMIT REQUEST'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export function NgoMyRequests() {
  const { username } = useAuth()
  const [data, setData] = useState(null)
  useEffect(() => {
    if (username) ngoAPI.myRequests(username).then(r => setData(r.data)).catch(() => setData([]))
  }, [username])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◆ MY REQUESTS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>{data ? `${data.length} REQUESTS` : '...'}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1/-1' }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>[ NO REQUESTS — CREATE YOUR FIRST ONE ]</div>
        ) : data.map((r, i) => {
          const pct = r.quantityNeeded ? Math.min((r.quantityReceived / r.quantityNeeded) * 100, 100) : 0
          return (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green)', flex: 1 }}>{r.title}</div>
                <span className={`badge badge-${r.status?.toLowerCase().replace('_', '-')}`}>{r.status}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(57,255,20,0.5)', marginBottom: '0.75rem' }}>
                Resource: <span style={{ color: 'var(--green)' }}>{r.resourceNeeded}</span>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(57,255,20,0.45)', marginBottom: '0.3rem' }}>
                  <span>Fulfilled</span><span>{r.quantityReceived}/{r.quantityNeeded}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--black-4)', borderRadius: '2px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? 'var(--green)' : 'var(--orange)', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}

export function NgoDonations() {
  const { username } = useAuth()
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState('')

  const fetchData = () => {
    if (username) ngoAPI.availableDonations(username).then(r => setData(r.data)).catch(() => setData([]))
  }
  useEffect(fetchData, [username])

  const handleAccept = async (id) => {
    setLoading(id); setMsg('')
    try {
      await ngoAPI.acceptDonation(id, username)
      setMsg('✓ Donation accepted!')
      fetchData()
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.message || 'Failed.'))
    } finally { setLoading('') }
  }

  const handleDeliver = async (id) => {
    setLoading(id + '_d'); setMsg('')
    try {
      await ngoAPI.deliverDonation(id, username)
      setMsg('✓ Marked as delivered!')
      fetchData()
    } catch (err) {
      setMsg('✗ ' + (err.response?.data?.message || 'Failed.'))
    } finally { setLoading('') }
  }

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">▲ INCOMING DONATIONS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>{data ? `${data.length} PENDING` : '...'}</div>
      </div>
      {msg && <div className={`alert ${msg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">[ NO PENDING DONATIONS ]</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Item</th><th>Quantity</th><th>Status</th><th>Donor ID</th><th>Actions</th></tr></thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.itemName}</td>
                    <td>{d.quantity}</td>
                    <td><span className={`badge badge-${d.status?.toLowerCase()}`}>{d.status}</span></td>
                    <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem' }}>{d.donorId?.slice(-8)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {d.status === 'PENDING' && (
                          <button className="btn btn-primary btn-sm" disabled={loading === d.id} onClick={() => handleAccept(d.id)  }>
                            {loading === d.id ? '...' : '✓ ACCEPT'}
                           
                          </button>
                        )}
                        {d.status === 'ACCEPTED' && (
                          <button className="btn btn-outline btn-sm" disabled={loading === d.id + '_d'} onClick={() => handleDeliver(d.id)}>
                            {loading === d.id + '_d' ? '...' : '▲ DELIVER'}
                            abc
                          </button>
                        )}
                        {d.status === 'DELIVERED' && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--green)' }}>✓ DONE</span>}
                      </div>
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

export function NgoHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    ngoAPI.heatmap().then(r => { setData(r.data); setLoading(false) }).catch(() => { setData([]); setLoading(false) })
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
