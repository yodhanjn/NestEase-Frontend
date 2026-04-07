import api from './api'

export const getNotifications = (page = 1, limit = 20) =>
  api.get(`/notifications?page=${page}&limit=${limit}`)

export const getUnreadNotificationCount = () => api.get('/notifications/unread-count')

export const markNotificationRead = (id: string) => api.put(`/notifications/${id}/read`)

export const markAllNotificationsRead = () => api.put('/notifications/read-all')
