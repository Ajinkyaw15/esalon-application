import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  bookAppointment,
  getAvailableSlots,
} from '../api/appointmentApi'
import { getSalonById, getServicesBySalon } from '../api/salonApi'
import { getErrorMessage } from '../utils/errors'
import type { Salon, Service } from '../types'

type BookLocationState = {
  serviceId?: number
  serviceName?: string
}

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>()
  const salonId = Number(id)
  const location = useLocation()
  const preselected = (location.state as BookLocationState | null) ?? {}

  const [salon, setSalon] = useState<Salon | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState<number | ''>(
    preselected.serviceId ?? '',
  )
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!salonId || Number.isNaN(salonId)) {
      setError('Invalid salon')
      setLoading(false)
      return
    }
    Promise.all([getSalonById(salonId), getServicesBySalon(salonId)])
      .then(([salonRes, servicesRes]) => {
        setSalon(salonRes.data)
        setServices(servicesRes.data)
        if (!preselected.serviceId && servicesRes.data.length === 1) {
          setServiceId(servicesRes.data[0].id)
        }
      })
      .catch(() => setError('Could not load salon details.'))
      .finally(() => setLoading(false))
  }, [salonId, preselected.serviceId])

  useEffect(() => {
    if (!salonId || !date) {
      setSlots([])
      return
    }
    setLoadingSlots(true)
    getAvailableSlots(salonId, date)
      .then((res) => {
        setSlots(res.data)
        if (res.data.length && !res.data.includes(time)) {
          setTime('')
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [salonId, date, time])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!serviceId || !date || !time) {
      setError('Please select a service, date, and time slot.')
      return
    }
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const appointmentTime = time.length === 5 ? `${time}:00` : time
      await bookAppointment({
        salonId,
        serviceId: Number(serviceId),
        appointmentDate: date,
        appointmentTime,
        notes: notes || undefined,
      })
      setSuccess('Appointment booked successfully!')
    } catch (err) {
      setError(getErrorMessage(err, 'Booking failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  if (loading) return <p className="status">Loading...</p>
  if (error && !salon) return <p className="status error">{error}</p>

  return (
    <div className="inner-page page-shell">
      <Link to={`/salons/${salonId}`} className="back-link">
        ← Back to salon
      </Link>
      <header className="page-header">
        <h1 className="page-title">Book appointment</h1>
        {salon && <p className="page-lead">{salon.name}</p>}
        {preselected.serviceName && (
          <p className="salon-meta">Service: {preselected.serviceName}</p>
        )}
      </header>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <label>
          Service
          <select
            value={serviceId}
            onChange={(e) =>
              setServiceId(e.target.value ? Number(e.target.value) : '')
            }
            required
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.duration} min, ₹{s.price}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Time slot
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            disabled={!date || loadingSlots}
          >
            <option value="">
              {loadingSlots
                ? 'Loading slots...'
                : !date
                  ? 'Pick a date first'
                  : slots.length
                    ? 'Select a time'
                    : 'No slots available'}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot.slice(0, 5)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </label>

        <button type="submit" className="btn btn-green" disabled={submitting}>
          {submitting ? 'Booking...' : 'Confirm booking'}
        </button>
      </form>

      {success && (
        <p className="auth-switch">
          <Link to="/appointments">View my bookings</Link>
        </p>
      )}
    </div>
  )
}
