import api from './api'
import { ApiResponse, PaginatedResponse, Patient, PatientRegistrationRequest, PatientStatus, RiskLevel, DeliveryCompletionRequest } from '@/types'

export const patientService = {
  register: async (data: PatientRegistrationRequest): Promise<Patient> => {
    const response = await api.post<ApiResponse<Patient>>('/patients', data)
    return response.data.data
  },

  getById: async (id: number): Promise<Patient> => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`)
    return response.data.data
  },

  getByMotherId: async (motherId: string): Promise<Patient> => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/mother-id/${motherId}`)
    return response.data.data
  },

  getAll: async (page = 0, size = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients', {
      params: { page, size },
    })
    return response.data.data
  },

  getByStatus: async (status: PatientStatus, page = 0, size = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>(`/patients/status/${status}`, {
      params: { page, size },
    })
    return response.data.data
  },

  getByRiskLevel: async (riskLevel: RiskLevel, page = 0, size = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>(`/patients/risk-level/${riskLevel}`, {
      params: { page, size },
    })
    return response.data.data
  },

  getHighRisk: async (): Promise<Patient[]> => {
    const response = await api.get<ApiResponse<Patient[]>>('/patients/high-risk')
    return response.data.data
  },

  getAtRisk: async (page = 0, size = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/at-risk', {
      params: { page, size },
    })
    return response.data.data
  },

  search: async (query: string, page = 0, size = 10): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/search', {
      params: { query, page, size },
    })
    return response.data.data
  },

  update: async (id: number, data: Partial<Patient>): Promise<Patient> => {
    const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data)
    return response.data.data
  },

  updateStatus: async (id: number, status: PatientStatus): Promise<Patient> => {
    const response = await api.patch<ApiResponse<Patient>>(`/patients/${id}/status`, null, {
      params: { status },
    })
    return response.data.data
  },

  getUpcomingEDD: async (daysAhead = 30): Promise<Patient[]> => {
    const response = await api.get<ApiResponse<Patient[]>>('/patients/upcoming-edd', {
      params: { daysAhead },
    })
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/patients/${id}`)
  },

  bulkUpload: async (file: File): Promise<BulkUploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<ApiResponse<BulkUploadResult>>('/patients/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/patients/bulk-upload/template', {
      responseType: 'blob',
    })
    return response.data
  },

  // Delivery Management
  completeDelivery: async (id: number, data: DeliveryCompletionRequest): Promise<Patient> => {
    const response = await api.post<ApiResponse<Patient>>(`/patients/${id}/complete-delivery`, data)
    return response.data.data
  },

  getSuccessfulDeliveries: async (page = 0, size = 20): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/deliveries/successful', {
      params: { page, size },
    })
    return response.data.data
  },

  getMotherMortalityCases: async (page = 0, size = 20): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/mortality/mother', {
      params: { page, size },
    })
    return response.data.data
  },

  getBabyMortalityCases: async (page = 0, size = 20): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/mortality/baby', {
      params: { page, size },
    })
    return response.data.data
  },

  getDeliveriesByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/deliveries/by-date-range', {
      params: { startDate, endDate, page, size },
    })
    return response.data.data
  },

  getMortalitiesByDateRange: async (startDate: string, endDate: string, page = 0, size = 20): Promise<PaginatedResponse<Patient>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Patient>>>('/patients/mortality/by-date-range', {
      params: { startDate, endDate, page, size },
    })
    return response.data.data
  },
}

export interface BulkUploadResult {
  totalRecords: number
  successCount: number
  failureCount: number
  successfulRecords: Array<{
    id: number
    name: string
    motherId: string
    aadhaarNumber: string
  }>
  failedRecords: Array<{
    rowNumber: number
    name: string
    aadhaarNumber: string
    errorMessage: string
  }>
}
