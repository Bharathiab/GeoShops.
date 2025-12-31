import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaEye, FaSearch, FaBoxOpen } from 'react-icons/fa';
import UserNavbar from '../../components/user/UserNavbar';
import MapView from '../../components/user/MapView';
import { fetchProperties } from '../../api';
import { parseFeatures } from '../../utils';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';
import './DepartmentBooking.css';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/PremiumHeader.css';

const DynamicBooking = () => {
    const navigate = useNavigate();
    const { department } = useParams();
    const [properties, setProperties] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadProperties();
    }, [department]);

    const loadProperties = async () => {
        try {
            const data = await fetchProperties(department);
            const activeProperties = data.filter(p => p.status !== 'Inactive');
            setProperties(activeProperties);
        } catch (error) {
            console.error(`Error loading ${department} properties:`, error);
        }
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleBookProperty = (property) => {
        navigate(`/user/booking/${department}/${property.id}`);
    };

    return (
        <div style={{ background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)", minHeight: "100vh" }}>
            <UserNavbar selectedDepartment={department} onDepartmentChange={(dept) => {
                if (dept === 'Home') navigate('/user');
                else navigate(`/user/${dept.toLowerCase()}`);
            }} />

            {/* HERO SECTION */}
            <div className="membership-header-premium position-relative overflow-hidden">
                <Container className="position-relative z-index-1">
                    <Row className="mb-4">
                        <Col>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="back-btn"
                                onClick={() => navigate('/user')}
                            >
                                <FaArrowLeft className="me-2" /> Back to Home
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
                                <Badge className="px-3 py-2 mb-3 border border-white border-opacity-20 rounded-pill bg-white bg-opacity-10">
                                    <span className="text-gold fw-bold tracking-wider fs-8">ELITE PARTNER</span>
                                </Badge>
                                <h1 className="fw-900 display-3 text-white mb-3 font-heading" style={{ letterSpacing: '-2px', lineHeight: '1' }}>
                                    {department} <span className="text-gradient-gold">Services</span>
                                </h1>
                                <p className="lead text-white text-opacity-80 mb-0 mw-500">
                                    Discover premium {department.toLowerCase()} solutions tailored to your needs from our verified network of providers.
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
                                            placeholder={`Search ${department.toLowerCase()}...`}
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
                <div className="hero-orb hero-orb-1 animate-float"></div>
                <div className="hero-orb hero-orb-2 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <Container className="properties-section pt-5">
                <Row>
                    <Col lg={showMap ? 6 : 12}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="section-title-dark mb-0">Available {department}s</h3>
                        </div>

                        <Row className="g-4">
                            <AnimatePresence mode="popLayout">
                                {filteredProperties.length === 0 ? (
                                    <Col xs={12}>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="no-properties p-5 text-center bg-white rounded-4 shadow-sm"
                                        >
                                            <FaBoxOpen size={50} className="text-muted opacity-25 mb-3" />
                                            <p className="fs-4 text-muted">No elite {department.toLowerCase()}s found matching your search.</p>
                                        </motion.div>
                                    </Col>
                                ) : (
                                    filteredProperties.map((property, index) => (
                                        <Col key={property.id} lg={showMap ? 12 : 4} md={6} sm={12}>
                                            <motion.div 
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="elite-property-card h-100"
                                            >
                                                <div className="elite-card-image-wrapper">
                                                    <img
                                                        src={getPropertyImage(property.imageUrl || property.image_url || property.imagePath || property.image, department)}
                                                        alt={property.company}
                                                        className={`elite-card-image ${property.status !== 'Active' ? 'grayscale opacity-50' : ''}`}
                                                        onError={(e) => handleImageError(e, department)}
                                                    />
                                                    {property.status !== 'Active' && (
                                                        <div className="not-available-overlay">
                                                            <span className="not-available-text">NOT AVAILABLE</span>
                                                        </div>
                                                    )}
                                                    <div className="elite-rating-badge shadow-sm">
                                                        <FaStar className="text-warning" /> 
                                                        <span>{property.rating || '4.5'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="elite-card-body">
                                                    <h3 className="elite-card-title">{property.company}</h3>
                                                    <div className="elite-card-location">
                                                        <FaMapMarkerAlt className="text-primary" />
                                                        {property.location}
                                                    </div>
                                                    
                                                    <div className="d-flex flex-wrap gap-2 mb-4">
                                                        {property.features && parseFeatures(property.features).slice(0, 3).map((feature, idx) => (
                                                            <span key={idx} className="elite-tag-pill">{feature}</span>
                                                        ))}
                                                        {property.features && parseFeatures(property.features).length > 3 && (
                                                            <span className="elite-tag-pill">+{parseFeatures(property.features).length - 3} more</span>
                                                        )}
                                                        {(!property.features || parseFeatures(property.features).length === 0) && (
                                                            <>
                                                                <span className="elite-tag-pill">Premium</span>
                                                                <span className="elite-tag-pill">Verified</span>
                                                                <span className="elite-tag-pill">Exclusive</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="elite-price-display">
                                                        <div>
                                                            <span className="elite-price-label">Starting from</span>
                                                            <span className="elite-price-val">₹{property.price || '500'}</span>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <button 
                                                                className="btn-elite-icon"
                                                                onClick={() => navigate(`/user/property-details/${department}/${property.id}`)}
                                                                disabled={property.status !== 'Active'}
                                                            >
                                                                <FaEye size={20} />
                                                            </button>
                                                            <button 
                                                                className={`btn-elite-primary ${property.status !== 'Active' ? 'disabled' : ''}`}
                                                                onClick={() => property.status === 'Active' && handleBookProperty(property)}
                                                                disabled={property.status !== 'Active'}
                                                            >
                                                                {property.status !== 'Active' ? 'Unavailable' : 'Book Now'}
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

                    {showMap && (
                        <Col lg={6}>
                            <div className="map-container-sticky" style={{ position: 'sticky', top: '20px' }}>
                                <MapView
                                    properties={filteredProperties}
                                    department={department}
                                    onPropertyClick={handleBookProperty}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default DynamicBooking;
