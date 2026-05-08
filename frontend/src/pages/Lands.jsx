import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PlusCircle, Search, Edit2, Trash2, X, MapPin, Maximize2, Tag } from 'lucide-react'

const Lands = () => {
  const [lands, setLands] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLand, setEditingLand] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    area: '',
    price: '',
    status: 'available'
  })

  const fetchLands = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/lands/')
      setLands(res.data)
    } catch (err) {
      console.error("Error fetching lands:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLands()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this property?')) {
      try {
        await axios.delete(`/api/lands/${id}`)
        setLands(lands.filter(land => land._id !== id))
      } catch (err) {
        alert("Failed to delete property")
      }
    }
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
      fetchLands()
      setIsModalOpen(false)
    } catch (err) {
      alert("Error saving data")
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Property Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track all land assets in real-time.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew} style={{ padding: '0.8rem 2rem' }}>
          <PlusCircle size={20} /> Add New Listing
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Filter by title, price, or location..." 
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '1rem' }}
          />
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
          <button className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }}>Filter</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading properties...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--glass)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <th style={{ padding: '1.25rem' }}>Property Details</th>
                <th style={{ padding: '1.25rem' }}>Location</th>
                <th style={{ padding: '1.25rem' }}>Area</th>
                <th style={{ padding: '1.25rem' }}>Valuation</th>
                <th style={{ padding: '1.25rem' }}>Status</th>
                <th style={{ padding: '1.25rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lands.map(land => (
                <tr key={land._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{land.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {land._id.substring(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                      <MapPin size={14} color="var(--primary)" /> {land.location || "N/A"}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Maximize2 size={14} color="var(--text-muted)" /> {land.area}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: '800', color: 'var(--success)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={14} /> {land.price}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      background: land.status === 'available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: land.status === 'available' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {land.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn" onClick={() => handleEdit(land)} style={{ padding: '0.6rem', background: 'var(--glass)' }}><Edit2 size={16} /></button>
                      <button className="btn" onClick={() => handleDelete(land._id)} style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', position: 'relative', padding: '2.5rem', border: '1px solid var(--primary)' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem' }}>{editingLand ? 'Update Listing' : 'New Property Listing'}</h2>
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label>Property Title</label>
                <input 
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Diamond Waterfront"
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input 
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. District 1, Ho Chi Minh City"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="input-group">
                  <label>Area (m²)</label>
                  <input 
                    type="text" required
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="e.g. 500"
                  />
                </div>
                <div className="input-group">
                  <label>Price ($)</label>
                  <input 
                    type="text" required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="e.g. 1,200,000"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  style={{ background: 'var(--bg-dark)' }}
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ flex: 1, background: 'var(--glass)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingLand ? 'Update Property' : 'Publish Listing'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lands
