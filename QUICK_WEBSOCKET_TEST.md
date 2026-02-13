# Quick WebSocket Testing Checklist

## Prerequisites
- ✅ Frontend deployed on Railway
- ✅ Backend deployed on Railway
- ✅ Test user accounts created (CLIENT, SPECIALIST)

---

## Test 1: WebSocket Connection ⚡

### Steps:
1. Open your app: `https://your-app.railway.app`
2. Open Browser DevTools (F12) → Console
3. Login with any account
4. Look for console logs:
   ```
   ✅ socket.io-client: connection established
   ✅ Socket connected: true
   ```

### Network Tab Check:
- Go to **Network** tab → Filter **WS**
- Should see: `wss://your-backend.railway.app/socket.io/?EIO=4&transport=websocket`
- Status: `101 Switching Protocols` ✅

**Expected:** Green "connected" indicator in NotificationsDropdown (small green dot on bell icon)

---

## Test 2: Real-time Notifications 🔔

### Steps:
1. Login to app
2. Check bell icon in header - should have NotificationsDropdown
3. **Trigger notification** (pick one method):

   **Method A: Via Database**
   ```sql
   -- Get your user ID first
   SELECT id, email FROM "User" LIMIT 5;

   -- Create test notification
   INSERT INTO "Notification" (id, "userId", subject, message, "isRead", "createdAt")
   VALUES (
     gen_random_uuid(),
     'YOUR_USER_ID_HERE',
     'Тестовое уведомление',
     'WebSocket работает!',
     false,
     NOW()
   );
   ```

   **Method B: Real User Action**
   - Have another user book a session with you
   - Or leave a review
   - Or send a chat message

### Expected Results:
- ✅ Toast notification appears: "Тестовое уведомление"
- ✅ Bell icon badge shows unread count (+1)
- ✅ Click bell → dropdown shows notification with blue background
- ✅ No page refresh needed!

### Console Check:
```javascript
// Should see WebSocket event:
🔔 New notification received: {
  id: "...",
  subject: "Тестовое уведомление",
  message: "WebSocket работает!",
  isRead: false
}
```

---

## Test 3: Chat Messages 💬

### Setup:
- **Window 1**: Login as CLIENT
- **Window 2**: Login as SPECIALIST (use Incognito mode)

### Steps:

#### Part A: Check Chat Route Exists
1. Navigate to `/dashboard/chat` (or integrate chat into dashboard first)
2. Or manually trigger ChatWindow component

#### Part B: Send Message (CLIENT → SPECIALIST)
**Window 1 (CLIENT):**
1. Open chat with SPECIALIST
2. Type: "Hello from CLIENT"
3. Press Enter or Send button

**Window 2 (SPECIALIST):**
- Message should appear **instantly** (< 1 second)
- No page refresh
- Unread indicator should appear

### Expected Results:
- ✅ Message delivered in real-time
- ✅ Message shows sender name
- ✅ Timestamp displayed
- ✅ Single checkmark (✓) on sender side
- ✅ Blue background on unread message (recipient side)

### Console Check (Window 2):
```javascript
📨 New message received: {
  id: "...",
  senderId: "CLIENT_USER_ID",
  text: "Hello from CLIENT",
  isRead: false
}
```

#### Part C: Read Receipt
**Window 2 (SPECIALIST):**
- View the message (should auto-mark as read)

**Window 1 (CLIENT):**
- Single check (✓) changes to double check (✓✓)
- Color changes (indicates "read")

### Expected:
- ✅ Read receipt updates without refresh

---

## Test 4: Typing Indicator ⌨️

