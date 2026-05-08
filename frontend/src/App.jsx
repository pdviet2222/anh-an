import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { LayoutDashboard, Map as MapIcon, Landmark, History, LogOut, User, PlusCircle } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import Lands from './pages/Lands'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import { useTranslation } from './i18n'

const Sidebar = ({ user, handleLogout }) => {
  const { locale, setLocale, t } = useTranslation()
  return (
  <div className="sidebar">
    <div className="logo" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
      LandManage AI
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <button className="btn" onClick={() => setLocale('en')} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', opacity: locale === 'en' ? 1 : 0.6 }}>EN</button>
      <button className="btn" onClick={() => setLocale('vi')} style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', opacity: locale === 'vi' ? 1 : 0.6 }}>VI</button>
    </div>
    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--glass)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <User size={16} color="white" />
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('common.language')}: </div>
        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{user?.username || 'Guest'}</div>
      </div>
    </div>
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Link to="/" className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'inherit' }}>
        <LayoutDashboard size={20} /> Dashboard
      </Link>
      <Link to="/map" className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'inherit' }}>
        <MapIcon size={20} /> Interactive Map
      </Link>
      <Link to="/lands" className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'inherit' }}>
        <Landmark size={20} /> Property List
      </Link>
      <Link to="/transactions" className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'inherit' }}>
        <History size={20} /> Transactions
      </Link>
    </nav>
    <div style={{ marginTop: 'auto' }}>
      <button onClick={handleLogout} className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', color: 'var(--danger)' }}>
        <LogOut size={20} /> Logout
      </button>
    </div>
  </div>)
}

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const isAuthenticated = !!localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && <Sidebar user={user} handleLogout={handleLogout} />}
        <main className={isAuthenticated ? "main-content" : "main-content-full"}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/map" element={isAuthenticated ? <MapPage /> : <Navigate to="/login" />} />
            <Route path="/lands" element={isAuthenticated ? <Lands /> : <Navigate to="/login" />} />
            <Route path="/transactions" element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
