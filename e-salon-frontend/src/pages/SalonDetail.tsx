import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSalonMapsLink } from '../api/mapsApi'
import { getSalonById, getServicesBySalon } from '../api/salonApi'
import { getErrorMessage } from '../utils/errors'
import { openDirectionsToSalon } from '../utils/geolocation'
import type { Salon, Service } from '../types'

export default function SalonDetail() {
  const { id } = useParams<{ id: string }>()
  const salonId = Number(id)

  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [mapsUrl, setMapsUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [directionsLoading, setDirectionsLoading] = useState(false)

  useEffect(() => {
    if (!salonId || Number.isNaN(salonId)) {
      setError('Invalid salon')
      setLoading(false)
      return
    }

    Promise.all([
      getSalonById(salonId),
      getServicesBySalon(salonId),
      getSalonMapsLink(salonId).catch(() => null),
    ])
      .then(([salonRes, servicesRes, mapsRes]) => {
        setSalon(salonRes.data)
        setServices(servicesRes.data)
        if (mapsRes?.data.googleMapsUrl) {
          setMapsUrl(mapsRes.data.googleMapsUrl)
        } else if (salonRes.data.latitude != null && salonRes.data.longitude != null) {
          setMapsUrl(
            `https://www.google.com/maps?q=${salonRes.data.latitude},${salonRes.data.longitude}`,
          )
        }
      })
      .catch(() => setError('Salon not found or server unavailable.'))
      .finally(() => setLoading(false))
  }, [salonId])

  async function handleDirections() {
    if (!salonId) return
    setDirectionsLoading(true)
    try {
      await openDirectionsToSalon(salonId)
    } catch (err) {
      alert(getErrorMessage(err, 'Could not open directions.'))
    } finally {
      setDirectionsLoading(false)
    }
  }

  if (loading) return <p className="status">Loading...</p>
  if (error || !salon) return <p className="status error">{error ?? 'Not found'}</p>

  return (
    <div className="inner-page page-shell page-shell--wide">
      <Link to="/" className="back-link">
        ← All salons
      </Link>
      <header className="page-header">
        <h1 className="page-title">{salon.name}</h1>
        <p className="salon-meta">
          {salon.city}, {salon.state} · {salon.phone}
        </p>
        <p>{salon.address}</p>
        {salon.openingTime && salon.closingTime && (
          <p className="salon-hours">
            Hours: {salon.openingTime} – {salon.closingTime}
          </p>
        )}
        <div className="salon-detail-actions">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              View on Google Maps
            </a>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleDirections}
            disabled={directionsLoading}
          >
            {directionsLoading ? 'Opening…' : 'Get directions'}
          </button>
        </div>
        {salon.latitude != null && salon.longitude != null && (
          <div className="map-embed">
            <iframe
              title={`Map of ${salon.name}`}
              src={`https://maps.google.com/maps?q=${salon.latitude},${salon.longitude}&z=15&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </header>

      <div className="panel">
        <h2>Services</h2>
      {services.length === 0 ? (
        <p className="status">No services listed for this salon.</p>
      ) : (
        <ul className="service-list">
          {services.map((service) => (
            <li key={service.id} className="service-item">
              <div>
                <strong>{service.name}</strong>
                <span className="service-meta">
                  {service.duration} min · ₹{service.price}
                </span>
                {service.description && <p>{service.description}</p>}
              </div>
              <Link
                to={`/salons/${salon.id}/book`}
                state={{ serviceId: service.id, serviceName: service.name }}
                className="btn btn-green btn-sm"
              >
                Book
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  )
}
