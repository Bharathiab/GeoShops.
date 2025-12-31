import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import {
  FaHotel, FaUserTie, FaHeartbeat, FaCut, FaPlus, FaCheckCircle,
  FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaSearchLocation, FaTag, FaRupeeSign, FaStar, FaList, FaLink, FaImage, FaTrash
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createProperty, fetchDepartments, resolveMapUrl, updateProperty, fetchSystemSettings, fetchSpecialistsByProperty, addSpecialist, deleteSpecialist, fetchServicesByProperty, addOfferedService, deleteOfferedService } from "../../api";
import StatusModal from "../common/StatusModal";
import { useNavigate } from "react-router-dom";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HostCreateProperty = ({ onSubmit, editingProperty }) => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [property, setProperty] = useState({
    company: "",
    owner: "",
    phone: "",
    email: "",
    location: "",
    location2: "",
    locationUrl: "",
    gstNumber: "",
    description: "",
    image: "",
    price: "",
    rating: "",
    amenities: "",
    imageUrl: "",
    latitude: null,
    longitude: null,
  });
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [customFeature, setCustomFeature] = useState("");
  const [departments, setDepartments] = useState([]);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [urlResolutionError, setUrlResolutionError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]); // New state for multiple images
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: "success",
    message: "",
    onConfirm: null
  });
  
  // Description Template State
  const [descriptionTemplates, setDescriptionTemplates] = useState([]);
  const [descriptionMode, setDescriptionMode] = useState("default"); // "default" or "custom"

  // Specialists State
  const [specialists, setSpecialists] = useState([]);
  const [newSpecialist, setNewSpecialist] = useState({ name: "", rating: "", imageUrl: "" });
  const [showSpecialistForm, setShowSpecialistForm] = useState(false);

  // Offered Services State
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", description: "", price: "", imageUrl: "" });
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingProperty) {
      setSelectedDepartment(editingProperty.department || "");
      setProperty({
        company: editingProperty.company || "",
        owner: editingProperty.owner || "",
        phone: editingProperty.phone || "",
        email: editingProperty.email || "",
        location: editingProperty.location || "",
        location2: editingProperty.location2 || "",
        locationUrl: editingProperty.locationUrl || "",
        gstNumber: editingProperty.gstNumber || "",
        description: editingProperty.description || "",
        image: editingProperty.imageUrl || "",
        price: editingProperty.price || "",
        rating: editingProperty.rating || "",
        amenities: editingProperty.amenities || "",
        imageUrl: editingProperty.imageUrl || "",
        latitude: editingProperty.latitude || null,
        longitude: editingProperty.longitude || null,
      });
      // Load existing images if available
      if (editingProperty.images && editingProperty.images.length > 0) {
        setImageUrls(editingProperty.images.map(img => img.imageUrl || img));
      } else {
        setImageUrls([]);
      }
      
      // Load specialists
      const loadSpecialists = async () => {
        try {
            if (editingProperty.id) {
                const specs = await fetchSpecialistsByProperty(editingProperty.id);
                setSpecialists(specs);
            }
        } catch (e) {
            console.error("Failed to load specialists", e);
        }
      };
      loadSpecialists();

      // Load services
      const loadServices = async () => {
        try {
            if (editingProperty.id) {
                const svcs = await fetchServicesByProperty(editingProperty.id);
                setServices(svcs);
            }
        } catch (e) {
            console.error("Failed to load services", e);
        }
      };
      loadServices();

      // Parse features if they exist
      if (editingProperty.features) {
        try {
          const features = JSON.parse(editingProperty.features);
          if (Array.isArray(features)) {
            setSelectedFeatures(features || []);
          } else if (features && typeof features === 'object') {
            // New structured format
            setSelectedFeatures(features.list || []);
            if (features.cabRates) {
              setProperty(prev => ({
                ...prev,
                price_economy: features.cabRates.economy,
                price_premium: features.cabRates.premium,
                price_xl: features.cabRates.xl
              }));
            }
          }
        } catch (e) {
          setSelectedFeatures([]);
        }
      }
    }
  }, [editingProperty]);

  // Location Picker Component
  const LocationPicker = ({ latitude, longitude, onLocationSelect }) => {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const markerRef = React.useRef(null);
    const [loadingLocation, setLoadingLocation] = React.useState(false);

    const getCurrentLocation = () => {
      setLoadingLocation(true);

      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser");
        getIPLocation();
        return;
      }

      console.log('🎯 Fetching current location with high accuracy...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          console.log('=== LOCATION FETCHED ===');
          console.log(`Latitude: ${lat}`);
          console.log(`Longitude: ${lng}`);
          console.log(`Accuracy: ±${Math.round(accuracy)} meters`);
          console.log(`Timestamp: ${new Date(position.timestamp).toLocaleString()}`);
          console.log('========================');

          // Update the property state with new coordinates
          onLocationSelect(lat, lng);

          if (mapInstanceRef.current) {
            // Center map on new location with high zoom for precision
            mapInstanceRef.current.setView([lat, lng], 17);

            // Update or create marker
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], {
                draggable: true
              }).addTo(mapInstanceRef.current);

              // Allow marker to be dragged for fine-tuning
              markerRef.current.on('dragend', function (e) {
                const newPos = e.target.getLatLng();
                console.log(`🖱️ Marker manually adjusted to: Lat ${newPos.lat}, Lng ${newPos.lng}`);
                onLocationSelect(newPos.lat, newPos.lng);
              });
            }

            // Remove existing accuracy circles
            mapInstanceRef.current.eachLayer((layer) => {
              if (layer instanceof L.Circle) {
                mapInstanceRef.current.removeLayer(layer);
              }
            });

            // Add accuracy circle if location is not very precise
            if (accuracy > 30) {
              const circleColor = accuracy > 500 ? '#ef4444' : accuracy > 100 ? '#f59e0b' : '#10b981';
              L.circle([lat, lng], {
                radius: accuracy,
                color: circleColor,
                fillColor: circleColor,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5'
              }).addTo(mapInstanceRef.current);
            }

            // Show accuracy feedback
            if (accuracy > 500) {
              mapInstanceRef.current.fitBounds(L.circle([lat, lng], { radius: accuracy }).getBounds());
            }
          }

          // Show accuracy-based feedback
          showAccuracyMessage(accuracy);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("❌ Error getting location:", error);

          let errorMsg = "Unable to get your location. ";
          let modalMessage = "";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += "Location permission denied.";
              modalMessage = "🚫 Location Permission Denied\n\nTo enable location:\n1. Click the 🔒 icon in your browser's address bar\n2. Set Location permission to 'Allow'\n3. Reload the page and try again\n\nAlternatively, you can:\n• Click on the map to set location manually\n• Paste a Google Maps URL in the Location URL field";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += "Location information is unavailable.";
              modalMessage = "📍 Location Unavailable\n\nYour device cannot determine your location right now.\n\nPlease:\n• Click on the map to set your location manually\n• Or paste a Google Maps URL";
              break;
            case error.TIMEOUT:
              errorMsg += "Location request timed out.";
              modalMessage = "⏱️ Location Request Timed Out\n\nGPS is taking too long to respond.\n\nPlease:\n• Try again (GPS may need time to acquire signal)\n• Click on the map to set location manually\n• Or paste a Google Maps URL";
              break;
            default:
              errorMsg += "An unknown error occurred.";
              modalMessage = "❌ Location Error\n\nUnable to get your location.\n\nPlease:\n• Click on the map to set your location\n• Or paste a Google Maps URL";
          }

          console.warn(errorMsg);

          if (error.code !== error.PERMISSION_DENIED) {
            // Try IP fallback for non-permission errors
            console.log('Attempting IP-based location fallback...');
            getIPLocation();
          } else {
            setModalConfig({
              show: true,
              type: "error",
              message: modalMessage,
              onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
            });
            setLoadingLocation(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    };

    const showAccuracyMessage = (accuracy) => {
      if (accuracy < 20) {
        setModalConfig({
          show: true,
          type: "success",
          message: `✅ Excellent Location Accuracy!\n\nYour location has been pinpointed to within ±${Math.round(accuracy)} meters.\n\nThis is very accurate and ready to use!`,
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      } else if (accuracy < 50) {
        setModalConfig({
          show: true,
          type: "success",
          message: `✅ Very Good Location Accuracy!\n\nAccuracy: ±${Math.round(accuracy)} meters\n\nThis is good enough for most purposes. You can fine-tune by dragging the marker if needed.`,
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      } else if (accuracy < 100) {
        setModalConfig({
          show: true,
          type: "info",
          message: `📍 Good Location Accuracy\n\nAccuracy: ±${Math.round(accuracy)} meters\n\nPlease verify the marker position and drag it to your exact location if needed.`,
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      } else if (accuracy < 500) {
        setModalConfig({
          show: true,
          type: "warning",
          message: `⚠️ Moderate Location Accuracy\n\nAccuracy: ±${Math.round(accuracy)} meters\n\nPlease adjust the marker:\n• Drag the marker to your exact location\n• Or click on the map where your property is\n• Or use Google Maps URL for precise coordinates`,
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      } else {
        const accuracyKm = (accuracy / 1000).toFixed(2);
        setModalConfig({
          show: true,
          type: "warning",
          message: `🚨 Low Location Accuracy (±${accuracyKm} km)\n\nThis location may not be accurate!\n\nPlease set the exact location:\n• Drag the marker to your property\n• Click on the map at your property location\n• Or paste a Google Maps URL (most reliable)`,
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      }
    };

    const getIPLocation = async () => {
      console.warn('⚠️ GPS UNAVAILABLE - Using IP-based location (VERY INACCURATE)');
      try {
        // Try service 1: ipapi.co
        let response = await fetch('https://ipapi.co/json/');
        let data = await response.json();

        if (!data.latitude || !data.longitude) {
          console.warn("Primary IP Geolocation (ipapi.co) failed to provide coordinates. Trying secondary service...");
          // Try service 2: ip-api.com
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

          console.log('=== IP-BASED LOCATION (INACCURATE) ===');
          console.log(`Latitude: ${lat}`);
          console.log(`Longitude: ${lng}`);
          console.log(`City: ${data.city || 'Unknown'}`);
          console.log(`Region: ${data.region || 'Unknown'}`);
          console.log('⚠️ This is NOT your exact location!');
          console.log('=======================================');

          onLocationSelect(lat, lng);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 11);

            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], {
                draggable: true
              }).addTo(mapInstanceRef.current);

              // Add drag handler
              markerRef.current.on('dragend', function (e) {
                const newPos = e.target.getLatLng();
                console.log(`Marker manually adjusted to: Lat ${newPos.lat}, Lng ${newPos.lng}`);
                onLocationSelect(newPos.lat, newPos.lng);
              });
            }

            // Add a large red circle to show this is very inaccurate
            L.circle([lat, lng], {
              radius: 5000, // 5km radius
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '10, 10'
            }).addTo(mapInstanceRef.current);
          }

          setModalConfig({
            show: true,
            type: "warning",
            message: `🚨 GPS UNAVAILABLE - Using approximate location based on your internet connection.\n\n⚠️ This is likely NOT your actual location!\n\nPlease set your exact location by:\n1. Dragging the marker to your property location\n2. Clicking on the map where your property is\n3. Pasting a Google Maps URL in the Location URL field`,
            onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
          });
        } else {
          throw new Error("All IP location services failed");
        }
      } catch (err) {
        console.error("IP fallback failed:", err);
        setModalConfig({
          show: true,
          type: "error",
          message: "Unable to detect your location automatically. Please pin your location manually by clicking on the map.",
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      } finally {
        setLoadingLocation(false);
      }
    };

    React.useEffect(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map centered on existing location or India
      const initialLat = latitude || 20.5937;
      const initialLng = longitude || 78.9629;
      const initialZoom = latitude && longitude ? 15 : 5;

      const map = L.map(mapRef.current).setView([initialLat, initialLng], initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add initial marker if coordinates exist
      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude], {
          draggable: true
        }).addTo(map);

        // Update coordinates when marker is dragged
        markerRef.current.on('dragend', function (e) {
          const newPos = e.target.getLatLng();
          console.log(`Marker dragged to: Lat ${newPos.lat}, Lng ${newPos.lng}`);
          onLocationSelect(newPos.lat, newPos.lng);
        });
      }

      // Add click handler to place/move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        console.log(`Map clicked at: Lat ${lat}, Lng ${lng}`);
        onLocationSelect(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            draggable: true
          }).addTo(map);

          // Add drag handler for newly created marker
          markerRef.current.on('dragend', function (e) {
            const newPos = e.target.getLatLng();
            console.log(`Marker dragged to: Lat ${newPos.lat}, Lng ${newPos.lng}`);
            onLocationSelect(newPos.lat, newPos.lng);
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

    // Update marker when props change
    React.useEffect(() => {
      if (mapInstanceRef.current && latitude && longitude) {
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], {
            draggable: true
          }).addTo(mapInstanceRef.current);

          // Add drag handler
          markerRef.current.on('dragend', function (e) {
            const newPos = e.target.getLatLng();
            console.log(`Marker dragged to: Lat ${newPos.lat}, Lng ${newPos.lng}`);
            onLocationSelect(newPos.lat, newPos.lng);
          });
        }

        // Center map on the updated location
        mapInstanceRef.current.setView([latitude, longitude], 15);
      }
    }, [latitude, longitude]);

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={getCurrentLocation}
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
              <FaMapMarkerAlt className="spin-slow" /> Getting Location...
            </motion.span>
          ) : (
            <>
              <FaMapMarkerAlt /> Use Current Location
            </>
          )}
        </motion.button>
      </div>
    );
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await fetchDepartments();
        const activeDepts = depts.filter(d => d.status === 'Active');

        const getIcon = (name) => {
          switch (name) {
            case 'Hotel': return <FaHotel />;
            case 'Cab': return <FaUserTie />;
            case 'Hospital': return <FaHeartbeat />;
            case 'Salon': return <FaCut />;
            default: return <FaHotel />;
          }
        };

        const getColor = (name) => {
          switch (name) {
            case 'Hotel': return "#007bff";
            case 'Cab': return "#28a745";
            case 'Hospital': return "#6f42c1";
            case 'Salon': return "#fd7e14";
            default: return "#6c757d";
          }
        };

        const mappedDepts = activeDepts.map(d => ({
          name: d.name,
          icon: getIcon(d.name),
          color: getColor(d.name)
        }));
        setDepartments(mappedDepts);
      } catch (error) {
        console.error("Error loading departments:", error);
      }
    };
    loadDepartments();
  }, []);

  const predefinedFeatures = {
    Salon: ['Haircuts', 'Manicure & Pedicure', 'Facials', 'Massages', 'Hair Coloring', 'Waxing', 'Makeup', 'Spa Treatment'],
    Hospital: ['General Physicians', 'Dermatologists', 'Cardiologists', 'Pediatricians', 'Orthopedics', 'Neurology', 'Emergency Care', 'Lab Services'],
    Hotel: ['AC Rooms', 'Non-AC Rooms', '2-Bedroom Suites', 'Food Services', 'WiFi', 'Swimming Pool', 'Gym', 'Parking', 'Room Service'],
    Cab: ['Economy Cabs', 'Premium Sedans', 'XL Vehicles', 'Luxury Cars', 'Airport Transfer', 'Hourly Rental', 'Outstation', 'Distance-based Pricing']
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSelectedFeatures([]);
    setCustomFeature("");
  };

  useEffect(() => {
    if (selectedDepartment) {
      loadDescriptionTemplates(selectedDepartment);
    }
  }, [selectedDepartment]);

  const loadDescriptionTemplates = async (dept) => {
    try {
      const settings = await fetchSystemSettings(dept);
      
      // Filter, Sort by key, then Map to values
      const templates = settings
        .filter(s => s.settingKey && s.settingKey.startsWith(`${dept}_desc_`) && s.settingValue)
        .sort((a,b) => a.settingKey.localeCompare(b.settingKey))
        .map(s => s.settingValue);

      setDescriptionTemplates(templates);
      
      // Determine mode based on whether current description matches a template
      // We need to check the property state, but be careful of closure staleness.
      // Ideally we check editingProperty or the current property state. 
      // Since this runs on dept change, usually property.description is reset or relevant to that dept?
      // If editing, we want to preserve the mode.
      
      const currentDesc = property.description;
      const isMatch = templates.includes(currentDesc);
      
      if (currentDesc && !isMatch) {
         setDescriptionMode("custom");
      } else if (templates.length > 0) {
         setDescriptionMode("default");
      } else {
         setDescriptionMode("custom");
      }
    } catch (err) {
      console.error("Failed to load templates", err);
      setDescriptionTemplates([]);
      setDescriptionMode("custom");
    }
  };

  // Function to extract coordinates from various map URL formats
  const extractCoordinatesFromUrl = (url) => {
    try {
      // Google Maps formats:
      // https://maps.google.com/?q=13.0256,80.2075
      // https://www.google.com/maps/place/13.0256,80.2075
      // https://www.google.com/maps/@13.0256,80.2075,15z
      // https://maps.app.goo.gl/... (shortened URLs - these need to be resolved)

      // Pattern 1: ?q=lat,lng or /place/lat,lng
      let match = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }

      match = url.match(/\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }

      // Pattern 2: @lat,lng,zoom
      match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }

      // Pattern 3: ll=lat,lng (OpenStreetMap and others)
      match = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }

      // Pattern 4: lat=...&lon=... or lat=...&lng=...
      const latMatch = url.match(/[?&]lat=(-?\d+\.?\d*)/);
      const lngMatch = url.match(/[?&](?:lon|lng)=(-?\d+\.?\d*)/);
      if (latMatch && lngMatch) {
        return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
      }

      // Pattern 5: OpenStreetMap format: #map=zoom/lat/lng
      match = url.match(/#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }

      // Pattern 6: Google Maps Probobuf/Data format: !3dlat!4dlng (Common in 'Place' URLs)
      // Example: .../data=!3m1... !3d13.0827!4d80.2707
      match = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }

      return null;
    } catch (error) {
      console.error("Error extracting coordinates from URL:", error);
      return null;
    }
  };


  const processLocationUrl = async (url) => {
    setUrlResolutionError(null);
    let coords = extractCoordinatesFromUrl(url); // Try direct extraction first

    if (coords) {
      setProperty(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
      return;
    }

    // Check if it's a short URL or needs resolution
    if (url && (url.includes('goo.gl') || url.includes('bit.ly') || url.includes('maps.app.goo.gl'))) {
      setIsResolvingUrl(true);
      try {
        const data = await resolveMapUrl(url);
        if (data.data && data.data.resolvedUrl) {
          const resolvedUrl = data.data.resolvedUrl;
          coords = extractCoordinatesFromUrl(resolvedUrl);
          if (coords) {
            setProperty(prev => ({
              ...prev,
              latitude: coords.lat,
              longitude: coords.lng
            }));
          } else {
            setUrlResolutionError("Could not extract coordinates from resolved URL");
          }
        }
      } catch (err) {
        console.error(err);
        setUrlResolutionError("Failed to resolve URL");
      } finally {
        setIsResolvingUrl(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'locationUrl') {
      setProperty({ ...property, [name]: value });
      // Debounce could be added here, but for now direct call on sufficient length is fine
      if (value && value.length > 8) {
        processLocationUrl(value);
      }
      return;
    }

    setProperty({ ...property, [name]: value });
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures(prev => [...prev, customFeature.trim()]);
      setCustomFeature("");
    }
  };

  const removeFeature = (feature) => {
    setSelectedFeatures(prev => prev.filter(f => f !== feature));
  };

  const handleAddSpecialist = () => {
    if (newSpecialist.name && newSpecialist.rating && newSpecialist.imageUrl) {
        setSpecialists(prev => [...prev, { ...newSpecialist, tempId: Date.now() }]); // Add tempId for local key
        setNewSpecialist({ name: "", rating: "", imageUrl: "" });
        setShowSpecialistForm(false);
    } else {
        alert("Please fill all specialist fields");
    }
  };

  const handleRemoveSpecialist = async (id, tempId) => {
    if (id) {
        try {
            await deleteSpecialist(id);
            setSpecialists(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            alert("Failed to delete specialist");
        }
    } else {
        setSpecialists(prev => prev.filter(s => s.tempId !== tempId));
    }
  };

  const handleAddService = () => {
    if (newService.name && newService.price && newService.imageUrl) {
        setServices(prev => [...prev, { ...newService, tempId: Date.now() }]);
        setNewService({ name: "", description: "", price: "", imageUrl: "" });
        setShowServiceForm(false);
    } else {
        alert("Please fill name, price and image URL");
    }
  };

  const handleRemoveService = async (id, tempId) => {
    if (id) {
        try {
            await deleteOfferedService(id);
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            alert("Failed to delete service");
        }
    } else {
        setServices(prev => prev.filter(s => s.tempId !== tempId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    const loginData = localStorage.getItem("hostLoginData");
    let hostId = null;
    if (loginData) {
      const parsedLoginData = JSON.parse(loginData);
      hostId = parsedLoginData.hostId;
    }

    if (!hostId) {
      setModalConfig({
        show: true,
        type: "error",
        message: "Please log in as a host first.",
        onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
      });
      return;
    }

    const finalFeatures = selectedDepartment === 'Cab'
      ? JSON.stringify({
        list: selectedFeatures,
        cabRates: {
          economy: property.price_economy || property.price,
          premium: property.price_premium,
          xl: property.price_xl
        }
      })
      : JSON.stringify(selectedFeatures);

    const propertyData = {
      ...property,
      hostId: hostId,
      features: finalFeatures,
      images: imageUrls.length > 0 ? imageUrls : [property.imageUrl] // Include multiple images
    };

    try {
      // Show loading modal
      setModalConfig({
        show: true,
        type: "loading",
        message: editingProperty
          ? "Updating property..."
          : "Adding property to " + selectedDepartment + "...",
        onConfirm: null
      });

      let propertyId;
      if (editingProperty) {
        // Update existing property
        const response = await updateProperty(selectedDepartment, editingProperty.id, propertyData);
        propertyId = editingProperty.id;
      } else {
        // Create new property
        const response = await createProperty(selectedDepartment, propertyData);
        // Response data from PropertyService.createProperty contains 'propertyId'
        propertyId = response.data.propertyId;
      }

      console.log("Property ID for adding specialists:", propertyId);
      if (!propertyId) {
          console.error("Failed to get property ID from response:", response);
          alert("Error: Property created but ID missing. Cannot add specialists.");
      }

      // Process Specialists
      if (propertyId) {
        for (const specialist of specialists) {
            if (!specialist.id) { // Only add new ones (no ID from backend yet)
                await addSpecialist({
                    propertyId: propertyId,
                    name: specialist.name,
                    rating: parseFloat(specialist.rating),
                    imageUrl: specialist.imageUrl
                });
            }
        }
        
        // Process Offered Services
        for (const service of services) {
            if (!service.id) { // Only add new ones
                await addOfferedService({
                    propertyId: propertyId,
                    name: service.name,
                    description: service.description,
                    price: parseFloat(service.price),
                    imageUrl: service.imageUrl
                });
            }
        }
      }

      // Just close the loading modal and call onSubmit to let parent handle the success logic
      setModalConfig(prev => ({ ...prev, show: false }));
      if (onSubmit) {
        onSubmit(propertyData);
      }

    } catch (error) {
      console.error(editingProperty ? "Error updating property:" : "Error creating property:", error);

      const errorMessage = error.message || error.details || "";

      if (errorMessage.includes("Property limit reached")) {
        setModalConfig({
          show: true,
          type: "warning", // Use warning type for a softer look or add a custom type if StatusModal supports it. 
          // StatusModal usually supports success, error, confirm. Let's stick to 'confirm' but with custom text if possible, 
          // or just standard error but we want custom buttons. 
          // Since StatusModal might be limited, let's see if we can pass a custom render or if we need to modify StatusModal.
          // Looking at standard StatusModal usage, it takes onConfirm. 
          // Let's use 'confirm' type to get two buttons? 
          // But 'confirm' usually has "Yes/No". 
          // If StatusModal is simple, I might need to make a custom modal here or assume 'confirm' can be adapted.
          // Let's assume for now I can't easily change StatusModal text without viewing it.
          // Wait, the user wants "Upgrade Now" and "Maybe Later". 
          // I should check StatusModal first? No, I'll just use a standard Modal for this specific case 
          // OR I can use the existing StatusModal IF I can customize button text.
          // Let's assume I can't and just render a specific Modal for this in the JSX, 
          // OR better: reuse the StatusModal state but handling the type 'upgrade' specially in the render?
          // No, simpler to just add a separate Modal block for this specific upgrade prompt 
          // OR modify the local modalConfig to support a 'custom' type and render it in the returned JSX.

          // Let's stick to the existing modalConfig but add a specific type 'upgrade_limit'.
          type: "upgrade_limit",
          message: errorMessage,
          onConfirm: () => navigate("/host/subscription-plans")
        });
      } else {
        setModalConfig({
          show: true,
          type: "error",
          message: errorMessage || (editingProperty
            ? "Failed to update property. Please try again."
            : "Failed to create property. Please try again."),
          onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
        });
      }
    }
  };

  return (
    <div className="p-4">
      {/* Department Selection */}
      <div className="mb-4">
        <h5 className="font-weight-bold mb-3 d-flex align-items-center gap-2">
          <div className="icon-box-sm bg-success-light text-success rounded-circle">
            <FaPlus size={12} />
          </div>
          Select Business Department
        </h5>
        <div className="department-selection-grid">
          {departments.map((dept) => (
            <motion.div
              key={dept.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`dept-card-modern ${selectedDepartment === dept.name ? "selected" : ""}`}
              onClick={() => handleDepartmentSelect(dept.name)}
            >
              <div
                className="dept-icon-wrapper"
                style={{
                  backgroundColor: selectedDepartment === dept.name ? 'transparent' : `${dept.color}15`,
                  color: dept.color
                }}
              >
                {dept.icon}
              </div>
              <h6>{dept.name}</h6>
              {selectedDepartment === dept.name && (
                <motion.div
                  layoutId="selected-dept-indicator"
                  className="position-absolute top-0 end-0 p-2"
                >
                  <FaCheckCircle className="text-success" size={14} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Property Form */}
      {selectedDepartment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-form-container"
        >
          <Form onSubmit={handleSubmit}>
            <div className="form-row-modern">
              {/* Company Name */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">Company Name</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaBuilding /></div>
                  <Form.Control
                    type="text"
                    name="company"
                    value={property.company}
                    onChange={handleChange}
                    placeholder="e.g. GreenHeap Salon"
                    className="modern-input"
                    required
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">Owner Name</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaUser /></div>
                  <Form.Control
                    type="text"
                    name="owner"
                    value={property.owner}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="modern-input"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">Phone Number</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaPhone /></div>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={property.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="modern-input"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">Email Address</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaEnvelope /></div>
                  <Form.Control
                    type="email"
                    name="email"
                    value={property.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="modern-input"
                    required
                  />
                </div>
              </div>
            </div>

            <Row>
              <Col md={6}>
                <div className="modern-input-group">
                  <label className="modern-label text-truncate">Business Address 1</label>
                  <div className="modern-input-wrapper">
                    <div className="input-icon-left"><FaMapMarkerAlt /></div>
                    <Form.Control
                      type="text"
                      name="location"
                      value={property.location}
                      onChange={handleChange}
                      placeholder="Enter business address line 1"
                      className="modern-input"
                      required
                    />
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="modern-input-group">
                  <label className="modern-label text-truncate">Business Address 2</label>
                  <div className="modern-input-wrapper">
                    <div className="input-icon-left"><FaMapMarkerAlt /></div>
                    <Form.Control
                      type="text"
                      name="location2"
                      value={property.location2}
                      onChange={handleChange}
                      placeholder="Enter business address line 2 (optional)"
                      className="modern-input"
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <Col md={12} className="mb-4">
              <label className="modern-label mb-2 d-flex align-items-center gap-2">
                <FaSearchLocation className="text-primary" /> Pin Location on Map
              </label>
              <div className="shadow-sm overflow-hidden" style={{ height: '300px', width: '100%', borderRadius: '1.25rem', border: '2px solid #f1f5f9' }}>
                <LocationPicker
                  latitude={property.latitude}
                  longitude={property.longitude}
                  onLocationSelect={(lat, lng) => {
                    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                    setProperty(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      locationUrl: googleMapsUrl
                    }));
                  }}
                />
              </div>
            </Col>

            <div className="form-row-modern">
              {/* Location URL */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">Location URL (Auto-Sync)</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaLink /></div>
                  <Form.Control
                    type="url"
                    name="locationUrl"
                    value={property.locationUrl}
                    onChange={handleChange}
                    placeholder="Paste Google Maps URL"
                    className="modern-input"
                  />
                </div>
                {isResolvingUrl && <small className="text-info mt-1 d-block">Resolving URL...</small>}
              </div>

              {/* Manual Coordinate Input */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">
                  Latitude (Manual Input)
                  <small className="text-muted ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    Optional - Enter exact coordinates
                  </small>
                </label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left">📍</div>
                  <Form.Control
                    type="number"
                    step="any"
                    name="latitude"
                    value={property.latitude || ''}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                        setProperty(prev => ({ ...prev, latitude: lat }));
                        if (property.longitude) {
                          const googleMapsUrl = `https://www.google.com/maps?q=${lat},${property.longitude}`;
                          setProperty(prev => ({ ...prev, locationUrl: googleMapsUrl }));
                        }
                      } else if (e.target.value === '') {
                        setProperty(prev => ({ ...prev, latitude: null }));
                      }
                    }}
                    placeholder="e.g. 13.0827"
                    className="modern-input"
                  />
                </div>
                <small className="text-muted mt-1 d-block" style={{ fontSize: '0.7rem' }}>
                  Range: -90 to 90 (e.g., 13.0827 for Chennai)
                </small>
              </div>

              <div className="modern-input-group">
                <label className="modern-label text-truncate">
                  Longitude (Manual Input)
                  <small className="text-muted ms-2" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                    Optional - Enter exact coordinates
                  </small>
                </label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left">📍</div>
                  <Form.Control
                    type="number"
                    step="any"
                    name="longitude"
                    value={property.longitude || ''}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                        setProperty(prev => ({ ...prev, longitude: lng }));
                        if (property.latitude) {
                          const googleMapsUrl = `https://www.google.com/maps?q=${property.latitude},${lng}`;
                          setProperty(prev => ({ ...prev, locationUrl: googleMapsUrl }));
                        }
                      } else if (e.target.value === '') {
                        setProperty(prev => ({ ...prev, longitude: null }));
                      }
                    }}
                    placeholder="e.g. 80.2707"
                    className="modern-input"
                  />
                </div>
                <small className="text-muted mt-1 d-block" style={{ fontSize: '0.7rem' }}>
                  Range: -180 to 180 (e.g., 80.2707 for Chennai)
                </small>
              </div>


              {/* GST Number */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">GST Number</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaTag /></div>
                  <Form.Control
                    type="text"
                    name="gstNumber"
                    value={property.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                    className="modern-input"
                    required
                  />
                </div>
              </div>

              {/* Price Section */}
              {selectedDepartment === 'Cab' ? (
                <>
                  <div className="modern-input-group">
                    <label className="modern-label text-truncate">Economy Price per KM</label>
                    <div className="modern-input-wrapper">
                      <div className="input-icon-left"><FaRupeeSign /></div>
                      <Form.Control
                        type="number"
                        name="price_economy"
                        value={property.price_economy || property.price || ""}
                        onChange={(e) => setProperty({ ...property, price_economy: e.target.value, price: e.target.value })}
                        placeholder="e.g. 12"
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="modern-input-group">
                    <label className="modern-label text-truncate">Premium Price per KM</label>
                    <div className="modern-input-wrapper">
                      <div className="input-icon-left"><FaRupeeSign /></div>
                      <Form.Control
                        type="number"
                        name="price_premium"
                        value={property.price_premium || ""}
                        onChange={(e) => setProperty({ ...property, price_premium: e.target.value })}
                        placeholder="e.g. 20"
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="modern-input-group">
                    <label className="modern-label text-truncate">XL Price per KM</label>
                    <div className="modern-input-wrapper">
                      <div className="input-icon-left"><FaRupeeSign /></div>
                      <Form.Control
                        type="number"
                        name="price_xl"
                        value={property.price_xl || ""}
                        onChange={(e) => setProperty({ ...property, price_xl: e.target.value })}
                        placeholder="e.g. 25"
                        className="modern-input"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="modern-input-group">
                  <label className="modern-label text-truncate">Starting Price</label>
                  <div className="modern-input-wrapper">
                    <div className="input-icon-left"><FaRupeeSign /></div>
                    <Form.Control
                      type="number"
                      name="price"
                      value={property.price}
                      onChange={handleChange}
                      placeholder="Enter base price"
                      className="modern-input"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="modern-input-group">
                <label className="modern-label text-truncate">Initial Rating</label>
                <div className="modern-input-wrapper">
                  <div className="input-icon-left"><FaStar className="text-warning" /></div>
                  <Form.Control
                    type="number"
                    name="rating"
                    value={property.rating}
                    onChange={handleChange}
                    placeholder="Rating (1-5)"
                    min="1"
                    max="5"
                    className="modern-input"
                    required
                  />
                </div>
              </div>
            </div>

            <Row>
              <Col md={6}>
                <div className="modern-input-group">
                  <label className="modern-label text-truncate">Amenities / Services</label>
                  <div className="modern-input-wrapper">
                    <div className="input-icon-left"><FaList /></div>
                    <Form.Control
                      type="text"
                      name="amenities"
                      value={property.amenities}
                      onChange={handleChange}
                      placeholder="e.g. Wifi, AC, Parking"
                      className="modern-input"
                      required
                    />
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="modern-input-group">
                  <label className="modern-label text-truncate">Featured Image URL</label>
                  <div className="modern-input-wrapper">
                    <div className="input-icon-left"><FaImage /></div>
                    <Form.Control
                      type="url"
                      name="imageUrl"
                      value={property.imageUrl}
                      onChange={handleChange}
                      placeholder="Enter image URL"
                      className="modern-input"
                      required
                    />
                  </div>
                </div>
              </Col>
            </Row>

            {/* Multiple Images Upload Section */}
            <div className="mb-4">
              <label className="modern-label d-flex align-items-center gap-2">
                <FaImage className="text-success" /> Additional Property Images
              </label>
              <div className="modern-input-wrapper mb-3">
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  className="modern-input pt-2"
                  style={{ paddingLeft: '1rem !important' }}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (files.length === 0) return;
                    try {
                      const formData = new FormData();
                      files.forEach(file => formData.append('files', file));
                      const response = await fetch('http://localhost:5000/api/upload/images', {
                        method: 'POST',
                        body: formData
                      });
                      const result = await response.json();
                      if (result.success) setImageUrls(result.imageUrls);
                      else alert('Failed to upload images: ' + result.message);
                    } catch (error) {
                      console.error('Error uploading images:', error);
                      alert('Failed to upload images. Please try again.');
                    }
                  }}
                />
              </div>

              {/* Image Preview Grid */}
              {imageUrls.length > 0 && (
                <div className="p-3 bg-light rounded-xl mb-3">
                  <h6 className="small font-weight-bold mb-3">Preview Gallery ({imageUrls.length})</h6>
                  <Row className="g-3">
                    {imageUrls.map((url, index) => (
                      <Col xs={6} md={3} key={index}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="modern-card shadow-sm border-0"
                          style={{ aspectRatio: '1/1', overflow: 'hidden' }}
                        >
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1 rounded-circle"
                            style={{ width: '24px', height: '24px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                          >
                            ×
                          </Button>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>

            {/* Description Section with Template Support */}
            <div className="mb-4 p-4 modern-card bg-light border-0">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="modern-label m-0">Property Description</label>
                {descriptionTemplates.length > 0 && (
                  <div className="d-flex bg-light rounded-pill p-1 border">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 ${descriptionMode === 'default' ? 'btn-modern btn-primary-modern shadow-sm' : 'btn-light text-muted'}`}
                      onClick={() => setDescriptionMode('default')}
                      style={{ transition: 'all 0.2s', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Default Templates
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 ${descriptionMode === 'custom' ? 'btn-modern btn-primary-modern shadow-sm' : 'btn-light text-muted'}`}
                      onClick={() => setDescriptionMode('custom')}
                      style={{ transition: 'all 0.2s', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      Custom Description
                    </button>
                  </div>
                )}
              </div>

              {descriptionMode === 'default' && descriptionTemplates.length > 0 ? (
                <div className="template-selection-container">
                  <p className="small text-muted mb-2">Select a professionally written description for your property:</p>
                  <Row className="g-3">
                    {descriptionTemplates.map((desc, idx) => (
                      <Col xs={12} key={idx}>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`p-3 border rounded-lg cursor-pointer ${property.description === desc ? 'bg-emerald-light border-emerald ring-2' : 'bg-white hover-shadow'}`}
                          style={{ 
                            borderWidth: property.description === desc ? '2px' : '1px',
                            borderColor: property.description === desc ? '#10b981' : '#e2e8f0',
                            backgroundColor: property.description === desc ? '#ecfdf5' : 'white',
                            cursor: 'pointer'
                          }}
                          onClick={() => setProperty(prev => ({ ...prev, description: desc }))}
                        >
                          <div className="d-flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className={`rounded-circle d-flex align-items-center justify-content-center ${property.description === desc ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '24px', height: '24px' }}>
                                {property.description === desc ? <FaCheckCircle size={14} /> : <span style={{fontSize: '12px'}}>{idx + 1}</span>}
                              </div>
                            </div>
                            <div>
                              <p className="mb-0 small text-dark" style={{ lineHeight: '1.5' }}>{desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                  {/* Optional: Allow editing the selected template? For now, if they want to edit, they switch to Custom */}
                  {property.description && (
                    <div className="mt-2 text-end">
                      <button 
                        type="button" 
                        className="btn btn-link text-success p-0 small"
                        onClick={() => setDescriptionMode('custom')}
                      >
                        Edit selected description
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={property.description}
                  onChange={handleChange}
                  placeholder="Tell guests about your property..."
                  className="modern-input"
                  style={{ paddingLeft: '1.25rem !important', minHeight: '120px' }}
                  required
                />
              )}
            </div>

            {/* Features Selection */}
            <div className="mb-4 p-4 modern-card bg-light border-0">
              <label className="modern-label mb-3 d-flex align-items-center gap-2">
                <FaCheckCircle className="text-success" /> Features & Amenities
              </label>

              <div className="mb-4">
                <h6 className="small font-weight-bold text-muted mb-3 uppercase letter-spacing-1">Predefined Options</h6>
                <div className="d-flex flex-wrap gap-2">
                  {predefinedFeatures[selectedDepartment]?.map((feature, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`btn-modern py-2 px-3 border-0 ${selectedFeatures.includes(feature) ? 'btn-primary-modern' : 'bg-white text-muted'}`}
                      onClick={() => toggleFeature(feature)}
                    >
                      {selectedFeatures.includes(feature) && <FaCheckCircle className="me-1" />}
                      {feature}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom Feature */}
              <div className="modern-input-group mb-0">
                <h6 className="small font-weight-bold text-muted mb-2 uppercase letter-spacing-1">Add Custom Service</h6>
                <Row className="g-2">
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 24/7 Security"
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      className="modern-input"
                      style={{ paddingLeft: '1.25rem !important' }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button variant="success" className="btn-modern btn-primary-modern h-100 px-4" onClick={addCustomFeature} disabled={!customFeature.trim()}>
                      Add
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Display Added Custom Services */}
              {selectedFeatures.filter(f => !predefinedFeatures[selectedDepartment]?.includes(f)).length > 0 && (
                <div className="mt-3">
                  <h6 className="small font-weight-bold text-muted mb-2 uppercase letter-spacing-1">Added Custom Services</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedFeatures
                      .filter(f => !predefinedFeatures[selectedDepartment]?.includes(f))
                      .map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="btn-modern btn-primary-modern py-2 px-3 d-flex align-items-center gap-2"
                        >
                          <FaCheckCircle />
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(feature)}
                            className="btn btn-sm p-0 ms-1 text-white border-0 bg-transparent"
                            style={{ fontSize: '0.9rem', lineHeight: 1 }}
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specialist / Team Section */}
            <div className="mb-4 p-4 modern-card bg-light border-0">
               <div className="d-flex justify-content-between align-items-center mb-3">
                 <label className="modern-label m-0 d-flex align-items-center gap-2">
                   <FaUserTie className="text-primary" /> Meet the Team / Specialists
                 </label>
                 <Button 
                   variant="outline-primary" 
                   size="sm" 
                   onClick={() => setShowSpecialistForm(!showSpecialistForm)}
                   className="rounded-pill d-flex align-items-center gap-1"
                 >
                   {showSpecialistForm ? 'Cancel' : <><FaPlus size={12}/> Add Specialist</>}
                 </Button>
               </div>

               {showSpecialistForm && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }}
                   className="p-3 bg-white rounded-3 shadow-sm mb-3 border"
                 >
                   <Row className="g-3">
                     <Col md={4}>
                       <Form.Control 
                         placeholder="Specialist Name"
                         value={newSpecialist.name}
                         onChange={(e) => setNewSpecialist({...newSpecialist, name: e.target.value})}
                         className="modern-input"
                       />
                     </Col>
                     <Col md={3}>
                       <Form.Control 
                         type="number"
                         placeholder="Rating (0.0 - 5.0)"
                         min="0"
                         max="5"
                         step="0.1"
                         value={newSpecialist.rating}
                         onChange={(e) => setNewSpecialist({...newSpecialist, rating: e.target.value})}
                         className="modern-input"
                       />
                     </Col>
                     <Col md={5}>
                       <div className="d-flex gap-2">
                           <Form.Control 
                             placeholder="Photo URL (https://...)"
                             value={newSpecialist.imageUrl}
                             onChange={(e) => setNewSpecialist({...newSpecialist, imageUrl: e.target.value})}
                             className="modern-input"
                           />
                           <Button variant="success" onClick={handleAddSpecialist}>Add</Button>
                       </div>
                     </Col>
                   </Row>
                 </motion.div>
               )}

               {/* Specialist List */}
               {specialists.length > 0 ? (
                 <div className="d-flex flex-wrap gap-3">
                   {specialists.map((spec, idx) => (
                     <div key={spec.id || spec.tempId} className="bg-white p-2 rounded-3 shadow-sm border d-flex align-items-center gap-3 pe-4" style={{minWidth: '200px'}}>
                        <img 
                          src={spec.imageUrl} 
                          alt={spec.name} 
                          className="rounded-circle object-fit-cover"
                          style={{width: '40px', height: '40px'}}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                        />
                         <div>
                            <div className="fw-bold text-dark small">{spec.name}</div>
                            <div className="d-flex align-items-center gap-1 text-warning smallest">
                               <FaStar size={10}/> {spec.rating}
                            </div>
                         </div>
                         <button 
                           type="button" 
                           onClick={() => handleRemoveSpecialist(spec.id, spec.tempId)}
                           className="ms-auto btn-link text-danger p-0 border-0 bg-transparent"
                         >
                            <FaTrash size={12}/>
                         </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted smaller italic">No specialists added yet.</p>
                )}
            </div>

            {/* Offered Services Section */}
            <div className="mb-4 p-4 modern-card bg-light border-0">
               <div className="d-flex justify-content-between align-items-center mb-3">
                 <label className="modern-label m-0 d-flex align-items-center gap-2">
                   <FaList size={16} className="text-success" /> Offered Services
                 </label>
                 <Button 
                   variant="outline-success" 
                   size="sm" 
                   onClick={() => setShowServiceForm(!showServiceForm)}
                   className="rounded-pill d-flex align-items-center gap-1"
                 >
                   {showServiceForm ? 'Cancel' : <><FaPlus size={12}/> Add Service</>}
                 </Button>
               </div>

               {showServiceForm && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }}
                   className="p-3 bg-white rounded-3 shadow-sm mb-3 border"
                 >
                   <Row className="g-3">
                     <Col md={4}>
                       <Form.Control 
                         placeholder="Service Name"
                         value={newService.name}
                         onChange={(e) => setNewService({...newService, name: e.target.value})}
                         className="modern-input"
                       />
                     </Col>
                     <Col md={3}>
                       <Form.Control 
                         type="number"
                         placeholder="Price"
                         value={newService.price}
                         onChange={(e) => setNewService({...newService, price: e.target.value})}
                         className="modern-input"
                       />
                     </Col>
                     <Col md={5}>
                        <Form.Control 
                            placeholder="Photo URL"
                            value={newService.imageUrl}
                            onChange={(e) => setNewService({...newService, imageUrl: e.target.value})}
                            className="modern-input"
                        />
                     </Col>
                     <Col md={12}>
                        <div className="d-flex gap-2">
                            <Form.Control 
                              as="textarea"
                              rows={1}
                              placeholder="Short Description"
                              value={newService.description}
                              onChange={(e) => setNewService({...newService, description: e.target.value})}
                              className="modern-input"
                            />
                            <Button variant="success" onClick={handleAddService}>Add</Button>
                        </div>
                     </Col>
                   </Row>
                 </motion.div>
               )}

               {/* Service List */}
               {services.length > 0 ? (
                 <div className="d-flex flex-wrap gap-3">
                   {services.map((svc, idx) => (
                     <div key={svc.id || svc.tempId} className="bg-white p-2 rounded-3 shadow-sm border d-flex align-items-center gap-3 pe-4" style={{minWidth: '240px'}}>
                        <img 
                          src={svc.imageUrl} 
                          alt={svc.name} 
                          className="rounded-circle object-fit-cover"
                          style={{width: '40px', height: '40px'}}
                          onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                        />
                        <div>
                           <div className="fw-bold text-dark small">{svc.name}</div>
                           <div className="text-success smallest fw-bold">₹{svc.price}</div>
                        </div>
                        <button 
                           type="button" 
                           onClick={() => handleRemoveService(svc.id, svc.tempId)}
                           className="ms-auto btn-link text-danger p-0 border-0 bg-transparent"
                         >
                            <FaTrash size={12}/>
                         </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted smaller italic">No services added yet.</p>
                )}
            </div>

            <div className="mt-5 d-flex justify-content-end gap-3 pt-4 border-top">
              <Button variant="light" className="btn-modern px-4" onClick={() => onSubmit && onSubmit(null)}>Cancel</Button>
              <Button type="submit" variant="success" className="btn-modern btn-primary-modern px-5">
                {editingProperty ? 'Update Property' : 'Submit Property'}
              </Button>
            </div>
          </Form>
        </motion.div>
      )}
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

export default HostCreateProperty;
