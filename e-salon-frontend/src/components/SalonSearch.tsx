import { useState, type FormEvent } from 'react'
import type { LocationStatus, NearbySort, SearchMode } from '../types'

export const RADIUS_OPTIONS = [1, 3, 5, 10, 25]

interface SalonSearchProps {
  mode: SearchMode
  cityQuery: string
  radiusKm: number
  sort: NearbySort
  serviceName: string
  serviceOptions: string[]
  loading: boolean
  locationStatus: LocationStatus
  onModeChange: (mode: SearchMode) => void
  onCityChange: (city: string) => void
  onRadiusChange: (km: number) => void
  onSortChange: (sort: NearbySort) => void
  onServiceChange: (name: string) => void
  onSearchCity: (city: string) => void
  onNearMe: () => void
  onShowAll: () => void
}

function statusLabel(status: LocationStatus) {
  switch (status) {
    case 'detecting':
      return 'Detecting your location...'
    case 'detected':
      return '📍 Location detected'
    case 'denied':
      return '📍 Location permission required'
    case 'unavailable':
    case 'timeout':
      return '⚠ Unable to detect location'
    case 'unsupported':
      return '📍 Location not supported — search by city'
    default:
      return ''
  }
}

export default function SalonSearch({
  mode,
  cityQuery,
  radiusKm,
  sort,
  serviceName,
  serviceOptions,
  loading,
  locationStatus,
  onModeChange,
  onCityChange,
  onRadiusChange,
  onSortChange,
  onServiceChange,
  onSearchCity,
  onNearMe,
  onShowAll,
}: SalonSearchProps) {
  const [localCity, setLocalCity] = useState(cityQuery)
  const locationHint = statusLabel(locationStatus)

  function handleCitySubmit(e: FormEvent) {
    e.preventDefault()
    const city = localCity.trim()
    if (!city) return
    onCityChange(city)
    onModeChange('city')
    onSearchCity(city)
  }

  return (
    <div className="salon-search discovery-bar">
      <div className="search-actions">
        <button
          type="button"
          className={`btn ${mode === 'nearby' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => {
            onModeChange('nearby')
            onNearMe()
          }}
          disabled={loading}
        >
          📍 Use My Current Location
        </button>
        <button
          type="button"
          className={`btn ${mode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => {
            onModeChange('all')
            onShowAll()
          }}
          disabled={loading}
        >
          All salons
        </button>
      </div>

      {locationHint && (
        <p className={`location-status location-status--${locationStatus}`}>{locationHint}</p>
      )}

      <form className="search-city-form" onSubmit={handleCitySubmit}>
        <label className="search-city-label">
          Search by city
          <div className="search-city-row">
            <input
              type="text"
              placeholder="e.g. Pune, Nagpur, Mumbai"
              value={localCity}
              onChange={(e) => setLocalCity(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !localCity.trim()}
            >
              Search
            </button>
          </div>
        </label>
      </form>

      <div className="discovery-filters">
        {mode === 'nearby' && (
          <label className="radius-label">
            Search within
            <select
              value={radiusKm}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              disabled={loading}
            >
              {RADIUS_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="radius-label">
          Service
          <select
            value={serviceName}
            onChange={(e) => onServiceChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Any service</option>
            {serviceOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {mode === 'nearby' && (
          <label className="radius-label">
            Sort
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as NearbySort)}
              disabled={loading}
            >
              <option value="nearest">Nearest</option>
              <option value="farthest">Farthest</option>
              <option value="recommended">Recommended</option>
              <option value="available_soon">Available Soon</option>
            </select>
          </label>
        )}
      </div>

      {mode === 'nearby' && (
        <p className="search-hint">
          Uses your device location once. Salons are filtered by geographic distance.
        </p>
      )}
      {mode === 'city' && cityQuery && (
        <p className="search-hint">
          Showing salons in: <strong>{cityQuery}</strong>
        </p>
      )}
      {(locationStatus === 'denied' ||
        locationStatus === 'unsupported' ||
        locationStatus === 'unavailable' ||
        locationStatus === 'timeout') && (
        <p className="search-hint">Search by city still works if GPS is unavailable.</p>
      )}
    </div>
  )
}
