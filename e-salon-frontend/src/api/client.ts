import axios from 'axios'

const api = axios.create({
  baseURL: '/api',  // uses Vite proxy → :8080
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