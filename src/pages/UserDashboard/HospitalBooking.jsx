import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserMd, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar, FaStethoscope, FaCheck, FaEye, FaSearch } from 'react-icons/fa';
import UserNavbar from '../../components/user/UserNavbar';
import MapView from '../../components/user/MapView';
import { fetchProperties, createBooking } from '../../api';
import { parseFeatures } from '../../utils';
import Toast from '../../utils/toast';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';
import './DepartmentBooking.css';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/PremiumHeader.css';

const HospitalBooking = () => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showPropertyDetails, setShowPropertyDetails] = useState(false);
    const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Booking form fields
    const [doctorCategory, setDoctorCategory] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [reason, setReason] = useState('');
    const [selectedAilment, setSelectedAilment] = useState('');
    const [requestMembership, setRequestMembership] = useState(false);

    const doctorCategories = [
        {
            name: 'General Physician',
            icon: '🩺',
            color: '#667eea',
            ailments: ['Fever', 'Cold & Cough', 'Body Pain', 'Fatigue', 'General Checkup', 'Headache', 'Stomach Issues']
        },
        {
            name: 'Dermatologist',
            icon: '💆',
            color: '#f093fb',
            ailments: ['Skin Rashes', 'Acne Treatment', 'Hair Fall', 'Allergies', 'Eczema', 'Psoriasis', 'Skin Infection']
        },
        {
            name: 'Cardiologist',
            icon: '❤️',
            color: '#f5576c',
            ailments: ['Chest Pain', 'Heart Checkup', 'High Blood Pressure', 'Palpitations', 'Irregular Heartbeat', 'Breathlessness']
        },
        {
            name: 'Pediatrician',
            icon: '👶',
            color: '#4facfe',
            ailments: ['Child Fever', 'Vaccination', 'Growth Issues', 'Child Allergies', 'Infant Care', 'Developmental Concerns']
        },
        {
            name: 'Orthopedic',
            icon: '🦴',
            color: '#43e97b',
            ailments: ['Bone Pain', 'Joint Issues', 'Fractures', 'Sports Injuries', 'Back Pain', 'Arthritis', 'Muscle Strain']
        },
        {
            name: 'Neurologist',
            icon: '🧠',
            color: '#fa709a',
            ailments: ['Migraine', 'Seizures', 'Memory Issues', 'Dizziness', 'Nerve Pain', 'Tremors', 'Sleep Disorders']
        },
        {
            name: 'Ophthalmologist',
            icon: '👁️',
            color: '#30cfd0',
            ailments: ['Eye Pain', 'Vision Problems', 'Eye Infection', 'Cataract', 'Glaucoma', 'Dry Eyes', 'Eye Checkup']
        },
        {
            name: 'ENT Specialist',
            icon: '👂',
            color: '#a8edea',
            ailments: ['Ear Pain', 'Throat Issues', 'Nose Problems', 'Hearing Issues', 'Tonsillitis', 'Sinusitis', 'Voice Problems']
        }
    ];

    // Sample doctors list (in production, this would come from the backend)
    const sampleDoctors = {
        'General Physician': ['Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Patel'],
        'Dermatologist': ['Dr. Sneha Reddy', 'Dr. Vikram Singh', 'Dr. Anjali Mehta'],
        'Cardiologist': ['Dr. Suresh Gupta', 'Dr. Kavita Desai', 'Dr. Rahul Verma'],
        'Pediatrician': ['Dr. Meera Iyer', 'Dr. Arun Nair', 'Dr. Pooja Joshi'],
        'Orthopedic': ['Dr. Sanjay Rao', 'Dr. Deepak Malhotra', 'Dr. Ritu Kapoor'],
        'Neurologist': ['Dr. Ashok Menon', 'Dr. Sunita Bose', 'Dr. Kiran Shah'],
        'Ophthalmologist': ['Dr. Ramesh Pillai', 'Dr. Lakshmi Krishnan', 'Dr. Vijay Agarwal'],
        'ENT Specialist': ['Dr. Mohan Das', 'Dr. Geeta Rao', 'Dr. Arjun Reddy']
    };

    useEffect(() => {
        loadHospitals();
    }, []);

    const loadHospitals = async () => {
        try {
            const data = await fetchProperties('Hospital');
            const activeHospitals = data.filter(h => h.status !== 'Inactive');
            setHospitals(activeHospitals);
        } catch (error) {
            console.error('Error loading hospitals:', error);
        }
    };

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleBookAppointment = (hospital) => {
        setSelectedHospital(hospital);
        setShowBookingModal(true);
    };

    const handleConfirmBooking = async () => {
        const userLoginData = JSON.parse(localStorage.getItem('userLoginData') || '{}');

        if (!userLoginData.userId) {
            Toast.warning('Please login to book an appointment!');
            navigate('/user-login');
            return;
        }

        if (!doctorCategory || !appointmentDate || !appointmentTime) {
            Toast.warning('Please fill in all required fields!');
            return;
        }

        const finalReason = selectedAilment || reason;
        if (!finalReason) {
            Toast.warning('Please select an ailment or describe your reason for visit!');
            return;
        }

        const bookingData = {
            userId: userLoginData.userId,
            hospitalId: selectedHospital.id,
            appointmentDate: `${appointmentDate}T${appointmentTime}:00`,
            reason: finalReason,
            doctorCategory,
            doctorName: doctorName || null,
            estimatedPrice: selectedHospital.price || 500,
            finalPrice: selectedHospital.price || 500,
            totalPrice: selectedHospital.price || 500,
            requestMembership
        };

        try {
            const response = await createBooking('Hospital', bookingData);

            // Redirect to payment page
            navigate('/user/booking-payment', {
                state: {
                    bookingId: response.data?.bookingId || response.bookingId,
                    amount: selectedHospital.price || 500,
                    propertyName: selectedHospital.company,
                    department: 'Hospital'
                }
            });

            setShowBookingModal(false);
            resetForm();
        } catch (error) {
            console.error('Error creating booking:', error);
            Toast.error('Failed to book appointment. Please try again.');
        }
    };

    const resetForm = () => {
        setDoctorCategory('');
        setDoctorName('');
        setAppointmentDate('');
        setAppointmentTime('');
        setReason('');
        setSelectedAilment('');
        setRequestMembership(false);
    };

    const getCurrentCategoryData = () => {
        return doctorCategories.find(cat => cat.name === doctorCategory);
    };

    const getAvailableDoctors = () => {
        return sampleDoctors[doctorCategory] || [];
    };

    return (
        <div style={{ background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)", minHeight: "100vh" }}>
            <UserNavbar selectedDepartment="Hospital" onDepartmentChange={(dept) => { if (dept === 'Home') navigate('/user'); }} />

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
                                    <span className="text-gold fw-bold tracking-wider fs-8">PREMIUM CARE</span>
                                </Badge>
                                <h1 className="fw-900 display-3 text-white mb-3 font-heading" style={{ letterSpacing: '-2px', lineHeight: '1' }}>
                                    Hospital <span className="text-gradient-gold">Services</span>
                                </h1>
                                <p className="lead text-white text-opacity-80 mb-0 mw-500">
                                    Connect with top specialists and book appointments instantly across our elite healthcare network.
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
                                            placeholder="Search specialists or hospitals..."
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

            <Container className="pt-5">
                {/* Doctor Categories - Moved outside the header */}
                <div className="categories-section pb-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-5"
                    >
                        <Badge className="px-3 py-2 mb-3 border border-primary border-opacity-10 rounded-pill bg-primary bg-opacity-10">
                            <span className="text-primary-light fw-bold tracking-wider fs-8">MEDICAL SPECIALTIES</span>
                        </Badge>
                        <h2 className="fw-900 display-5 text-dark mb-2 font-heading" style={{ letterSpacing: '-1.5px' }}>
                            Find Your <span className="text-gradient-gold">Specialist</span>
                        </h2>
                        <p className="text-muted lead fw-500">Select a category to discover elite medical practitioners.</p>
                    </motion.div>
                    <Row className="g-4 justify-content-center">
                        {doctorCategories.map((category, index) => (
                            <Col key={index} lg={3} md={4} sm={6} xs={6}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -10, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ delay: 0.1 * index }}
                                        className={`doctor-category-card-v2 ${selectedCategory === category.name ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category.name)}
                                        style={{
                                            background: '#ffffff',
                                            padding: '3rem 2rem',
                                            borderRadius: '32px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            boxShadow: selectedCategory === category.name 
                                                ? `0 25px 50px -12px ${category.color}40` 
                                                : '0 10px 30px -10px rgba(0,0,0,0.05)',
                                            border: `2px solid ${selectedCategory === category.name ? category.color : 'transparent'}`,
                                            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {selectedCategory === category.name && (
                                            <div className="active-glow" style={{
                                                position: 'absolute',
                                                top: '-50%',
                                                left: '-50%',
                                                width: '200%',
                                                height: '200%',
                                                background: `radial-gradient(circle, ${category.color}10 0%, transparent 70%)`,
                                                zIndex: 0
                                            }} />
                                        )}
                                    <div className={`category-icon-wrapper mb-4 ${selectedCategory === category.name ? 'animate-float-icon' : ''}`} style={{ 
                                        background: `${category.color}15`,
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        margin: '0 auto',
                                        color: category.color,
                                        boxShadow: selectedCategory === category.name ? `0 0 20px ${category.color}40` : 'none',
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        {category.icon}
                                    </div>
                                    <h5 className="fw-bold text-dark mb-1">{category.name}</h5>
                                    <p className="text-muted small mb-0">Elite Specialists Available</p>
                                    
                                    {selectedCategory === category.name && (
                                        <motion.div 
                                            layoutId="active-indicator"
                                            className="active-dot mx-auto mt-3"
                                            style={{ width: '8px', height: '8px', borderRadius: '50%', background: category.color }}
                                        />
                                    )}
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>

            <Container className="properties-section pt-5">
                <Row>
                    {/* Properties List */}
                    <Col lg={showMap ? 6 : 12}>
                        <h3 className="section-title-dark">Available Hospitals</h3>
                        <Row className="g-4">
                            <AnimatePresence mode="popLayout">
                                {filteredHospitals.length === 0 ? (
                                    <Col xs={12} key="no-results">
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="no-properties p-5 text-center bg-white rounded-4 shadow-sm"
                                        >
                                            <FaStethoscope size={50} className="text-muted opacity-25 mb-3" />
                                            <p className="fs-4 text-muted">No elite hospitals found matching your search.</p>
                                        </motion.div>
                                    </Col>
                                ) : (
                                    filteredHospitals.map((hospital, index) => (
                                        <Col key={hospital.id} lg={showMap ? 12 : 4} md={6} sm={12}>
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ 
                                                    duration: 0.4, 
                                                    delay: index * 0.05,
                                                    ease: [0.165, 0.84, 0.44, 1]
                                                }}
                                                className="elite-property-card h-100"
                                            >
                                                <div className="elite-card-image-wrapper">
                                                    <img
                                                        src={getPropertyImage(hospital.imageUrl || hospital.image_url || hospital.imagePath || hospital.image, 'Hospital')}
                                                        alt={hospital.company}
                                                        className={`elite-card-image ${hospital.status !== 'Active' ? 'grayscale opacity-50' : ''}`}
                                                        onError={(e) => handleImageError(e, 'Hospital')}
                                                    />
                                                    {hospital.status !== 'Active' && (
                                                        <div className="not-available-overlay">
                                                            <span className="not-available-text">NOT AVAILABLE</span>
                                                        </div>
                                                    )}
                                                    <div className="elite-rating-badge shadow-sm">
                                                        <FaStar className="text-warning" /> 
                                                        <span>{hospital.rating || '4.5'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="elite-card-body">
                                                    <h3 className="elite-card-title">{hospital.company}</h3>
                                                    <div className="elite-card-location">
                                                        <FaMapMarkerAlt className="text-primary" />
                                                        {hospital.location}
                                                    </div>
                                                    
                                                    {hospital.features && parseFeatures(hospital.features).length > 0 && (
                                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                                            {parseFeatures(hospital.features).slice(0, 3).map((feature, idx) => (
                                                                <span key={idx} className="elite-tag-pill">{feature}</span>
                                                            ))}
                                                            {parseFeatures(hospital.features).length > 3 && (
                                                                <span className="elite-tag-pill">+{parseFeatures(hospital.features).length - 3} more</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="elite-price-display">
                                                        <div>
                                                            <span className="elite-price-label">Consultation Fee</span>
                                                            <span className="elite-price-val">₹{hospital.price || '500'}</span>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                className="btn-elite-icon"
                                                                onClick={() => navigate(`/user/property-details/Hospital/${hospital.id}`)}
                                                                disabled={hospital.status !== 'Active'}
                                                            >
                                                                <FaEye size={20} />
                                                            </button>
                                                            <button 
                                                                className={`btn-elite-primary ${hospital.status !== 'Active' ? 'disabled' : ''}`}
                                                                onClick={() => hospital.status === 'Active' && navigate(`/user/booking/Hospital/${hospital.id}`)}
                                                                disabled={hospital.status !== 'Active'}
                                                            >
                                                                {hospital.status !== 'Active' ? 'Unavailable' : 'Book Now'}
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
                                    properties={filteredHospitals}
                                    department="Hospital"
                                    onPropertyClick={handleBookAppointment}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>

        </div>
    );
};

export default HospitalBooking;
