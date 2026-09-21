import { useCallback, useEffect, useMemo, useState } from 'react'
import Hero from '../components/Hero'
import FeaturedSalonCard from '../components/FeaturedSalonCard'
import SalonSearch, { RADIUS_OPTIONS } from '../components/SalonSearch'
import DiscoveryMap from '../components/DiscoveryMap'
import { getAllServices, getNearbySalons, getSalons } from '../api/salonApi'
import { getSalonsByCity } from '../api/mapsApi'
import { getErrorMessage } from '../utils/errors'
import {
  GeoError,
  getUserLocation,
  openDirectionsToSalon,
  type UserCoords,
} from '../utils/geolocation'
import type { LocationStatus, NearbySort, Salon, SalonLocation, SearchMode } from '../types'

function uniqueServiceNames(items: { name: string }[]) {
  return [...new Set(items.map((s) => s.name).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  )
}

export default function Home() {
  const [mode, setMode] = useState<SearchMode>('all')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [sectionTitle, setSectionTitle] = useState('Top Rated Salons Near You')
  const [sectionSubtitle, setSectionSubtitle] = useState(
    'Explore the best beauty & wellness destinations in your area.',
  )
  const [radiusKm, setRadiusKm] = useState(5)
  const [sort, setSort] = useState<NearbySort>('nearest')
  const [serviceName, setServiceName] = useState('')
  const [serviceOptions, setServiceOptions] = useState<string[]>([])
  const [cityQuery, setCityQuery] = useState('')

  const [allSalons, setAllSalons] = useState<Salon[]>([])
  const [locationSalons, setLocationSalons] = useState<SalonLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLabel, setLoadingLabel] = useState('Finding salons...')
  const [error, setError] = useState<string | null>(null)
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')
  const [coords, setCoords] = useState<UserCoords | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [directionsId, setDirectionsId] = useState<number | null>(null)

  const fetchNearby = useCallback(
    async (point: UserCoords, radius: number, nextSort: NearbySort, service: string) => {
      setLoading(true)
      setLoadingLabel('Finding salons near you...')
      setError(null)
      try {
        const res = await getNearbySalons(point.latitude, point.longitude, radius, {
          serviceName: service || undefined,
          sort: nextSort,
        })
        setLocationSalons(res.data)
        setSelectedId(res.data[0]?.id ?? null)
        document.getElementById('salons')?.scrollIntoView({ behavior: 'smooth' })
      } catch (err) {
        setError(getErrorMessage(err, 'Could not find nearby salons.'))
        setLocationSalons([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const loadAll = useCallback(() => {
    setLoading(true)
    setLoadingLabel('Finding salons...')
    setError(null)
    setMode('all')
    setLocationStatus('idle')
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
    setMode('nearby')
    setView('list')
    setSectionTitle('Salons Near You')
    setSectionSubtitle('Sorted from your current location.')
    setLocationStatus('detecting')
    setLoading(true)
    setLoadingLabel('Detecting your location...')
    setError(null)
    try {
      const point = await getUserLocation({ forceRefresh: true })
      setCoords(point)
      setLocationStatus('detected')
    } catch (err) {
      const geo = err instanceof GeoError ? err : null
      const code = geo?.code ?? 'unknown'
      setLocationStatus(
        code === 'denied' ||
          code === 'unavailable' ||
          code === 'timeout' ||
          code === 'unsupported'
          ? code
          : 'unavailable',
      )
      setError(geo?.message ?? getErrorMessage(err, 'Could not find nearby salons.'))
      setLocationSalons([])
      setLoading(false)
    }
  }, [])

  const loadByCity = useCallback((city: string) => {
    setLoading(true)
    setLoadingLabel('Finding salons...')
    setError(null)
    setMode('city')
    setCityQuery(city)
    setSectionTitle(`Salons in ${city}`)
    setSectionSubtitle(`Premium salons available in ${city}.`)
    getSalonsByCity(city)
      .then((res) => {
        setLocationSalons(res.data)
        setSelectedId(res.data[0]?.id ?? null)
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

  useEffect(() => {
    getAllServices()
      .then((res) => setServiceOptions(uniqueServiceNames(res.data)))
      .catch(() => setServiceOptions([]))
  }, [])

  useEffect(() => {
    if (mode !== 'nearby' || !coords) return
    const handle = window.setTimeout(() => {
      void fetchNearby(coords, radiusKm, sort, serviceName)
    }, 200)
    return () => window.clearTimeout(handle)
  }, [radiusKm, sort, serviceName, mode, coords, fetchNearby])

  const showLocation = mode === 'nearby' || mode === 'city'
  const items = showLocation ? locationSalons : allSalons
  const showDistance = mode === 'nearby'

  const nextRadius = useMemo(() => {
    const idx = RADIUS_OPTIONS.indexOf(radiusKm)
    return idx >= 0 && idx < RADIUS_OPTIONS.length - 1
      ? RADIUS_OPTIONS[idx + 1]
      : null
  }, [radiusKm])

  async function handleDirections(salon: Salon | SalonLocation) {
    setDirectionsId(salon.id)
    try {
      await openDirectionsToSalon(salon)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not open directions.'))
    } finally {
      setDirectionsId(null)
    }
  }

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

          <SalonSearch
            mode={mode}
            cityQuery={cityQuery}
            radiusKm={radiusKm}
            sort={sort}
            serviceName={serviceName}
            serviceOptions={serviceOptions}
            loading={loading}
            locationStatus={locationStatus}
            onModeChange={setMode}
            onCityChange={setCityQuery}
            onRadiusChange={setRadiusKm}
            onSortChange={setSort}
            onServiceChange={setServiceName}
            onSearchCity={loadByCity}
            onNearMe={loadNearby}
            onShowAll={loadAll}
          />

          {mode === 'nearby' && (
            <div className="view-switcher" role="tablist" aria-label="Results view">
              <button
                type="button"
                className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('list')}
              >
                List
              </button>
              <button
                type="button"
                className={`btn btn-sm ${view === 'map' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('map')}
              >
                Map
              </button>
            </div>
          )}

          {loading && <p className="status">{loadingLabel}</p>}
          {error && !loading && (
            <div className="status error">
              <p>{error}</p>
              {(locationStatus === 'timeout' || locationStatus === 'unavailable') && (
                <button type="button" className="btn btn-primary btn-sm" onClick={loadNearby}>
                  Try again
                </button>
              )}
            </div>
          )}

          {!loading && !error && items.length === 0 && mode === 'nearby' && (
            <div className="status">
              <p>
                {serviceName
                  ? `No salons offering this service were found nearby.`
                  : `No salons found within ${radiusKm} km.`}
              </p>
              {nextRadius && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setRadiusKm(nextRadius)}
                >
                  {serviceName ? 'Search a larger area' : `Expand to ${nextRadius} km`}
                </button>
              )}
            </div>
          )}

          {!loading && !error && items.length === 0 && mode !== 'nearby' && (
            <p className="status">No salons found. Try another city or use your current location.</p>
          )}

          {!loading && items.length > 0 && showDistance && (
            <p className="result-count">
              {items.length} salon{items.length === 1 ? '' : 's'} within {radiusKm} km
            </p>
          )}

          {!loading && items.length > 0 && mode === 'nearby' && view === 'map' && (
            <DiscoveryMap
              key={coords?.updatedAt ?? 'map'}
              user={coords}
              salons={locationSalons}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {!loading && items.length > 0 && (view === 'list' || mode !== 'nearby') && (
            <div className="featured-grid">
              {showLocation
                ? locationSalons.map((s) => (
                    <FeaturedSalonCard
                      key={s.id}
                      id={s.id}
                      name={s.name}
                      city={s.city}
                      address={s.address}
                      rating={s.rating}
                      distanceKm={showDistance ? s.distanceKm : undefined}
                      imageUrl={s.imageUrl}
                      openingTime={s.openingTime}
                      closingTime={s.closingTime}
                      services={s.services}
                      nextAvailableSlot={s.nextAvailableSlot}
                      requestedService={serviceName || undefined}
                      selected={selectedId === s.id}
                      onSelect={() => setSelectedId(s.id)}
                      onDirections={() => handleDirections(s)}
                      directionsLoading={directionsId === s.id}
                    />
                  ))
                : allSalons.map((s) => (
                    <FeaturedSalonCard
                      key={s.id}
                      id={s.id}
                      name={s.name}
                      city={s.city}
                      address={s.address}
                      rating={s.rating}
                      imageUrl={s.imageUrl}
                      openingTime={s.openingTime}
                      closingTime={s.closingTime}
                      onDirections={
                        s.latitude != null && s.longitude != null
                          ? () => handleDirections(s)
                          : undefined
                      }
                      directionsLoading={directionsId === s.id}
                    />
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
