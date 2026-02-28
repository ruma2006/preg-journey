import api from './api'
import { ApiResponse, PaginatedResponse, Consultation, ConsultationRequest } from '@/types'

export const consultationService = {
  schedule: async (data: ConsultationRequest): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>('/consultations', data)
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/consultations/${id}`)
  },

  getById: async (id: number): Promise<Consultation> => {
    const response = await api.get<ApiResponse<Consultation>>(`/consultations/${id}`)
    return response.data.data
  },

  start: async (id: number): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/consultations/${id}/start`)
    return response.data.data
  },

  complete: async (id: number, data: Partial<ConsultationRequest>): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/consultations/${id}/complete`, data)
    return response.data.data
  },

  cancel: async (id: number, reason: string, cancelledBy: string): Promise<Consultation> => {
    const response = await api.post<ApiResponse<Consultation>>(`/consultations/${id}/cancel`, null, {
      params: { reason, cancelledBy },
    })
    return response.data.data
  },

  getByPatient: async (patientId: number): Promise<Consultation[]> => {
    const response = await api.get<ApiResponse<Consultation[]>>(`/consultations/patient/${patientId}`)
    return response.data.data
  },

  getByDoctor: async (doctorId: number, page = 0, size = 10): Promise<PaginatedResponse<Consultation>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Consultation>>>(`/consultations/doctor/${doctorId}`, {
      params: { page, size },
    })
    return response.data.data
  },

  getTodayForDoctor: async (doctorId: number): Promise<Consultation[]> => {
    const response = await api.get<ApiResponse<Consultation[]>>(`/consultations/doctor/${doctorId}/today`)
    return response.data.data
  },

  getUpcomingForDoctor: async (doctorId: number): Promise<Consultation[]> => {
    const response = await api.get<ApiResponse<Consultation[]>>(`/consultations/doctor/${doctorId}/upcoming`)
    return response.data.data
  },

  getUpcoming: async (page = 0, size = 10): Promise<PaginatedResponse<Consultation>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Consultation>>>('/consultations/upcoming', {
      params: { page, size },
    })
    return response.data.data
  },
}
