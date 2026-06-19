const SALON_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1560066984-138d7174c035?w=640&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=640&q=80',
  'https://images.unsplash.com/photo-1633681926022-84c23e8cb04d?w=640&q=80',
  'https://images.unsplash.com/photo-1595475882-399b3b0b0e3a?w=640&q=80',
]

export function getSalonImageUrl(imageUrl?: string | null, id = 0): string {
  if (imageUrl?.trim()) return imageUrl
  return SALON_PLACEHOLDERS[id % SALON_PLACEHOLDERS.length]
}

export const HERO_BG =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&q=85'

export const AUTH_BG =
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1920&q=80'
