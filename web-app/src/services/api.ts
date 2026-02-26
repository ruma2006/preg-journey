import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_BASE_URL = '/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken && originalRequest) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            params: { refreshToken },
          })
          const newAuth = response.data.data
          useAuthStore.getState().setAuth(newAuth)

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAuth.accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh failed, logout
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } else {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action')
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error(error.response.data?.message || 'Resource not found')
    }

    // Handle 409 Conflict
    if (error.response?.status === 409) {
      toast.error(error.response.data?.message || 'Resource already exists')
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('An unexpected error occurred. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api
