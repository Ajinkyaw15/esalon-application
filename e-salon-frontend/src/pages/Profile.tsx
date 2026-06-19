import { useEffect, useState, type FormEvent } from 'react'
import { getProfile, updateProfile } from '../api/profileApi'
import { getErrorMessage } from '../utils/errors'
import type { UserProfile } from '../types'

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getProfile()
      .then((res) => {
        setProfile(res.data)
        setForm({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phone: res.data.phone ?? '',
        })
      })
      .catch((err) => setError(getErrorMessage(err, 'Could not load profile')))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSubmitting(true)
    try {
      const res = await updateProfile(form)
      setProfile(res.data)
      setMessage('Profile updated.')
    } catch (err) {
      setError(getErrorMessage(err, 'Update failed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="status">Loading profile...</p>
  if (error && !profile) return <p className="status error">{error}</p>

  return (
    <div className="inner-page page-shell">
      <header className="page-header">
        <h1 className="page-title">Profile</h1>
        {profile && <p className="page-lead">{profile.email}</p>}
      </header>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <label>
          First name
          <input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
        </label>
        <label>
          Last name
          <input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-green" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
