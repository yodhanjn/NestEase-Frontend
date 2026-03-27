import api from './api'

export interface PGFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  gender?: string
  amenities?: string
  rating?: number
  sort?: string
  page?: number
  limit?: number
}

export const getAllPGs = (filters: PGFilters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== '') params.append(key, String(val))
  })
  return api.get(`/pg?${params.toString()}`)
}

export const getPGById = (id: string) => api.get(`/pg/${id}`)

export const createPG = (data: FormData | object) => api.post('/pg', data)

export const updatePG = (id: string, data: object) => api.put(`/pg/${id}`, data)

export const deletePG = (id: string) => api.delete(`/pg/${id}`)

export const getMyPGs = () => api.get('/pg/my')

export const uploadPGImages = (id: string, formData: FormData) =>
  api.post(`/pg/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
