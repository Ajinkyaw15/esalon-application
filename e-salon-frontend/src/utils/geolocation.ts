import { getDirectionsToSalon } from '../api/mapsApi'

const LOCATION_KEY = 'userLocation'

export interface UserCoords {
  latitude: number
  longitude: number
}

export function getCachedLocation(): UserCoords | null {
  try {
    const raw = sessionStorage.getItem(LOCATION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserCoords
  } catch {
    return null
  }
}

export function cacheLocation(coords: UserCoords) {
  sessionStorage.setItem(LOCATION_KEY, JSON.stringify(coords))
}

export function getUserLocation(): Promise<UserCoords> {
  const cached = getCachedLocation()
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }
        cacheLocation(coords)
        resolve(coords)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Location permission denied. Enable location in browser settings.'))
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new Error('Location unavailable. Try again or search by city.'))
        } else {
          reject(new Error('Could not get your location. Try again or search by city.'))
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  })
}

/** Open Google Maps directions in a new tab */
export async function openDirectionsToSalon(salonId: number) {
  const coords = await getUserLocation()
  const res = await getDirectionsToSalon(
    salonId,
    coords.latitude,
    coords.longitude,
  )
  window.open(res.data.directionsUrl, '_blank', 'noopener,noreferrer')
}
