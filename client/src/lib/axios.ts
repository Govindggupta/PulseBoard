import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token')

  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = String(error.config?.url ?? '')

    if (
      status === 401 &&
      !requestUrl.includes('/api/auth/signin') &&
      !requestUrl.includes('/api/auth/signup')
    ) {
      localStorage.removeItem('pb_token')
      localStorage.removeItem('pb_user')
      window.location.href = '/signin'
    }

    return Promise.reject(error)
  },
)