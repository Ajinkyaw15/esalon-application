import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  cancelAppointment,
  getMyAppointments,
} from '../api/appointmentApi'
import { getErrorMessage } from '../utils/errors'
import type { Appointment } from '../types'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  function load() {
    setLoading(true)
    getMyAppointments()
      .then((res) => setAppointments(res.data))
      .catch((err) => setError(getErrorMessage(err, 'Could not load appointments')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(id: number) {
    if (!confirm('Cancel this appointment?')) return
    setCancellingId(id)
    try {
      await cancelAppointment(id)
      load()
    } catch (err) {
      alert(getErrorMessage(err, 'Could not cancel'))
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <p className="status">Loading bookings...</p>
  if (error) return <p className="status error">{error}</p>

  return (
    <div className="inner-page page-shell">
      <header className="page-header">
        <h1 className="page-title">My bookings</h1>
        <p className="page-lead">Your upcoming and past appointments.</p>
      </header>

      {appointments.length === 0 ? (
        <p className="status">
          No bookings yet. <Link to="/">Browse salons</Link>
        </p>
      ) : (
        <ul className="appointment-list">
          {appointments.map((apt) => (
            <li key={apt.id} className="appointment-item">
              <div>
                <strong>{apt.salonName}</strong> — {apt.serviceName}
                <p className="salon-meta">
                  {apt.appointmentDate} at {String(apt.appointmentTime).slice(0, 5)}{' '}
                  · {apt.duration} min · ₹{apt.price}
                </p>
                <span className={`badge badge-${apt.status.toLowerCase()}`}>
                  {apt.status}
                </span>
              </div>
              {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={cancellingId === apt.id}
                  onClick={() => handleCancel(apt.id)}
                >
                  {cancellingId === apt.id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
