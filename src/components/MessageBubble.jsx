function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitialColor(name) {
  const colors = [
    '#5c6bc0', '#ef5350', '#66bb6a', '#ffa726',
    '#ab47bc', '#26c6da', '#ec407a', '#8d6e63',
  ];
  let hash = 0;
  for (const ch of name || '') hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function MessageBubble({ event, isOwn }) {
  const senderName = event.payload?.sender_name || event.sender?.kind || 'Unknown';
  const text = event.payload?.text || JSON.stringify(event.payload);
  const time = formatTime(event.timestamp);
  const color = getInitialColor(senderName);

  return (
    <div className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div className="text-xs mb-1 ml-1 font-medium" style={{ color }}>
            {senderName}
          </div>
        )}
        <div
          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
            isOwn
              ? 'bg-[#5c6bc0] text-white rounded-br-md'
              : 'bg-[#16213e] text-[#ddd] rounded-bl-md'
          }`}
        >
          {text}
        </div>
        <div className={`text-[10px] text-[#555] mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
          {time}
        </div>
      </div>
    </div>
  );
}
