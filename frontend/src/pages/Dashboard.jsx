import { useState } from 'react'
import TabDashboard from '../components/TabDashboard.jsx'
import TabCitas from '../components/TabCitas.jsx'
import TabMensajes from '../components/TabMensajes.jsx'
import TabCalendario from '../components/TabCalendario.jsx'
import TabConfig from '../components/TabConfig.jsx'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'citas', label: 'Citas', icon: '📋' },
  { id: 'mensajes', label: 'Mensajes', icon: '💬', badge: 3 },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'config', label: 'Configuración', icon: '⚙️' },
]

export default function Dashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* SIDEBAR */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
        background: 'white', borderRight: '1px solid var(--gray-100)',
        padding: '20px 0', zIndex: 50, boxShadow: 'var(--shadow)'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--gray-100)', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>
            <div style={{
              width: 30, height: 30, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 800
            }}>✦</div>
            AestheticAI
          </div>
        </div>

        {/* Nav items */}
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', margin: '2px 8px',
              border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'var(--teal-50)' : 'transparent',
              color: activeTab === tab.id ? 'var(--teal-700)' : 'var(--gray-500)',
              transition: 'all 0.15s', width: 'calc(100% - 16px)',
            }}
          >
            <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span style={{
                marginLeft: 'auto', background: 'var(--teal-500)', color: 'white',
                borderRadius: 99, fontSize: 10, fontWeight: 700,
                padding: '2px 6px', minWidth: 18, textAlign: 'center'
              }}>{tab.badge}</span>
            )}
          </button>
        ))}

        {/* Bottom */}
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, padding: '0 8px' }}>
          <button
            onClick={() => onNavigate('landing')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              background: 'transparent', color: 'var(--gray-400)', width: '100%', transition: 'all 0.15s'
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span> Salir
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 240, padding: 24, flex: 1, minHeight: '100vh' }}>
        {activeTab === 'dashboard' && <TabDashboard />}
        {activeTab === 'citas' && <TabCitas onNewCita={() => setActiveTab('calendario')} />}
        {activeTab === 'mensajes' && <TabMensajes />}
        {activeTab === 'calendario' && <TabCalendario />}
        {activeTab === 'config' && <TabConfig />}
      </main>
    </div>
  )
}
