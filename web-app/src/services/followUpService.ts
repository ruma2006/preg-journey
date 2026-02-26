import api from './api'
import { ApiResponse, PaginatedResponse, FollowUp, FollowUpRequest, FollowUpUpdateRequest } from '@/types'

export const followUpService = {
  create: async (data: FollowUpRequest): Promise<FollowUp> => {
    const response = await api.post<ApiResponse<FollowUp>>('/follow-ups', data)
    return response.data.data
  },

  getById: async (id: number): Promise<FollowUp> => {
    const response = await api.get<ApiResponse<FollowUp>>(`/follow-ups/${id}`)
    return response.data.data
  },

  update: async (id: number, data: FollowUpUpdateRequest): Promise<FollowUp> => {
    const response = await api.put<ApiResponse<FollowUp>>(`/follow-ups/${id}`, data)
    return response.data.data
  },

  reschedule: async (id: number, newDate: string): Promise<FollowUp> => {
    const response = await api.patch<ApiResponse<FollowUp>>(`/follow-ups/${id}/reschedule`, null, {
      params: { newDate },
    })
    return response.data.data
  },

  reassign: async (id: number, newAssigneeId: number): Promise<FollowUp> => {
    const response = await api.patch<ApiResponse<FollowUp>>(`/follow-ups/${id}/reassign`, null, {
      params: { newAssigneeId },
    })
    return response.data.data
  },

  getByPatient: async (patientId: number): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>(`/follow-ups/patient/${patientId}`)
    return response.data.data
  },

  getByUser: async (userId: number, page = 0, size = 10): Promise<PaginatedResponse<FollowUp>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<FollowUp>>>(`/follow-ups/user/${userId}`, {
      params: { page, size },
    })
    return response.data.data
  },

  getTodayPendingForUser: async (userId: number): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>(`/follow-ups/user/${userId}/today`)
    return response.data.data
  },

  getToday: async (): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/today')
    return response.data.data
  },

  getOverdue: async (): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/overdue')
    return response.data.data
  },

  getUpcoming: async (): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/upcoming')
    return response.data.data
  },

  getRequiringDoctor: async (): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/requiring-doctor')
    return response.data.data
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/range', {
      params: { startDate, endDate },
    })
    return response.data.data
  },

  getAll: async (): Promise<FollowUp[]> => {
    const response = await api.get<ApiResponse<FollowUp[]>>('/follow-ups/all')
    return response.data.data
  },
}
