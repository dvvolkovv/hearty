/**
 * WebSocket Test Helper
 *
 * Load this in browser console to get helper functions for testing WebSocket
 *
 * Usage:
 *   1. Open browser console (F12)
 *   2. Copy-paste this entire file
 *   3. Use the helper functions below
 */

window.WSTestHelper = {
  /**
   * Check if WebSocket is connected
   */
  checkConnection() {
    const socket = window.io?.socket;
    if (!socket) {
      console.log('❌ Socket.IO not initialized');
      return false;
    }

    console.log('Socket Status:', {
      connected: socket.connected,
      id: socket.id,
      transport: socket.io?.engine?.transport?.name,
    });

    return socket.connected;
  },

  /**
   * Get current user info from localStorage
   */
  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found. Please login first.');
      return null;
    }

    // Decode JWT (basic decode, not verification)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Current User:', payload);
      return payload;
    } catch (e) {
      console.log('❌ Invalid token format');
      return null;
    }
  },

  /**
   * Subscribe to all WebSocket events (for debugging)
   */
  listenToAllEvents() {
    const socket = window.io?.socket;
    if (!socket) {
      console.log('❌ Socket not available');
      return;
    }

    // Chat events
    socket.on('chat:message:new', (data) => {
      console.log('📨 chat:message:new', data);
    });

    socket.on('chat:typing', (data) => {
      console.log('⌨️  chat:typing', data);
    });

    socket.on('chat:message:read', (data) => {
      console.log('✓✓ chat:message:read', data);
    });

    // Notification events
    socket.on('notification:new', (data) => {
      console.log('🔔 notification:new', data);
    });

    socket.on('notification:updated', (data) => {
      console.log('🔔 notification:updated', data);
    });

    socket.on('notifications:all-read', (data) => {
      console.log('🔔 notifications:all-read', data);
    });

    // Presence events
    socket.on('user:online', (data) => {
      console.log('🟢 user:online', data);
    });

    socket.on('user:offline', (data) => {
      console.log('⚫ user:offline', data);
    });

    socket.on('presence:update', (data) => {
      console.log('👤 presence:update', data);
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Connection error:', error);
    });

    console.log('✅ Listening to all WebSocket events');
  },

  /**
   * Send a test chat message
   */
  async sendTestMessage(recipientId, text = 'Test message from console') {
    const token = localStorage.getItem('token');
    const API_URL = import.meta?.env?.VITE_API_URL || 'https://heartypro-back-production.up.railway.app/api';

    try {
      const response = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId, text }),
      });

      const result = await response.json();
      console.log('✅ Message sent:', result);
      return result;
    } catch (error) {
      console.log('❌ Failed to send message:', error);
      throw error;
    }
  },

  /**
   * Create a test notification (requires database access)
   */
  createTestNotification() {
    console.log('💡 To create test notification, run this SQL:');
    console.log(`
      INSERT INTO "Notification" (id, "userId", subject, message, "isRead", "createdAt")
      VALUES (
        gen_random_uuid(),
        'YOUR_USER_ID',
        'Test Notification',
        'WebSocket is working!',
        false,
        NOW()
      );
    `);
  },

  /**
   * Get WebSocket connection info
   */
  getConnectionInfo() {
    const socket = window.io?.socket;
    if (!socket) {
      console.log('❌ Socket not available');
      return;
    }

    console.log('WebSocket Connection Info:');
    console.log({
      connected: socket.connected,
      id: socket.id,
      transport: socket.io?.engine?.transport?.name,
      url: socket.io?.uri,
      reconnection: socket.io?.opts?.reconnection,
      reconnectionAttempts: socket.io?.opts?.reconnectionAttempts,
      reconnectionDelay: socket.io?.opts?.reconnectionDelay,
    });
  },

  /**
   * Test reconnection
   */
  testReconnection() {
    const socket = window.io?.socket;
    if (!socket) {
      console.log('❌ Socket not available');
      return;
    }

    console.log('🔄 Testing reconnection...');
    console.log('Disconnecting...');
    socket.disconnect();

    setTimeout(() => {
      console.log('Reconnecting...');
      socket.connect();
    }, 2000);
  },

  /**
   * Show help
   */
  help() {
    console.log(`
WebSocket Test Helper - Available Functions:
────────────────────────────────────────────

✅ WSTestHelper.checkConnection()
   Check if WebSocket is connected

✅ WSTestHelper.getCurrentUser()
   Get current user info from JWT

✅ WSTestHelper.listenToAllEvents()
   Subscribe to all WebSocket events for debugging

✅ WSTestHelper.sendTestMessage(recipientId, text)
   Send a test chat message

✅ WSTestHelper.getConnectionInfo()
   Show detailed connection information

✅ WSTestHelper.testReconnection()
   Test reconnection mechanism

✅ WSTestHelper.createTestNotification()
   Show SQL to create test notification

✅ WSTestHelper.help()
   Show this help message

────────────────────────────────────────────
Example Usage:
  WSTestHelper.checkConnection()
  WSTestHelper.listenToAllEvents()
  WSTestHelper.sendTestMessage('user-id-here', 'Hello!')
    `);
  },
};

// Auto-run help on load
WSTestHelper.help();

console.log('✅ WebSocket Test Helper loaded!');
console.log('💡 Type WSTestHelper.help() to see available functions');
