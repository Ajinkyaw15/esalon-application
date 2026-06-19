export interface AuthResponse {
  token: string
  email: string
  firstName: string
  lastName: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

export interface Salon {
  id: number
  name: string
  description?: string
  address: string
  city: string
  state: string
  postalCode?: string
  phone: string
  email?: string
  latitude?: number
  longitude?: number
  rating?: number
  totalReviews?: number
  imageUrl?: string
  openingTime?: string
  closingTime?: string
  workingDays?: string
}

/** Salon with distance + map links from /api/maps */
export interface SalonLocation {
  id: number
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  distanceKm: number
  googleMapsUrl: string
  rating: number
  phone: string
}

export interface Service {
  id: number
  salonId: number
  name: string
  description?: string
  duration: number
  price: number
  category: string
  imageUrl?: string
}

export interface AppointmentRequest {
  salonId: number
  serviceId: number
  appointmentDate: string
  appointmentTime: string
  notes?: string
}

export interface Appointment {
  id: number
  salonName: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  price: number
  status: string
  notes?: string
}

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  profileImageUrl?: string
  role: string
  createdAt?: string
  recentAppointments?: Appointment[]
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phone: string
}

export type SearchMode = 'all' | 'city' | 'nearby'
