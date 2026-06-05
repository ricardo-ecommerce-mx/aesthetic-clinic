import { useEffect, useRef } from 'react'

const agenda = [
  { time: '9:00', name: 'María González', service: 'Botox · $1,800', color: 'var(--teal-400)' },
  { time: '10:30', name: 'Sofia Ramírez', service: 'Hidratación · $950', color: 'var(--green)' },
  { time: '12:00', name: 'Ana Torres', service: 'Peeling · $1,200', color: '#F97316' },
  { time: '15:30', name: 'Carla Mendez', service: 'Relleno · $2,400', color: '#8B5CF6' },
  { time: '17:00', name: 'Valeria Ruiz', service: 'Consulta · $500', color: '#60A5FA' },
]

const barData = [18, 24, 19, 28, 21, 26, 23, 30]
const barLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']

export default function TabDashboard() {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)' }}>Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Junio 2025 · Clínica Bella Piel</div>
        </div>
        <button className="btn btn-primary">Exportar reporte</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Citas este mes', value: '84', meta: '↑ 12% vs anterior', metaColor: 'var(--green)' },
          { label: 'Ingresos', value: '$47,200', meta: '↑ 8% vs anterior', metaColor: 'var(--green)' },
          { label: 'Nuevas pacientes', value: '23', meta: '🌟 Récord trimestre', metaColor: 'var(--gray-400)' },
          { label: 'Msgs WhatsApp', value: '312', meta: '🤖 78% por IA', metaColor: 'var(--gray-400)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.metaColor, marginTop: 6, fontWeight: 600 }}>{s.meta}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar chart */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>Citas por semana</div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {barData.map((v, i) => (
                <div key={i} style={{ flex: 1, background: 'linear-gradient(to top,var(--teal-400),var(--teal-200))', borderRadius: '4px 4px 0 0', height: `${(v / Math.max(...barData)) * 100}%`, transition: 'height 0.3s', cursor: 'pointer', title: `${v} citas` }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
              {barLabels.map(l => (
                <div key={l} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--gray-400)', fontWeight: 500 }}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Agenda */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>Agenda de hoy</div>
          <div style={{ padding: '0 16px' }}>
            {agenda.map((a, i) => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < agenda.length - 1 ? '1px solid var(--gray-50)' : 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal-600)', minWidth: 44 }}>{a.time}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by service */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-100)', fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>Ingresos por servicio — Junio</div>
        <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {[
            { label: 'Botox', val: '$18.4k', color: 'var(--teal-600)' },
            { label: 'Rellenos', val: '$12.1k', color: 'var(--green)' },
            { label: 'Peeling', val: '$8.7k', color: '#8B5CF6' },
            { label: 'Hidratación', val: '$5.2k', color: '#F97316' },
            { label: 'Consultas', val: '$2.8k', color: '#60A5FA' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
