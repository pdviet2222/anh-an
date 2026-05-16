import React, { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { LayoutDashboard, Map as MapIcon, Landmark, History, LogOut, User } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import Lands from './pages/Lands'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import { useTranslation } from './i18n'

const Sidebar = ({ user, handleLogout }) => {
  const { locale, setLocale, t } = useTranslation()
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/map', icon: <MapIcon size={20} />, label: 'Interactive Map' },
    { to: '/lands', icon: <Landmark size={20} />, label: 'Property List' },
    { to: '/transactions', icon: <History size={20} />, label: 'Transactions' },
  ]

  return (
  <div className="sidebar">
    <div className="brand-lockup">
      <div className="brand-mark">LM</div>
      <div>
        <div className="brand-name">LandManage AI</div>
        <div className="brand-caption">Asset operations</div>
      </div>
    </div>
    <div className="locale-toggle" aria-label={t('common.language')}>
      <button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button>
      <button className={locale === 'vi' ? 'active' : ''} onClick={() => setLocale('vi')}>VI</button>
    </div>
    <div className="user-panel">
      <div className="user-avatar">
        <User size={16} />
      </div>
      <div className="user-copy">
        <div className="user-label">{t('common.language')}: {locale.toUpperCase()}</div>
        <div className="user-name">{user?.username || 'Guest'}</div>
      </div>
    </div>
    <nav className="sidebar-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          {item.icon} {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="sidebar-footer">
      <button onClick={handleLogout} className="nav-item logout-button">
        <LogOut size={20} /> Logout
      </button>
    </div>
  </div>)
}

function App() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
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
