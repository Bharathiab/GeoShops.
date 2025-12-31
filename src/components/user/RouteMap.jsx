import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ pickupCoords, dropoffCoords }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !pickupCoords || !dropoffCoords) return;

    // Clear existing layers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Create custom icons
    const pickupIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #10b981;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">📍</div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const dropoffIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">🎯</div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Add markers
    L.marker([pickupCoords.lat, pickupCoords.lon], { icon: pickupIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('<b>Pickup Location</b>');

    L.marker([dropoffCoords.lat, dropoffCoords.lon], { icon: dropoffIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('<b>Drop-off Location</b>');

    // Draw line between points
    const latlngs = [
      [pickupCoords.lat, pickupCoords.lon],
      [dropoffCoords.lat, dropoffCoords.lon]
    ];

    L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current);

    // Fit bounds to show both markers
    const bounds = L.latLngBounds(latlngs);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  }, [pickupCoords, dropoffCoords]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #e5e7eb'
      }}
    />
  );
};

export default RouteMap;
