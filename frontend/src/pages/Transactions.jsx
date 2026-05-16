import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { CreditCard, FileText, PlusCircle, Receipt, Users } from 'lucide-react'
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
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/transactions/', { params: { page: 1, limit: 20 } })
      setTransactions(res.data.items || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLands = useCallback(async () => {
    try {
      const res = await axios.get('/api/lands/', { params: { page: 1, limit: 100, status: 'available' } })
      setLands(res.data.items || [])
    } catch (err) {
      console.error('Error fetching lands for transaction form:', err)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchLands()
  }, [fetchTransactions, fetchLands])

  const totals = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      acc.count += 1
      acc.volume += Number(tx.amount || 0)
      if (tx.status === 'completed') acc.completed += 1
      if (tx.status === 'pending') acc.pending += 1
      return acc
    }, { count: 0, volume: 0, completed: 0, pending: 0 })
  }, [transactions])

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
      setErrorMessage(err.response?.data?.error || 'Failed to create transaction')
      setShowError(true)
    }
  }

  return (
    <div className="fade-in transactions-page">
      <div className="page-hero">
        <div>
          <div className="page-kicker">Deal desk</div>
          <h1 className="page-title">{t('transactions.title')}</h1>
          <p className="page-subtitle">Create, monitor, and audit property transaction records.</p>
        </div>
      </div>

      <div className="transactions-summary-grid">
        <div className="card mini-metric"><Receipt size={18} /><span>Total records</span><strong>{totals.count}</strong></div>
        <div className="card mini-metric"><CreditCard size={18} /><span>Total volume</span><strong>${totals.volume.toLocaleString()}</strong></div>
        <div className="card mini-metric"><Users size={18} /><span>Completed</span><strong>{totals.completed}</strong></div>
        <div className="card mini-metric"><FileText size={18} /><span>Pending</span><strong>{totals.pending}</strong></div>
      </div>

      <div className="card transactions-form-card">
        <h3 className="form-section-title"><PlusCircle size={18} /> Create Transaction</h3>
        <form onSubmit={handleCreateTransaction} className="transactions-form">
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Select property</label>
              <select
                value={formData.land_id}
                required
                onChange={(e) => setFormData({ ...formData, land_id: e.target.value })}
                className="form-input form-select"
              >
                <option value="">Select property</option>
                {lands.map((land) => (
                  <option key={land._id} value={land._id}>{land.title}</option>
                ))}
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Buyer name</label>
              <input
                type="text"
                placeholder="Enter buyer name"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-col">
              <label className="form-label">Amount</label>
              <input
                type="number"
                min="0"
                placeholder="Enter amount"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="form-input form-select"
              >
                <option value="sale">Sale</option>
                <option value="lease">Lease</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input form-select"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col-full">
              <label className="form-label">Notes</label>
              <textarea
                placeholder="Enter transaction notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-input form-textarea"
                rows="3"
              />
            </div>
          </div>

          <button className="btn btn-primary transactions-submit-btn" type="submit">Save Transaction</button>
        </form>
      </div>

      <div className="card transactions-table-card">
        <div className="table-toolbar">
          <h3 className="section-title">Recent Transactions</h3>
          <span>{transactions.length} records</span>
        </div>
        <div className="responsive-table">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>TX ID</th>
              <th>{t('lands.propertyDetails')}</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && transactions.map(tx => (
              <tr key={tx._id} className="table-row">
                <td className="tx-id">{tx._id.slice(0, 8)}</td>
                <td>{tx.land_title || 'N/A'}</td>
                <td>{tx.buyer_name || '-'}</td>
                <td className="tx-amount">${Number(tx.amount || 0).toLocaleString()}</td>
                <td>{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                <td>
                  <span className={`status-pill status-${tx.status || 'pending'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={6} className="table-loading">Loading transactions...</td>
              </tr>
            )}
            {!loading && !transactions.length && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-title">No transactions yet</div>
                    <div className="empty-state-text">Create the first transaction after selecting an available property.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {showError && (
          <div className="modal-backdrop">
            <div className="card modal-card error-modal">
              <div className="modal-header">
                <h2 className="modal-title">Error</h2>
              </div>
              <p className="error-message">{errorMessage}</p>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowError(false)}
                  className="btn btn-primary modal-primary-btn"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions
