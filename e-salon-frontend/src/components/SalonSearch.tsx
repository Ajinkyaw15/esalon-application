import { useState, type FormEvent } from 'react'
import type { SearchMode } from '../types'

interface SalonSearchProps {
  mode: SearchMode
  cityQuery: string
  radiusKm: number
  loading: boolean
  onModeChange: (mode: SearchMode) => void
  onCityChange: (city: string) => void
  onRadiusChange: (km: number) => void
  onSearchCity: (city: string) => void
  onNearMe: () => void
  onShowAll: () => void
}

export default function SalonSearch({
  mode,
  cityQuery,
  radiusKm,
  loading,
  onModeChange,
  onCityChange,
  onRadiusChange,
  onSearchCity,
  onNearMe,
  onShowAll,
}: SalonSearchProps) {
  const [localCity, setLocalCity] = useState(cityQuery)

  function handleCitySubmit(e: FormEvent) {
    e.preventDefault()
    const city = localCity.trim()
    if (!city) return
    onCityChange(city)
    onModeChange('city')
    onSearchCity(city)
  }

  return (
    <div className="salon-search">
      <div className="search-actions">
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
        <button
          type="button"
          className={`btn ${mode === 'nearby' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => {
            onModeChange('nearby')
            onNearMe()
          }}
          disabled={loading}
        >
          📍 Near me
        </button>
      </div>

      <form className="search-city-form" onSubmit={handleCitySubmit}>
        <label className="search-city-label">
          Search by city
          <div className="search-city-row">
            <input
              type="text"
              placeholder="e.g. Pune, Mumbai"
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

      {mode === 'nearby' && (
        <label className="radius-label">
          Radius (km)
          <select
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            disabled={loading}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
        </label>
      )}

      {mode === 'nearby' && (
        <p className="search-hint">
          Uses your device location. Salons are sorted by distance from you.
        </p>
      )}
      {mode === 'city' && cityQuery && (
        <p className="search-hint">Showing salons in: <strong>{cityQuery}</strong></p>
      )}
    </div>
  )
}
