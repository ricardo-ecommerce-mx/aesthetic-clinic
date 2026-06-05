import { useState } from 'react'

export default function Auth({ onNavigate }) {
  const [mode, setMode] = useState('login')

  const isLogin = mode === 'login'

  const handleSubmit = (e) => {
    e.preventDefault()
    onNavigate('dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--teal-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div style={{
        background: 'white', borderRadius: 'var(--radius-2xl)', padding: 40,
        width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--gray-100)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 20, color: 'var(--gray-900)' }}>
            <div style={{
              width: 36, height: 36, background: 'linear-gradient(135deg,var(--teal-500),var(--teal-700))',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 16, fontWeight: 800
            }}>✦</div>
            AestheticAI
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4 }}>
          {isLogin ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 28 }}>
          {isLogin ? 'Inicia sesión para acceder a tu panel' : 'Comienza a gestionar tu clínica con IA'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Nombre de la clínica</label>
              <input type="text" className="form-input" placeholder="Clínica Bella Piel" required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input type="email" className="form-input" placeholder="tu@clinica.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-input" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
            {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--gray-500)' }}>
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <a
            onClick={() => setMode(isLogin ? 'register' : 'login')}
            style={{ color: 'var(--teal-600)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
          </a>
        </p>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--gray-400)' }}>
          <a onClick={() => onNavigate('landing')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
            ← Volver al inicio
          </a>
        </p>
      </div>
    </div>
  )
}
