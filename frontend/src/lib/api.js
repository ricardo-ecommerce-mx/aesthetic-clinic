import { io } from 'socket.io-client'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

// ── Socket.IO ──────────────────────────────────────────────────────
export const socket = io(BACKEND_URL || window.location.origin, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 2000,
})

// ── REST helpers ──────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  getStatus: () => request('/api/status'),
  getConversations: () => request('/api/conversations'),
  getConversation: (jid) => request(`/api/conversations/${encodeURIComponent(jid)}`),
  sendMessage: (jid, text) => request('/api/send', { method: 'POST', body: JSON.stringify({ jid, text }) }),
  updatePrompt: (prompt) => request('/api/prompt', { method: 'POST', body: JSON.stringify({ prompt }) }),
  testAI: (message) => request('/api/test-ai', { method: 'POST', body: JSON.stringify({ message }) }),
}
