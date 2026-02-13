# WebSocket API Documentation

## Overview

Hearty.pro использует Socket.IO для real-time коммуникации между клиентами и сервером. WebSocket API поддерживает:

- ✅ **Real-time чат** между клиентами и специалистами
- ✅ **Уведомления** в реальном времени
- ✅ **Онлайн статус** пользователей (presence)
- ✅ **Индикаторы набора** (typing indicators)
- ✅ **Прочитанные сообщения** (read receipts)

---

## Установка на Frontend

```bash
npm install socket.io-client
```

---

## Подключение

### TypeScript/JavaScript

```typescript
import { io, Socket } from 'socket.io-client'

const token = localStorage.getItem('authToken') // JWT token

const socket: Socket = io('http://localhost:3001', {
  auth: {
    token: token
  },
  // Альтернативно можно передать через query или headers:
  // query: { token },
  // extraHeaders: { Authorization: `Bearer ${token}` }

  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
})

// Успешное подключение
socket.on('connect', () => {
  console.log('Connected to WebSocket server', socket.id)
})

// Ошибка подключения (например, неверный JWT)
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message)
  // Обработка ошибки аутентификации
})

// Отключение
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
})
```

---

## Chat Events

### 1. Присоединение к чат-комнате

**Важно:** Пользователь должен присоединиться к комнате, чтобы получать сообщения.

```typescript
socket.emit('chat:join', { roomId: 'chat-room-123' })

socket.on('chat:joined', (data) => {
  console.log('Joined chat room:', data.roomId)
})
```

### 2. Получение новых сообщений

```typescript
socket.on('chat:message:new', (message) => {
  console.log('New message:', message)
  /*
  message: {
    id: string
    chatRoomId: string
    senderId: string
    senderRole: 'CLIENT' | 'SPECIALIST'
    text: string
    attachments: string[]
    isRead: boolean
    readAt: Date | null
    createdAt: Date
  }
  */

  // Обновить UI с новым сообщением
  addMessageToChat(message)
})
```

### 3. Индикатор набора текста

**Отправка:**
```typescript
// Начал печатать
socket.emit('chat:typing', {
  roomId: 'chat-room-123',
  isTyping: true
})

// Закончил печатать
socket.emit('chat:typing', {
  roomId: 'chat-room-123',
  isTyping: false
})
```

**Получение:**
```typescript
socket.on('chat:typing', (data) => {
  console.log(`${data.userName} is typing:`, data.isTyping)
  /*
  data: {
    roomId: string
    userId: string
    userName: string
    isTyping: boolean
  }
  */

  // Показать/скрыть индикатор "печатает..."
  if (data.isTyping) {
    showTypingIndicator(data.userName)
  } else {
    hideTypingIndicator(data.userName)
  }
})
```

### 4. Прочитанные сообщения

**Отправка (пометить как прочитанное):**
```typescript
socket.emit('chat:message:read', {
  messageId: 'msg-123',
  roomId: 'chat-room-123'
})
```

**Получение (уведомление о прочтении):**
```typescript
socket.on('chat:message:read', (data) => {
  console.log('Message read:', data)
  /*
  data: {
    messageId: string
    roomId: string
    readBy: string (userId)
    readAt: Date
  }
  */

  // Обновить UI - показать "прочитано"
  markMessageAsRead(data.messageId)
})
```

### 5. Покинуть чат-комнату

```typescript
socket.emit('chat:leave', { roomId: 'chat-room-123' })
```

---

## Notification Events

### 1. Подписка на уведомления

**Автоматически:** При подключении пользователь автоматически подписывается на свой канал уведомлений `user:{userId}`.

**Вручную (опционально):**
```typescript
socket.emit('notifications:subscribe')

socket.on('notifications:subscribed', (data) => {
  console.log('Subscribed to notifications:', data.userId)
})
```

### 2. Получение новых уведомлений

```typescript
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification)
  /*
  notification: {
    id: string
    type: 'IN_APP' | 'EMAIL'
    subject: string
    message: string
    actionUrl?: string
    data?: Record<string, any>
    readAt: Date | null
    createdAt: Date
  }
  */

  // Показать уведомление в UI
  showNotification(notification)

  // Обновить счетчик непрочитанных
  updateNotificationBadge()
})
```

### 3. Пометить уведомление как прочитанное

```typescript
socket.emit('notifications:mark-read', { notificationId: 'notif-123' })

socket.on('notifications:read', (data) => {
  console.log('Notification marked as read:', data.notificationId)
})
```

### 4. Пометить все уведомления как прочитанные

```typescript
socket.emit('notifications:mark-all-read')

socket.on('notifications:all-read', (data) => {
  console.log('All notifications marked as read for user:', data.userId)
})
```

### 5. Получить количество непрочитанных

```typescript
socket.emit('notifications:get-unread-count')

socket.on('notifications:unread-count', (data) => {
  console.log('Unread notifications:', data.count)
  updateBadge(data.count)
})
```

