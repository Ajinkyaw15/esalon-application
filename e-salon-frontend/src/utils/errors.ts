import axios from 'axios'

export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | string | undefined
    if (typeof data === 'string' && data) return data
    if (data && typeof data === 'object' && data.message) return data.message
    if (err.response?.status === 401) return 'Invalid email or password'
    if (err.response?.status === 403) {
      return 'Access denied — restart the Spring Boot backend after the security fix'
    }
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
