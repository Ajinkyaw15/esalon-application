import api from './client'
import type { Salon, Service } from '../types'

export const getSalons = () => api.get<Salon[]>('/salons')

export const getSalonById = (id: number) => api.get<Salon>(`/salons/${id}`)

export const getServicesBySalon = (salonId: number) =>
  api.get<Service[]>(`/services/salon/${salonId}`)

export const getAllServices = () => api.get<Service[]>('/services')

export const getNearbySalons = (
  latitude: number,
  longitude: number,
  radiusKm = 5,
  options?: { serviceId?: number; serviceName?: string; sort?: string },
) =>
  api.get<import('../types').SalonLocation[]>('/salons/nearby', {
    params: {
      latitude,
      longitude,
      radius: radiusKm,
      serviceId: options?.serviceId,
      serviceName: options?.serviceName,
      sort: options?.sort ?? 'nearest',
    },
  })
