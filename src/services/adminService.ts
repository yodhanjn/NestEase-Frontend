import api from './api'

export const getAdminPGStats = () => api.get('/admin/pg/stats')

export const getPendingPGs = () => api.get('/admin/pg/pending')

export const getUnderperformingPGs = (ratingThreshold = 3, minReviews = 5) =>
  api.get(`/admin/pg/underperforming?ratingThreshold=${ratingThreshold}&minReviews=${minReviews}`)

export const approvePG = (id: string) => api.put(`/admin/pg/${id}/approve`)

export const rejectPG = (id: string) => api.put(`/admin/pg/${id}/reject`)

export const removePG = (id: string) => api.put(`/admin/pg/${id}/remove`)
