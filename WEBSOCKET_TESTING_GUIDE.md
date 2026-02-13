# WebSocket Testing Guide - Phase 3

## Overview
Comprehensive testing guide for real-time features implemented in Phase 3 of Hearty platform:
- Socket.IO connection management
- Real-time chat messaging
- Real-time notifications
- Online presence tracking

---

## Prerequisites

1. **Backend Running**:
   ```bash
   cd /Users/dmitry/Downloads/hearty/backend
   npm run dev
   # Should be running on http://localhost:3001 (or your configured port)
   ```

2. **Frontend Running**:
   ```bash
   cd /Users/dmitry/Downloads/hearty
   npm run dev
   # Should be running on http://localhost:5173 (or your configured port)
   ```

3. **Valid User Accounts**:
   - At least 2 test accounts (to test chat between users)
   - 1 CLIENT account
   - 1 SPECIALIST account
   - 1 ADMIN account (optional, for notifications)

---

## Test 1: WebSocket Connection

### Objective
Verify Socket.IO client connects to server with JWT authentication.

### Steps

1. **Open Browser DevTools**:
   - Open Chrome/Firefox DevTools (F12)
   - Go to **Console** tab

2. **Login to Application**:
   - Navigate to `/dashboard`
   - Login with any valid account
   - JWT token should be stored in `localStorage`

3. **Verify Connection**:
   - Check console for Socket.IO connection logs
   - Look for: `socket.io-client: connection established`

4. **Verify SocketContext State**:
   - In React DevTools (Components tab), find `SocketProvider`
   - Check state:
     - `connected: true`
     - `error: null`
     - `socket: Socket {connected: true, ...}`

5. **Check Network Tab**:
   - Go to **Network** tab → Filter by **WS** (WebSocket)
   - Should see connection to `ws://localhost:3001/socket.io/?EIO=4&transport=websocket&token=...`
   - Status: `101 Switching Protocols`

### Expected Results
✅ Socket connects successfully
✅ JWT token sent in `auth.token`
✅ No authentication errors in console
✅ Connection persists (no disconnects)
✅ `connected` state is `true`

---

## Test 2: Auto Reconnection

### Objective
Verify Socket.IO automatically reconnects after disconnection.

### Steps

1. **Establish Connection** (see Test 1)

2. **Simulate Disconnect**:
   - Stop backend server: `Ctrl+C` in backend terminal
   - Watch console logs

3. **Observe Reconnection Attempts**:
   - Should see: `socket.io-client: reconnecting (attempt 1)`
   - Max attempts: 5 (configured in SocketContext)
   - Delay: 1s to 5s

4. **Restart Backend**:
   - Restart backend server: `npm run dev`

5. **Verify Reconnection**:
   - Should see: `socket.io-client: connection established`
   - `connected` state changes from `false` → `true`

### Expected Results
✅ Client detects disconnect immediately
✅ Reconnection attempts start automatically
✅ Successfully reconnects when backend is back
✅ No manual page refresh needed
✅ UI shows connection status (check NotificationsDropdown green dot)

---

## Test 3: Real-time Chat Messaging

### Objective
Test end-to-end chat functionality with real-time delivery.

### Setup
- Open 2 browser windows (or incognito + normal)
- **Window A**: Login as CLIENT
- **Window B**: Login as SPECIALIST

### Steps

#### 3.1: Join Chat Room

**Window A (CLIENT)**:
1. Navigate to Chat page (integrate ChatWindow into dashboard)
2. Open DevTools Console
3. Look for: `Joined chat room: {roomId}`

**Window B (SPECIALIST)**:
1. Navigate to same Chat room
2. Check console: `Joined chat room: {roomId}`

#### 3.2: Send Message (CLIENT → SPECIALIST)

**Window A (CLIENT)**:
1. Type message: "Hello from CLIENT"
2. Press Send (or Enter)
3. Message should appear immediately in chat

**Window B (SPECIALIST)**:
1. Should receive message **in real-time** (no refresh)
2. Message should display: "Hello from CLIENT"
3. Sender name should be CLIENT's name
4. Blue notification dot should appear (unread)

