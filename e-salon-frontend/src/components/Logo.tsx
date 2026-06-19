import { Link } from 'react-router-dom'

interface LogoProps {
  light?: boolean
  className?: string
}

export default function Logo({ light = false, className = '' }: LogoProps) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''} ${className}`.trim()}>
      <span className="logo-mark" aria-hidden>
        E
      </span>
      <span className="logo-text">Ecozii</span>
    </Link>
  )
}