---

## Presence Events

### 1. Онлайн/Оффлайн статус

**Автоматически:** При подключении/отключении сервер отправляет события всем клиентам.

```typescript
// Пользователь подключился
socket.on('user:online', (data) => {
  console.log('User came online:', data)
  /*
  data: {
    userId: string
    status: 'online'
    timestamp: Date
  }
  */

  // Обновить UI - показать зеленый индикатор
  setUserStatus(data.userId, 'online')
})

// Пользователь отключился
socket.on('user:offline', (data) => {
  console.log('User went offline:', data)
  /*
  data: {
    userId: string
    status: 'offline'
    timestamp: Date
  }
  */

  // Обновить UI - показать серый индикатор
  setUserStatus(data.userId, 'offline')
})
```

### 2. Обновить статус вручную

```typescript
// Установить статус "away" (отошел)
socket.emit('presence:update', { status: 'away' })

// Вернуться онлайн
socket.emit('presence:update', { status: 'online' })

socket.on('user:status', (data) => {
  console.log('User status changed:', data)
  /*
  data: {
    userId: string
    status: 'online' | 'away'
    timestamp: Date
  }
  */
})
```

### 3. Получить список онлайн пользователей

```typescript
socket.emit('presence:get-online')

socket.on('presence:online-users', (data) => {
  console.log('Online users:', data.users)
  /*
  data: {
    users: [
      {
        userId: string
        status: 'online'
        lastSeen: Date
      }
    ]
  }
  */
})
```

### 4. Проверить статус конкретного пользователя

```typescript
socket.emit('presence:get-user', { userId: 'user-123' })

socket.on('presence:user-status', (data) => {
  console.log('User status:', data)
  /*
  data: {
    userId: string
    status: 'online' | 'offline' | 'away'
    lastSeen: Date | null
  }
  */
})
```

### 5. Присутствие в чат-комнате

**Присоединиться к presence комнаты:**
```typescript
socket.emit('presence:join-chat', { roomId: 'chat-room-123' })

socket.on('presence:user-joined-chat', (data) => {
  console.log('User joined chat room:', data)
  /*
  data: {
    roomId: string
    userId: string
    timestamp: Date
  }
  */

  // Показать "находится в чате"
  showUserInChat(data.userId)
})
```

**Покинуть presence комнаты:**
```typescript
socket.emit('presence:leave-chat', { roomId: 'chat-room-123' })

socket.on('presence:user-left-chat', (data) => {
  console.log('User left chat room:', data)
  hideUserInChat(data.userId)
})
```

---

## Error Handling

```typescript
socket.on('error', (error) => {
  console.error('WebSocket error:', error.message)

  // Показать пользователю ошибку
  showErrorNotification(error.message)
})
```

---

## Пример: Полный Chat Component (React)

```typescript
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  text: string
  senderId: string
  senderRole: string
  createdAt: Date
}

export const ChatComponent = ({ roomId, token }: { roomId: string, token: string }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)

  useEffect(() => {
    // Подключение к WebSocket
    const newSocket = io('http://localhost:3001', {
      auth: { token }
    })

    setSocket(newSocket)

    // Присоединиться к чат-комнате
    newSocket.emit('chat:join', { roomId })

    // Слушаем новые сообщения
    newSocket.on('chat:message:new', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // Слушаем индикатор набора
    newSocket.on('chat:typing', (data) => {
      if (data.isTyping) {
        setTypingUser(data.userName)
        setIsTyping(true)
      } else {
        setIsTyping(false)
        setTypingUser(null)
      }
    })

    // Слушаем прочтение сообщений
    newSocket.on('chat:message:read', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        )
      )
    })

    // Cleanup при unmount
    return () => {
      newSocket.emit('chat:leave', { roomId })
      newSocket.disconnect()
    }
  }, [roomId, token])

  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket) {
      socket.emit('chat:typing', { roomId, isTyping })
    }
  }

  const sendMessage = (text: string) => {
    // Отправляем через REST API (не WebSocket)
    fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ recipientId: '...', text })
    })
    // WebSocket событие придет автоматически от сервера
  }

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
        {isTyping && <div>{typingUser} печатает...</div>}
      </div>

      <input
        onFocus={() => sendTypingIndicator(true)}
        onBlur={() => sendTypingIndicator(false)}
        onChange={() => {/* handle input */}}
      />
    </div>
  )
}
```

---

## Production Considerations

### 1. Environment Variables

```env
# Frontend
VITE_WEBSOCKET_URL=https://api.hearty.pro
# или ws://localhost:3001 для разработки
```

### 2. Reconnection Strategy

```typescript
const socket = io(WEBSOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout: 20000
})

let reconnectAttempts = 0

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Сервер принудительно отключил - переподключиться вручную
    socket.connect()
  }
  // Иначе Socket.IO переподключится автоматически
})

socket.on('reconnect_attempt', (attempt) => {
  reconnectAttempts = attempt
  console.log(`Reconnection attempt ${attempt}`)
})

socket.on('reconnect', () => {
  reconnectAttempts = 0
  console.log('Reconnected successfully')

  // Переподписаться на комнаты
  socket.emit('chat:join', { roomId: currentRoomId })
})
```

