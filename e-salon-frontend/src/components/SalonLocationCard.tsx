import { Link } from 'react-router-dom'
import type { SalonLocation } from '../types'

interface SalonLocationCardProps {
  salon: SalonLocation
  showDistance?: boolean
  onDirections?: (salonId: number) => void
  directionsLoading?: boolean
}

export default function SalonLocationCard({
  salon,
  showDistance = false,
  onDirections,
  directionsLoading = false,
}: SalonLocationCardProps) {
  return (
    <article className="salon-card">
      <div className="salon-card-body">
        <h2>{salon.name}</h2>
        <p className="salon-meta">
          {salon.city}
          {showDistance && salon.distanceKm > 0 && (
            <> · {salon.distanceKm} km away</>
          )}
          {salon.rating > 0 && <> · ★ {salon.rating.toFixed(1)}</>}
        </p>
        <p className="salon-address">{salon.address}</p>
        {salon.phone && <p className="salon-phone">{salon.phone}</p>}
      </div>
      <div className="salon-card-actions">
        <Link to={`/salons/${salon.id}`} className="btn btn-primary btn-sm">
          View & book
        </Link>
        <a
          href={salon.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
        >
          Map
        </a>
        {onDirections && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={directionsLoading}
            onClick={() => onDirections(salon.id)}
          >
            {directionsLoading ? '…' : 'Directions'}
          </button>
        )}
      </div>
    </article>
  )
}
