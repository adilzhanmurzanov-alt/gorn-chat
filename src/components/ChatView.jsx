import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatView({ channel, messages, loading, error, onSendMessage, currentUserId, onToggleSidebar }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const messagesRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e]">
      {/* Channel header */}
      <div className="px-5 py-3 border-b border-[#252550] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-[#888] hover:text-white text-lg cursor-pointer"
          >
            &#9776;
          </button>
          <h2 className="text-white font-semibold text-base m-0">
            <span className="text-[#5c6bc0] mr-1">#</span>
            {channel.name || channel.id.slice(0, 8)}
          </h2>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(channel.id)}
          className="text-xs text-[#666] hover:text-[#aaa] transition-colors cursor-pointer"
          title="Copy channel ID to share"
        >
          Copy ID
        </button>
      </div>

      {/* Messages area */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-5 py-4">
        {loading && (
          <div className="text-center text-[#555] py-8">Loading messages...</div>
        )}
        {error && (
          <div className="text-center text-red-400/70 py-8 text-sm">{error}</div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="text-center text-[#555] py-8 text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            event={msg}
            isOwn={msg.payload?.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-5 py-3 border-t border-[#252550] shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channel.name || channel.id.slice(0, 8)}...`}
            autoFocus
            className="flex-1 px-4 py-2.5 bg-[#16213e] border border-[#333] rounded-lg text-white outline-none focus:border-[#5c6bc0] transition-colors placeholder:text-[#555] text-sm"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-5 py-2.5 bg-[#5c6bc0] hover:bg-[#7986cb] disabled:bg-[#252550] disabled:text-[#555] text-white rounded-lg font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
