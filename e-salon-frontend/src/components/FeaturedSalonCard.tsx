import { Link } from 'react-router-dom'
import { getSalonImageUrl } from '../utils/salonImages'
import { formatDistanceKm } from '../utils/geolocation'

interface FeaturedSalonCardProps {
  id: number
  name: string
  city: string
  address?: string
  rating?: number
  distanceKm?: number
  imageUrl?: string
  openingTime?: string
  closingTime?: string
  services?: string[]
  nextAvailableSlot?: string
  requestedService?: string
  onDirections?: () => void
  directionsLoading?: boolean
  selected?: boolean
  onSelect?: () => void
}

export default function FeaturedSalonCard({
  id,
  name,
  city,
  address,
  rating = 0,
  distanceKm,
  imageUrl,
  openingTime,
  closingTime,
  services,
  nextAvailableSlot,
  requestedService,
  onDirections,
  directionsLoading,
  selected,
  onSelect,
}: FeaturedSalonCardProps) {
  return (
    <article
      className={`featured-card ${selected ? 'featured-card-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="featured-card-image">
        <img src={getSalonImageUrl(imageUrl, id)} alt={name} loading="lazy" />
      </div>
      <div className="featured-card-body">
        <h3>{name}</h3>
        {rating > 0 && (
          <p className="featured-card-city">
            ★ {rating.toFixed(1)}
          </p>
        )}
        {distanceKm != null && (
          <p className="featured-distance">{formatDistanceKm(distanceKm)}</p>
        )}
        <p className="featured-card-city">
          📌 {address ? `${address}` : city}
        </p>
        {(openingTime || closingTime) && (
          <p className="featured-card-city">
            🕐 {openingTime && closingTime
              ? `Open ${openingTime} – ${closingTime}`
              : closingTime
                ? `Open until ${closingTime}`
                : `Opens ${openingTime}`}
          </p>
        )}
        {services && services.length > 0 && (
          <p className="featured-card-city">{services.slice(0, 3).join(' • ')}</p>
        )}
        {nextAvailableSlot && (
          <p className="availability-chip">
            🟢 {requestedService ? `${requestedService} available` : 'Next opening'} at{' '}
            {nextAvailableSlot.replace(/^\d{4}-\d{2}-\d{2}\s/, '')}
          </p>
        )}
        <div className="salon-card-actions">
          <Link to={`/salons/${id}`} className="btn btn-green btn-sm" onClick={(e) => e.stopPropagation()}>
            View Salon
          </Link>
          {onDirections && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={directionsLoading}
              onClick={(e) => {
                e.stopPropagation()
                onDirections()
              }}
            >
              {directionsLoading ? 'Opening…' : 'Directions'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
