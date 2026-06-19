import { Link } from 'react-router-dom'
import type { Salon } from '../types'

export default function SalonCard({ salon }: { salon: Salon }) {
  return (
    <article className="salon-card">
      <div className="salon-card-body">
        <h2>{salon.name}</h2>
        <p className="salon-meta">
          {salon.city}, {salon.state}
          {salon.rating != null && ` · ★ ${Number(salon.rating).toFixed(1)}`}
        </p>
        <p className="salon-address">{salon.address}</p>
        {salon.description && <p className="salon-desc">{salon.description}</p>}
      </div>
      <Link to={`/salons/${salon.id}`} className="btn btn-primary">
        View & book
      </Link>
    </article>
  )
}
