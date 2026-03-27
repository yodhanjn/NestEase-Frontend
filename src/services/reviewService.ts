import api from './api'

export interface SubmitReviewPayload {
  pgId: string
  bookingId: string
  cleanlinessRating: number
  foodRating: number
  waterRating: number
  electricityRating: number
  wifiRating: number
  securityRating: number
  comment?: string
}

export const submitReview = (payload: SubmitReviewPayload) => api.post('/reviews', payload)

export const getReviewsByPG = (pgId: string) => api.get(`/reviews/pg/${pgId}`)

export const getEligibleReviewBookings = () => api.get('/reviews/eligible-bookings')
