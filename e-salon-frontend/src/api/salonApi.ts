import api from './client'
import type { Salon, Service } from '../types'

export const getSalons = () => api.get<Salon[]>('/salons')

export const getSalonById = (id: number) => api.get<Salon>(`/salons/${id}`)

export const getServicesBySalon = (salonId: number) =>
  api.get<Service[]>(`/services/salon/${salonId}`)
