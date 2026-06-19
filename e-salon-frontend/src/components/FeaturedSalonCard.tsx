import { Link } from 'react-router-dom'
import { getSalonImageUrl } from '../utils/salonImages'

interface FeaturedSalonCardProps {
  id: number
  name: string
  city: string
  rating?: number
  distanceKm?: number
  imageUrl?: string
}

export default function FeaturedSalonCard({
  id,
  name,
  city,
  rating = 0,
  distanceKm,
  imageUrl,
}: FeaturedSalonCardProps) {
  return (
    <article className="featured-card">
      <div className="featured-card-image">
        <img src={getSalonImageUrl(imageUrl, id)} alt={name} loading="lazy" />
      </div>
      <div className="featured-card-body">
        <h3>{name}</h3>
        <p className="featured-card-city">{city}</p>
        <div className="featured-card-meta">
          {rating > 0 && (
            <span className="featured-rating">
              <span className="star" aria-hidden>
                ★
              </span>{' '}
              {rating.toFixed(1)}
            </span>
          )}
          {distanceKm != null && distanceKm > 0 && (
            <span className="featured-distance">{distanceKm} km</span>
          )}
        </div>
        <Link to={`/salons/${id}`} className="btn btn-green btn-block">
          <span className="leaf" aria-hidden>
            ♻
          </span>{' '}
          Book Now
        </Link>
      </div>
    </article>
  )
}
