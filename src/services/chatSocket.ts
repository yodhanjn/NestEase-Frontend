import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectChatSocket = (userId: string) => {
  if (socket && socket.connected) return socket

  socket = io(import.meta.env.VITE_API_URL, {
    transports: ['websocket'],
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
