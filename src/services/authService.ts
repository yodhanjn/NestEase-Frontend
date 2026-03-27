import api from './api'

export const register = (data: { name: string; email: string; phone?: string; password: string; role: string }) =>
  api.post('/auth/register', data)

export const verifyOTP = (data: { userId: string; otp: string }) =>
  api.post('/auth/verify-otp', data)

export const resendOTP = (data: { userId: string }) =>
  api.post('/auth/resend-otp', data)

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

export const getMe = () => api.get('/auth/me')
