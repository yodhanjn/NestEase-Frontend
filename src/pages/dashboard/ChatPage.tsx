import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Send, MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getConversations, getMessages, sendMessage } from '../../services/chatService'
import { connectChatSocket, getChatSocket } from '../../services/chatSocket'

type Conversation = {
  conversationKey: string
  pg: { _id: string; pgName: string; location?: { city?: string } }
  otherUser: { _id: string; name: string; role: string }
  unreadCount: number
  lastMessage: { _id: string; content: string; createdAt: string }
}

type ChatMessage = {
  _id: string
  pg: string | { _id: string }
  sender: { _id: string; name?: string } | string
  receiver: { _id: string; name?: string } | string
  content: string
  createdAt: string
}

const getUserId = (user: { _id?: string; id?: string } | null | undefined) =>
  user?._id || user?.id || ''

const isValidConversation = (conversation: Conversation) =>
  Boolean(conversation?.pg?._id && conversation?.otherUser?._id && conversation?.otherUser?.name)

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [content, setContent] = useState('')

  const userId = getUserId(user)
  const isOwner = user?.role === 'owner'

  const initialPgId = searchParams.get('pgId') || ''
  const initialUserId = searchParams.get('userId') || ''
  const initialOtherName = searchParams.get('name') || 'User'
  const initialPgName = searchParams.get('pgName') || 'PG'
  const initialOtherRole = searchParams.get('role') || (isOwner ? 'resident' : 'owner')

  const activeMeta = useMemo(() => {
    if (active && isValidConversation(active)) return active
    if (initialPgId && initialUserId) {
      return {
        conversationKey: `${initialPgId}::temp`,
        pg: { _id: initialPgId, pgName: initialPgName },
        otherUser: { _id: initialUserId, name: initialOtherName, role: initialOtherRole },
        unreadCount: 0,
        lastMessage: { _id: 'temp', content: '', createdAt: new Date().toISOString() },
      } as Conversation
    }
    return null
  }, [active, initialPgId, initialUserId, initialOtherName, initialPgName, initialOtherRole])

  const activeMetaRef = useRef(activeMeta)
  useEffect(() => {
    activeMetaRef.current = activeMeta
  }, [activeMeta])

  const loadConversations = async () => {
    try {
      const res = await getConversations()
      const list = (res.data.conversations || []).filter(isValidConversation)
      setConversations(list)
      return list
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load conversations')
      setConversations([])
      return []
    }
  }

  const loadMessages = async (pgId: string, otherUserId: string) => {
    if (!pgId || !otherUserId) return
    try {
      const res = await getMessages(pgId, otherUserId)
      setMessages(res.data.messages || [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load messages')
      setMessages([])
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    const init = async () => {
      setLoading(true)
      try {
        const convs = await loadConversations()
        if (cancelled) return

        const hasUrlTarget = Boolean(initialPgId && initialUserId)
        const matchedFromUrl = hasUrlTarget
          ? convs.find(
              (c: Conversation) =>
                String(c.pg._id) === String(initialPgId) &&
                String(c.otherUser._id) === String(initialUserId)
            )
          : null

        if (matchedFromUrl) {
          setActive(matchedFromUrl)
          await loadMessages(matchedFromUrl.pg._id, matchedFromUrl.otherUser._id)
        } else if (hasUrlTarget) {
          setActive(null)
          setMessages([])
          await loadMessages(initialPgId, initialUserId)
        } else if (convs[0]) {
          setActive(convs[0])
          await loadMessages(convs[0].pg._id, convs[0].otherUser._id)
        } else {
          setActive(null)
          setMessages([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [authLoading, userId, initialPgId, initialUserId])

  useEffect(() => {
    if (!userId) return

    const socket = connectChatSocket(userId)
    if (!socket) return

    const onNewMessage = (message: ChatMessage) => {
      const currentActive = activeMetaRef.current
      const msgPgId = typeof message.pg === 'string' ? message.pg : message.pg?._id
      const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id
      const receiverId = typeof message.receiver === 'string' ? message.receiver : message.receiver?._id
      const msgOtherUserId = String(senderId) === String(userId) ? receiverId : senderId

      const isActiveChat =
        currentActive &&
        String(currentActive.pg._id) === String(msgPgId) &&
        String(currentActive.otherUser._id) === String(msgOtherUserId)

      if (isActiveChat) {
        setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]))
      }
      loadConversations()
    }

    socket.off('chat:new_message', onNewMessage)
    socket.on('chat:new_message', onNewMessage)

    return () => {
      socket.off('chat:new_message', onNewMessage)
    }
  }, [userId])

  const handleSelectConversation = async (conversation: Conversation) => {
    if (!isValidConversation(conversation)) return
    setActive(conversation)
    await loadMessages(conversation.pg._id, conversation.otherUser._id)
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationKey === conversation.conversationKey ? { ...c, unreadCount: 0 } : c
      )
    )
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || !activeMeta) return

    setSending(true)
    try {
      const res = await sendMessage({
        pgId: activeMeta.pg._id,
        receiverId: activeMeta.otherUser._id,
        content: text,
      })
      const newMsg = res.data.message
      setMessages((prev) => [...prev, newMsg])
      setContent('')
      await loadConversations()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1A6B6B] border-t-transparent" />
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">Please sign in again to use messages.</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">Messages</h1>
        <p className="text-sm text-gray-500 mb-6">
          {isOwner
            ? 'Chat with residents who booked your PGs or messaged you first.'
            : 'Chat directly with PG owners about listings.'}
        </p>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[520px]">
          <aside className="border-b md:border-b-0 md:border-r border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#2D2D2D]">Conversations</h2>
            </div>
            <div className="max-h-[320px] md:max-h-[560px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">
                  {isOwner
                    ? 'No conversations yet. Open Booking Requests and use Message on a resident booking to start chatting.'
                    : 'No conversations yet. Open a PG listing and use Chat with Owner to start.'}
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.conversationKey}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      activeMeta?.conversationKey === conversation.conversationKey ? 'bg-[#E8F4F4]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#2D2D2D] truncate">
                          {conversation.otherUser?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.pg?.pgName || 'PG listing'}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {conversation.lastMessage?.content || ''}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="text-xs rounded-full px-2 py-0.5 bg-[#1A6B6B] text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="md:col-span-2 flex flex-col min-h-[360px]">
            {activeMeta ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-[#2D2D2D]">{activeMeta.otherUser.name}</h3>
                  <p className="text-xs text-gray-500">{activeMeta.pg.pgName}</p>
                </div>

                <div className="flex-1 min-h-[220px] p-4 overflow-y-auto bg-[#FAFAFA]">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No messages yet. Start the conversation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const senderId =
                          typeof message.sender === 'string' ? message.sender : message.sender?._id
                        const isMine = String(senderId) === String(userId)
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                                isMine
                                  ? 'bg-[#1A6B6B] text-white'
                                  : 'bg-white border border-gray-100 text-gray-700'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p
                                className={`text-[10px] mt-1 ${
                                  isMine ? 'text-white/70' : 'text-gray-400'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1A6B6B]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="px-4 py-2 rounded-xl text-white disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: '#1A6B6B' }}
                  >
                    <Send size={14} />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <MessageCircle size={28} className="mb-2" />
                <p className="text-sm text-center">
                  {isOwner
                    ? 'Select a conversation or open Booking Requests and tap Message on a booking.'
                    : 'Select a conversation to start chatting.'}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
