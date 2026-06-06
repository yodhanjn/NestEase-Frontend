import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectChatSocket = (userId: string) => {
  if (socket && socket.connected) return socket

  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not configured')
  }

  socket = io(apiUrl, {
    transports: ['websocket', 'polling'],
    query: { userId },
  })

  return socket
}

export const getChatSocket = () => socket

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
