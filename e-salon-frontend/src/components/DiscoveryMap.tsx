import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SalonLocation } from '../types'
import { formatDistanceKm } from '../utils/geolocation'

interface UserPoint {
  latitude: number
  longitude: number
}

interface DiscoveryMapProps {
  user: UserPoint | null
  salons: SalonLocation[]
  selectedId: number | null
  onSelect: (id: number) => void
}

type LeafletMap = {
  setView: (latlng: [number, number], zoom: number) => unknown
  remove: () => void
  invalidateSize: () => void
  removeLayer?: (layer: unknown) => void
}

type LeafletNs = {
  map: (el: HTMLElement) => LeafletMap & { addLayer?: (l: unknown) => unknown }
  tileLayer: (url: string, opts: Record<string, unknown>) => { addTo: (m: unknown) => unknown }
  marker: (latlng: [number, number], opts?: Record<string, unknown>) => {
    addTo: (m: unknown) => unknown
    bindPopup: (html: string) => unknown
    on: (ev: string, fn: () => void) => unknown
    setIcon?: (icon: unknown) => unknown
  }
  divIcon: (opts: Record<string, unknown>) => unknown
  featureGroup: (layers: unknown[]) => { getBounds: () => { pad: (n: number) => unknown } }
}

declare global {
  interface Window {
    L?: LeafletNs
  }
}

function loadLeaflet(): Promise<LeafletNs> {
  if (window.L) return Promise.resolve(window.L)

  return new Promise((resolve, reject) => {
    const cssId = 'leaflet-css'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const existing = document.getElementById('leaflet-js') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.L) resolve(window.L)
        else reject(new Error('Leaflet failed to load'))
      })
      return
    }

    const script = document.createElement('script')
    script.id = 'leaflet-js'
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => {
      if (window.L) resolve(window.L)
      else reject(new Error('Leaflet failed to load'))
    }
    script.onerror = () => reject(new Error('Leaflet failed to load'))
    document.body.appendChild(script)
  })
}

export default function DiscoveryMap({
  user,
  salons,
  selectedId,
  onSelect,
}: DiscoveryMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const [ready, setReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const selected = salons.find((s) => s.id === selectedId) ?? null

  useEffect(() => {
    let cancelled = false
    loadLeaflet()
      .then((L) => {
        if (cancelled || !hostRef.current) return
        const center: [number, number] = user
          ? [user.latitude, user.longitude]
          : salons[0]
            ? [salons[0].latitude, salons[0].longitude]
            : [20.5937, 78.9629]
        const map = L.map(hostRef.current)
        map.setView(center, 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)
        mapRef.current = map
        setReady(true)
        setTimeout(() => map.invalidateSize(), 80)
      })
      .catch(() => {
        if (!cancelled) setMapError('Map could not be loaded. List view still works.')
      })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
    // Recreate when the host remounts; markers are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const L = window.L
    if (!map || !L || !ready) return

    const layers: unknown[] = []
    const userIcon = L.divIcon({
      className: 'map-pin map-pin-user',
      html: '<span>You</span>',
      iconSize: [40, 24],
      iconAnchor: [20, 12],
    })
    const salonIcon = (active: boolean) =>
      L.divIcon({
        className: `map-pin ${active ? 'map-pin-selected' : 'map-pin-salon'}`,
        html: '<span>Salon</span>',
        iconSize: [52, 24],
        iconAnchor: [26, 12],
      })

    if (user) {
      const marker = L.marker([user.latitude, user.longitude], { icon: userIcon, zIndexOffset: 1000 })
      marker.addTo(map)
      marker.bindPopup('Your current location')
      layers.push(marker)
      map.setView([user.latitude, user.longitude], 13)
    }

    salons.forEach((salon) => {
      const marker = L.marker([salon.latitude, salon.longitude], {
        icon: salonIcon(salon.id === selectedId),
      })
      marker.addTo(map)
      marker.on('click', () => onSelect(salon.id))
      layers.push(marker)
    })

    return () => {
      layers.forEach((layer) => {
        try {
          map.removeLayer?.(layer)
        } catch {
          /* ignore */
        }
      })
    }
  }, [ready, user, salons, selectedId, onSelect])

  return (
    <div className="discovery-map-wrap">
      {mapError && <p className="status error">{mapError}</p>}
      {!ready && !mapError && <p className="status">Loading map...</p>}
      <div ref={hostRef} className="discovery-map" role="img" aria-label="Nearby salons map" />
      {selected && (
        <aside className="map-preview">
          <h3>{selected.name}</h3>
          {selected.distanceKm != null && (
            <p>{formatDistanceKm(selected.distanceKm)}</p>
          )}
          {selected.rating > 0 && <p>★ {selected.rating.toFixed(1)}</p>}
          <p>{selected.address}</p>
          <div className="salon-card-actions">
            <Link to={`/salons/${selected.id}`} className="btn btn-green btn-sm">
              View Salon
            </Link>
          </div>
        </aside>
      )}
    </div>
  )
}
