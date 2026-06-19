import { useState, type FormEvent } from 'react'
import { HERO_BG } from '../utils/salonImages'

interface HeroProps {
  onSearchCity: (city: string) => void
  onNearMe: () => void
  loading?: boolean
}

export default function Hero({ onSearchCity, onNearMe, loading }: HeroProps) {
  const [city, setCity] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = city.trim()
    if (q) onSearchCity(q)
  }

  return (
    <section className="hero" style={{ backgroundImage: `url(${HERO_BG})` }}>
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">
          Find &amp; Book <em>Premium Salons</em> Near You
        </h1>
        <p className="hero-subtitle">
          Discover top-rated beauty &amp; wellness services with Ecozii.
        </p>

        <form className="hero-search" onSubmit={handleSubmit}>
          <div className="hero-search-field">
            <span className="hero-search-icon" aria-hidden>
              ⌕
            </span>
            <input
              type="text"
              placeholder="Enter your city or location"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-green" disabled={loading || !city.trim()}>
            Find Salons
          </button>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={onNearMe}
            disabled={loading}
          >
            Near me
          </button>
        </form>
      </div>
    </section>
  )
}
