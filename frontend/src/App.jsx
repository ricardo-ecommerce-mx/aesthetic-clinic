import { useState } from 'react'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PublicBooking from './pages/PublicBooking.jsx'

// Simple client-side "router" based on hash
const getInitialPage = () => {
  if (window.location.pathname === '/book') return 'book'
  return 'landing'
}

export default function App() {
  const [page, setPage] = useState(getInitialPage())

  if (page === 'book') return <PublicBooking />
  if (page === 'landing') return <Landing onNavigate={setPage} />
  if (page === 'auth') return <Auth onNavigate={setPage} />
  if (page === 'dashboard') return <Dashboard onNavigate={setPage} />
  return <Landing onNavigate={setPage} />
}
