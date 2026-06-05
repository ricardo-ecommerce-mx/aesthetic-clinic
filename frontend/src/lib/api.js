import { io } from 'socket.io-client'

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

export const socket = io(BACKEND_URL || window.location.origin, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 2000,
})

async function request(path, options = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  // Status
  getStatus: () => request('/api/status'),
  getConfig: () => request('/api/config'),
  saveConfig: (data) => request('/api/config', { method: 'POST', body: JSON.stringify(data) }),

  // Appointments
  getAppointments: () => request('/api/appointments'),
  createAppointment: (data) => request('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id, data) => request(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAppointment: (id) => request(`/api/appointments/${id}`, { method: 'DELETE' }),
  getSlots: (date) => request(`/api/appointments/slots/${date}`),

  // Conversations
  getConversations: () => request('/api/conversations'),
  sendMessage: (jid, text) => request('/api/send', { method: 'POST', body: JSON.stringify({ jid, text }) }),

  // AI
  updatePrompt: (prompt) => request('/api/prompt', { method: 'POST', body: JSON.stringify({ prompt }) }),
  testAI: (message) => request('/api/test-ai', { method: 'POST', body: JSON.stringify({ message }) }),
}
