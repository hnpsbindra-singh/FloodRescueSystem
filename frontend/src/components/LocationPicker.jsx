import React, { useState, useEffect, useRef, useCallback } from 'react'

/**
 * LocationPicker
 * Props:
 *   lat, lng         – controlled values (string or number)
 *   onChange(lat, lng) – called when location changes
 *   label            – optional section label override
 */
export default function LocationPicker({ lat, lng, onChange, label = 'INCIDENT LOCATION' }) {
  const [gpsStatus, setGpsStatus] = useState('idle') // idle | loading | success | error
  const [gpsError, setGpsError] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const mapContainerId = useRef(`map-${Math.random().toString(36).slice(2)}`)

  const hasCoords = lat !== '' && lng !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))
  const displayLat = hasCoords ? parseFloat(lat).toFixed(6) : '—'
  const displayLng = hasCoords ? parseFloat(lng).toFixed(6) : '—'

  // Detect GPS
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by this browser.')
      setGpsStatus('error')
      return
    }
    setGpsStatus('loading')
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude
        const newLng = pos.coords.longitude
        onChange(newLat.toString(), newLng.toString())
        setGpsStatus('success')
        setTimeout(() => setGpsStatus('idle'), 3000)
      },
      (err) => {
        setGpsStatus('error')
        const msgs = {
          1: 'Location access denied. Please allow location in browser settings.',
          2: 'Position unavailable. Try again or enter manually.',
          3: 'Location request timed out.',
        }
        setGpsError(msgs[err.code] || 'Failed to get location.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Lazy-load Leaflet and init map
  useEffect(() => {
    let L
    let destroyed = false

    const initMap = async () => {
      // Dynamically import Leaflet (avoids SSR issues)
      L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (destroyed) return

      // Fix default icon paths broken by bundlers
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const container = document.getElementById(mapContainerId.current)
      if (!container || mapInstanceRef.current) return

      const defaultLat = hasCoords ? parseFloat(lat) : 20.5937
      const defaultLng = hasCoords ? parseFloat(lng) : 78.9629
      const zoom = hasCoords ? 13 : 5

      const map = L.map(container, { zoomControl: true, attributionControl: true }).setView([defaultLat, defaultLng], zoom)

      // Dark OSM tile style via CartoDB dark matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Custom green marker icon
      const greenIcon = L.divIcon({
        className: '',
        html: `<div style="
          width: 24px; height: 24px;
          background: #39ff14;
          border: 2px solid #000;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 12px #39ff14, 0 0 24px rgba(57,255,20,0.4);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -28],
      })

      // Place marker if coords already set
      if (hasCoords) {
        const marker = L.marker([parseFloat(lat), parseFloat(lng)], { icon: greenIcon, draggable: true }).addTo(map)
        marker.on('dragend', (e) => {
          const { lat: mLat, lng: mLng } = e.target.getLatLng()
          onChange(mLat.toString(), mLng.toString())
        })
        markerRef.current = marker
      }

      // Click on map to place/move marker
      map.on('click', (e) => {
        const { lat: cLat, lng: cLng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([cLat, cLng])
        } else {
          const m = L.marker([cLat, cLng], { icon: greenIcon, draggable: true }).addTo(map)
          m.on('dragend', (ev) => {
            const { lat: mLat, lng: mLng } = ev.target.getLatLng()
            onChange(mLat.toString(), mLng.toString())
          })
          markerRef.current = m
        }
        onChange(cLat.toString(), cLng.toString())
      })

      mapInstanceRef.current = map
      mapRef.current = L
      setMapReady(true)
    }

    initMap()

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
        setMapReady(false)
      }
    }
  }, []) // eslint-disable-line

  // Sync marker when lat/lng change externally (e.g. GPS update)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapRef.current) return
    const L = mapRef.current
    if (!hasCoords) return

    const newLatLng = [parseFloat(lat), parseFloat(lng)]

    // Custom icon (re-create since L ref is the instance)
    const greenIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 24px; height: 24px;
        background: #39ff14;
        border: 2px solid #000;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 0 12px #39ff14, 0 0 24px rgba(57,255,20,0.4);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    })

    if (markerRef.current) {
      markerRef.current.setLatLng(newLatLng)
    } else {
      const m = L.marker(newLatLng, { icon: greenIcon, draggable: true }).addTo(mapInstanceRef.current)
      m.on('dragend', (ev) => {
        const { lat: mLat, lng: mLng } = ev.target.getLatLng()
        onChange(mLat.toString(), mLng.toString())
      })
      markerRef.current = m
    }

    mapInstanceRef.current.setView(newLatLng, Math.max(mapInstanceRef.current.getZoom(), 13))
  }, [lat, lng]) // eslint-disable-line

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.62rem',
        color: 'rgba(57,255,20,0.45)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '0.6rem',
      }}>
        {label}
      </div>

      {/* GPS Button + coords display */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={detectLocation}
          disabled={gpsStatus === 'loading'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: gpsStatus === 'success' ? 'rgba(57,255,20,0.15)' : gpsStatus === 'error' ? 'rgba(255,45,45,0.1)' : 'var(--black-3)',
            border: `1px solid ${gpsStatus === 'success' ? 'var(--green)' : gpsStatus === 'error' ? 'var(--red)' : 'var(--green-dark)'}`,
            color: gpsStatus === 'error' ? 'var(--red)' : 'var(--green)',
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '0.55rem 1rem',
            cursor: gpsStatus === 'loading' ? 'wait' : 'pointer',
            borderRadius: '1px',
            transition: 'all 0.2s',
            boxShadow: gpsStatus === 'success' ? '0 0 12px rgba(57,255,20,0.3)' : 'none',
          }}
        >
          {gpsStatus === 'loading' ? (
            <><span className="spinner" style={{ width: 14, height: 14 }} /> DETECTING...</>
          ) : gpsStatus === 'success' ? (
            <>✓ GPS LOCKED</>
          ) : gpsStatus === 'error' ? (
            <>⚠ GPS FAILED</>
          ) : (
            <>◎ USE MY GPS LOCATION</>
          )}
        </button>

        {/* Coord readout */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: hasCoords ? 'var(--green)' : 'rgba(57,255,20,0.3)',
          background: 'var(--black-3)',
          border: '1px solid var(--green-dark)',
          padding: '0.45rem 0.75rem',
          letterSpacing: '0.05em',
          flex: 1,
          minWidth: 200,
        }}>
          {hasCoords ? `${displayLat}, ${displayLng}` : '— awaiting location —'}
        </div>
      </div>

      {gpsError && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--red)', marginBottom: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(255,45,45,0.07)', border: '1px solid rgba(255,45,45,0.3)' }}>
          ⚠ {gpsError}
        </div>
      )}

      {/* Manual inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(57,255,20,0.4)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>LATITUDE</div>
          <input
            className="form-input"
            type="number"
            step="any"
            placeholder="e.g. 28.6139"
            value={lat}
            onChange={e => onChange(e.target.value, lng)}
            required
            style={{ fontSize: '0.82rem' }}
          />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(57,255,20,0.4)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>LONGITUDE</div>
          <input
            className="form-input"
            type="number"
            step="any"
            placeholder="e.g. 77.2090"
            value={lng}
            onChange={e => onChange(lat, e.target.value)}
            required
            style={{ fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Map */}
      <div style={{ position: 'relative' }}>
        <div
          id={mapContainerId.current}
          style={{
            width: '100%',
            height: '280px',
            border: '1px solid var(--green-dark)',
            borderRadius: '1px',
            background: '#0d0d0d',
            position: 'relative',
            zIndex: 1,
          }}
        />
        {!mapReady && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--black-3)',
            border: '1px solid var(--green-dark)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'rgba(57,255,20,0.4)',
            gap: '0.5rem',
            zIndex: 2,
          }}>
            <span className="spinner" style={{ width: 18, height: 18 }} />
            LOADING MAP...
          </div>
        )}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6rem',
          color: 'rgba(57,255,20,0.3)',
          marginTop: '0.35rem',
          letterSpacing: '0.05em',
        }}>
          ◎ Click on map to set location · Drag pin to adjust · Or use GPS button above
        </div>
      </div>
    </div>
  )
}
