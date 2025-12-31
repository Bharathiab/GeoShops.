import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt } from 'react-icons/fa';
import StatusModal from '../common/StatusModal';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPickerMap = ({ onLocationSelect, initialCoords, markerColor = '#10b981' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: "success",
    message: "",
    onConfirm: null
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const initialLat = initialCoords?.lat || 20.5937;
    const initialLng = initialCoords?.lon || 78.9629;
    const map = L.map(mapRef.current).setView([initialLat, initialLng], initialCoords ? 13 : 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add initial marker if coords exist
    if (initialCoords) {
      const icon = createCustomIcon(markerColor);
      markerRef.current = L.marker([initialCoords.lat, initialCoords.lon], { icon }).addTo(map);
    }

    // Add click handler
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      // Update or create marker
      const icon = createCustomIcon(markerColor);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      }

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        onLocationSelect({
          lat,
          lon: lng,
          address
        });
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        onLocationSelect({
          lat,
          lon: lng,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        ">📍</div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          updateMapToLocation(lat, lng, 13);

          // Show accuracy circle
          if (mapInstanceRef.current) {
            // Remove previous accuracy circle if any
            mapInstanceRef.current.eachLayer((layer) => {
              if (layer instanceof L.Circle) {
                mapInstanceRef.current.removeLayer(layer);
              }
            });

            if (accuracy > 50) { // Only show if accuracy is slightly wide
              L.circle([lat, lng], { radius: accuracy, color: '#10b981', fillOpacity: 0.1, weight: 1 }).addTo(mapInstanceRef.current);
            }

            // Zoom to fit the accuracy circle if it's large
            if (accuracy > 500) {
              mapInstanceRef.current.fitBounds(L.circle([lat, lng], { radius: accuracy }).getBounds());
              setModalConfig({
                show: true,
                type: "info",
                message: `Location is approximate (within ${Math.round(accuracy)} meters). Please adjust the pin manually for better precision.`,
                onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
              });
            }
          }

          // Reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            onLocationSelect({ lat, lon: lng, address });
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            onLocationSelect({ lat, lon: lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.warn('GPS location failed, trying IP fallback...', error);
          getIPLocation();
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    } else {
      getIPLocation();
    }
  };

  const getIPLocation = async () => {
    try {
      let response = await fetch('https://ipapi.co/json/');
      let data = await response.json();

      if (!data.latitude) {
        response = await fetch('https://ip-api.com/json/');
        data = await response.json();
        if (data.status === 'success') {
          data.latitude = data.lat;
          data.longitude = data.lon;
        }
      }

      if (data.latitude && data.longitude) {
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        updateMapToLocation(lat, lng, 11);
        onLocationSelect({ lat, lon: lng, address: data.city || "Approximate Location" });

        setModalConfig({
          show: true,
          type: "info",
          message: "Precise location unavailable. Using approximate location based on your network.",
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      } else {
        throw new Error("All location lookups failed");
      }
    } catch (err) {
      console.error("Location fallback search failed:", err);
      setModalConfig({
        show: true,
        type: "error",
        message: "Unable to detect location. Please click on the map to pin your location manually.",
        onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
      });
    } finally {
      setLoadingLocation(false);
    }
  };

  const updateMapToLocation = (lat, lng, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom);
      const icon = createCustomIcon(markerColor);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '350px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #e5e7eb'
        }}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={loadingLocation}
        className="btn-vibrant-emerald px-3 py-2 rounded-lg d-flex align-items-center gap-2 shadow-emerald border-0"
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          zIndex: 1000,
          fontSize: '0.85rem',
          fontWeight: '600'
        }}
      >
        {loadingLocation ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="d-flex align-items-center gap-2"
          >
            <div className="spinner-border spinner-border-sm" role="status"></div> Getting Location...
          </motion.span>
        ) : (
          <>
            <FaMapMarkerAlt /> Use Current Location
          </>
        )}
      </motion.button>
      <small className="text-muted d-block mt-2">
        💡 Click anywhere on the map to select a precise location
      </small>
      <StatusModal
        show={modalConfig.show}
        onHide={() => setModalConfig(prev => ({ ...prev, show: false }))}
        type={modalConfig.type}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default LocationPickerMap;
