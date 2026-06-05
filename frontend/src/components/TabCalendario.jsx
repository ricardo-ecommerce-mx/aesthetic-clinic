import { useState } from 'react'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ALL_SLOTS = ['9:00','9:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','15:00','15:30','16:00','17:00']
const TAKEN_SLOTS = ['10:00','11:30','14:00']
const SERVICES = ['Botox preventivo — $1,800','Relleno labial — $2,400','Peeling químico — $1,200','Hidratación profunda — $950','Mesoterapia — $1,500','Consulta inicial — $500']
const PUBLIC_URL = (import.meta.env.VITE_BACKEND_URL || window.location.origin).replace(':3001','') + '/book'

export default function TabCalendario() {
  const [month, setMonth] = useState(5)
  const [year, setYear] = useState(2025)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [copied, setCopied] = useState(false)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y); setSelectedDay(null); setSelectedSlot(null)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(PUBLIC_URL).catch(() => {})
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Calendario</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Gestiona horarios y disponibilidad</div>
        </div>
      </div>

      {/* Public link banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
        <span style={{ fontSize: 14 }}>🔗</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal-700)' }}>Link público para clientes:</span>
        <span style={{ fontSize: 12, color: 'var(--teal-600)', flex: 1, wordBreak: 'break-all' }}>{PUBLIC_URL}</span>
        <button onClick={copyLink} style={{ padding: '4px 12px', border: '1px solid var(--teal-300)', background: 'white', color: 'var(--teal-600)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600 }}>
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Calendar */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => changeMonth(-1)} style={{ width: 32, height: 32, border: '1px solid var(--gray-200)', background: 'white', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 14 }}>←</button>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--gray-900)' }}>{MONTHS[month]} {year}</div>
            <button onClick={() => changeMonth(1)} style={{ width: 32, height: 32, border: '1px solid var(--gray-200)', background: 'white', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 14 }}>→</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 8 }}>
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', padding: '6px 0', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const isToday = day === 4 && month === 5 && year === 2025
              const isSel = selectedDay === day
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setSelectedSlot(null) }}
                  style={{
                    padding: '8px 4px', textAlign: 'center', fontFamily: 'inherit',
                    border: isSel ? '2px solid var(--teal-400)' : 'none',
                    borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13,
                    fontWeight: isSel || isToday ? 700 : 500, minHeight: 36,
                    background: isToday ? 'var(--teal-500)' : isSel ? 'var(--teal-100)' : 'transparent',
                    color: isToday ? 'white' : isSel ? 'var(--teal-700)' : 'var(--gray-600)',
                    transition: 'all 0.15s'
                  }}
                >{day}</button>
              )
            })}
          </div>
        </div>

        {/* Booking panel */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 20, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)' }}>
          {!selectedDay ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13 }}>Selecciona un día para ver los horarios</p>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 16 }}>{MONTHS[month]} {selectedDay}, {year}</div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 10 }}>Horarios disponibles:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                {ALL_SLOTS.map(slot => {
                  const taken = TAKEN_SLOTS.includes(slot)
                  const sel = selectedSlot === slot
                  return (
                    <button
                      key={slot}
                      disabled={taken}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: 8, fontFamily: 'inherit',
                        border: `1.5px solid ${sel ? 'var(--teal-500)' : taken ? 'var(--gray-100)' : 'var(--gray-200)'}`,
                        borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 600,
                        cursor: taken ? 'not-allowed' : 'pointer',
                        background: sel ? 'var(--teal-500)' : taken ? 'var(--gray-100)' : 'white',
                        color: sel ? 'white' : taken ? 'var(--gray-300)' : 'var(--gray-600)',
                        transition: 'all 0.15s'
                      }}
                    >{slot}</button>
                  )
                })}
              </div>

              {selectedSlot && (
                <div className="fade-in">
                  <div style={{ height: 1, background: 'var(--gray-100)', margin: '16px 0' }} />
                  <div className="form-group"><label className="form-label">Nombre completo</label><input className="form-input" placeholder="Nombre de la paciente" /></div>
                  <div className="form-group"><label className="form-label">Correo electrónico</label><input className="form-input" type="email" placeholder="correo@ejemplo.com" /></div>
                  <div className="form-group"><label className="form-label">WhatsApp</label><input className="form-input" type="tel" placeholder="+52 222 123 4567" /></div>
                  <div className="form-group">
                    <label className="form-label">Servicio</label>
                    <select className="form-input">{SERVICES.map(s => <option key={s}>{s}</option>)}</select>
                  </div>
                  <button className="btn btn-primary btn-block" onClick={() => alert('✅ Cita agendada exitosamente')}>✓ Confirmar cita</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
