import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectChatSocket = (userId: string) => {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return null

  if (socket) {
    if (!socket.connected) socket.connect()
    return socket
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
