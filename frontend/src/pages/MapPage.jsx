import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Layers, Tag, Maximize2, ExternalLink } from 'lucide-react'
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

const tileLayers = {
  light: {
    label: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  standard: {
    label: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  dark: {
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
}

const MapPage = () => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState('light')
  const mapShellRef = useRef(null)
  const { t } = useTranslation()
  const selectedLayer = tileLayers[activeLayer]

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get('/api/lands/', { params: { page: 1, limit: 200 } })
        // Filter only properties that have location coordinates
        const withCoords = (res.data.items || []).filter(p => p.location && typeof p.location === 'object')
        setProperties(withCoords)
      } catch (err) {
        console.error("Error fetching map data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const openFullScreen = () => {
    if (mapShellRef.current?.requestFullscreen) {
      mapShellRef.current.requestFullscreen()
    }
  }

  return (
    <div className="fade-in map-page">
      <div className="page-hero">
        <div>
          <div className="page-kicker">Spatial intelligence</div>
          <h1 className="page-title">{t('map.title')}</h1>
          <p className="page-subtitle">{t('map.subtitle')}</p>
        </div>
        <div className="map-status-panel">
          <div>{loading ? 'Loading map assets...' : t('map.showing', { n: properties.length })}</div>
          <button className="btn btn-primary compact-btn" onClick={openFullScreen}>{t('map.fullScreen')}</button>
        </div>
      </div>

      <div className="map-layer-toolbar">
        <div className="map-layer-label">
          <Layers size={16} /> Map style
        </div>
        <div className="map-layer-options">
          {Object.entries(tileLayers).map(([key, layer]) => (
            <button
              key={key}
              type="button"
              className={activeLayer === key ? 'active' : ''}
              onClick={() => setActiveLayer(key)}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card map-shell" ref={mapShellRef}>
        <div className="map-container">
          <MapContainer 
            center={[10.762622, 106.660172]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              key={activeLayer}
              url={selectedLayer.url}
              attribution={selectedLayer.attribution}
            />
            {properties.map(prop => (
              <Marker key={prop._id} position={[prop.location?.lat || 10.7626, prop.location?.lng || 106.6601]}>
                <Popup className="custom-popup">
                  <div className="map-popup">
                    <h3>{prop.title}</h3>
                    <div className="map-popup-meta">
                      <span><Tag size={14} /> <strong>{prop.price}</strong></span>
                      <span><Maximize2 size={14} /> {prop.area}</span>
                      <span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: prop.status === 'available' ? 'var(--success)' : 'var(--danger)' }}></div>
                        {prop.status === 'available' ? t('common.available').toUpperCase() : t('common.sold').toUpperCase()}
                      </span>
                    </div>
                    <button className="btn btn-primary popup-btn">
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
