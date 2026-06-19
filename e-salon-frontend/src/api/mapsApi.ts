import api from './client'
import type { SalonLocation } from '../types'

export const getNearbySalons = (
  latitude: number,
  longitude: number,
  radiusKm = 10,
) =>
  api.get<SalonLocation[]>('/maps/nearby', {
    params: { latitude, longitude, radiusKm },
  })

export const getSalonsByCity = (city: string) =>
  api.get<SalonLocation[]>(`/maps/city/${encodeURIComponent(city.trim())}`)

export const getSalonMapsLink = (salonId: number) =>
  api.get<{ googleMapsUrl: string }>(`/maps/salon/${salonId}/link`)

export const getDirectionsToSalon = (
  salonId: number,
  fromLat: number,
  fromLng: number,
) =>
  api.get<{ directionsUrl: string }>(`/maps/directions/salon/${salonId}`, {
    params: { fromLat, fromLng },
  })