**Window 1 (CLIENT):**
- Start typing in chat input (don't send)
- Type a few characters

**Window 2 (SPECIALIST):**
- Should see: "CLIENT_NAME печатает..."
- Text appears below messages
- Disappears 2 seconds after typing stops

### Expected:
- ✅ Typing indicator appears instantly
- ✅ Auto-hides after 2s of inactivity

---

## Test 5: Online Presence 🟢

**Window 1 (USER_A):**
- Login and stay connected

**Window 2 (USER_B):**
- Navigate to page showing USER_A's OnlineIndicator
- Example: Chat window or specialist profile

### Expected:
- ✅ Green dot (🟢) = USER_A is online
- ✅ Dot has pulse animation
- ✅ Label shows "Онлайн" (if showLabel={true})

**Test Offline:**
- Close Window 1 (USER_A logs out)
- Window 2 should show:
  - ✅ Gray dot (⚫) = offline
  - ✅ "Был в сети {time ago}"

---

## Test 6: Reconnection After Disconnect 🔄

### Steps:
1. Login to app
2. Check WebSocket connected (green dot)
3. **Simulate disconnect:**
   - DevTools → Network → Set to "Offline"
   - Or stop backend server temporarily
4. Wait 5-10 seconds
5. **Restore connection:**
   - DevTools → Network → Set to "Online"
   - Or restart backend

### Expected:
- ✅ UI shows "Соединение потеряно. Переподключение..."
- ✅ Automatic reconnection attempts (1-5s delays)
- ✅ Successfully reconnects when network restored
- ✅ Green dot returns
- ✅ No page refresh needed

### Console Check:
```
socket.io-client: disconnect
socket.io-client: reconnecting (attempt 1)
socket.io-client: reconnecting (attempt 2)
socket.io-client: connection established
Socket connected: true
```

---

## Test 7: Error Handling ❌

### Test Invalid Token:
1. DevTools → Application → Local Storage
2. Change `token` to invalid string
3. Refresh page

**Expected:**
- ✅ Socket fails to connect
- ✅ Error in console: "Authentication failed"
- ✅ UI shows disconnected state (no green dot)
- ✅ No app crash

---

## Common Issues & Quick Fixes 🔧

### Issue: "Socket not connected"
**Check:**
- Backend WebSocket server running?
- JWT token valid? (logout → login)
- CORS configured for Railway domains?

### Issue: Notifications not appearing
**Check:**
- `notifications:subscribe` event sent? (check console)
- NotificationsDropdown component mounted?
- Backend emitting events correctly?

### Issue: Messages not real-time
**Check:**
- Both users joined same chat room?
- Backend emitting to correct room: `chat:${roomId}`?
- Check Network tab for WebSocket frames

### Issue: Read receipts not working
**Check:**
- `markAsRead` called when viewing message?
- Backend emitting `chat:message:read` event?
- Both users listening to same room?

---

## Browser DevTools Quick Reference 🛠️

### Console - Success Indicators:
```javascript
✅ socket.io-client: connection established
✅ Joined chat room: {roomId}
✅ Subscribed to notifications
✅ 📨 New message received
✅ 🔔 New notification received
✅ 👤 User online: {userId}
```

### Network Tab - WebSocket:
- Filter: **WS**
- Look for: `wss://` or `ws://` connection
- Status: `101 Switching Protocols` = ✅
- Frames tab: See ping/pong and events

### React DevTools - SocketContext:
```javascript
{
  socket: Socket { connected: true },
  connected: true,
  error: null
}
```

---

## Success Criteria ✅

All tests passing means WebSocket is production-ready:

- [x] WebSocket connects on login
- [x] JWT authentication works
- [x] Notifications delivered in real-time
- [x] Toast notifications appear
- [x] Badge updates without refresh
- [x] Chat messages delivered instantly
- [x] Typing indicators work
- [x] Read receipts update
- [x] Online/offline status tracked
- [x] Reconnection automatic
- [x] Error states handled gracefully
- [x] No app crashes

---

## Next Steps After Testing ⏭️

1. **If all tests pass:** WebSocket is ready for production! 🎉
2. **If some tests fail:** Debug using logs and test again
3. **Production checklist:**
   - Enable SSL/TLS (wss://)
   - Configure CORS for production domains
   - Set up monitoring/alerts
   - Load testing

**For detailed testing guide, see:** [WEBSOCKET_TESTING_GUIDE.md](./WEBSOCKET_TESTING_GUIDE.md)
