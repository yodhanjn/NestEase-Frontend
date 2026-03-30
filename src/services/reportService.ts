import api from './api'

export const submitFraudReport = (payload: { reportedPgId: string; reason: string; details?: string }) =>
  api.post('/reports', payload)

export const getMyFraudReports = () => api.get('/reports/my')
