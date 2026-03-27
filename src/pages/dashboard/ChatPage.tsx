import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Send, MessageCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getConversations, getMessages, sendMessage } from '../../services/chatService'
import { connectChatSocket, disconnectChatSocket, getChatSocket } from '../../services/chatSocket'

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
  sender: { _id: string; name?: string }
  receiver: { _id: string; name?: string }
  content: string
  createdAt: string
}

export default function ChatPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [active, setActive] = useState<Conversation | null>(null)
  const [content, setContent] = useState('')

  const initialPgId = searchParams.get('pgId') || ''
  const initialUserId = searchParams.get('userId') || ''
  const initialOtherName = searchParams.get('name') || 'User'
  const initialPgName = searchParams.get('pgName') || 'PG'

  const activeMeta = useMemo(() => {
    if (active) return active
    if (initialPgId && initialUserId) {
      return {
        conversationKey: `${initialPgId}::temp`,
        pg: { _id: initialPgId, pgName: initialPgName },
        otherUser: { _id: initialUserId, name: initialOtherName, role: 'owner' },
        unreadCount: 0,
        lastMessage: { _id: 'temp', content: '', createdAt: new Date().toISOString() },
      } as Conversation
    }
    return null
  }, [active, initialPgId, initialUserId, initialOtherName, initialPgName])

  const loadConversations = async () => {
    try {
      const res = await getConversations()
      setConversations(res.data.conversations || [])
      return res.data.conversations || []
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load conversations')
      return []
    }
  }

  const loadMessages = async (pgId: string, otherUserId: string) => {
    try {
      const res = await getMessages(pgId, otherUserId)
      setMessages(res.data.messages || [])
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load messages')
    }
  }

  useEffect(() => {
    if (!user?._id) return

    const init = async () => {
      const convs = await loadConversations()

      const initialFromList =
        convs.find((c: Conversation) => c.pg?._id === initialPgId && c.otherUser?._id === initialUserId) ||
        convs[0] ||
        null

      if (initialFromList) {
        setActive(initialFromList)
        await loadMessages(initialFromList.pg._id, initialFromList.otherUser._id)
      } else if (initialPgId && initialUserId) {
        await loadMessages(initialPgId, initialUserId)
      }
      setLoading(false)
    }

    const socket = connectChatSocket(user._id)
    socket.off('chat:new_message')
    socket.on('chat:new_message', (message: ChatMessage) => {
      const msgPgId = typeof message.pg === 'string' ? message.pg : message.pg?._id
      const msgOtherUserId =
        message.sender._id === user._id ? message.receiver._id : message.sender._id

      const isActiveChat =
        activeMeta &&
        activeMeta.pg._id === msgPgId &&
        activeMeta.otherUser._id === msgOtherUserId

      if (isActiveChat) {
        setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]))
      }
      loadConversations()
    })

    init()

    return () => {
      const s = getChatSocket()
      s?.off('chat:new_message')
      disconnectChatSocket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id])

  const handleSelectConversation = async (conversation: Conversation) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1A6B6B] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-1">Messages</h1>
        <p className="text-sm text-gray-500 mb-6">Chat directly with PG owners and residents.</p>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[620px]">
          <aside className="border-r border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#2D2D2D]">Conversations</h2>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">No conversations yet.</div>
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
                          {conversation.otherUser.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{conversation.pg.pgName}</p>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {conversation.lastMessage.content}
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

          <section className="md:col-span-2 flex flex-col">
            {activeMeta ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-[#2D2D2D]">{activeMeta.otherUser.name}</h3>
                  <p className="text-xs text-gray-500">{activeMeta.pg.pgName}</p>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-[#FAFAFA]">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No messages yet. Start the conversation.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isMine = message.sender?._id === user?._id
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
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <MessageCircle size={28} className="mb-2" />
                <p className="text-sm">Select a conversation to start chatting.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
