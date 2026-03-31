const API_BASE = 'https://gornpipe-production.up.railway.app';
const WS_BASE = 'wss://gornpipe-production.up.railway.app';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const appKey = localStorage.getItem('gorn_app_key');
  if (appKey) headers['x-app-key'] = appKey;
  return headers;
}

async function request(method, path, body) {
  const opts = { method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// App registration
export async function registerApp(name) {
  return request('POST', '/apps/register', { name });
}

// Channels
export async function createChannel(name) {
  return request('POST', '/channels', { name });
}

export async function getChannel(channelId) {
  return request('GET', `/channels/${channelId}`);
}

export async function getChannelMembers(channelId) {
  return request('GET', `/channels/${channelId}/members`);
}

export async function joinChannel(channelId, memberKind, memberId, role = 'member') {
  return request('POST', `/channels/${channelId}/members`, {
    member_kind: memberKind,
    member_id: memberId,
    role,
  });
}

// Events
export async function publishEvent(channelId, type, payload = {}) {
  return request('POST', '/events', {
    type,
    channel_id: channelId,
    tier: 'fire-and-forget',
    payload,
  });
}

export async function getEvents(channelId, { after, limit = 50 } = {}) {
  const params = new URLSearchParams({ channel_id: channelId, limit: String(limit) });
  if (after) params.set('after', after);
  return request('GET', `/events?${params}`);
}

export async function getChannelEvents(channelId, { after, limit = 50 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);
  return request('GET', `/channels/${channelId}/events?${params}`);
}

// Subscriptions
export async function createSubscription(eventPattern, channelId = null) {
  const body = { event_pattern: eventPattern };
  if (channelId) body.channel_id = channelId;
  return request('POST', '/subscriptions', body);
}

// WebSocket
export function connectWebSocket(onMessage, onOpen, onClose) {
  const appKey = localStorage.getItem('gorn_app_key');
  const wsUrl = appKey ? `${WS_BASE}/ws?app_key=${appKey}` : `${WS_BASE}/ws`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[WS] Connected');
    onOpen?.();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.warn('[WS] Non-JSON message:', event.data);
    }
  };

  ws.onclose = (event) => {
    console.log('[WS] Disconnected:', event.code, event.reason);
    onClose?.(event);
  };

  ws.onerror = (error) => {
    console.error('[WS] Error:', error);
  };

  return ws;
}

// Health
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
