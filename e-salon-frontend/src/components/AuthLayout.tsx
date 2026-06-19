import { Link, Outlet } from 'react-router-dom'
import { AUTH_BG } from '../utils/salonImages'
import Logo from './Logo'

export default function AuthLayout() {
  return (
    <div className="auth-shell" style={{ backgroundImage: `url(${AUTH_BG})` }}>
      <div className="auth-shell-overlay" aria-hidden />
      <header className="auth-top">
        <Logo light />
        <Link to="/" className="btn btn-gold btn-sm">
          Back to Home
        </Link>
      </header>
      <main className="auth-main">
        <Outlet />
      </main>
      <footer className="auth-footer">© {new Date().getFullYear()} Ecozii. All rights reserved.</footer>
    </div>
  )
}