**Check Console (Window B)**:
- Should see event: `chat:message:new`
- Payload:
  ```json
  {
    "id": "...",
    "chatRoomId": "...",
    "senderId": "CLIENT_USER_ID",
    "senderRole": "CLIENT",
    "text": "Hello from CLIENT",
    "isRead": false,
    "createdAt": "2025-02-13T..."
  }
  ```

#### 3.3: Send Reply (SPECIALIST → CLIENT)

**Window B (SPECIALIST)**:
1. Type: "Hi, how can I help?"
2. Send

**Window A (CLIENT)**:
1. Should receive message instantly
2. Message displayed in chat

#### 3.4: Typing Indicator

**Window A (CLIENT)**:
1. Start typing (don't send)
2. Type a few characters

**Window B (SPECIALIST)**:
1. Should see: "{CLIENT_NAME} печатает..."
2. Indicator should disappear 2 seconds after CLIENT stops typing

**Check Console (Window B)**:
- Event: `chat:typing`
- Payload:
  ```json
  {
    "roomId": "...",
    "userId": "CLIENT_USER_ID",
    "userName": "CLIENT_NAME",
    "isTyping": true
  }
  ```

#### 3.5: Read Receipts

**Window A (CLIENT)**:
1. Check sent message
2. Should show single checkmark: ✓ (not read yet)

**Window B (SPECIALIST)**:
1. View the message (MessageList should call `markAsRead`)

**Window A (CLIENT)**:
1. Checkmark should change to double: ✓✓ (read)

**Check Console (Window A)**:
- Event: `chat:message:read`
- Payload:
  ```json
  {
    "messageId": "...",
    "roomId": "...",
    "readBy": "SPECIALIST_USER_ID",
    "readAt": "2025-02-13T..."
  }
  ```

### Expected Results
✅ Messages delivered in real-time (< 200ms)
✅ Typing indicator works bidirectionally
✅ Read receipts update without refresh
✅ Chat rooms isolate conversations (no crosstalk)
✅ Messages persist on page refresh (loaded via REST API)
✅ Auto-scroll to bottom on new message

---

## Test 4: Real-time Notifications

### Objective
Test notification delivery via WebSocket.

### Setup
- Login as any user (CLIENT or SPECIALIST)

### Steps

#### 4.1: Subscribe to Notifications

1. Navigate to Dashboard
2. NotificationsDropdown should be visible (Bell icon)
3. Check DevTools Console
4. Should see: `Subscribed to notifications`

**Check Network Tab**:
- WebSocket frame sent:
  - Event: `notifications:subscribe`
  - No payload needed

#### 4.2: Trigger Notification (Backend Event)

**Option A: Simulate from Backend**
```bash
# Using psql or database GUI, insert notification
INSERT INTO "Notification" (id, "userId", subject, message, "isRead", "createdAt")
VALUES (gen_random_uuid(), 'YOUR_USER_ID', 'Test Notification', 'This is a test', false, NOW());
```

**Option B: Real User Action**
- Have another user book a session with you (if SPECIALIST)
- Leave a review (triggers notification)
- Send a chat message (triggers notification)

#### 4.3: Verify Real-time Delivery

**Frontend**:
1. Should see toast notification: "Test Notification"
2. Bell icon badge should update: unread count +1
3. Dropdown should show new notification (blue background)

**Check Console**:
- Event: `notification:new`
- Payload:
  ```json
  {
    "id": "...",
    "subject": "Test Notification",
    "message": "This is a test",
    "actionUrl": null,
    "isRead": false,
    "createdAt": "2025-02-13T..."
  }
  ```

#### 4.4: Mark as Read

1. Click Bell icon → Open dropdown
2. Click checkmark (✓) button on notification
3. Should see:
   - Blue background removed
   - Unread count decreases
   - Blue dot disappears

**Check Console**:
- Event: `notification:updated`
- Payload:
  ```json
  {
    "id": "...",
    "isRead": true,
    "readAt": "2025-02-13T..."
  }
  ```

#### 4.5: Mark All as Read

1. Have multiple unread notifications (repeat 4.2)
2. Click "Прочитать все" button
3. All notifications marked as read
4. Unread count → 0

**Check Console**:
- Event: `notifications:all-read`

### Expected Results
✅ Notifications appear instantly (no polling)
✅ Toast shows notification preview
✅ Badge updates in real-time
✅ Mark as read updates UI immediately
✅ Mark all as read works correctly
✅ Deleted notifications removed from list

---

## Test 5: Online Presence

### Objective
Test user online/offline/away status tracking.

### Setup
- Open 2 browser windows
- **Window A**: Login as USER_A
- **Window B**: Login as USER_B

### Steps

#### 5.1: Track User Status

**Window A (USER_A)**:
1. Navigate to page with OnlineIndicator for USER_B
2. Example: Chat window with USER_B

**Check OnlineIndicator**:
- Should show green dot (online) if USER_B is connected
- Should show gray dot (offline) if USER_B is not connected

#### 5.2: User Goes Online

**Window B (USER_B)**:
1. Login (if not already)
2. WebSocket connects

**Window A (USER_A)**:
1. OnlineIndicator should change to green (online)
2. No page refresh needed

**Check Console (Window A)**:
- Event: `user:online`
- Payload:
  ```json
  {
    "userId": "USER_B_ID",
    "status": "online"
  }
  ```

#### 5.3: User Goes Offline

**Window B (USER_B)**:
1. Close tab or logout
2. WebSocket disconnects

**Window A (USER_A)**:
1. OnlineIndicator should change to gray (offline)
2. If `showLabel={true}`, should show "Был в сети {time}"

**Check Console (Window A)**:
- Event: `user:offline`
- Payload:
  ```json
  {
    "userId": "USER_B_ID",
    "status": "offline",
    "lastSeen": "2025-02-13T..."
  }
  ```

#### 5.4: Away Status (Optional)

**Window B (USER_B)**:
1. Manually update status to "away" (if implemented in UI)
2. Or trigger via inactivity timeout (if implemented)

**Window A (USER_A)**:
1. OnlineIndicator should change to yellow (away)

**Check Console (Window A)**:
- Event: `presence:update`
- Payload:
  ```json
  {
    "userId": "USER_B_ID",
    "status": "away"
  }
  ```

#### 5.5: Chat Room Presence

**Window A (USER_A)**:
1. Join chat room with USER_B
2. Check console: `presence:join-chat`

**Window B (USER_B)**:
1. Should see USER_A in online users list (if UI implemented)

### Expected Results
✅ Online status updates in real-time
✅ Offline status detected on disconnect
✅ Last seen timestamp displayed
✅ Away status works (if implemented)
✅ Chat room presence tracked separately
✅ Presence survives reconnection

---

## Test 6: Error Handling

### Objective
Verify error states and recovery mechanisms.

### Steps

#### 6.1: Invalid JWT Token

1. Open DevTools → Application → Local Storage
2. Modify `token` value to invalid string: "invalid_token"
3. Refresh page

**Expected**:
- Socket fails to connect
- Error in console: "Authentication failed"
- `error` state in SocketContext set
- UI shows disconnected state (no green dot)

#### 6.2: Network Failure

1. Disconnect internet (or use DevTools → Network → Offline)
2. Try sending chat message

**Expected**:
- Message send fails
- Toast error: "Не удалось отправить сообщение"
- Connection status shows "Переподключение..."
- Reconnection attempts when network restored

#### 6.3: Server Error

1. Modify backend to return 500 error on message send
2. Send message

**Expected**:
- Error caught in frontend
- Toast error displayed
- Message not added to chat

### Expected Results
✅ Invalid token handled gracefully
✅ Network errors show user-friendly messages
✅ Reconnection works after errors
✅ No app crashes on errors
✅ Error states cleared on successful reconnection

---

## Test 7: Performance & Load

### Objective
Ensure WebSocket performance under load.

### Steps

#### 7.1: Multiple Tabs

1. Open 5 tabs, all logged in as same user
2. All should share same Socket.IO connection (check backend logs)
3. Send messages, check delivery to all tabs

#### 7.2: High Message Volume

1. Send 50 messages rapidly (write script or use console)
   ```javascript
   for (let i = 0; i < 50; i++) {
     sendMessage({ recipientId: '...', text: `Message ${i}` });
   }
   ```
2. Check:
   - All messages delivered
   - No dropped messages
   - UI remains responsive

#### 7.3: Idle Connection

1. Leave tab open for 10+ minutes
2. Check:
   - Connection still alive (heartbeat)
   - Send message after idle period
   - Message delivered successfully

### Expected Results
✅ Multiple tabs supported
✅ High message volume handled
✅ No message loss
✅ Idle connections maintained (heartbeat)
✅ Reconnection after idle period

---

## Browser DevTools Checklist

### Console Logs to Look For

**Success Indicators**:
- ✅ `socket.io-client: connection established`
- ✅ `Joined chat room: {roomId}`
- ✅ `Subscribed to notifications`
- ✅ WebSocket events logged (chat:message:new, notification:new, etc.)

**Error Indicators**:
- ❌ `socket.io-client: connect_error`
- ❌ `Authentication failed`
- ❌ `Failed to send message`
- ❌ `Socket disconnected`

### Network Tab (WS Filter)

**Healthy Connection**:
- Status: `101 Switching Protocols`
- Type: `websocket`
- Frames: Active bidirectional traffic (ping/pong, events)

**Unhealthy Connection**:
- Status: `Failed to load`
- No WebSocket frames
- Repeated reconnection attempts

### React DevTools

**SocketContext State**:
```javascript
{
  socket: Socket { connected: true, id: "abc123..." },
  connected: true,
  error: null
}
```

**useChat Hook State**:
```javascript
{
  messages: [{ id: "...", text: "...", ... }],
  typingUsers: [],
  isJoined: true,
  connected: true
}
```

---

## Common Issues & Fixes

### Issue 1: "Socket not connected"
**Cause**: JWT token invalid or expired
**Fix**: Logout and login again to refresh token

### Issue 2: Messages not delivered in real-time
**Cause**: Room not joined or WebSocket disconnected
**Fix**: Check `isJoined` state, verify room ID

### Issue 3: Typing indicator stuck
**Cause**: Timeout not cleared properly
**Fix**: Check `typingTimeoutRef` cleanup in MessageInput

### Issue 4: Read receipts not working
**Cause**: `markAsRead` not called or event not emitted
**Fix**: Check backend emit in `/routes/chat.ts`

### Issue 5: Notifications not appearing
**Cause**: Not subscribed or event listener missing
**Fix**: Verify `notifications:subscribe` event sent

---

## Manual Testing Checklist

### WebSocket Connection
- [ ] Socket connects on login
- [ ] JWT auth works
- [ ] Reconnection after disconnect
- [ ] Connection status visible in UI
- [ ] Error messages on auth failure

### Chat Functionality
- [ ] Send message (CLIENT → SPECIALIST)
- [ ] Receive message in real-time
- [ ] Typing indicator appears
- [ ] Typing indicator disappears
- [ ] Read receipts (single/double check)
- [ ] Messages persist on refresh
- [ ] Auto-scroll to bottom
- [ ] Multiple chat rooms isolated

### Notifications
- [ ] Subscribe on mount
- [ ] Receive notification in real-time
- [ ] Toast appears
- [ ] Badge updates
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Navigate via actionUrl

### Presence
- [ ] Online status (green dot)
- [ ] Offline status (gray dot)
- [ ] Away status (yellow dot)
- [ ] Last seen timestamp
- [ ] Update on connect/disconnect
- [ ] Chat room presence

### Error Handling
- [ ] Invalid token error
- [ ] Network failure recovery
- [ ] Server error handling
- [ ] No app crashes

### Performance
- [ ] Multiple tabs support
- [ ] High message volume
- [ ] Idle connection maintained
- [ ] No memory leaks

---

## Next Steps After Testing

1. **Fix Bugs**: Address any issues found during testing
2. **Add Integration Tests**: Write automated tests (Jest + socket.io-client)
3. **Performance Optimization**: Monitor WebSocket traffic, optimize event frequency
4. **Production Deployment**: Configure CORS, SSL/TLS for secure WebSocket
5. **Monitoring**: Set up logging and alerts for WebSocket errors

---

## Production Readiness Checklist

- [ ] All manual tests passed
- [ ] Error handling robust
- [ ] Reconnection logic tested
- [ ] CORS configured for production domain
- [ ] SSL/TLS enabled for wss://
- [ ] Rate limiting on WebSocket events
- [ ] Logging and monitoring set up
- [ ] Load testing completed
- [ ] Documentation updated

---

**Phase 3 Implementation Complete!** 🎉

All WebSocket features are now ready for testing and integration into the Hearty platform.
