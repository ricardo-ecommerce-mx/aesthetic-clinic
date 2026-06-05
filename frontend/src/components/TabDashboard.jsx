import { useState, useEffect } from 'react'
import { api, socket } from '../lib/api.js'

const PRICE_MAP = {
  'Botox': 1800, 'Relleno': 2400, 'Peeling': 1200,
  'Hidratación': 950, 'Mesoterapia': 1500, 'Consulta': 500
}

function getPrice(service) {
  if (!service) return 0
  for (const [key, val] of Object.entries(PRICE_MAP)) {
    if (service.includes(key)) return val
  }
  return 0
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y,m,d] = dateStr.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${parseInt(d)} ${months[parseInt(m)-1]}`
}

export default function TabDashboard() {
  const [appointments, setAppointments] = useState([])
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = new Date().getMonth()

  const load = () => {
    api.getAppointments().then(setAppointments).catch(() => {})
  }

  useEffect(() => {
    load()
    socket.on('appointment_created', load)
    socket.on('appointment_updated', load)
    return () => { socket.off('appointment_created', load); socket.off('appointment_updated', load) }
  }, [])

  const thisMonthAppts = appointments.filter(a => {
    const m = a.date ? parseInt(a.date.split('-')[1]) - 1 : -1
    return m === thisMonth
  })

  const todayAppts = appointments.filter(a => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))

  const totalRevenue = thisMonthAppts
    .filter(a => a.status === 'confirmed')
    .reduce((sum, a) => sum + getPrice(a.service), 0)

  const newPatients = thisMonthAppts.filter(a => a.status !== 'cancelled').length

  // Weekly bars (last 4 weeks approx)
  const weeks = [0,0,0,0]
  thisMonthAppts.forEach(a => {
    const day = a.date ? parseInt(a.date.split('-')[2]) : 0
    const weekIdx = Math.min(Math.floor((day-1)/7), 3)
    weeks[weekIdx]++
  })
  const maxW = Math.max(...weeks, 1)

  const dotColors = ['var(--teal-400)','var(--green)','#F97316','#8B5CF6','#60A5FA','#EC4899']

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
            {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })} · Clínica Bella Piel
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Citas este mes', value: thisMonthAppts.length, meta: appointments.length > 0 ? '📊 Total acumulado: ' + appointments.length : '— Sin citas aún' },
          { label: 'Ingresos estimados', value: `$${totalRevenue.toLocaleString('es-MX')}`, meta: 'Citas confirmadas' },
          { label: 'Citas hoy', value: todayAppts.length, meta: todayAppts.length > 0 ? `Próxima: ${todayAppts[0]?.time}` : '— Ninguna hoy' },
          { label: 'Pendientes', value: appointments.filter(a => a.status === 'pending').length, meta: 'Requieren confirmación' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>{s.meta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>Citas por semana (este mes)</div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
              {weeks.map((v, i) => (
                <div key={i} style={{ flex: 1, background: v > 0 ? 'linear-gradient(to top,var(--teal-400),var(--teal-200))' : 'var(--gray-100)', borderRadius: '4px 4px 0 0', height: `${(v/maxW)*100}%`, minHeight: v > 0 ? 8 : 4, transition: 'height 0.3s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
              {['Sem 1','Sem 2','Sem 3','Sem 4'].map(l => (
                <div key={l} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--gray-400)', fontWeight: 500 }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's agenda */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>Agenda de hoy</div>
          <div style={{ padding: '0 16px' }}>
            {todayAppts.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No hay citas para hoy</div>
            ) : todayAppts.slice(0, 5).map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < todayAppts.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', minWidth: 44 }}>{a.time}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[i % dotColors.length], flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.service?.split('—')[0]?.trim()} · ${getPrice(a.service).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent appointments */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
          Citas recientes
        </div>
        {appointments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            Aquí aparecerán las citas cuando se registren desde el Calendario o el link público.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Paciente','Servicio','Fecha','Hora','Estado'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--gray-100)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 8).map(a => {
                  const sMap = { confirmed: { label: '✓ Confirmada', bg: '#DCFCE7', color: '#15803D' }, pending: { label: '⏳ Pendiente', bg: '#FEF9C3', color: '#854D0E' }, cancelled: { label: '✗ Cancelada', bg: '#FEE2E2', color: '#991B1B' } }
                  const s = sMap[a.status] || sMap.pending
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 13 }}>{a.name}</div>
                        {a.phone && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.phone}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.service?.split('—')[0]?.trim()}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{formatDate(a.date)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.time}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
