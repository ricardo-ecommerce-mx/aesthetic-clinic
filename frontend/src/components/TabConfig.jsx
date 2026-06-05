import { useState, useEffect } from 'react'
import { socket, api } from '../lib/api.js'

const DEFAULT_PROMPT = `Eres la asistente virtual de Clínica Bella Piel, una clínica estética en Puebla, México. Tu nombre es "Bella" y eres amable, profesional y empática.

Tu objetivo es:
1. Dar la bienvenida a las clientas de manera cálida
2. Informar sobre nuestros servicios: Botox ($1,800), Relleno labial ($2,400), Peeling ($1,200), Hidratación ($950), Mesoterapia ($1,500)
3. Ayudar a agendar citas preguntando: nombre, servicio, fecha y hora
4. Invitar a usar el calendario: [TU_URL]/book
5. Responder preguntas sobre los procedimientos

Horarios: Lun–Vie 9AM–7PM, Sáb 9AM–2PM
Dirección: Av. Juárez 123, Centro, Puebla

Responde siempre en español. Usa emojis con moderación (💆‍♀️✨💉🌸). Respuestas concisas de 2-3 oraciones.`

export default function TabConfig() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [testInput, setTestInput] = useState('Hola, ¿qué servicios tienen?')
  const [testOutput, setTestOutput] = useState('')
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [qrImage, setQrImage] = useState(null)
  const [whatsappReady, setWhatsappReady] = useState(false)
  const [qrTimer, setQrTimer] = useState(58)

  useEffect(() => {
    api.getStatus().then(s => {
      if (s.connected) setWhatsappReady(true)
      if (s.qr) setQrImage(s.qr)
    }).catch(() => {})

    socket.on('qr', (qrDataUrl) => { setQrImage(qrDataUrl); setWhatsappReady(false); setQrTimer(58) })
    socket.on('whatsapp_ready', () => { setWhatsappReady(true); setQrImage(null) })
    socket.on('whatsapp_disconnected', () => { setWhatsappReady(false) })

    return () => { socket.off('qr'); socket.off('whatsapp_ready'); socket.off('whatsapp_disconnected') }
  }, [])

  useEffect(() => {
    if (qrImage && !whatsappReady) {
      const interval = setInterval(() => {
        setQrTimer(t => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [qrImage, whatsappReady])

  const savePrompt = async () => {
    try { await api.updatePrompt(prompt) } catch {}
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const testAgent = async () => {
    setTesting(true); setTestOutput('')
    try {
      const { response } = await api.testAI(testInput)
      setTestOutput(response)
    } catch {
      setTestOutput('¡Hola! Somos Clínica Bella Piel. Ofrecemos Botox ($1,800), Relleno labial ($2,400), Peeling ($1,200), Hidratación ($950) y Mesoterapia ($1,500). ¿En qué te puedo ayudar? 💆‍♀️')
    }
    setTesting(false)
  }

  const Section = ({ icon, title, children }) => (
    <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Configuración</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Personaliza tu clínica y agente IA</div>
        </div>
        <button className="btn btn-primary" onClick={savePrompt}>{saved ? '✓ Guardado' : 'Guardar cambios'}</button>
      </div>

      {/* Clinic data */}
      <Section icon="🏥" title="Datos de la clínica">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label className="form-label">Nombre de la clínica</label><input className="form-input" defaultValue="Clínica Bella Piel" /></div>
          <div className="form-group"><label className="form-label">Teléfono / WhatsApp</label><input className="form-input" type="tel" defaultValue="+52 222 555 0000" /></div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Dirección</label><input className="form-input" defaultValue="Av. Juárez 123, Col. Centro, Puebla, Pue." /></div>
          <div className="form-group"><label className="form-label">Horario (Lun–Vie)</label><input className="form-input" defaultValue="9:00 AM – 7:00 PM" /></div>
          <div className="form-group"><label className="form-label">Horario (Sábado)</label><input className="form-input" defaultValue="9:00 AM – 2:00 PM" /></div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Servicios (separados por coma)</label><input className="form-input" defaultValue="Botox, Rellenos, Peeling, Hidratación, Mesoterapia, Consultas" /></div>
        </div>
      </Section>

      {/* AI Prompt */}
      <Section icon="🤖" title="Prompt del Agente IA">
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>Define cómo debe comportarse y responder tu agente en WhatsApp:</p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          style={{ width: '100%', minHeight: 220, padding: 16, border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, resize: 'vertical', transition: 'border-color 0.15s', background: 'var(--gray-50)', color: 'var(--gray-700)' }}
          onFocus={e => { e.target.style.borderColor = 'var(--teal-400)'; e.target.style.background = 'white' }}
          onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)' }}
        />
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>Mensaje de prueba:</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={testInput} onChange={e => setTestInput(e.target.value)} style={{ flex: 1 }} placeholder="Escribe un mensaje de prueba..." />
            <button className="btn btn-primary" onClick={testAgent} disabled={testing}>{testing ? '⏳ ...' : '🧪 Probar'}</button>
            <button className="btn btn-ghost" onClick={savePrompt}>{saved ? '✓' : 'Guardar'}</button>
          </div>
          {testOutput && (
            <div style={{ marginTop: 12, padding: 14, background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', marginBottom: 6 }}>🤖 Respuesta del agente:</div>
              <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6 }}>{testOutput}</div>
            </div>
          )}
        </div>
      </Section>

      {/* WhatsApp QR */}
      <Section icon="📱" title="Conexión WhatsApp Business">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 16, lineHeight: 1.7 }}>
              Escanea el código QR con tu teléfono para conectar WhatsApp Business al agente IA. Las sesiones persisten en Railway.
            </p>
            {[
              '1. Abre WhatsApp en tu teléfono',
              '2. Ve a Ajustes → Dispositivos vinculados',
              '3. Toca "Vincular un dispositivo"',
              '4. Escanea el código QR →',
            ].map(step => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                <span>{step}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: whatsappReady ? 'var(--green)' : qrTimer > 0 ? '#F97316' : '#EF4444', animation: !whatsappReady && qrTimer > 0 ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-600)' }}>
                {whatsappReady ? '✅ WhatsApp conectado' : qrTimer > 0 ? `Esperando escaneo (${qrTimer}s)...` : 'QR expirado — regenerar'}
              </span>
            </div>
            <button
              className="btn btn-ghost"
              style={{ marginTop: 12, fontSize: 12 }}
              onClick={() => { setQrTimer(58); api.getStatus().then(s => { if (s.qr) setQrImage(s.qr) }) }}
            >🔄 Actualizar QR</button>
          </div>

          {/* QR display */}
          <div style={{ textAlign: 'center', padding: '24px 32px', background: 'var(--teal-50)', border: '2px dashed var(--teal-200)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {whatsappReady ? (
              <div style={{ width: 160, height: 160, background: 'white', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', textAlign: 'center' }}>Conectado</div>
              </div>
            ) : qrImage ? (
              <img src={qrImage} alt="WhatsApp QR" style={{ width: 160, height: 160, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }} />
            ) : (
              <div style={{ width: 160, height: 160, background: 'white', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: 36 }}>📱</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', padding: '0 8px' }}>Iniciando WhatsApp...</div>
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>Escanear con WhatsApp</div>
            {!whatsappReady && qrTimer > 0 && <div style={{ fontSize: 11, color: 'var(--gray-300)' }}>Válido por {qrTimer}s</div>}
          </div>
        </div>
      </Section>
    </div>
  )
}
