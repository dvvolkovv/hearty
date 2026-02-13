import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { getChatRooms } from '../api/chat';
import type { ChatRoom } from '../api/chat';

/**
 * Temporary Chat Test Page
 *
 * Add to App.tsx routes:
 *   <Route path="/test-chat" element={<ChatTestPage />} />
 */
export const ChatTestPage = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user ID from localStorage token
  const getCurrentUserId = (): string => {
    const token = localStorage.getItem('token');
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || '';
    } catch {
      return '';
    }
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const result = await getChatRooms();
        setRooms(result.rooms);

        // Auto-select first room if available
        if (result.rooms.length > 0) {
          setSelectedRoom(result.rooms[0]);
        }
      } catch (error) {
        console.error('Failed to load chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">No Chat Rooms</h2>
        <p className="text-gray-600 mb-4">
          You don't have any chat conversations yet.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <p className="text-sm text-blue-800">
            💡 <strong>To create a chat room:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
            <li>• Book a session as CLIENT with a SPECIALIST</li>
            <li>• Or send a message as SPECIALIST to a CLIENT</li>
            <li>• Chat room will be auto-created</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebSocket Chat Test</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rooms List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Chat Rooms</h2>
            <div className="space-y-2">
              {rooms.map((room) => {
                const recipient = room.specialist || room.client;
                const recipientName = recipient?.name || 'Unknown';

                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{recipientName}</div>
                    {room.lastMessage && (
                      <div className="text-sm text-gray-600 truncate">
                        {room.lastMessage.text}
                      </div>
                    )}
                    {room.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {room.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedRoom ? (
              <ChatWindow
                room={selectedRoom}
                currentUserId={currentUserId}
                className="h-[600px]"
              />
            ) : (
              <div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center">
                <p className="text-gray-500">Select a chat room to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Debug Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Current User ID: {currentUserId}</div>
            <div>Total Rooms: {rooms.length}</div>
            <div>Selected Room ID: {selectedRoom?.id || 'None'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
