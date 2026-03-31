// Local storage helpers for user identity and known channels

export function getUser() {
  const raw = localStorage.getItem('gorn_user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem('gorn_user', JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem('gorn_user');
}

export function getKnownChannels() {
  const raw = localStorage.getItem('gorn_channels');
  return raw ? JSON.parse(raw) : [];
}

export function addKnownChannel(channel) {
  const channels = getKnownChannels();
  if (!channels.find((c) => c.id === channel.id)) {
    channels.push(channel);
    localStorage.setItem('gorn_channels', JSON.stringify(channels));
  }
}

export function removeKnownChannel(channelId) {
  const channels = getKnownChannels().filter((c) => c.id !== channelId);
  localStorage.setItem('gorn_channels', JSON.stringify(channels));
}

export function getAppKey() {
  return localStorage.getItem('gorn_app_key');
}

export function setAppKey(key) {
  localStorage.setItem('gorn_app_key', key);
}

export function getAppId() {
  return localStorage.getItem('gorn_app_id');
}

export function setAppId(id) {
  localStorage.setItem('gorn_app_id', id);
}

// Generate a stable UUID for anonymous users
export function generateUUID() {
  return crypto.randomUUID();
}
