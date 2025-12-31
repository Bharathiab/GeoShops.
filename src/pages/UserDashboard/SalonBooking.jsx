import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCut, FaMapMarkerAlt, FaStar, FaCheck, FaEye, FaSearch, FaUserTie } from 'react-icons/fa';
import UserNavbar from '../../components/user/UserNavbar';
import MapView from '../../components/user/MapView';
import { fetchProperties, createBooking, validateCoupon, fetchSpecialistsByProperty } from '../../api';
import { parseFeatures } from '../../utils';
import Toast from '../../utils/toast';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';
import './DepartmentBooking.css';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/PremiumHeader.css';

const SalonBooking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [salons, setSalons] = useState([]);
    const [selectedSalon, setSelectedSalon] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Specialist State
    const [specialists, setSpecialists] = useState([]);
    const [selectedSpecialist, setSelectedSpecialist] = useState(null);

    // Booking form fields
    const [selectedServices, setSelectedServices] = useState([]);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [description, setDescription] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [requestMembership, setRequestMembership] = useState(false);

    const salonServices = [
        {
            name: 'Haircut',
            icon: '✂️',
            price: 300,
            duration: '30 min',
            description: 'Professional hair styling',
            color: '#667eea'
        },
        {
            name: 'Hair Coloring',
            icon: '🎨',
            price: 1500,
            duration: '90 min',
            description: 'Premium hair coloring',
            color: '#f093fb'
        },
        {
            name: 'Manicure',
            icon: '💅',
            price: 400,
            duration: '45 min',
            description: 'Hand care & nail art',
            color: '#fa709a'
        },
        {
            name: 'Pedicure',
            icon: '🦶',
            price: 500,
            duration: '60 min',
            description: 'Foot care & relaxation',
            color: '#fee140'
        },
        {
            name: 'Facial',
            icon: '🧖',
            price: 800,
            duration: '60 min',
            description: 'Deep cleansing facial',
            color: '#4facfe'
        },
        {
            name: 'Massage',
            icon: '💆',
            price: 1000,
            duration: '60 min',
            description: 'Relaxing body massage',
            color: '#43e97b'
        },
        {
            name: 'Waxing',
            icon: '✨',
            price: 600,
            duration: '45 min',
            description: 'Full body waxing',
            color: '#a8edea'
        },
        {
            name: 'Makeup',
            icon: '💄',
            price: 2000,
            duration: '90 min',
            description: 'Professional makeup',
            color: '#f5576c'
        }
    ];

    useEffect(() => {
        loadSalons();
    }, []);

    // Handle incoming navigation state (e.g. from PropertyDetailsModal)
    useEffect(() => {
        if (location.state && location.state.selectedSpecialist && location.state.property) {
            const { selectedSpecialist, property } = location.state;
            setSelectedSalon(property);
            setSelectedSpecialist(selectedSpecialist);
            setShowBookingModal(true);
            // Clear state to avoid reopening on refresh (optional, but good practice)
            // window.history.replaceState({}, document.title); 
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedSalon) {
            loadSpecialists(selectedSalon.id);
            // Reset specialist selection if the new salon doesn't match the one we navigated with
            if (location.state?.property?.id !== selectedSalon.id) {
                 setSelectedSpecialist(null);
            }
        }
    }, [selectedSalon]);

    const loadSpecialists = async (propertyId) => {
        try {
            const data = await fetchSpecialistsByProperty(propertyId);
            setSpecialists(data);
        } catch (error) {
            console.error("Failed to load specialists", error);
        }
    };



    useEffect(() => {
        calculateTotalPrice();
    }, [selectedServices]);

    useEffect(() => {
        calculateFinalPrice();
    }, [totalPrice, appliedCoupon]);

    const loadSalons = async () => {
        try {
            const data = await fetchProperties('Salon');
            const activeSalons = data.filter(s => s.status !== 'Inactive');
            setSalons(activeSalons);
        } catch (error) {
            console.error('Error loading salons:', error);
        }
    };

    const calculateTotalPrice = () => {
        const total = selectedServices.reduce((sum, serviceName) => {
            const service = salonServices.find(s => s.name === serviceName);
            return sum + (service?.price || 0);
        }, 0);
        setTotalPrice(total);
    };

    const toggleService = (serviceName) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceName)) {
                return prev.filter(s => s !== serviceName);
            } else {
                return [...prev, serviceName];
            }
        });
    };

    const calculateFinalPrice = () => {
        if (!appliedCoupon) {
            setDiscountAmount(0);
            setFinalPrice(totalPrice);
            return;
        }

        let discount = 0;
        if (appliedCoupon.discount_type === 'Percentage') {
            discount = (totalPrice * appliedCoupon.discount_value) / 100;
        } else {
            discount = appliedCoupon.discount_value;
        }

        setDiscountAmount(discount);
        setFinalPrice(Math.max(0, totalPrice - discount));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            Toast.warning('Please enter a coupon code');
            return;
        }

        try {
            const userLoginData = JSON.parse(localStorage.getItem('userLoginData') || '{}');
            const result = await validateCoupon(couponCode, userLoginData.userId, selectedSalon?.id);
            if (result.valid) {
                // Create coupon object from the returned data
                const couponData = {
                    code: couponCode,
                    discount_type: result.discountType,
                    discount_value: result.discountValue
                };
                setAppliedCoupon(couponData);
                Toast.success(`Coupon applied! You get ${result.discountType === 'Percentage' ? result.discountValue + '%' : '₹' + result.discountValue} off`);
            } else {
                Toast.error(result.message || 'Invalid coupon code');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            Toast.error('Failed to validate coupon. Please try again.');
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const filteredSalons = salons.filter(salon => {
        const matchesSearch = salon.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            salon.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleBookService = (salon) => {
        navigate(`/user/booking/Salon/${salon.id}`);
    };

    const handleConfirmBooking = async () => {
        // Redirection logic removed as it's now handled by the full-page booking component.
    };

    const resetForm = () => {
        // Form state reset logic removed.
    };

    const getTotalDuration = () => {
        return selectedServices.reduce((total, serviceName) => {
            const service = salonServices.find(s => s.name === serviceName);
            const minutes = parseInt(service?.duration) || 0;
            return total + minutes;
        }, 0);
    };

    return (
        <div style={{ background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)", minHeight: "100vh" }}>
            <UserNavbar selectedDepartment="Salon" onDepartmentChange={(dept) => { if (dept === 'Home') navigate('/user'); }} />

            {/* HERO SECTION - Standardized Premium Style */}
            <div className="membership-header-premium position-relative overflow-hidden">
                <Container className="position-relative z-index-1">
                    <Row className="mb-4">
                        <Col>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="back-btn"
                                onClick={() => navigate('/user/booking-selection')}
                            >
                                <FaArrowLeft className="me-2" /> Back to Services
                            </motion.button>
                        </Col>
                    </Row>

                    <Row className="align-items-center py-5">
                        <Col md={7}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Badge className="px-3 py-2 mb-3 border border-white border-opacity-20 rounded-pill backdrop-blur-strong bg-white bg-opacity-10">
                                    <span className="text-gold fw-bold tracking-wider fs-8">ELITE BEAUTY</span>
                                </Badge>
                                <h1 className="fw-900 display-3 text-white mb-3 font-heading" style={{ letterSpacing: '-2px', lineHeight: '1' }}>
                                    Salon <span className="text-gradient-gold">Services</span>
                                </h1>
                                <p className="lead text-white text-opacity-80 mb-0 mw-500">
                                    Pamper yourself with professional beauty services and expert stylists at our premium partner salons.
                                </p>
                            </motion.div>
                        </Col>
                        <Col md={5}>
                            <motion.div
                                className="mt-4 mt-md-0"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <div className="glass-search-container p-2">
                                    <div className="glass-search-wrapper-v2">
                                        <FaSearch className="search-icon-gold-v2" />
                                        <Form.Control
                                            type="text"
                                            placeholder="Find your style..."
                                            className="glass-input-v2"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 d-flex justify-content-center">
                                    <Button
                                        variant="outline-light"
                                        className="rounded-pill px-4"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                                        onClick={() => setShowMap(!showMap)}
                                    >
                                        {showMap ? 'Hide Map' : 'View on Map'}
                                    </Button>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>

                {/* Decorative Elements */}
                <div className="hero-orb hero-orb-1 animate-float"></div>
                <div className="hero-orb hero-orb-2 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <Container className="properties-section pt-5">
                <Row>
                    {/* Properties List */}
                    <Col lg={showMap ? 6 : 12}>
                        <h3 className="section-title-dark">Available Salons</h3>
                        <Row className="g-4">
                            <AnimatePresence mode="popLayout">
                                {filteredSalons.length === 0 ? (
                                    <Col xs={12}>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="no-properties p-5 text-center bg-white rounded-4 shadow-sm"
                                        >
                                            <FaCut size={50} className="text-muted opacity-25 mb-3" />
                                            <p className="fs-4 text-muted">No elite salons found matching your search.</p>
                                        </motion.div>
                                    </Col>
                                ) : (
                                    filteredSalons.map((salon, index) => (
                                        <Col key={salon.id} lg={showMap ? 12 : 4} md={6} sm={12}>
                                            <motion.div 
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="elite-property-card h-100"
                                            >
                                                <div className="elite-card-image-wrapper">
                                                    <img
                                                        src={getPropertyImage(salon.imageUrl || salon.image_url || salon.imagePath || salon.image, 'Salon')}
                                                        alt={salon.company}
                                                        className={`elite-card-image ${salon.status !== 'Active' ? 'grayscale opacity-50' : ''}`}
                                                        onError={(e) => handleImageError(e, 'Salon')}
                                                    />
                                                    {salon.status !== 'Active' && (
                                                        <div className="not-available-overlay">
                                                            <span className="not-available-text">NOT AVAILABLE</span>
                                                        </div>
                                                    )}
                                                    <div className="elite-rating-badge shadow-sm">
                                                        <FaStar className="text-warning" /> 
                                                        <span>{salon.rating || '4.5'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="elite-card-body">
                                                    <h3 className="elite-card-title">{salon.company}</h3>
                                                    <div className="elite-card-location">
                                                        <FaMapMarkerAlt className="text-primary" />
                                                        {salon.location}
                                                    </div>
                                                    
                                                    <div className="d-flex flex-wrap gap-2 mb-4">
                                                        {parseFeatures(salon.features).slice(0, 3).map((feature, idx) => (
                                                            <span key={idx} className="elite-tag-pill">{feature}</span>
                                                        ))}
                                                        {parseFeatures(salon.features).length > 3 && (
                                                            <span className="elite-tag-pill">+{parseFeatures(salon.features).length - 3} more</span>
                                                        )}
                                                        {(!salon.features || parseFeatures(salon.features).length === 0) && (
                                                            <>
                                                                <span className="elite-tag-pill">Styling</span>
                                                                <span className="elite-tag-pill">Spa</span>
                                                                <span className="elite-tag-pill">Premium Care</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="elite-price-display">
                                                        <div>
                                                            <span className="elite-price-label">Services from</span>
                                                            <span className="elite-price-val">₹{salon.price || '300'}</span>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                className="btn-elite-icon"
                                                                onClick={() => navigate(`/user/property-details/Salon/${salon.id}`)}
                                                                disabled={salon.status !== 'Active'}
                                                            >
                                                                <FaEye size={20} />
                                                            </button>
                                                            <button 
                                                                className={`btn-elite-primary ${salon.status !== 'Active' ? 'disabled' : ''}`}
                                                                onClick={() => salon.status === 'Active' && navigate(`/user/booking/Salon/${salon.id}`)}
                                                                disabled={salon.status !== 'Active'}
                                                            >
                                                                {salon.status !== 'Active' ? 'Unavailable' : 'Book Now'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Col>
                                    ))
                                )}
                            </AnimatePresence>
                        </Row>
                    </Col>

                    {/* Map View */}
                    {showMap && (
                        <Col lg={6}>
                            <div className="map-container-sticky">
                                <MapView
                                    properties={filteredSalons}
                                    department="Salon"
                                    onPropertyClick={handleBookService}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>

        </div>
    );
};

export default SalonBooking;
