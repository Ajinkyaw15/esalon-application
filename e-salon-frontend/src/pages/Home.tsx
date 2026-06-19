import { useCallback, useEffect, useState } from 'react'
import Hero from '../components/Hero'
import FeaturedSalonCard from '../components/FeaturedSalonCard'
import { getSalons } from '../api/salonApi'
import { getNearbySalons, getSalonsByCity } from '../api/mapsApi'
import { getErrorMessage } from '../utils/errors'
import { getUserLocation } from '../utils/geolocation'
import type { Salon, SalonLocation, SearchMode } from '../types'

function toFeaturedProps(salon: Salon | SalonLocation, showDistance: boolean) {
  const isLoc = 'distanceKm' in salon
  return {
    id: salon.id,
    name: salon.name,
    city: 'city' in salon ? salon.city : '',
    rating: isLoc ? salon.rating : (salon as Salon).rating,
    distanceKm: showDistance && isLoc ? salon.distanceKm : undefined,
    imageUrl: 'imageUrl' in salon ? (salon as Salon).imageUrl : undefined,
  }
}

export default function Home() {
  const [mode, setMode] = useState<SearchMode>('all')
  const [sectionTitle, setSectionTitle] = useState('Top Rated Salons Near You')
  const [sectionSubtitle, setSectionSubtitle] = useState(
    'Explore the best beauty & wellness destinations in your area.',
  )
  const [radiusKm] = useState(10)

  const [allSalons, setAllSalons] = useState<Salon[]>([])
  const [locationSalons, setLocationSalons] = useState<SalonLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(() => {
    setLoading(true)
    setError(null)
    setMode('all')
    setSectionTitle('Top Rated Salons Near You')
    setSectionSubtitle('Explore the best beauty & wellness destinations in your area.')
    getSalons()
      .then((res) => setAllSalons(res.data))
      .catch((err) =>
        setError(getErrorMessage(err, 'Could not load salons. Is the backend running?')),
      )
      .finally(() => setLoading(false))
  }, [])

  const loadNearby = useCallback(async () => {
    setLoading(true)
    setError(null)
    setMode('nearby')
    setSectionTitle('Salons Near You')
    setSectionSubtitle('Sorted by distance from your current location.')
    try {
      const coords = await getUserLocation()
      const res = await getNearbySalons(coords.latitude, coords.longitude, radiusKm)
      setLocationSalons(res.data)
      document.getElementById('salons')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not find nearby salons.'))
      setLocationSalons([])
    } finally {
      setLoading(false)
    }
  }, [radiusKm])

  const loadByCity = useCallback((city: string) => {
    setLoading(true)
    setError(null)
    setMode('city')
    setSectionTitle(`Salons in ${city}`)
    setSectionSubtitle(`Premium salons available in ${city}.`)
    getSalonsByCity(city)
      .then((res) => {
        setLocationSalons(res.data)
        document.getElementById('salons')?.scrollIntoView({ behavior: 'smooth' })
      })
      .catch((err) =>
        setError(getErrorMessage(err, `No salons found in "${city}".`)),
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const showLocation = mode === 'nearby' || mode === 'city'
  const items = showLocation ? locationSalons : allSalons
  const showDistance = mode === 'nearby'

  return (
    <>
      <Hero
        onSearchCity={loadByCity}
        onNearMe={loadNearby}
        loading={loading}
      />

      <section id="salons" className="salons-section">
        <div className="salons-section-inner">
          <header className="section-head">
            <h2>{sectionTitle}</h2>
            <p>{sectionSubtitle}</p>
          </header>

          {loading && <p className="status">Finding salons...</p>}
          {error && <p className="status error">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="status">No salons found. Try another city or use Near me.</p>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="featured-grid">
              {showLocation
                ? locationSalons.map((s) => (
                    <FeaturedSalonCard key={s.id} {...toFeaturedProps(s, showDistance)} />
                  ))
                : allSalons.map((s) => (
                    <FeaturedSalonCard key={s.id} {...toFeaturedProps(s, false)} />
                  ))}
            </div>
          )}

          {!loading && mode !== 'all' && (
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button type="button" className="btn btn-ghost" onClick={loadAll}>
                Show all salons
              </button>
            </p>
          )}
        </div>
      </section>

      <section id="contact" className="salons-section" style={{ paddingTop: 0 }}>
        <div className="salons-section-inner section-head">
          <h2>Contact Ecozii</h2>
          <p>support@ecozii.com · Book premium salon experiences anytime.</p>
        </div>
      </section>
    </>
  )
}
