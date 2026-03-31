import { useState, useEffect, useRef, useCallback } from 'react';
import { getUser, setUser, getKnownChannels, addKnownChannel, generateUUID } from './api/storage';
import { createChannel, getChannel, getChannelEvents, publishEvent, joinChannel, connectWebSocket, checkHealth } from './api/tunnel';
import NameScreen from './components/NameScreen';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import EmptyState from './components/EmptyState';

const DEFAULT_CHANNEL = {
  id: '22bb325a-ab3b-4911-833a-a529a34542ae',
  name: 'lobby',
};

export default function App() {
  const [user, setUserState] = useState(getUser);
  const [channels, setChannels] = useState(getKnownChannels);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const lastEventIdRef = useRef(null);

  // Ensure lobby channel is in known channels on mount
  useEffect(() => {
    addKnownChannel(DEFAULT_CHANNEL);
    setChannels(getKnownChannels());
  }, []);

  // Save user
  const handleSetUser = (name) => {
    const u = { name, id: generateUUID() };
    setUser(u);
    setUserState(u);
  };

  // Load channel messages
  const loadMessages = useCallback(async (channelId) => {
    try {
      setLoading(true);
      setError(null);
      const events = await getChannelEvents(channelId);
      const msgs = (events || []).filter((e) => e.type?.startsWith('message.'));
      setMessages(msgs);
      if (msgs.length > 0) {
        lastEventIdRef.current = msgs[msgs.length - 1].id;
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages. Server may be unavailable.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select channel
  const handleSelectChannel = useCallback((channelId) => {
    setActiveChannelId(channelId);
    lastEventIdRef.current = null;
    loadMessages(channelId);
    setSidebarOpen(false);
  }, [loadMessages]);

  // Create channel
  const handleCreateChannel = async (name) => {
    try {
      const ch = await createChannel(name);
      addKnownChannel({ id: ch.id, name: ch.name || name });
      setChannels(getKnownChannels());
      // Join the channel as the user
      try {
        await joinChannel(ch.id, 'user', user.id);
      } catch (e) {
        // Non-critical
      }
      handleSelectChannel(ch.id);
      return ch;
    } catch (err) {
      console.error('Failed to create channel:', err);
      throw err;
    }
  };

  // Join existing channel by ID
  const handleJoinChannel = async (channelId) => {
    try {
      const ch = await getChannel(channelId);
      addKnownChannel({ id: ch.id, name: ch.name || channelId.slice(0, 8) });
      setChannels(getKnownChannels());
      try {
        await joinChannel(ch.id, 'user', user.id);
      } catch (e) {
        // Already a member, or other non-critical error
      }
      handleSelectChannel(ch.id);
    } catch (err) {
      console.error('Failed to join channel:', err);
      throw err;
    }
  };

  // Send message
  const handleSendMessage = async (text) => {
    if (!activeChannelId || !text.trim()) return;
    try {
      const event = await publishEvent(activeChannelId, 'message.text', {
        text: text.trim(),
        sender_name: user.name,
        sender_id: user.id,
      });
      // Optimistically add the message
      setMessages((prev) => [...prev, event]);
      lastEventIdRef.current = event.id;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message.');
    }
  };

  // WebSocket for real-time
  useEffect(() => {
    if (!user) return;

    let reconnectTimeout;
    let ws;

    const connect = () => {
      ws = connectWebSocket(
        (data) => {
          // Incoming event from WebSocket
          if (data.type?.startsWith('message.') && data.channel_id === activeChannelId) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });
            lastEventIdRef.current = data.id;
          }
        },
        () => setConnected(true),
        () => {
          setConnected(false);
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        }
      );
      wsRef.current = ws;
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, activeChannelId]);

  // Polling fallback for new messages
  useEffect(() => {
    if (!activeChannelId) return;

    const poll = async () => {
      try {
        const events = await getChannelEvents(activeChannelId, {
          after: lastEventIdRef.current,
          limit: 50,
        });
        const newMsgs = (events || []).filter((e) => e.type?.startsWith('message.'));
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const unique = newMsgs.filter((m) => !existingIds.has(m.id));
            if (unique.length === 0) return prev;
            return [...prev, ...unique];
          });
          lastEventIdRef.current = newMsgs[newMsgs.length - 1].id;
        }
      } catch (err) {
        // Silent polling failure
      }
    };

    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [activeChannelId]);

  // Not logged in
  if (!user) {
    return <NameScreen onSubmit={handleSetUser} />;
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  return (
    <div className="flex h-full w-full relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-20 h-full transition-transform duration-200`}>
        <Sidebar
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={handleCreateChannel}
          onJoinChannel={handleJoinChannel}
          userName={user.name}
          connected={connected}
          onLogout={() => {
            localStorage.clear();
            setUserState(null);
            setChannels([]);
            setActiveChannelId(null);
            setMessages([]);
          }}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {activeChannel ? (
          <ChatView
            channel={activeChannel}
            messages={messages}
            loading={loading}
            error={error}
            onSendMessage={handleSendMessage}
            currentUserId={user.id}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        ) : (
          <EmptyState onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}
      </div>
    </div>
  );
}
