import React, { useEffect, useRef, useState } from 'react'

const RISK_COLORS = {
  LOW: '#39ff14',
  MEDIUM: '#ffd700',
  HIGH: '#ff8c00',
  CRITICAL: '#ff2d2d',
}

const RISK_HEX = {
  LOW: '57,255,20',
  MEDIUM: '255,215,0',
  HIGH: '255,140,0',
  CRITICAL: '255,45,45',
}

function HeatmapMap({ data }) {
  const mapContainerId = useRef(`hmap-${Math.random().toString(36).slice(2)}`)
  const mapInstanceRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!data || data.length === 0) return
    let destroyed = false

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (destroyed) return

      const container = document.getElementById(mapContainerId.current)
      if (!container || mapInstanceRef.current) return

      const avgLat = data.reduce((s, p) => s + p.latitude, 0) / data.length
      const avgLng = data.reduce((s, p) => s + p.longitude, 0) / data.length

      const map = L.map(container, { zoomControl: true }).setView([avgLat, avgLng], 6)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      data.forEach((point) => {
        const color = RISK_COLORS[point.riskLevel] || '#39ff14'
        const radius = 8 + (point.averageSeverity || 0) * 2.5

        const circle = L.circleMarker([point.latitude, point.longitude], {
          radius,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.35,
        }).addTo(map)

        if (point.riskLevel === 'CRITICAL') {
          L.circleMarker([point.latitude, point.longitude], {
            radius: radius + 8,
            fillColor: 'transparent',
            color: color,
            weight: 1.5,
            opacity: 0.4,
            fillOpacity: 0,
          }).addTo(map)
        }

        circle.bindPopup(`
          <div style="background:#0d0d0d;border:1px solid ${color};color:${color};font-family:'Share Tech Mono',monospace;font-size:11px;padding:8px 10px;min-width:160px;line-height:1.7;">
            <div style="font-weight:700;font-size:12px;margin-bottom:4px;text-shadow:0 0 8px ${color}">● ${point.riskLevel}</div>
            <div style="color:rgba(57,255,20,0.7)">Lat: ${point.latitude?.toFixed(5)}</div>
            <div style="color:rgba(57,255,20,0.7)">Lng: ${point.longitude?.toFixed(5)}</div>
            <div style="margin-top:4px">Avg Severity: <span style="color:${color}">${point.averageSeverity?.toFixed(1)}</span></div>
            <div>Reports: <span style="color:${color}">${point.reportCount}</span></div>
          </div>
        `, { className: 'leaflet-dark-popup', maxWidth: 220 })
      })

      if (data.length > 1) {
        const bounds = L.latLngBounds(data.map(p => [p.latitude, p.longitude]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      mapInstanceRef.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMapReady(false)
      }
    }
  }, [data])

  if (!data || data.length === 0) return null

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(57,255,20,0.4)', letterSpacing: '0.1em' }}>RISK LEGEND:</div>
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color }}>{level}</span>
          </div>
        ))}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(57,255,20,0.3)', marginLeft: 'auto' }}>
          ◎ Click marker for details · Scroll to zoom
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          id={mapContainerId.current}
          style={{ width: '100%', height: '420px', border: '1px solid var(--green-dark)', borderRadius: '1px', background: '#0a0a0a' }}
        />
        {!mapReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black-3)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(57,255,20,0.4)', gap: '0.6rem', zIndex: 10 }}>
            <span className="spinner" style={{ width: 22, height: 22 }} /> RENDERING THREAT MAP...
          </div>
        )}
      </div>

      <style>{`
        .leaflet-dark-popup .leaflet-popup-content-wrapper,
        .leaflet-dark-popup .leaflet-popup-tip { background: #0d0d0d !important; border: none !important; box-shadow: 0 0 16px rgba(57,255,20,0.2) !important; padding: 0 !important; }
        .leaflet-dark-popup .leaflet-popup-content { margin: 0 !important; }
        .leaflet-container { font-family: 'Share Tech Mono', monospace !important; }
        .leaflet-bar a { background: #111 !important; color: #39ff14 !important; border-color: #1a4d00 !important; }
        .leaflet-bar a:hover { background: #1a1a1a !important; }
        .leaflet-control-attribution { background: rgba(0,0,0,0.7) !important; color: rgba(57,255,20,0.3) !important; font-size: 9px !important; }
        .leaflet-control-attribution a { color: rgba(57,255,20,0.5) !important; }
      `}</style>
    </div>
  )
}

export default function HeatmapTable({ data, loading }) {
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)' }}>
      <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 1rem' }} />
      LOADING HEATMAP DATA...
    </div>
  )

  if (!data?.length) return (
    <div className="empty-state">[ NO HEATMAP DATA AVAILABLE ]</div>
  )

  return (
    <div>
      <HeatmapMap data={data} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {data.map((point, i) => {
          const color = RISK_COLORS[point.riskLevel] || 'var(--green)'
          const rgb = RISK_HEX[point.riskLevel] || '57,255,20'
          const intensity = Math.min((point.averageSeverity || 0) / 10, 1)
          return (
            <div key={i} style={{
              background: `rgba(${rgb}, ${0.04 + intensity * 0.1})`,
              border: `1px solid rgba(${rgb}, 0.3)`,
              borderLeft: `3px solid ${color}`,
              borderRadius: '1px',
              padding: '0.65rem 0.75rem',
              fontFamily: 'var(--font-mono)',
              animation: point.riskLevel === 'CRITICAL' ? 'statusPulse 1.5s infinite' : 'none',
            }}>
              <div style={{ fontSize: '0.6rem', color, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>● {point.riskLevel}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(57,255,20,0.5)', marginBottom: '0.15rem' }}>{point.latitude?.toFixed(4)}, {point.longitude?.toFixed(4)}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(57,255,20,0.8)' }}>Sev: <span style={{ color }}>{point.averageSeverity?.toFixed(1)}</span></div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(57,255,20,0.4)', marginTop: '0.1rem' }}>{point.reportCount} report{point.reportCount !== 1 ? 's' : ''}</div>
            </div>
          )
        })}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr><th>#</th><th>Latitude</th><th>Longitude</th><th>Avg Severity</th><th>Reports</th><th>Risk Level</th></tr>
          </thead>
          <tbody>
            {data.map((point, i) => (
              <tr key={i}>
                <td style={{ color: 'rgba(57,255,20,0.3)' }}>{i + 1}</td>
                <td>{point.latitude?.toFixed(6)}</td>
                <td>{point.longitude?.toFixed(6)}</td>
                <td>{point.averageSeverity?.toFixed(2)}</td>
                <td>{point.reportCount}</td>
                <td><span className={`badge badge-${point.riskLevel?.toLowerCase()}`}>{point.riskLevel}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
