import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const url = config.url ?? ''
  const isAuthRoute = url.startsWith('/auth/')
  const token = localStorage.getItem('token')
  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api