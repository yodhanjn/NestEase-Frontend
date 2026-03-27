import api from './api'

export interface SubmitFeedbackPayload {
  pgId: string
  bookingId: string
  foodQuality: number
  cleanliness: number
  safety: number
  internet: number
  comment?: string
}

export const submitDailyFeedback = (payload: SubmitFeedbackPayload) => api.post('/feedback', payload)

export const getFeedbackByPG = (pgId: string) => api.get(`/feedback/pg/${pgId}`)

export const getEligibleFeedbackBookings = () => api.get('/feedback/eligible-bookings')
