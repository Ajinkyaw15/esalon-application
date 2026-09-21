export type GeoErrorCode =
  | 'unsupported'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unknown'

export class GeoError extends Error {
  code: GeoErrorCode
  constructor(code: GeoErrorCode, message: string) {
    super(message)
    this.name = 'GeoError'
    this.code = code
  }
}

export interface UserCoords {
  latitude: number
  longitude: number
  updatedAt: number
}

const LOCATION_KEY = 'userLocation'
const MAX_CACHE_MS = 60_000

export function getCachedLocation(maxAgeMs = MAX_CACHE_MS): UserCoords | null {
  try {
    const raw = sessionStorage.getItem(LOCATION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserCoords
    if (
      typeof parsed.latitude !== 'number' ||
      typeof parsed.longitude !== 'number' ||
      typeof parsed.updatedAt !== 'number'
    ) {
      return null
    }
    if (Date.now() - parsed.updatedAt > maxAgeMs) return null
    return parsed
  } catch {
    return null
  }
}

export function cacheLocation(coords: UserCoords) {
  sessionStorage.setItem(LOCATION_KEY, JSON.stringify(coords))
}

export function clearCachedLocation() {
  sessionStorage.removeItem(LOCATION_KEY)
}

export function getUserLocation(options?: {
  forceRefresh?: boolean
}): Promise<UserCoords> {
  const forceRefresh = options?.forceRefresh ?? false
  if (!forceRefresh) {
    const cached = getCachedLocation()
    if (cached) return Promise.resolve(cached)
  }

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new GeoError(
          'unsupported',
          'This browser does not support location. Search by city instead.',
        ),
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: UserCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          updatedAt: Date.now(),
        }
        cacheLocation(coords)
        resolve(coords)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new GeoError(
              'denied',
              'Location access is required to find salons near you.',
            ),
          )
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(
            new GeoError(
              'unavailable',
              'Unable to detect your location. Please try again.',
            ),
          )
        } else if (err.code === err.TIMEOUT) {
          reject(
            new GeoError(
              'timeout',
              'Location request timed out. Please try again.',
            ),
          )
        } else {
          reject(
            new GeoError(
              'unknown',
              'Unable to detect your location. Please try again.',
            ),
          )
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: forceRefresh ? 0 : 30000,
      },
    )
  })
}

export function googleMapsDirectionsUrl(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  return (
    'https://www.google.com/maps/dir/?api=1' +
    `&origin=${fromLat},${fromLng}` +
    `&destination=${toLat},${toLng}`
  )
}

export function openGoogleMapsDirections(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  window.open(
    googleMapsDirectionsUrl(fromLat, fromLng, toLat, toLng),
    '_blank',
    'noopener,noreferrer',
  )
}

export async function openDirectionsToSalon(salonId: number): Promise<void>
export async function openDirectionsToSalon(salon: {
  id: number
  latitude?: number
  longitude?: number
}): Promise<void>
export async function openDirectionsToSalon(
  salonOrId: number | { id: number; latitude?: number; longitude?: number },
) {
  const salon = typeof salonOrId === 'number' ? { id: salonOrId } : salonOrId
  const coords = await getUserLocation()
  if (salon.latitude != null && salon.longitude != null) {
    openGoogleMapsDirections(
      coords.latitude,
      coords.longitude,
      salon.latitude,
      salon.longitude,
    )
    return
  }
  const { getDirectionsToSalon } = await import('../api/mapsApi')
  const res = await getDirectionsToSalon(
    salon.id,
    coords.latitude,
    coords.longitude,
  )
  window.open(res.data.directionsUrl, '_blank', 'noopener,noreferrer')
}

export function formatDistanceKm(km: number) {
  return `${km.toFixed(1)} km away`
}
