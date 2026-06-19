import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errors'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Welcome Back!</h1>
      <p className="auth-lead">Please enter your details to login.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <div className="auth-field">
          <label>
            <span aria-hidden>👤</span> Email Address
          </label>
          <div className="auth-input-wrap">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>
            <span aria-hidden>🔒</span> Password
          </label>
          <div className="auth-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-toggle-pw"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember Me
          </label>
          <span className="auth-link">Forgot Password?</span>
        </div>

        <button type="submit" className="btn btn-green auth-submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="auth-divider">Or login with</div>
      <div className="auth-social">
        <button type="button" className="social-fb" disabled>
          Facebook
        </button>
        <button type="button" className="social-google" disabled>
          Google
        </button>
      </div>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  )
}
