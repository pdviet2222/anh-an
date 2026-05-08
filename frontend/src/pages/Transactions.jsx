import React from 'react'
import { useTranslation } from '../i18n'

const Transactions = () => {
  const { t } = useTranslation()
  const transactions = [
    { id: 'TX-9021', property: 'Skyline Land', client: 'John Doe', amount: '$500,000', date: '2026-05-01', status: 'completed' },
    { id: 'TX-9022', property: 'Riverside Plot', client: 'Jane Smith', amount: '$850,000', date: '2026-05-03', status: 'pending' },
    { id: 'TX-9023', property: 'Green Garden', client: 'Bob Johnson', amount: '$320,000', date: '2026-05-04', status: 'completed' },
  ]

  return (
    <div className="fade-in">
      <h1 style={{ marginBottom: '2rem' }}>{t('transactions.title')}</h1>
      
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
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', color: 'var(--primary)' }}>{tx.id}</td>
                <td style={{ padding: '1rem' }}>{tx.property}</td>
                <td style={{ padding: '1rem' }}>{tx.client}</td>
                <td style={{ padding: '1rem' }}>{tx.amount}</td>
                <td style={{ padding: '1rem' }}>{tx.date}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.75rem',
                    background: tx.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: tx.status === 'completed' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Transactions
