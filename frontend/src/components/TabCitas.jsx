import { useState, useEffect } from 'react'
import { api, socket } from '../lib/api.js'

const STATUS = {
  confirmed: { label: '✓ Confirmada', bg: '#DCFCE7', color: '#15803D' },
  pending:   { label: '⏳ Pendiente',  bg: '#FEF9C3', color: '#854D0E' },
  cancelled: { label: '✗ Cancelada',  bg: '#FEE2E2', color: '#991B1B' },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y,m,d] = dateStr.split('-')
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${parseInt(d)} ${months[parseInt(m)-1]}`
}

export default function TabCitas({ onNewCita }) {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.getAppointments().then(data => {
      setAppointments(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
    socket.on('appointment_created', load)
    socket.on('appointment_updated', load)
    socket.on('appointment_deleted', load)
    return () => { socket.off('appointment_created', load); socket.off('appointment_updated', load); socket.off('appointment_deleted', load) }
  }, [])

  const updateStatus = async (id, status) => {
    await api.updateAppointment(id, { status })
    load()
  }

  const filtered = filter === 'all' ? appointments
    : appointments.filter(a => a.status === filter)

  const counts = {
    today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Citas</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{appointments.length} citas registradas</div>
        </div>
        <button className="btn btn-primary" onClick={onNewCita}>+ Nueva cita</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Citas hoy', value: counts.today, color: 'var(--gray-900)' },
          { label: 'Pendientes', value: counts.pending, color: '#F97316' },
          { label: 'Confirmadas', value: counts.confirmed, color: 'var(--green)' },
          { label: 'Canceladas', value: counts.cancelled, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>Lista de citas</div>
          <div style={{ display: 'flex', gap: 2, background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 3 }}>
            {[['all','Todas'],['pending','Pendientes'],['confirmed','Confirmadas'],['cancelled','Canceladas']].map(([val,lbl]) => (
              <button key={val} onClick={() => setFilter(val)}
                style={{ padding: '6px 12px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: filter===val ? 'white' : 'transparent', color: filter===val ? 'var(--teal-700)' : 'var(--gray-500)', boxShadow: filter===val ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}
              >{lbl}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Cargando citas...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 14 }}>No hay citas aún. Agrega una desde el Calendario.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)' }}>
                  {['Paciente','Servicio','Fecha','Hora','Estado','Acciones'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--gray-100)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const s = STATUS[a.status] || STATUS.pending
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 13 }}>{a.name}</div>
                        {a.phone && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.phone}</div>}
                        {a.email && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.email}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.service?.split('—')[0]?.trim() || a.service}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{formatDate(a.date)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.time}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {a.status !== 'confirmed' && (
                            <button onClick={() => updateStatus(a.id, 'confirmed')} style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#15803D', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Confirmar</button>
                          )}
                          {a.status !== 'cancelled' && (
                            <button onClick={() => updateStatus(a.id, 'cancelled')} style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #FECACA', background: '#FFF5F5', color: '#991B1B', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancelar</button>
                          )}
                        </div>
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
