import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { isAuthenticated, firstName, logout } = useAuth()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className={`site-header ${isHome ? '' : 'site-header--inner'}`}>
      <nav className="nav-inner">
        <Logo light />

        <ul className="nav-menu">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <a href="/#salons">Services</a>
          </li>
          <li>
            <a href="/#salons">Salons</a>
          </li>
          <li>
            <a href="/#contact">Contact</a>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <NavLink to="/appointments">Bookings</NavLink>
              </li>
              <li>
                <NavLink to="/profile">Profile</NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-greeting">Hi, {firstName}</span>
              <button type="button" className="btn btn-outline-gold btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-gold">
              Book Now
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
