import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { adminAPI } from '../../services/api'

export default function AdminDashboard() {
  const [reports, setReports] = useState(null)
  const [ngoReqs, setNgoReqs] = useState(null)
  const [donations, setDonations] = useState(null)
  const [heatmap, setHeatmap] = useState(null)

  useEffect(() => {
    adminAPI.reports().then(r => setReports(r.data)).catch(() => setReports([]))
    adminAPI.ngoRequests().then(r => setNgoReqs(r.data)).catch(() => setNgoReqs([]))
    adminAPI.donations().then(r => setDonations(r.data)).catch(() => setDonations([]))
    adminAPI.heatmap().then(r => setHeatmap(r.data)).catch(() => setHeatmap([]))
  }, [])

  const criticalZones = heatmap?.filter(h => h.riskLevel === 'CRITICAL').length ?? 0
  const pendingDonations = donations?.filter(d => d.status === 'PENDING').length ?? 0

  return (
    <Layout>
      <div className="topbar">
        <div className="page-title">⚡ ADMIN COMMAND CENTER</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', animation: 'statusPulse 2s infinite' }}>
          ● LIVE
        </div>
      </div>

      {criticalZones > 0 && (
        <div style={{
          background: 'rgba(255,45,45,0.08)',
          border: '1px solid var(--red)',
          borderLeft: '4px solid var(--red)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--red)',
          animation: 'statusPulse 1.5s infinite',
        }}>
          ⚠ ALERT: {criticalZones} CRITICAL ZONE{criticalZones > 1 ? 'S' : ''} REQUIRE IMMEDIATE ATTENTION
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard label="Flood Reports" value={reports?.length} icon="◉" color="var(--red)" sublabel="Total incidents" />
        <StatCard label="NGO Requests" value={ngoReqs?.length} icon="◆" color="var(--orange)" sublabel="Active requests" />
        <StatCard label="Donations" value={donations?.length} icon="▲" color="var(--green)" sublabel="Total tracked" />
        <StatCard label="Critical Zones" value={criticalZones} icon="⚠" color="var(--red)" sublabel="Heatmap critical" />
      </div>

      <div className="grid-2">
        {/* Recent Reports */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Flood Reports</span>
            <div className="section-line" />
          </div>
          {reports === null ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}><span className="spinner" /></div>
          ) : reports.length === 0 ? (
            <div className="empty-state">[ NO REPORTS ]</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto' }}>
              {reports.slice(0, 6).map((r, i) => (
                <div key={i} style={{ padding: '0.6rem 0.75rem', background: 'var(--black-3)', border: '1px solid var(--green-dark)', borderLeft: `3px solid ${r.severityScore >= 8 ? 'var(--red)' : r.severityScore >= 5 ? 'var(--orange)' : 'var(--green)'}` }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--green)' }}>{r.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(57,255,20,0.45)', marginTop: '0.2rem' }}>
                    Severity: {r.severityScore}/10 · ID: {r.id?.slice(-6)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donation Status */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Donation Pipeline</span>
            <div className="section-line" />
          </div>
          {donations === null ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}><span className="spinner" /></div>
          ) : (
            <div>
              {['PENDING', 'ACCEPTED', 'DELIVERED'].map(status => {
                const count = donations.filter(d => d.status === status).length
                const pct = donations.length ? (count / donations.length * 100).toFixed(0) : 0
                const color = status === 'PENDING' ? 'var(--orange)' : status === 'ACCEPTED' ? 'var(--yellow)' : 'var(--green)'
                return (
                  <div key={status} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(57,255,20,0.6)', marginBottom: '0.3rem' }}>
                      <span>{status}</span><span style={{ color }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--black-4)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, boxShadow: `0 0 6px ${color}`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ marginTop: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(57,255,20,0.35)' }}>
                Total: {donations.length} donations tracked
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
