import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Tag, Maximize2, ExternalLink } from 'lucide-react'
import { useTranslation } from '../i18n'

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('/api/lands/')
        // Filter only properties that have location coordinates
        const withCoords = res.data.filter(p => p.location && typeof p.location === 'object')
        setProperties(withCoords)
      } catch (err) {
        console.error("Error fetching map data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>{t('map.title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('map.subtitle')}</p>
        </div>
        <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('map.showing', { n: properties.length })}</div>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{t('map.fullScreen')}</button>
        </div>
      </div>

      <div className="card" style={{ padding: '0.5rem', height: '650px', border: '1px solid var(--primary-glow)' }}>
        <div className="map-container" style={{ height: '100%', borderRadius: '0.75rem' }}>
          <MapContainer 
            center={[10.762622, 106.660172]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {properties.map(prop => (
              <Marker key={prop._id} position={[prop.location?.lat || 10.7626, prop.location?.lng || 106.6601]}>
                <Popup className="custom-popup">
                    <div style={{ width: '220px', padding: '0.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{prop.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem', color: '#555' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Tag size={14} /> <strong>{prop.price}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Maximize2 size={14} /> {prop.area}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prop.status === 'available' ? 'var(--success)' : 'var(--danger)' }}></div>
                        {prop.status === 'available' ? t('common.available').toUpperCase() : t('common.sold').toUpperCase()}
                      </span>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.75rem', padding: '0.5rem' }}>
                      {t('map.fullScreen')} <ExternalLink size={12} />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

export default MapPage
