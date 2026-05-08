import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react'
import { useTranslation } from '../i18n'

const Login = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '', email: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const res = await axios.post(endpoint, formData)
      
      if (!isRegister) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        window.location.href = '/' // Force reload to refresh App state
      } else {
        alert("Registration successful! Please login.")
        setIsRegister(false)
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh' }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: '420px', padding: '3rem', border: '1px solid var(--primary-glow)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', background: 'var(--accent-gradient)', 
            borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', boxShadow: '0 10px 20px var(--primary-glow)'
          }}>
            <Lock size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{isRegister ? t('login.createAccount') : t('login.welcome')}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {isRegister ? t('login.createAccount') : t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="input-group">
              <label><Mail size={14} /> {t('login.email')}</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com" 
              />
            </div>
          )}
          <div className="input-group">
            <label><UserIcon size={14} /> {t('login.username')}</label>
            <input 
              type="text" required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Your username" 
            />
          </div>
          <div className="input-group">
            <label><Lock size={14} /> {t('login.password')}</label>
            <input 
              type="password" required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••" 
            />
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? t('login.signUp') : t('login.signIn'))}
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {isRegister ? t('login.alreadyHave') : "Don't have an account yet?"}{' '}
          <span 
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}
          >
            {isRegister ? 'Sign In' : t('login.registerVIP')}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
