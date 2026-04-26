import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function Map({ photos, selectedPhoto, onSelectPhoto }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([35.6762, 139.6503], 4)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

    const map = mapInstanceRef.current

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker))
    markersRef.current = {}

    // Add markers
    const bounds = L.latLngBounds([])
    photos.forEach(photo => {
      if (!photo.location?.latitude || !photo.location?.longitude) return

      const marker = L.marker([photo.location.latitude, photo.location.longitude])
        .addTo(map)
        .bindPopup(
          `<div class="popup-content">
            <img src="${photo.url}=w200" style="width: 150px; height: auto; border-radius: 4px; margin-bottom: 8px;" />
            <p style="margin: 0; font-size: 12px; color: #666;">${photo.date?.split('T')[0]}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px;">${photo.filename}</p>
          </div>`,
          { maxWidth: 200 }
        )

      marker.on('click', () => {
        onSelectPhoto(photo)
      })

      if (selectedPhoto?.id === photo.id) {
        marker.openPopup()
        marker.setIcon(L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDMyIDQwIj48cGF0aCBmaWxsPSIjNDMzZmJmIiBkPSJNMTYgMEE5LjkxIDkuOTEgMCAwIDAgNi4xMyA2LjEzIEE5LjkxIDkuOTEgMCAwIDAgMTYgMzIgQzAgMCAxNiAzMiAxNiAzMmMwIDAgMTYtMTYgMTYtMzJhOS45MSA5LjkxIDAgMCAwLTkuODctOS44N1pNMTYgMjQuNWE0LjUgNC41IDAgMSAxIDAtOSA0LjUgNC41IDAgMCAxIDAgOXonLz48L3N2Zz4=',
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40],
          className: 'selected-marker'
        }))
      } else {
        marker.setIcon(L.icon({
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSMzMiIgdmlld0JveD0iMCAwIDI0IDMyIj48cGF0aCBmaWxsPSIjOTk5IiBkPSJNMTIgMEM1LjQgMCAyIDEuNzEgMiA0LjExYzAgMy45OSAxMCAyMCAxMCAyMHMxMC0xNi4wMSAxMC0yMEMyMiAxLjcxIDE4LjYgMCAxMiAweiIvPjwvc3ZnPg==',
          iconSize: [24, 32],
          iconAnchor: [12, 32],
          popupAnchor: [0, -32]
        }))
      }

      markersRef.current[photo.id] = marker
      bounds.extend([photo.location.latitude, photo.location.longitude])
    })

    // Fit bounds if there are markers
    if (Object.keys(markersRef.current).length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [photos, selectedPhoto, onSelectPhoto])

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-lg shadow-md"
      style={{ minHeight: '500px' }}
    />
  )
}

export default Map
