import { useState } from 'react';

export default function Sidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onJoinChannel,
  userName,
  connected,
  onLogout,
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [actionError, setActionError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setActionError('');
    try {
      await onCreateChannel(newName.trim());
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      setActionError('Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    setCreating(true);
    setActionError('');
    try {
      await onJoinChannel(joinId.trim());
      setJoinId('');
      setShowJoin(false);
    } catch (err) {
      setActionError('Channel not found or unavailable');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-64 min-w-[256px] bg-[#16213e] flex flex-col border-r border-[#1a1a3e]">
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a3e]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-lg tracking-tight">GORN</span>
          <span className="flex items-center gap-1.5 text-xs text-[#888]">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {connected ? 'live' : 'polling'}
          </span>
        </div>
      </div>

      {/* Channel actions */}
      <div className="px-3 py-2 flex gap-2">
        <button
          onClick={() => { setShowCreate(!showCreate); setShowJoin(false); setActionError(''); }}
          className="flex-1 text-xs py-1.5 rounded bg-[#1a1a3e] hover:bg-[#252550] text-[#aaa] hover:text-white transition-colors cursor-pointer"
        >
          + New
        </button>
        <button
          onClick={() => { setShowJoin(!showJoin); setShowCreate(false); setActionError(''); }}
          className="flex-1 text-xs py-1.5 rounded bg-[#1a1a3e] hover:bg-[#252550] text-[#aaa] hover:text-white transition-colors cursor-pointer"
        >
          Join
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="px-3 pb-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Channel name..."
            autoFocus
            className="w-full px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#333] rounded text-white outline-none focus:border-[#5c6bc0] placeholder:text-[#555]"
          />
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="w-full mt-1.5 py-1.5 text-xs rounded bg-[#5c6bc0] hover:bg-[#7986cb] disabled:bg-[#333] text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          {actionError && <p className="text-red-400 text-xs mt-1">{actionError}</p>}
        </form>
      )}

      {/* Join form */}
      {showJoin && (
        <form onSubmit={handleJoin} className="px-3 pb-2">
          <input
            type="text"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Channel ID (UUID)..."
            autoFocus
            className="w-full px-2 py-1.5 text-sm bg-[#1a1a2e] border border-[#333] rounded text-white outline-none focus:border-[#5c6bc0] placeholder:text-[#555] font-mono text-xs"
          />
          <button
            type="submit"
            disabled={!joinId.trim() || creating}
            className="w-full mt-1.5 py-1.5 text-xs rounded bg-[#5c6bc0] hover:bg-[#7986cb] disabled:bg-[#333] text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {creating ? 'Joining...' : 'Join'}
          </button>
          {actionError && <p className="text-red-400 text-xs mt-1">{actionError}</p>}
        </form>
      )}

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {channels.length === 0 ? (
          <p className="text-[#555] text-xs text-center mt-4 px-2">
            No channels yet. Create one or join by ID.
          </p>
        ) : (
          channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onSelectChannel(ch.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm mb-0.5 transition-colors cursor-pointer ${
                ch.id === activeChannelId
                  ? 'bg-[#5c6bc0]/20 text-white'
                  : 'text-[#aaa] hover:bg-[#1a1a3e] hover:text-white'
              }`}
            >
              <span className="text-[#666] mr-1">#</span>
              {ch.name || ch.id.slice(0, 8)}
            </button>
          ))
        )}
      </div>

      {/* User info */}
      <div className="p-3 border-t border-[#1a1a3e] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#5c6bc0] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userName[0].toUpperCase()}
          </div>
          <span className="text-sm text-[#ccc] truncate">{userName}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-[#666] hover:text-red-400 text-xs transition-colors cursor-pointer"
          title="Log out"
        >
          exit
        </button>
      </div>
    </div>
  );
}
