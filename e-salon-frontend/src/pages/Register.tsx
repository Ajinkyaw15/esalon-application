import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../utils/errors'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Join Ecozii</h1>
      <p className="auth-lead">Create your account and book premium salon services.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <div className="form-row-2">
          <div className="auth-field">
            <label>First name</label>
            <div className="auth-input-wrap">
              <input
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="auth-field">
            <label>Last name</label>
            <div className="auth-input-wrap">
              <input
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="auth-field">
          <label>Email</label>
          <div className="auth-input-wrap">
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Phone</label>
          <div className="auth-input-wrap">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Password</label>
          <div className="auth-input-wrap">
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-green auth-submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
