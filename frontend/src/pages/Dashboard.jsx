import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Landmark, TrendingUp, Users, DollarSign, ArrowUpRight, Clock, MapPin } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useTranslation } from '../i18n'

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_lands: 0,
    available_lands: 0,
    sold_lands: 0,
    total_revenue: 0
  })
  const [loading, setLoading] = useState(true)

  const chartData = [
    { name: 'Jan', revenue: 4000, transactions: 24 },
    { name: 'Feb', revenue: 3000, transactions: 18 },
    { name: 'Mar', revenue: 9800, transactions: 45 },
    { name: 'Apr', revenue: 3908, transactions: 22 },
    { name: 'May', revenue: 4800, transactions: 30 },
    { name: 'Jun', revenue: 7800, transactions: 38 },
  ]

  const pieData = [
    { name: 'Available', value: 45, color: '#10b981' },
    { name: 'Sold', value: 30, color: '#6366f1' },
    { name: 'Pending', value: 25, color: '#f59e0b' },
  ]

  useEffect(() => {
    // Real API call to Flask Backend
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/reports/stats')
        setStats(res.data)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const { t } = useTranslation()

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('dashboard.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" style={{ background: 'var(--glass)' }}>{t('dashboard.exportPDF')}</button>
          <button className="btn btn-primary">{t('dashboard.refreshData')}</button>
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard icon={<Landmark />} label={t('lands.title')} value={stats.total_lands || 1284} trend="+14%" />
        <StatCard icon={<TrendingUp />} label={t('common.available')} value={stats.available_lands || 432} trend="+5.2%" color="var(--success)" />
        <StatCard icon={<Users />} label="Active Investors" value="842" trend="+12%" color="var(--warning)" />
        <StatCard icon={<DollarSign />} label={t('dashboard.total_revenue') || 'Total Revenue'} value={`$${(stats.total_revenue / 1000).toFixed(1)}k` || "$4.2M"} trend="+18%" color="var(--primary)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ minHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Revenue Analytics</h3>
            <select style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Property Status</h3>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            {pieData.map(item => (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                  {item.name}
                </span>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={20} color="var(--primary)" /> Recent Transactions
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <th style={{ padding: '1rem' }}>Property</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <ActivityRow title="Diamond Villa" loc="District 1, HCM" date="2 hours ago" amount="$1.2M" status="Completed" />
            <ActivityRow title="Skyline Apartment" loc="District 7, HCM" date="5 hours ago" amount="$450k" status="Pending" />
            <ActivityRow title="Riverside Plot" loc="Thu Duc City" date="Yesterday" amount="$850k" status="Completed" />
          </tbody>
        </table>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, trend, color = "var(--primary)" }) => (
  <div className="card stat-card">
    <div className="stat-icon" style={{ background: `rgba(${color === 'var(--primary)' ? '99,102,241' : color === 'var(--success)' ? '16,185,129' : '245,158,11'}, 0.1)`, color }}>
      {icon}
    </div>
    <div className="stat-info" style={{ flex: 1 }}>
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {trend} <ArrowUpRight size={12} />
      </div>
    </div>
  </div>
)

const ActivityRow = ({ title, loc, date, amount, status }) => (
  <tr style={{ borderTop: '1px solid var(--border)' }}>
    <td style={{ padding: '1rem', fontWeight: '600' }}>{title}</td>
    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {loc}</span>
    </td>
    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{date}</td>
    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{amount}</td>
    <td style={{ padding: '1rem' }}>
      <span style={{ 
        padding: '0.25rem 0.6rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: '700',
        background: status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        color: status === 'Completed' ? 'var(--success)' : 'var(--warning)'
      }}>
        {status}
      </span>
    </td>
  </tr>
)

export default Dashboard
