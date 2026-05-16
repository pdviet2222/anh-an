import React, { useState } from 'react'
import axios from 'axios'
import { Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react'
import { useTranslation } from '../i18n'

const Login = () => {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({ username: '', password: '', email: '' })
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const res = await axios.post(endpoint, formData)
      
      if (!isRegister) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        window.location.href = '/' // Force reload to refresh App state
      } else {
        setMessage(t('login.registerSuccess'))
        setIsRegister(false)
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card fade-in auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={32} />
          </div>
          <h2>{isRegister ? t('login.createAccount') : t('login.welcome')}</h2>
          <p>
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
          
          {message && <div className="auth-message">{message}</div>}

          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (isRegister ? t('login.signUp') : t('login.signIn'))}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? t('login.alreadyHave') : "Don't have an account yet?"}{' '}
          <span 
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Sign In' : t('login.registerVIP')}
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
