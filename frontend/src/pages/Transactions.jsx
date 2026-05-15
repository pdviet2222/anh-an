import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from '../i18n'

const Transactions = () => {
  const { t } = useTranslation()
  const [transactions, setTransactions] = useState([])
  const [lands, setLands] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    land_id: '',
    buyer_name: '',
    amount: '',
    type: 'sale',
    status: 'completed',
    notes: ''
  })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/transactions/', { params: { page: 1, limit: 20 } })
      setTransactions(res.data.items || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLands = async () => {
    try {
      const res = await axios.get('/api/lands/', { params: { page: 1, limit: 100, status: 'available' } })
      setLands(res.data.items || [])
    } catch (err) {
      console.error('Error fetching lands for transaction form:', err)
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchLands()
  }, [])

  const handleCreateTransaction = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/transactions/', {
        ...formData,
        amount: Number(formData.amount)
      })
      setFormData({ land_id: '', buyer_name: '', amount: '', type: 'sale', status: 'completed', notes: '' })
      fetchTransactions()
      fetchLands()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create transaction')
    }
  }

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem' }}>{t('transactions.title')}</h1>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Create Transaction</h3>
        <form onSubmit={handleCreateTransaction} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <select
            value={formData.land_id}
            required
            onChange={(e) => setFormData({ ...formData, land_id: e.target.value })}
            style={{ padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'white' }}
          >
            <option value="">Select property</option>
            {lands.map((land) => (
              <option key={land._id} value={land._id}>{land.title}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buyer name"
            value={formData.buyer_name}
            onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
          />
          <input
            type="number"
            min="0"
            placeholder="Amount"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            style={{ padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'white' }}
          >
            <option value="sale">Sale</option>
            <option value="lease">Lease</option>
          </select>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            style={{ padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'white' }}
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <button className="btn btn-primary" style={{ gridColumn: 'span 3', justifyContent: 'center' }} type="submit">Save Transaction</button>
        </form>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--glass)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>TX ID</th>
              <th style={{ padding: '1rem' }}>{t('lands.propertyDetails')}</th>
              <th style={{ padding: '1rem' }}>Client</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && transactions.map(tx => (
              <tr key={tx._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', color: 'var(--primary)' }}>{tx._id.slice(0, 8)}</td>
                <td style={{ padding: '1rem' }}>{tx.land_title || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>{tx.buyer_name || '-'}</td>
                <td style={{ padding: '1rem' }}>${Number(tx.amount || 0).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem',
                    background: tx.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : tx.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: tx.status === 'completed' ? 'var(--success)' : tx.status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading transactions...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Transactions
