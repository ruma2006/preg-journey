import api from './api'
import { ApiResponse, PaginatedResponse, RiskAlert, RiskLevel, AlertType } from '@/types'

export const alertService = {
  getById: async (id: number): Promise<RiskAlert> => {
    const response = await api.get<ApiResponse<RiskAlert>>(`/alerts/${id}`)
    return response.data.data
  },

  getByPatient: async (patientId: number): Promise<RiskAlert[]> => {
    const response = await api.get<ApiResponse<RiskAlert[]>>(`/alerts/patient/${patientId}`)
    return response.data.data
  },

  getUnacknowledged: async (page = 0, size = 10): Promise<PaginatedResponse<RiskAlert>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<RiskAlert>>>('/alerts/unacknowledged', {
      params: { page, size },
    })
    return response.data.data
  },

  getUnacknowledgedOrdered: async (): Promise<RiskAlert[]> => {
    const response = await api.get<ApiResponse<RiskAlert[]>>('/alerts/unacknowledged/ordered')
    return response.data.data
  },

  getCritical: async (): Promise<RiskAlert[]> => {
    const response = await api.get<ApiResponse<RiskAlert[]>>('/alerts/critical')
    return response.data.data
  },

  getHighPriority: async (page = 0, size = 10): Promise<PaginatedResponse<RiskAlert>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<RiskAlert>>>('/alerts/high-priority', {
      params: { page, size },
    })
    return response.data.data
  },

  getUnresolved: async (): Promise<RiskAlert[]> => {
    const response = await api.get<ApiResponse<RiskAlert[]>>('/alerts/unresolved')
    return response.data.data
  },

  getBySeverity: async (severity: RiskLevel, page = 0, size = 10): Promise<PaginatedResponse<RiskAlert>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<RiskAlert>>>(`/alerts/severity/${severity}`, {
      params: { page, size },
    })
    return response.data.data
  },

  getByType: async (alertType: AlertType): Promise<RiskAlert[]> => {
    const response = await api.get<ApiResponse<RiskAlert[]>>(`/alerts/type/${alertType}`)
    return response.data.data
  },

  acknowledge: async (id: number, notes?: string, actionTaken?: string): Promise<RiskAlert> => {
    const response = await api.post<ApiResponse<RiskAlert>>(`/alerts/${id}/acknowledge`, {
      notes,
      actionTaken,
    })
    return response.data.data
  },

  updateAcknowledgement: async (id: number, notes?: string, actionTaken?: string): Promise<RiskAlert> => {
    const response = await api.put<ApiResponse<RiskAlert>>(`/alerts/${id}/acknowledgement`, {
      notes,
      actionTaken,
    })
    return response.data.data
  },

  resolve: async (id: number, resolutionNotes: string): Promise<RiskAlert> => {
    const response = await api.post<ApiResponse<RiskAlert>>(`/alerts/${id}/resolve`, null, {
      params: { resolutionNotes },
    })
    return response.data.data
  },

  bulkAcknowledge: async (alertIds: number[]): Promise<void> => {
    await api.post('/alerts/bulk-acknowledge', alertIds)
  },

  countUnacknowledged: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/alerts/stats/unacknowledged')
    return response.data.data
  },

  countCritical: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/alerts/stats/critical')
    return response.data.data
  },

  getAll: async (page = 0, size = 10): Promise<PaginatedResponse<RiskAlert>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<RiskAlert>>>('/alerts', {
      params: { page, size },
    })
    return response.data.data
  },

  getAcknowledged: async (page = 0, size = 10): Promise<PaginatedResponse<RiskAlert>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<RiskAlert>>>('/alerts/acknowledged', {
      params: { page, size },
    })
    return response.data.data
  },

  getAllForPatient: async (patientId: number, page = 0, size = 10): Promise<PaginatedResponse<RiskAlert>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<RiskAlert>>>(`/alerts/patient/${patientId}/all`, {
      params: { page, size },
    })
    return response.data.data
  },
}
