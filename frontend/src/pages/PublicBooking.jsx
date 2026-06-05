import { useState, useEffect } from 'react'
import { api, BACKEND_URL } from '../lib/api.js'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ALL_SLOTS = ['9:00','9:30','10:00','10:30','11:00','11:30','12:00','13:00','14:00','15:00','15:30','16:00','17:00']
const SERVICES = ['Botox preventivo — $1,800','Relleno labial — $2,400','Peeling químico — $1,200','Hidratación profunda — $950','Mesoterapia — $1,500','Consulta inicial — $500']

export default function PublicBooking() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [takenSlots, setTakenSlots] = useState([])
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: SERVICES[0] })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dateStr = selectedDay ? `${year}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : null

  useEffect(() => {
    if (!dateStr) return
    api.getSlots(dateStr).then(d => setTakenSlots(d.taken || [])).catch(() => setTakenSlots([]))
  }, [dateStr])

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y); setSelectedDay(null); setSelectedSlot(null)
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!selectedSlot || !dateStr) return
    setLoading(true)
    try {
      await api.createAppointment({
        name: form.name,
        email: form.email,
        phone: form.phone,
        service: form.service,
        date: dateStr,
        time: selectedSlot,
      })
      setConfirmed(true)
    } catch (err) {
      alert('Error al agendar. Intenta de nuevo.')
    }
    setLoading(false)
  }

  if (confirmed) return (
    <div style={{ minHeight: '100vh', background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 'var(--radius-2xl)', padding: 48, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>¡Cita agendada!</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24, lineHeight: 1.7 }}>
          Hola <strong>{form.name}</strong>, tu cita para el <strong>{MONTHS[month]} {selectedDay}, {year}</strong> a las <strong>{selectedSlot}</strong> ha sido registrada.
          {form.phone && <><br /><br />Recibirás confirmación al WhatsApp <strong>{form.phone}</strong>.</>}
        </p>
        <div style={{ background: 'var(--teal-50)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--teal-700)', fontWeight: 600 }}>{form.service}</div>
        <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Clínica Bella Piel · Av. Juárez 123, Puebla</p>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => { setConfirmed(false); setSelectedDay(null); setSelectedSlot(null); setForm({ name:'', email:'', phone:'', service: SERVICES[0] }) }}>Agendar otra cita</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--teal-50)', padding: '2rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>✦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--gray-900)' }}>Clínica Bella Piel</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Agenda tu cita en línea · Sin costo de reserva</div>
          </div>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 6 }}>Reserva tu cita</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>Elige el día, el horario y completa tus datos. ¡Es rápido y sencillo! 💆‍♀️</p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Calendar */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' }}>
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
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
              const isSel = selectedDay === day
              return (
                <button key={day} disabled={isPast} onClick={() => { setSelectedDay(day); setSelectedSlot(null) }}
                  style={{
                    padding: '8px 4px', textAlign: 'center', fontFamily: 'inherit',
                    border: isSel ? '2px solid var(--teal-400)' : 'none',
                    borderRadius: 'var(--radius)', cursor: isPast ? 'not-allowed' : 'pointer', fontSize: 13,
                    fontWeight: isSel || isToday ? 700 : 500, minHeight: 36,
                    background: isToday ? 'var(--teal-500)' : isSel ? 'var(--teal-100)' : 'transparent',
                    color: isPast ? 'var(--gray-200)' : isToday ? 'white' : isSel ? 'var(--teal-700)' : 'var(--gray-600)',
                    transition: 'all 0.15s'
                  }}
                >{day}</button>
              )
            })}
          </div>
        </div>

        {/* Booking form */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--gray-100)' }}>
          {!selectedDay ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 14 }}>Selecciona un día para ver los horarios disponibles</p>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 4 }}>{MONTHS[month]} {selectedDay}, {year}</div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12 }}>Elige un horario disponible:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 16 }}>
                {ALL_SLOTS.map(slot => {
                  const taken = takenSlots.includes(slot)
                  const sel = selectedSlot === slot
                  return (
                    <button key={slot} disabled={taken} onClick={() => setSelectedSlot(slot)}
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
                <form onSubmit={handleConfirm} className="fade-in">
                  <div style={{ height: 1, background: 'var(--gray-100)', margin: '14px 0' }} />
                  <div className="form-group"><label className="form-label">Nombre completo *</label><input className="form-input" required placeholder="Tu nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Correo electrónico</label><input className="form-input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">WhatsApp *</label><input className="form-input" type="tel" required placeholder="+52 222 123 4567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="form-group">
                    <label className="form-label">Servicio *</label>
                    <select className="form-input" value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
                      {SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? '⏳ Guardando...' : '✓ Confirmar cita'}</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
