import { useState, useEffect } from 'react'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PublicBooking from './pages/PublicBooking.jsx'

export default function App() {
  const [page, setPage] = useState('loading')

  useEffect(() => {
    const path = window.location.pathname
    if (path === '/book' || path === '/book/') {
      setPage('book')
    } else {
      setPage('landing')
    }
  }, [])

  if (page === 'loading') return null
  if (page === 'book') return <PublicBooking />
  if (page === 'landing') return <Landing onNavigate={setPage} />
  if (page === 'auth') return <Auth onNavigate={setPage} />
  if (page === 'dashboard') return <Dashboard onNavigate={setPage} />
  return <Landing onNavigate={setPage} />
}
