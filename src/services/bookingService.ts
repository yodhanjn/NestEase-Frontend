import api from './api'

export interface CreateBookingPayload {
  pgId: string
  checkInDate: string
  checkOutDate: string
  note?: string
}

export const createBooking = (payload: CreateBookingPayload) => api.post('/bookings', payload)

export const getMyBookings = () => api.get('/bookings/my')

export const getOwnerBookings = () => api.get('/bookings/owner')

export const updateBookingStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') =>
  api.put(`/bookings/${id}/status`, { status })