### 3. Error Handling & Logging

```typescript
socket.on('connect_error', (error) => {
  if (error.message.includes('expired')) {
    // JWT истек - обновить токен
    refreshAuthToken().then(newToken => {
      socket.auth.token = newToken
      socket.connect()
    })
  } else {
    console.error('Connection error:', error)
  }
})
```

---

## Testing WebSocket Locally

### С помощью браузерной консоли:

```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_JWT_TOKEN' }
})

socket.on('connect', () => console.log('Connected!'))
socket.emit('chat:join', { roomId: 'test-room' })
socket.on('chat:message:new', msg => console.log('New message:', msg))
```

### С помощью socket.io-client (Node.js):

```bash
npm install -g socket.io-client
```

```javascript
const io = require('socket.io-client')
const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_JWT_TOKEN' }
})

socket.on('connect', () => {
  console.log('Connected!')
  socket.emit('chat:join', { roomId: 'test-room' })
})

socket.on('notification:new', (notif) => {
  console.log('Notification:', notif)
})
```

---

## Namespace Architecture

Текущая реализация использует rooms вместо namespaces:

- `user:{userId}` - личная комната пользователя для уведомлений
- `chat:{roomId}` - комната чата
- `notifications:{userId}` - подписка на уведомления
- `presence:chat:{roomId}` - присутствие в чате

Все события отправляются в default namespace `/`.

---

## Events Summary

### Emit (Client → Server)

| Event | Data | Description |
|-------|------|-------------|
| `chat:join` | `{ roomId }` | Присоединиться к чат-комнате |
| `chat:leave` | `{ roomId }` | Покинуть чат-комнату |
| `chat:typing` | `{ roomId, isTyping }` | Индикатор набора |
| `chat:message:read` | `{ messageId, roomId }` | Пометить сообщение как прочитанное |
| `notifications:subscribe` | - | Подписаться на уведомления |
| `notifications:mark-read` | `{ notificationId }` | Пометить уведомление как прочитанное |
| `notifications:mark-all-read` | - | Пометить все как прочитанные |
| `notifications:get-unread-count` | - | Получить количество непрочитанных |
| `presence:update` | `{ status }` | Обновить статус |
| `presence:get-online` | - | Получить список онлайн пользователей |
| `presence:get-user` | `{ userId }` | Получить статус пользователя |
| `presence:join-chat` | `{ roomId }` | Присоединиться к presence чата |
| `presence:leave-chat` | `{ roomId }` | Покинуть presence чата |

### On (Server → Client)

| Event | Data | Description |
|-------|------|-------------|
| `chat:joined` | `{ roomId }` | Подтверждение присоединения к комнате |
| `chat:message:new` | `Message` | Новое сообщение |
| `chat:typing` | `{ roomId, userId, userName, isTyping }` | Индикатор набора от другого пользователя |
| `chat:message:read` | `{ messageId, roomId, readBy, readAt }` | Сообщение прочитано |
| `notification:new` | `Notification` | Новое уведомление |
| `notifications:subscribed` | `{ userId }` | Подтверждение подписки |
| `notifications:read` | `{ notificationId }` | Уведомление прочитано |
| `notifications:all-read` | `{ userId }` | Все уведомления прочитаны |
| `notifications:unread-count` | `{ count }` | Количество непрочитанных |
| `user:online` | `{ userId, status, timestamp }` | Пользователь онлайн |
| `user:offline` | `{ userId, status, timestamp }` | Пользователь оффлайн |
| `user:status` | `{ userId, status, timestamp }` | Статус пользователя изменен |
| `presence:online-users` | `{ users }` | Список онлайн пользователей |
| `presence:user-status` | `{ userId, status, lastSeen }` | Статус пользователя |
| `presence:user-joined-chat` | `{ roomId, userId, timestamp }` | Пользователь зашел в чат |
| `presence:user-left-chat` | `{ roomId, userId, timestamp }` | Пользователь покинул чат |
| `error` | `{ message }` | Ошибка |

---

## Support

Если возникают вопросы или проблемы с WebSocket API, проверьте:

1. **JWT токен валиден** - проверьте срок действия токена
2. **Правильный URL** - `http://localhost:3001` для dev, `https://api.hearty.pro` для prod
3. **CORS настроен** - backend разрешает подключения от вашего домена
4. **Network tab** - проверьте WebSocket connection в DevTools
5. **Server logs** - посмотрите логи на backend для ошибок аутентификации

**Backend Server:** `npm run dev` должен показывать:
```
🔌 Socket.IO server initialized
🔌 WebSocket: Ready
```

**Frontend:** При успешном подключении в консоли должно появиться:
```
Connected to WebSocket server <socket-id>
```
