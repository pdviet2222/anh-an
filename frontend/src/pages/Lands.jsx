import React, { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { PlusCircle, Search, Edit2, Trash2, X, MapPin, Maximize2, Tag } from 'lucide-react'
import { useTranslation } from '../i18n'

const Lands = () => {
  const { t } = useTranslation()
  const [lands, setLands] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 })
  const [filters, setFilters] = useState({ q: '', status: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLand, setEditingLand] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showError, setShowError] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    area: '',
    price: '',
    status: 'available'
  })

  const fetchLands = useCallback(async (page = 1, activeFilters = { q: '', status: '' }) => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: pagination.limit,
      }
      if (activeFilters.q.trim()) params.q = activeFilters.q.trim()
      if (activeFilters.status) params.status = activeFilters.status

      const res = await axios.get('/api/lands/', { params })
      setLands(res.data.items || [])
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, total_pages: 0 })
    } catch (err) {
      console.error("Error fetching lands:", err)
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchLands(1)
  }, [fetchLands])

  const handleDelete = async (id) => {
    setConfirmMessage('Are you sure you want to permanently delete this property?')
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`/api/lands/${id}`)
        fetchLands(pagination.page, filters)
        setShowConfirm(false)
      } catch (err) {
        setErrorMessage("Failed to delete property")
        setShowError(true)
        setShowConfirm(false)
      }
    })
    setShowConfirm(true)
  }

  const handleEdit = (land) => {
    setEditingLand(land)
    setFormData(land)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingLand(null)
    setFormData({ title: '', description: '', location: '', area: '', price: '', status: 'available' })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingLand) {
        await axios.put(`/api/lands/${editingLand._id}`, formData)
      } else {
        await axios.post('/api/lands/', formData)
      }
      fetchLands(pagination.page, filters)
      setIsModalOpen(false)
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error saving data")
      setShowError(true)
    }
  }

  const applyFilters = () => {
    fetchLands(1, filters)
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.total_pages) return
    fetchLands(nextPage, filters)
  }

  const summary = useMemo(() => ({
    total: pagination.total || lands.length || 0,
    available: lands.filter((land) => land.status === 'available').length,
    pending: lands.filter((land) => land.status === 'pending').length,
    sold: lands.filter((land) => land.status === 'sold').length,
  }), [lands, pagination.total])

  return (
    <div className="fade-in lands-page">
      <div className="page-hero">
        <div>
          <div className="page-kicker">Property control center</div>
          <h1 className="page-title">{t('lands.title')}</h1>
          <p className="page-subtitle">{t('lands.subtitle')}</p>
        </div>
        <button className="btn btn-primary hero-action" onClick={handleAddNew}>
          <PlusCircle size={20} /> {t('lands.addNew')}
        </button>
      </div>

      <div className="lands-summary-grid">
        <div className="card summary-card">
          <span className="summary-label">Total properties</span>
          <strong className="summary-value">{summary.total}</strong>
          <span className="summary-note">All land assets in the inventory</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Available</span>
          <strong className="summary-value summary-value-success">{summary.available}</strong>
          <span className="summary-note">Ready for listing or sale</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Pending</span>
          <strong className="summary-value summary-value-warning">{summary.pending}</strong>
          <span className="summary-note">Awaiting review or approval</span>
        </div>
        <div className="card summary-card">
          <span className="summary-label">Sold</span>
          <strong className="summary-value summary-value-danger">{summary.sold}</strong>
          <span className="summary-note">Closed transactions tracked here</span>
        </div>
      </div>

      <div className="card lands-toolbar">
        <div className="toolbar-grid">
          <div className="toolbar-search">
            <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder={t('lands.filterPlaceholder')}
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <div className="toolbar-actions">
            <select
              className="toolbar-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="available">{t('common.available')}</option>
              <option value="sold">{t('common.sold')}</option>
              <option value="pending">{t('common.pending')}</option>
            </select>
            <button className="btn toolbar-button" onClick={applyFilters}>Filter</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card lands-loading">{t('lands.loading')}</div>
      ) : (
        <div className="card lands-table-card">
          <div className="lands-table-wrap">
            <table className="lands-table">
              <thead>
                <tr>
                  <th>{t('lands.propertyDetails')}</th>
                  <th>{t('lands.location')}</th>
                  <th>{t('lands.area')}</th>
                  <th>{t('lands.valuation')}</th>
                  <th>{t('lands.status')}</th>
                  <th>{t('lands.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {lands.length ? lands.map(land => (
                  <tr key={land._id} className="table-row-hover">
                    <td>
                      <div className="land-title">{land.title}</div>
                      <div className="land-id">ID: {land._id.substring(0, 8)}...</div>
                    </td>
                    <td>
                      <div className="land-meta">
                        <MapPin size={14} color="var(--primary)" /> {land.location || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="land-meta">
                        <Maximize2 size={14} color="var(--text-muted)" /> {land.area}
                      </div>
                    </td>
                    <td>
                      <div className="land-price">
                        <Tag size={14} /> {land.price}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill status-${land.status || 'pending'}`}>
                        {(land.status === 'available' ? t('common.available') : land.status === 'sold' ? t('common.sold') : t('common.pending')).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn row-action-btn" onClick={() => handleEdit(land)}><Edit2 size={16} /></button>
                        <button className="btn row-action-btn danger" onClick={() => handleDelete(land._id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state-title">No properties found</div>
                        <div className="empty-state-text">Try a different filter or add a new listing.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="lands-footer">
        <span className="lands-footer-text">
          Total: {pagination.total || 0}
        </span>
        <div className="lands-pagination">
          <button className="btn" onClick={() => handlePageChange((pagination.page || 1) - 1)} disabled={(pagination.page || 1) <= 1}>Prev</button>
          <button className="btn" onClick={() => handlePageChange((pagination.page || 1) + 1)} disabled={(pagination.page || 1) >= (pagination.total_pages || 1)}>Next</button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="card modal-card">
            <button
              onClick={() => setIsModalOpen(false)}
              className="modal-close"
            >
              <X size={24} />
            </button>
            <div className="modal-header">
              <div className="page-kicker">Property form</div>
              <h2 className="modal-title">{editingLand ? t('lands.updateListing') : t('lands.newListing')}</h2>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="input-group">
                <label>{t('lands.propertyDetails')}</label>
                <input
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Diamond Waterfront"
                />
              </div>
              <div className="input-group">
                <label>{t('lands.location')}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. District 1, Ho Chi Minh City"
                />
              </div>
              <div className="modal-grid">
                <div className="input-group">
                  <label>{t('lands.area')} (m²)</label>
                  <input
                    type="number" required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="input-group">
                  <label>{t('lands.valuation')} ($)</label>
                  <input
                    type="number" required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g. 1,200,000"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>{t('lands.status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="modal-select"
                >
                  <option value="available">{t('common.available')}</option>
                  <option value="sold">{t('common.sold')}</option>
                  <option value="pending">{t('common.pending')}</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn modal-secondary-btn">{t('lands.cancel')}</button>
                <button type="submit" className="btn btn-primary modal-primary-btn">{editingLand ? t('lands.update') : t('lands.publish')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-backdrop">
          <div className="card modal-card confirm-modal">
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
            </div>
            <p className="confirm-message">{confirmMessage}</p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn modal-secondary-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className="btn btn-primary modal-primary-btn danger-action"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
  )
}

export default Lands
