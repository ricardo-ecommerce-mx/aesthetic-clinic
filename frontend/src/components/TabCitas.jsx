const appointments = [
  { name: 'María González', phone: '+52 222 123 4567', service: 'Botox preventivo', date: '4 Jun', time: '9:00 AM', amount: '$1,800', status: 'confirmed' },
  { name: 'Sofia Ramírez', phone: '+52 222 987 6543', service: 'Hidratación profunda', date: '4 Jun', time: '10:30 AM', amount: '$950', status: 'confirmed' },
  { name: 'Ana Torres', phone: '+52 222 555 1234', service: 'Peeling químico', date: '4 Jun', time: '12:00 PM', amount: '$1,200', status: 'pending' },
  { name: 'Carla Mendez', phone: '+52 222 444 9876', service: 'Relleno labial', date: '4 Jun', time: '15:30 PM', amount: '$2,400', status: 'confirmed' },
  { name: 'Valeria Ruiz', phone: '+52 222 333 7654', service: 'Consulta inicial', date: '4 Jun', time: '17:00 PM', amount: '$500', status: 'pending' },
  { name: 'Luisa Hernández', phone: '+52 222 222 3456', service: 'Botox preventivo', date: '5 Jun', time: '10:00 AM', amount: '$1,800', status: 'confirmed' },
  { name: 'Patricia López', phone: '+52 222 111 8765', service: 'Mesoterapia', date: '5 Jun', time: '12:00 PM', amount: '$1,500', status: 'cancelled' },
]

const statusMap = {
  confirmed: { label: '✓ Confirmada', bg: '#DCFCE7', color: '#15803D' },
  pending: { label: '⏳ Pendiente', bg: '#FEF9C3', color: '#854D0E' },
  cancelled: { label: '✗ Cancelada', bg: '#FEE2E2', color: '#991B1B' },
}

export default function TabCitas({ onNewCita }) {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Citas</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Gestión de agenda y pacientes</div>
        </div>
        <button className="btn btn-primary" onClick={onNewCita}>+ Nueva cita</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Citas hoy', value: '5', color: 'var(--gray-900)' },
          { label: 'Pendientes', value: '8', color: '#F97316' },
          { label: 'Confirmadas', value: '71', color: 'var(--green)' },
          { label: 'Canceladas', value: '5', color: '#EF4444' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
          Lista de citas — Junio 2025
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)' }}>
                {['Paciente', 'Servicio', 'Fecha', 'Hora', 'Monto', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--gray-100)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => {
                const s = statusMap[a.status]
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 13 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{a.phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.service}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)' }}>{a.time}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{a.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
