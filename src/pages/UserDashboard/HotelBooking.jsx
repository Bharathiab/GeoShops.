import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBed, FaUtensils, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaHotel, FaSnowflake, FaHome, FaEye, FaWifi, FaSwimmingPool, FaParking, FaConciergeBell, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from '../../components/user/UserNavbar';
import MapView from '../../components/user/MapView';
import { fetchProperties, createBooking, validateCoupon } from '../../api';
import { parseFeatures } from '../../utils';
import Toast from '../../utils/toast';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';
import './DepartmentBooking.css';
import '../../styles/PremiumHeader.css';

const HotelBooking = () => {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showPropertyDetails, setShowPropertyDetails] = useState(false);
    const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Booking form fields
    const [roomType, setRoomType] = useState('');
    const [includeFood, setIncludeFood] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [requestMembership, setRequestMembership] = useState(false);

    const roomTypes = [
        {
            name: 'AC Room',
            icon: <FaSnowflake />,
            priceMultiplier: 1.5,
            description: 'Air-conditioned comfort',
            color: '#4facfe'
        },
        {
            name: 'Non-AC Room',
            icon: <FaBed />,
            priceMultiplier: 1.0,
            description: 'Cozy and affordable',
            color: '#43e97b'
        },
        {
            name: '2-Bedroom Suite',
            icon: <FaHome />,
            priceMultiplier: 2.5,
            description: 'Spacious family suite',
            color: '#fa709a'
        }
    ];

    const foodCostPerDay = 500; // ₹500 per day for food

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    useEffect(() => {
        calculateTotalPrice();
    }, [roomType, includeFood, checkInDate, checkOutDate, selectedHotel]);

    useEffect(() => {
        calculateFinalPrice();
    }, [totalPrice, appliedCoupon]);

    const loadHotels = async () => {
        try {
            const data = await fetchProperties('Hotel');
            const activeHotels = data.filter(h => h.status !== 'Inactive');
            setHotels(activeHotels);
        } catch (error) {
            console.error('Error loading hotels:', error);
        }
    };

    const calculateTotalPrice = () => {
        if (!selectedHotel || !roomType || !checkInDate || !checkOutDate) {
            setTotalPrice(0);
            return;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            setTotalPrice(0);
            return;
        }

        const selectedRoomType = roomTypes.find(rt => rt.name === roomType);
        const basePrice = selectedHotel.price || 1000;
        const roomPrice = basePrice * selectedRoomType.priceMultiplier;
        const foodPrice = includeFood ? foodCostPerDay : 0;

        const total = (roomPrice + foodPrice) * days;
        setTotalPrice(total);
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
            const result = await validateCoupon(couponCode, userLoginData.userId, selectedHotel?.id);
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

    const filteredHotels = hotels.filter(hotel => {
        const matchesSearch = hotel.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleBookRoom = (hotel) => {
        setSelectedHotel(hotel);
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async () => {
        const userLoginData = JSON.parse(localStorage.getItem('userLoginData') || '{}');

        if (!userLoginData.userId) {
            Toast.warning('Please login to book a room!');
            navigate('/user-login');
            return;
        }

        if (!roomType || !checkInDate || !checkOutDate) {
            Toast.warning('Please fill in all required fields!');
            return;
        }

        if (new Date(checkOutDate) <= new Date(checkInDate)) {
            Toast.warning('Check-out date must be after check-in date!');
            return;
        }

        const bookingData = {
            userId: userLoginData.userId,
            hotelId: selectedHotel.id,
            checkInDate,
            checkOutDate,
            totalPrice,
            roomType,
            includeFood,
            numberOfGuests,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            discountAmount: discountAmount,
            finalPrice: finalPrice,
            requestMembership: requestMembership
        };

        try {
            const response = await createBooking('Hotel', bookingData);

            // Redirect to payment page instead of showing success message
            navigate('/user/booking-payment', {
                state: {
                    bookingId: response.data?.bookingId || response.bookingId,
                    amount: finalPrice,
                    propertyName: selectedHotel.company,
                    department: 'Hotel'
                }
            });

            setShowBookingModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating booking:', error);
            Toast.error('Failed to book room. Please try again.');
        }
    };

    const resetForm = () => {
        setRoomType('');
        setIncludeFood(false);
        setCheckInDate('');
        setCheckOutDate('');
        setNumberOfGuests(1);
        setTotalPrice(0);
        setCouponCode('');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setFinalPrice(0);
        setRequestMembership(false);
    };

    const getDays = () => {
        if (!checkInDate || !checkOutDate) return 0;
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    return (
        <div className="department-booking-wrapper">
            <style>
                {`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .hotel-card-premium {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                    border: none !important;
                    border-radius: 20px !important;
                    overflow: hidden !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
                    background: white !important;
                }
                .hotel-card-premium:hover {
                    transform: translateY(-12px) scale(1.02) !important;
                    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.25) !important;
                }
                .property-image-container {
                    position: relative;
                    height: 250px;
                    overflow: hidden;
                }
                .property-image-zoom {
                    transition: transform 0.6s ease !important;
                }
                .hotel-card-premium:hover .property-image-zoom {
                    transform: scale(1.1);
                }
                `}
            </style>

            <UserNavbar selectedDepartment="Hotel" onDepartmentChange={(dept) => {
                if (dept === 'Home') navigate('/user');
            }} />

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

                    <Row className="align-items-center mb-5">
                        <Col md={7}>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <Badge className="px-3 py-2 mb-3 border border-white border-opacity-20 rounded-pill backdrop-blur-strong bg-white bg-opacity-10">
                                    <span className="text-gold fw-bold tracking-wider fs-8">PREMIUM STAYS</span>
                                </Badge>
                                <h1 className="fw-900 display-3 text-white mb-3 font-heading" style={{ letterSpacing: '-2px', lineHeight: '1' }}>
                                    Hotel <span className="text-gradient-gold">Reservations</span>
                                </h1>
                                <p className="lead text-white text-opacity-80 mb-0 mw-500">
                                    Experience luxury and comfort with our curated selection of elite hotels and resorts across the network.
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
                                            placeholder="Search hotels or locations..."
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

            <Container className="properties-section" style={{ marginTop: '3rem' }}>
                <Row>
                    {/* Properties List */}
                    <Col lg={showMap ? 6 : 12}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="section-title-dark mb-4" style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '2rem'
                            }}>
                                Available Hotels
                            </h3>
                        </motion.div>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Row className="g-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredHotels.length === 0 ? (
                                        <motion.div 
                                            key="no-hotels"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="col-12"
                                        >
                                            <div className="no-properties p-5 text-center bg-white rounded-4 shadow-sm">
                                                <FaHotel size={50} className="text-muted opacity-25 mb-3" />
                                                <p className="fs-4 text-muted">No elite hotels found matching your search.</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        filteredHotels.map((hotel, index) => (
                                            <Col key={hotel.id} lg={showMap ? 12 : 4} md={6} sm={12}>
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 30 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="elite-property-card h-100"
                                                >
                                                    <div className="elite-card-image-wrapper">
                                                        <img
                                                            src={getPropertyImage(hotel.imageUrl || hotel.image_url || hotel.imagePath || hotel.image, 'Hotel')}
                                                            alt={hotel.company}
                                                            className={`elite-card-image ${hotel.status !== 'Active' ? 'grayscale opacity-50' : ''}`}
                                                            onError={(e) => handleImageError(e, 'Hotel')}
                                                        />
                                                        {hotel.status !== 'Active' && (
                                                            <div className="not-available-overlay">
                                                                <span className="not-available-text">NOT AVAILABLE</span>
                                                            </div>
                                                        )}
                                                        <div className="elite-rating-badge shadow-sm">
                                                            <FaStar className="text-warning" /> 
                                                            <span>{hotel.rating || '4.5'}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="elite-card-body">
                                                        <h3 className="elite-card-title">{hotel.company}</h3>
                                                        <div className="elite-card-location">
                                                            <FaMapMarkerAlt className="text-primary" />
                                                            {hotel.location}
                                                        </div>
                                                        
                                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                                            <span className="elite-tag-pill"><FaWifi className="me-1" /> WiFi</span>
                                                            <span className="elite-tag-pill"><FaSwimmingPool className="me-1" /> Pool</span>
                                                            <span className="elite-tag-pill"><FaConciergeBell className="me-1" /> Service</span>
                                                        </div>

                                                        <div className="elite-price-display">
                                                            <div>
                                                                <span className="elite-price-label">Price per night</span>
                                                                <span className="elite-price-val">₹{hotel.price || '1000'}</span>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                <button 
                                                                    className="btn-elite-icon"
                                                                    onClick={() => navigate(`/user/property-details/Hotel/${hotel.id}`)}
                                                                    disabled={hotel.status !== 'Active'}
                                                                >
                                                                    <FaEye size={20} />
                                                                </button>
                                                                <button 
                                                                    className={`btn-elite-primary ${hotel.status !== 'Active' ? 'disabled' : ''}`}
                                                                    onClick={() => hotel.status === 'Active' && navigate(`/user/booking/Hotel/${hotel.id}`)}
                                                                    disabled={hotel.status !== 'Active'}
                                                                >
                                                                    {hotel.status !== 'Active' ? 'Unavailable' : 'Book Now'}
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
                        </motion.div>
                    </Col>

                    {/* Map View */}
                    {showMap && (
                        <Col lg={6}>
                            <div className="map-container-sticky">
                                <MapView
                                    properties={filteredHotels}
                                    department="Hotel"
                                    onPropertyClick={handleBookRoom}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>

        </div>
    );
};

export default HotelBooking;
