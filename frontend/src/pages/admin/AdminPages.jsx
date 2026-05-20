import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import HeatmapTable from '../../components/HeatmapTable'
import { adminAPI } from '../../services/api'

export function AdminReports() {
  const [data, setData] = useState(null)
  useEffect(() => { adminAPI.reports().then(r => setData(r.data)).catch(() => setData([])) }, [])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◉ FLOOD REPORTS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>
          {data ? `${data.length} RECORDS` : '...'}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">[ NO FLOOD REPORTS ON RECORD ]</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Description</th><th>Severity</th><th>Victim ID</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td style={{ color: 'rgba(57,255,20,0.35)' }}>{r.id?.slice(-8)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green)', maxWidth: 200 }}>{r.title}</td>
                    <td style={{ color: 'rgba(57,255,20,0.6)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                    <td>
                      <span className={`badge ${r.severityScore >= 8 ? 'badge-critical' : r.severityScore >= 6 ? 'badge-high' : r.severityScore >= 4 ? 'badge-medium' : 'badge-low'}`}>
                        {r.severityScore}/10
                      </span>
                    </td>
                    <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem' }}>{r.victimId?.slice(-8)}</td>
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

export function AdminNgoRequests() {
  const [data, setData] = useState(null)
  useEffect(() => { adminAPI.ngoRequests().then(r => setData(r.data)).catch(() => setData([])) }, [])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◆ NGO REQUESTS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>
          {data ? `${data.length} REQUESTS` : '...'}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">[ NO NGO REQUESTS ]</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Resource</th><th>Needed</th><th>Received</th><th>Status</th><th>NGO ID</th></tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>{r.title}</td>
                    <td>{r.resourceNeeded}</td>
                    <td>{r.quantityNeeded}</td>
                    <td style={{ color: r.quantityReceived >= r.quantityNeeded ? 'var(--green)' : 'var(--orange)' }}>{r.quantityReceived}</td>
                    <td><span className={`badge badge-${r.status?.toLowerCase().replace('_', '-')}`}>{r.status}</span></td>
                    <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem' }}>{r.ngoId?.slice(-8)}</td>
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

export function AdminDonations() {
  const [data, setData] = useState(null)
  useEffect(() => { adminAPI.donations().then(r => setData(r.data)).catch(() => setData([])) }, [])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">▲ ALL DONATIONS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green-dim)' }}>
          {data ? `${data.length} RECORDS` : '...'}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data === null ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">[ NO DONATIONS ]</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Item</th><th>Quantity</th><th>Status</th><th>Donor ID</th><th>Request ID</th></tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--green)' }}>{d.itemName}</td>
                    <td>{d.quantity}</td>
                    <td><span className={`badge badge-${d.status?.toLowerCase()}`}>{d.status}</span></td>
                    <td style={{ color: 'rgba(57,255,20,0.4)', fontSize: '0.72rem' }}>{d.donorId?.slice(-8)}</td>
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

export function AdminHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    adminAPI.heatmap().then(r => { setData(r.data); setLoading(false) }).catch(() => { setData([]); setLoading(false) })
  }, [])

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">◎ SEVERITY HEATMAP</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', animation: 'statusPulse 2s infinite' }}>
          ● LIVE DATA
        </div>
      </div>
      <div className="card">
        <HeatmapTable data={data} loading={loading} />
      </div>
    </Layout>
  )
}
