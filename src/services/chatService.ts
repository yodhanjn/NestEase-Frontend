import api from './api'

export interface SendMessagePayload {
  pgId: string
  receiverId: string
  content: string
}

export const getConversations = () => api.get('/chat/conversations')

export const getMessages = (pgId: string, userId: string) =>
  api.get(`/chat/messages?pgId=${encodeURIComponent(pgId)}&userId=${encodeURIComponent(userId)}`)

export const sendMessage = (payload: SendMessagePayload) => api.post('/chat/messages', payload)
