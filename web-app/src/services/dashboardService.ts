import api from './api'
import { ApiResponse, DashboardStats } from '@/types'

export const dashboardService = {
  getOverview: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/overview')
    return response.data.data
  },

  getRiskDistribution: async (): Promise<Record<string, number>> => {
    const response = await api.get<ApiResponse<Record<string, number>>>('/dashboard/risk-distribution')
    return response.data.data
  },

  getDistrictStats: async (): Promise<Record<string, number>> => {
    const response = await api.get<ApiResponse<Record<string, number>>>('/dashboard/district-stats')
    return response.data.data
  },

  getAlertsSummary: async (): Promise<Record<string, unknown>> => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>('/dashboard/alerts-summary')
    return response.data.data
  },

  getConsultationsSummary: async (): Promise<Record<string, unknown>> => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>('/dashboard/consultations-summary')
    return response.data.data
  },

  getFollowUpsSummary: async (): Promise<Record<string, unknown>> => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>('/dashboard/follow-ups-summary')
    return response.data.data
  },

  getDoctorDashboard: async (doctorId: number): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>(`/dashboard/doctor/${doctorId}`)
    return response.data.data
  },

  getHelpDeskDashboard: async (userId: number): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>(`/dashboard/help-desk/${userId}`)
    return response.data.data
  },
}
