import api from './api'

export const getAdminPGStats = () => api.get('/admin/pg/stats')

export const getPendingPGs = () => api.get('/admin/pg/pending')

export const getUnderperformingPGs = (ratingThreshold = 3, minReviews = 5) =>
  api.get(`/admin/pg/underperforming?ratingThreshold=${ratingThreshold}&minReviews=${minReviews}`)

export const approvePG = (id: string) => api.put(`/admin/pg/${id}/approve`)

export const rejectPG = (id: string) => api.put(`/admin/pg/${id}/reject`)

export const removePG = (id: string) => api.put(`/admin/pg/${id}/remove`)

export const getFraudReports = (status = 'all') => api.get(`/admin/reports?status=${status}`)

export const actOnFraudReport = (
  id: string,
  payload: {
    status?: 'open' | 'under_review' | 'resolved' | 'dismissed'
    adminNote?: string
    action?: 'none' | 'flag_pg' | 'deactivate_pg' | 'approve_pg'
  }
) => api.put(`/admin/reports/${id}`, payload)
