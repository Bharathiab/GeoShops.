import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaLocationArrow, FaExpand, FaCompress, FaSpinner } from 'react-icons/fa';
import Toast from '../../utils/toast';
import '../../pages/UserDashboard/DepartmentBooking.css'; // Ensure CSS is available

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ properties, department, onPropertyClick }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Department-specific marker colors
    const getDepartmentColor = (dept) => {
        const colors = {
            Hospital: '#0f766e', // Emerald
            Hotel: '#8b5cf6', // Violet
            Cab: '#0ea5e9', // Sky Blue
            Salon: '#ec4899' // Pink
        };
        return colors[dept] || '#3388ff';
    };

    // Create custom premium marker icon
    const createCustomIcon = (color) => {
        return L.divIcon({
            className: 'custom-marker-container',
            html: `
        <div class="marker-pin-wrapper">
          <div class="marker-pin" style="background: ${color}; box-shadow: 0 0 15px ${color}80;"></div>
          <div class="marker-pulse" style="border-color: ${color}"></div>
        </div>
      `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -45]
        });
    };

    // Inject Styles for Markers
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .marker-pin-wrapper { position: relative; width: 40px; height: 40px; }
            .marker-pin {
                width: 30px; 
                height: 30px; 
                border-radius: 50% 50% 50% 0; 
                background: #0f766e; 
                position: absolute; 
                transform: rotate(-45deg); 
                left: 50%; 
                top: 50%; 
                margin: -15px 0 0 -15px;
                border: 3px solid white;
                z-index: 2;
                transition: all 0.3s ease;
            }
            .marker-pin::after {
                content: ''; 
                width: 14px; 
                height: 14px; 
                margin: 5px 0 0 5px; 
                background: #fff; 
                position: absolute; 
                border-radius: 50%;
            }
            .marker-pulse {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 40px; height: 40px;
                border-radius: 50%;
                border: 2px solid #0f766e;
                opacity: 0;
                animation: pulse 2s infinite;
                z-index: 1;
            }
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
            .marker-pin-wrapper:hover .marker-pin { transform: rotate(-45deg) scale(1.1) translateY(-5px); }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map with custom styling options
        const map = L.map(mapRef.current, {
            zoomControl: false, // We'll add custom controls
            attributionControl: false
        }).setView([20.5937, 78.9629], 5);

        // Add a nice dark/light mode friendly tile layer
        // Using CartoDB Voyager for a cleaner "premium" look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current || !properties) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // If no properties, return
        if (properties.length === 0) return;

        const bounds = [];
        const color = getDepartmentColor(department);
        const icon = createCustomIcon(color);

        // Add markers for each property
        properties.forEach((property, index) => {
            if (!property.latitude || !property.longitude) return;

            const lat = property.latitude;
            const lng = property.longitude;
            
            const marker = L.marker([lat, lng], { icon })
                .addTo(mapInstanceRef.current)
                .bindPopup(`
                    <div style="font-family: 'Outfit', sans-serif;">
                        <div style="
                            height: 120px; 
                            background-image: url('${property.imageUrl || property.image_url || 'https://via.placeholder.com/300?text=Premium+Property'}'); 
                            background-size: cover; 
                            background-position: center;
                            border-radius: 12px 12px 0 0;
                            position: relative;
                        ">
                            <div style="
                                position: absolute; 
                                bottom: 10px; 
                                left: 10px; 
                                background: rgba(255,255,255,0.9); 
                                padding: 4px 8px; 
                                border-radius: 6px; 
                                font-size: 0.75rem; 
                                font-weight: bold; 
                                display: flex; 
                                align-items: center; 
                                gap: 4px;
                            ">
                                ⭐ ${property.rating || '4.8'}
                            </div>
                        </div>
                        <div style="padding: 16px;">
                            <h6 style="margin: 0 0 4px 0; font-weight: 800; font-size: 1.1rem; color: #0f172a;">${property.company}</h6>
                            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                                📍 ${property.location}
                            </p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div style="font-weight: 700; color: #0f766e; font-size: 1.1rem;">
                                    ₹${property.price}<span style="font-size: 0.75rem; color: #94a3b8; font-weight: 500;">/visit</span>
                                </div>
                            </div>
                            <button 
                                onclick="window.handlePropertyClick(${index})"
                                style="
                                    width: 100%;
                                    padding: 10px;
                                    background: linear-gradient(135deg, #002C22 0%, #0f766e 100%);
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 700;
                                    font-size: 0.9rem;
                                    letter-spacing: 0.5px;
                                    transition: transform 0.2s;
                                "
                                onmouseover="this.style.opacity='0.95'; this.style.transform='scale(1.02)'"
                                onmouseout="this.style.opacity='1'; this.style.transform='scale(1)'"
                            >
                                Book Appointment
                            </button>
                        </div>
                    </div>
                `, {
                    className: 'user-map-popup',
                    minWidth: 280,
                    maxWidth: 280,
                    closeButton: true
                });

            markersRef.current.push(marker);
            bounds.push([lat, lng]);
        });

        // Fit map to show all markers
        if (bounds.length > 0) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        window.handlePropertyClick = (index) => {
            if (onPropertyClick) onPropertyClick(properties[index]);
        };

        return () => {
            delete window.handlePropertyClick;
        };
    }, [properties, department, onPropertyClick]);

    const handleMyLocation = () => {
        if (!navigator.geolocation) {
            Toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([latitude, longitude], 13);
                    
                    if (!userMarkerRef.current) {
                        const userIcon = L.divIcon({
                            className: 'user-marker',
                            html: '<div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>',
                            iconSize: [24, 24]
                        });
                        userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
                    } else {
                        userMarkerRef.current.setLatLng([latitude, longitude]);
                    }
                }
                setIsLocating(false);
                Toast.success("Location found!");
            },
            (error) => {
                console.warn("Location access denied", error);
                setIsLocating(false);
                let errorMessage = "Unable to retrieve your location";
                if (error.code === 1) errorMessage = "Location access denied. Please enable permissions.";
                else if (error.code === 2) errorMessage = "Location unavailable.";
                else if (error.code === 3) errorMessage = "Location request timed out.";
                Toast.error(errorMessage);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', fontFamily: "'Outfit', sans-serif" }}>
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: '100%',
                    background: '#f8fafc'
                }}
            />
            
            {/* Gradient Header Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                zIndex: 400,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: getDepartmentColor(department),
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                    }}>
                        <FaMapMarkerAlt size={14} />
                    </div>
                    <div>
                        <h6 style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{department} Locator</h6>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{properties.length} nearby locations</span>
                    </div>
                </div>
            </div>

            {/* Floating Controls */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 400
            }}>
                <button
                    onClick={handleMyLocation}
                    disabled={isLocating}
                    style={{
                        width: '44px', height: '44px',
                        borderRadius: '12px',
                        background: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isLocating ? '#3b82f6' : '#64748b',
                        cursor: isLocating ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: isLocating ? 0.8 : 1
                    }}
                    title="My Location"
                >
                    {isLocating ? <FaSpinner className="spin-animation" /> : <FaLocationArrow />}
                </button>
            </div>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default MapView;
