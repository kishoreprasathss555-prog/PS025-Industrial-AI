import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string') {
    return `${envUrl.replace(/\/+$/, '')}/api`
  }
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 8000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ps025_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ps025_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
