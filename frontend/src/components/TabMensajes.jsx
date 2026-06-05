import { useState, useEffect, useRef } from 'react'
import { socket, api } from '../lib/api.js'

const DEMO_CONVS = {
  'demo_maria': {
    name: 'María González', initials: 'MG', color: 'linear-gradient(135deg,#2DD4BF,#0D9488)',
    messages: [
      { from: 'contact', text: 'Hola! Quisiera agendar una cita para botox 💉', timestamp: Date.now() - 14 * 60000 },
      { from: 'me', text: '¡Hola María! 🌸 Bienvenida a Clínica Bella Piel. Con gusto te ayudo. ¿Qué día te queda mejor?', isAI: true, timestamp: Date.now() - 13 * 60000 },
      { from: 'contact', text: '¿El viernes en la mañana tienen?', timestamp: Date.now() - 2 * 60000 },
      { from: 'me', text: '¡Perfecto! El viernes tenemos 9:00 AM, 10:30 AM y 12:00 PM. Botox preventivo $1,800 💆‍♀️', isAI: true, timestamp: Date.now() - 90000 },
      { from: 'contact', text: 'Perfecto, confirmo para el viernes 👍', timestamp: Date.now() - 60000 },
    ]
  },
  'demo_sofia': {
    name: 'Sofia Ramírez', initials: 'SR', color: 'linear-gradient(135deg,#4ADE80,#16A34A)',
    messages: [
      { from: 'contact', text: 'Hola! ¿Tienen disponibilidad hoy?', timestamp: Date.now() - 9 * 60000 },
      { from: 'contact', text: 'Para un peeling o hidratación ✨', timestamp: Date.now() - 9 * 60000 + 10000 },
    ]
  },
  'demo_ana': {
    name: 'Ana Torres', initials: 'AT', color: 'linear-gradient(135deg,#60A5FA,#2563EB)',
    messages: [
      { from: 'contact', text: '¿Cuánto cuesta el peeling químico?', timestamp: Date.now() - 30 * 60000 },
    ]
  },
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'ahora'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm'
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

export default function TabMensajes() {
  const [convs, setConvs] = useState(DEMO_CONVS)
  const [activeJid, setActiveJid] = useState('demo_maria')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const msgsRef = useRef(null)

  useEffect(() => {
    // Try to load real conversations
    api.getConversations().then(list => {
      if (list.length > 0) {
        const realConvs = {}
        list.forEach(c => { realConvs[c.jid] = { name: c.name, initials: c.name.slice(0,2).toUpperCase(), color: 'linear-gradient(135deg,#2DD4BF,#0D9488)', messages: c.messages } })
        setConvs(realConvs)
        setActiveJid(list[0].jid)
      }
    }).catch(() => {})

    socket.on('connect', () => setWsConnected(true))
    socket.on('disconnect', () => setWsConnected(false))
    socket.on('new_message', ({ jid, from, text, isAI, timestamp, name }) => {
      setConvs(prev => {
        const updated = { ...prev }
        if (!updated[jid]) updated[jid] = { name: name || jid, initials: (name||jid).slice(0,2).toUpperCase(), color: 'linear-gradient(135deg,#2DD4BF,#0D9488)', messages: [] }
        updated[jid] = { ...updated[jid], messages: [...updated[jid].messages, { from, text, isAI, timestamp }] }
        return updated
      })
    })
    return () => { socket.off('connect'); socket.off('disconnect'); socket.off('new_message') }
  }, [])

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [convs, activeJid])

  const sendMsg = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    // Add user's manual message
    setConvs(prev => {
      const updated = { ...prev }
      if (!updated[activeJid]) return prev
      updated[activeJid] = { ...updated[activeJid], messages: [...updated[activeJid].messages, { from: 'me', text, timestamp: Date.now() }] }
      return updated
    })

    setLoading(true)

    // Try real API, fallback to demo
    try {
      await api.sendMessage(activeJid, text)
    } catch {
      // Demo mode: call Anthropic directly
      try {
        const { response } = await api.testAI(text)
        setConvs(prev => {
          const updated = { ...prev }
          updated[activeJid] = { ...updated[activeJid], messages: [...updated[activeJid].messages, { from: 'me', text: response, isAI: true, timestamp: Date.now() }] }
          return updated
        })
      } catch {
        setConvs(prev => {
          const updated = { ...prev }
          updated[activeJid] = { ...updated[activeJid], messages: [...updated[activeJid].messages, { from: 'me', text: '¡Hola! ¿En qué te puedo ayudar hoy? 🌸', isAI: true, timestamp: Date.now() }] }
          return updated
        })
      }
    }
    setLoading(false)
  }

  const activeConv = convs[activeJid]

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Mensajes</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>
            <span style={{ color: wsConnected ? 'var(--green)' : '#F97316', fontWeight: 600 }}>● {wsConnected ? 'WhatsApp conectado' : 'Modo demo'}</span>
            <span style={{ color: 'var(--gray-400)', marginLeft: 8 }}>· Agente IA activo</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 140px)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {/* Chat list */}
        <div style={{ borderRight: '1px solid var(--gray-100)', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-100)', fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>Conversaciones</div>
          {Object.entries(convs).map(([jid, conv]) => {
            const last = conv.messages[conv.messages.length - 1]
            return (
              <div
                key={jid}
                onClick={() => setActiveJid(jid)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', cursor: 'pointer',
                  background: activeJid === jid ? 'var(--teal-50)' : 'transparent',
                  borderBottom: '1px solid var(--gray-50)', transition: 'background 0.1s'
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: conv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>{conv.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{conv.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{last?.text || 'Sin mensajes'}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', flexShrink: 0 }}>{last ? timeAgo(last.timestamp) : ''}</div>
              </div>
            )
          })}
        </div>

        {/* Conversation */}
        {activeConv ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: activeConv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{activeConv.initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{activeConv.name}</div>
                <div style={{ fontSize: 12, color: 'var(--green)' }}>● En línea</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>🤖 IA activa</span>
              </div>
            </div>

            <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--gray-50)' }}>
              {activeConv.messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, maxWidth: '75%', alignSelf: msg.from === 'me' ? 'flex-end' : 'flex-start', flexDirection: msg.from === 'me' ? 'row-reverse' : 'row' }}>
                  {msg.from !== 'me' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: activeConv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{activeConv.initials}</div>
                  )}
                  <div>
                    <div style={{
                      padding: '10px 14px', borderRadius: 16, fontSize: 13, lineHeight: 1.5,
                      borderBottomLeftRadius: msg.from !== 'me' ? 4 : 16,
                      borderBottomRightRadius: msg.from === 'me' ? 4 : 16,
                      background: msg.from === 'me' ? 'linear-gradient(135deg,var(--teal-500),var(--teal-700))' : 'white',
                      color: msg.from === 'me' ? 'white' : 'var(--gray-700)',
                      boxShadow: msg.from !== 'me' ? 'var(--shadow-sm)' : 'none'
                    }}>{msg.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>
                      {timeAgo(msg.timestamp)}{msg.isAI ? ' · 🤖 IA' : ''}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'white', borderRadius: 16, borderBottomLeftRadius: 4, width: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                </div>
              )}
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10, background: 'white' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
                placeholder="Escribe un mensaje..."
                rows={1}
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 24, fontFamily: 'inherit', fontSize: 13, resize: 'none', outline: 'none', transition: 'border-color 0.15s' }}
              />
              <button onClick={sendMsg} disabled={loading} style={{ width: 40, height: 40, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', fontSize: 14 }}>Selecciona una conversación</div>
        )}
      </div>
    </div>
  )
}
