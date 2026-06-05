import React from 'react'

export default function Landing({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--teal-50)' }}>
      {/* NAV */}
      <nav style={{
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--gray-100)', padding: '0 2rem',
        height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, color: 'var(--gray-900)' }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 14, fontWeight: 800
          }}>✦</div>
          AestheticAI
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => onNavigate('auth')}>Iniciar sesión</button>
          <button className="btn btn-primary" onClick={() => onNavigate('auth')}>Comenzar gratis</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '80px 2rem 60px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--teal-100)', color: 'var(--teal-700)',
          padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
          marginBottom: 24, border: '1px solid var(--teal-200)'
        }}>🤖 Agente IA + WhatsApp Business</div>

        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, lineHeight: 1.15, color: 'var(--gray-900)', marginBottom: 20 }}>
          Gestiona tu clínica estética<br />
          con <span style={{
            background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>inteligencia artificial</span>
        </h1>

        <p style={{ fontSize: 17, color: 'var(--gray-500)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Conecta WhatsApp Business, automatiza respuestas con IA, gestiona citas y
          haz crecer tu clínica — todo desde un panel elegante.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('auth')}>
            🚀 Empieza ahora — es gratis
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNavigate('dashboard')}>
            Ver demo en vivo →
          </button>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '40px 2rem 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--teal-600)', marginBottom: 12 }}>Funcionalidades</div>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>Todo lo que tu clínica necesita</h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: 48 }}>Un sistema completo diseñado para clínicas estéticas modernas</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {[
            { icon: '📱', bg: '#DCFCE7', title: 'WhatsApp Business + IA', desc: 'Conecta con QR, responde automáticamente con IA usando tu propio prompt personalizado.' },
            { icon: '📅', bg: 'var(--teal-100)', title: 'Gestión de citas', desc: 'Calendario visual, horarios disponibles, booking público para clientes con link compartible.' },
            { icon: '💬', bg: '#EFF6FF', title: 'Chat estilo WhatsApp', desc: 'Bandeja unificada de mensajes con historial, burbujas diferenciadas y respuesta IA integrada.' },
            { icon: '📊', bg: '#F5F3FF', title: 'Dashboard de métricas', desc: 'Resumen mensual, agenda semanal, ingresos generados y KPIs clave de tu negocio.' },
          ].map(f => (
            <div key={f.title} style={{
              background: 'white', borderRadius: 'var(--radius-xl)', padding: 24,
              border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow)'
            }}>
              <div style={{ width: 44, height: 44, background: f.bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
