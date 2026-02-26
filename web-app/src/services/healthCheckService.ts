import api from './api'
import { ApiResponse, PaginatedResponse, HealthCheck, HealthCheckRequest } from '@/types'

export const healthCheckService = {
  perform: async (data: HealthCheckRequest): Promise<HealthCheck> => {
    const response = await api.post<ApiResponse<HealthCheck>>('/health-checks', data)
    return response.data.data
  },

  getById: async (id: number): Promise<HealthCheck> => {
    const response = await api.get<ApiResponse<HealthCheck>>(`/health-checks/${id}`)
    return response.data.data
  },

  getByPatient: async (patientId: number): Promise<HealthCheck[]> => {
    const response = await api.get<ApiResponse<HealthCheck[]>>(`/health-checks/patient/${patientId}`)
    return response.data.data
  },

  getByPatientPaginated: async (patientId: number, page = 0, size = 10): Promise<PaginatedResponse<HealthCheck>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<HealthCheck>>>(`/health-checks/patient/${patientId}/paginated`, {
      params: { page, size },
    })
    return response.data.data
  },

  getLatest: async (patientId: number): Promise<HealthCheck | null> => {
    const response = await api.get<ApiResponse<HealthCheck>>(`/health-checks/patient/${patientId}/latest`)
    return response.data.data
  },

  getHighRisk: async (page = 0, size = 10): Promise<PaginatedResponse<HealthCheck>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<HealthCheck>>>('/health-checks/high-risk', {
      params: { page, size },
    })
    return response.data.data
  },

  getOverdue: async (): Promise<HealthCheck[]> => {
    const response = await api.get<ApiResponse<HealthCheck[]>>('/health-checks/overdue')
    return response.data.data
  },

  getDueToday: async (): Promise<HealthCheck[]> => {
    const response = await api.get<ApiResponse<HealthCheck[]>>('/health-checks/due-today')
    return response.data.data
  },

  countToday: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/health-checks/stats/today')
    return response.data.data
  },
}
