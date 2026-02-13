import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getChatRooms, getChatMessages, sendMessage, ChatRoom as ApiChatRoom, Message as ApiMessage, SendMessagePayload } from '../api/chat'
import { MessageCircle, Send, User, ArrowLeft } from 'lucide-react'

// Local interfaces for simplified UI state
interface ChatRoom {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string | null
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
}

// Helper to transform API data to UI data
const transformRoomForUI = (apiRoom: ApiChatRoom, currentUserRole: string): ChatRoom => {
  const participant = currentUserRole === 'CLIENT' ? apiRoom.specialist : apiRoom.client
  return {
    id: apiRoom.id,
    participantId: participant?.id || '',
    participantName: participant?.name || 'Неизвестный',
    participantAvatar: currentUserRole === 'CLIENT' ? apiRoom.specialist?.image : apiRoom.client?.avatar,
    lastMessage: apiRoom.lastMessage?.text || '',
    lastMessageTime: apiRoom.lastMessage?.createdAt || '',
    unreadCount: apiRoom.unreadCount || 0
  }
}

const transformMessageForUI = (apiMsg: ApiMessage): Message => {
  return {
    id: apiMsg.id,
    content: apiMsg.text,
    senderId: apiMsg.senderId,
    createdAt: apiMsg.createdAt
  }
}

export const Messages = () => {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id)
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadRooms = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getChatRooms()
      const transformedRooms = (data.rooms || []).map(room => transformRoomForUI(room, user.role))
      setRooms(transformedRooms)
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const data = await getChatMessages(roomId)
      const transformedMessages = (data.messages || []).map(transformMessageForUI)
      setMessages(transformedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedRoom || sendingMessage) return

    const messageContent = input.trim()
    setInput('')
    setSendingMessage(true)

    try {
      const payload: SendMessagePayload = {
        recipientId: selectedRoom.participantId,
        text: messageContent
      }
      await sendMessage(payload)
      await loadMessages(selectedRoom.id)
      await loadRooms()
    } catch (error) {
      console.error('Failed to send message:', error)
      setInput(messageContent)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Вчера'
    } else if (days < 7) {
      return d.toLocaleDateString('ru-RU', { weekday: 'short' })
    } else {
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black mb-8">Сообщения</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chats list */}
        <div className={`${selectedRoom ? 'hidden md:block' : ''} md:col-span-1 bg-white border-2 border-border rounded-3xl p-6 overflow-y-auto`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Чаты
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Нет активных чатов</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full p-4 rounded-2xl text-left transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      {room.participantAvatar ? (
                        <img src={room.participantAvatar} alt={room.participantName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold truncate">{room.participantName}</p>
                        {room.lastMessageTime && (
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(room.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
                      )}
                    </div>
                    {room.unreadCount && room.unreadCount > 0 && (
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">
                        {room.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active chat */}
        <div className={`${!selectedRoom ? 'hidden md:flex' : 'flex'} md:col-span-2 bg-white border-2 border-border rounded-3xl flex-col`}>
          {selectedRoom ? (
            <>
              {/* Chat header */}
              <div className="p-6 border-b-2 border-border flex items-center gap-4">
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="md:hidden p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {selectedRoom.participantAvatar ? (
                    <img src={selectedRoom.participantAvatar} alt={selectedRoom.participantName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold">{selectedRoom.participantName}</h3>
                  <p className="text-sm text-muted-foreground">Онлайн</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Нет сообщений</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderId === user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                            isMine
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMine ? 'text-white/70' : 'text-muted-foreground'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t-2 border-border">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || sendingMessage}
                    className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Отправить</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Выберите чат для начала общения</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
