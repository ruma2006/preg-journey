import api from './api'
import { ApiResponse, AuthRequest, AuthResponse, UserRegistrationRequest } from '@/types'

export const authService = {
  login: async (credentials: AuthRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    return response.data.data
  },

  register: async (data: UserRegistrationRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', null, {
      params: { refreshToken },
    })
    return response.data.data
  },
}
