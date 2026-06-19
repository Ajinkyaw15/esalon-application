import api from './client'
import type { Appointment, AppointmentRequest } from '../types'

export const getAvailableSlots = (salonId: number, date: string) =>
  api.get<string[]>('/appointments/slots', { params: { salonId, date } })

export const bookAppointment = (data: AppointmentRequest) =>
  api.post<Appointment>('/appointments/book', data)

export const getMyAppointments = () => api.get<Appointment[]>('/appointments/my')

export const cancelAppointment = (id: number) =>
  api.put<Appointment>(`/appointments/${id}/cancel`)
