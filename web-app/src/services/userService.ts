import { ApiResponse, PaginatedResponse, User, UserRegistrationRequest, UserRole } from '@/types'
import api from './api'

export const userService = {
  create: async (data: UserRegistrationRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', data)
    return response.data.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`)
    return response.data.data
  },

  getAll: async (page = 0, size = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params: { page, size },
    })
    return response.data.data
  },

  getByRole: async (role: UserRole): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>(`/users/role/${role}`)
    return response.data.data
  },

  getDoctors: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users/doctors')
    return response.data.data
  },

  getHelpDeskUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users/help-desk')
    return response.data.data
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data.data
  },

  updateRole: async (id: number, role: UserRole): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, null, {
      params: { role },
    })
    return response.data.data
  },

  deactivate: async (id: number): Promise<void> => {
    await api.post(`/users/${id}/deactivate`)
  },

  activate: async (id: number): Promise<void> => {
    await api.post(`/users/${id}/activate`)
  },

  resetPassword: async (id: number): Promise<string> => {
    const response = await api.post<ApiResponse<string>>(`/users/${id}/reset-password`)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },

  changePassword: async (id: number, newPassword: string): Promise<void> => {
    await api.post(`/users/${id}/change-password`, null, {
      params: { newPassword },
    })
  },

  // Current user profile methods
  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/me')
    return response.data.data
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/me', data)
    return response.data.data
  },

  uploadProfilePhoto: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<User>>('/users/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  changeMyPassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    })
  },
}
