import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge, Button, Card, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding, FaArrowLeft, FaCheckCircle, FaInfoCircle, FaUserTie, FaPlus, FaListUl } from 'react-icons/fa';
import { fetchProperties, fetchSpecialistsByProperty, fetchServicesByProperty } from '../../api';
import UserNavbar from '../../components/user/UserNavbar';
import { parseFeatures } from '../../utils';

const UserPropertyDetailsPage = () => {
    const { department, id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [specialists, setSpecialists] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Ensure department is capitalized (e.g., 'hotel' -> 'Hotel')
                const formattedDept = department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
                const properties = await fetchProperties(formattedDept);
                
                // More robust property matching
                const foundProperty = properties.find(p => p.id.toString() === id);
                
                if (foundProperty) {
                    setProperty(foundProperty);
                    console.log("Details: Loading specialists/services for property:", foundProperty.id);
                    const [specs, svcs] = await Promise.all([
                        fetchSpecialistsByProperty(foundProperty.id),
                        fetchServicesByProperty(foundProperty.id)
                    ]);
                    console.log("Details: Specialists loaded:", specs.length, "Services loaded:", svcs.length);
                    setSpecialists(specs);
                    setServices(svcs);
                }
            } catch (error) {
                console.error("Error loading property details:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [department, id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <Spinner animation="border" variant="success" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <h3 className="text-muted mb-4">Property not found</h3>
                <Button variant="success" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const getImages = (prop) => {
        if (prop.images && Array.isArray(prop.images) && prop.images.length > 0) {
            return prop.images.map(img => typeof img === 'string' ? img : img.imageUrl || img.image_url || '').filter(url => url);
        }
        if (prop.imageUrl) return [prop.imageUrl];
        if (prop.image_url) return [prop.image_url];
        return [];
    };

    const images = getImages(property);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const handleBook = () => {
        if (property.status !== 'Active') return;
        navigate(`/user/booking/${department}/${property.id}`);
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <UserNavbar selectedDepartment={department} onDepartmentChange={(dept) => navigate(`/user/${dept.toLowerCase()}`)} />
            
            {/* Header / Hero */}
            <div style={{ 
                background: 'linear-gradient(135deg, #001A14 0%, #002C22 100%)',
                padding: '60px 0 100px',
                color: 'white'
            }}>
                <Container>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="d-flex align-items-center gap-2 mb-4 cursor-pointer"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft /> <span className="fw-bold text-uppercase smallest tracking-widest opacity-70">Back to Listings</span>
                    </motion.div>
                    
                    <Row className="align-items-end justify-content-between g-4">
                        <Col lg={8}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <Badge bg="success" className="mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase tracking-widest" style={{ fontSize: '0.7rem' }}>
                                    {property.department} Elite
                                </Badge>
                                <h1 className="display-4 fw-900 mb-2 font-heading" style={{ letterSpacing: '-1px' }}>
                                    {property.company}
                                </h1>
                                <div className="d-flex flex-wrap align-items-center gap-4 opacity-80">
                                    <div className="d-flex align-items-center gap-2">
                                        <FaMapMarkerAlt className="text-gold" />
                                        <span>{property.location}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaStar className="text-warning" />
                                        <span className="fw-bold">{property.rating?.toFixed(1) || '4.8'} (250+ reviews)</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                        <Col lg={3} className="text-lg-end">
                            {/* Elite Guaranteed Badge - Floating Directly */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-4 shadow-lg text-start mx-auto mx-lg-0" 
                                style={{ 
                                    backgroundColor: '#ffb321', 
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.3), 0 0 30px rgba(255, 179, 33, 0.2)',
                                    maxWidth: '320px'
                                }}
                            >
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                                        <FaCheckCircle style={{ color: '#ffb321' }} size={24} />
                                    </div>
                                    <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.25rem', letterSpacing: '-0.3px' }}>Elite Guaranteed</h5>
                                </div>
                                <p className="mb-0 text-dark fw-normal opacity-90" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                    Verified premises with our luxury standard checklist.
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container style={{ marginTop: '-40px' }} className="pb-5">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Row className="g-4">
                        {/* Highlights Grid */}
                        <Col lg={8}>
                            <motion.div variants={itemVariants} className="bg-white rounded-5 shadow-sm p-4 p-md-5 mb-4 border border-light">
                                <h4 className="fw-900 mb-4 font-heading d-flex align-items-center gap-3">
                                    <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                                        <FaInfoCircle size={20} />
                                    </div>
                                    About the Premises
                                </h4>
                                <p className="text-muted lead-2 mb-5" style={{ lineHeight: '1.8' }}>
                                    {property.description || "Experience the pinnacle of luxury and comfort. Our properties are handpicked for their exceptional service and world-class amenities, ensuring an unforgettable stay for every guest."}
                                </p>

                                <Row className="g-4 mb-5">
                                    <Col md={6}>
                                        <h6 className="fw-bold text-uppercase smallest text-muted tracking-widest mb-3">Core Amenities</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {property.amenities?.split(',').map((am, i) => (
                                                <span key={i} className="px-3 py-2 rounded-pill bg-light text-dark fw-600 border border-light shadow-xs smallest">
                                                    <span className="text-success me-1">✓</span> {am.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <h6 className="fw-bold text-uppercase smallest text-muted tracking-widest mb-3">Premium Features</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {property.features && parseFeatures(property.features).map((f, i) => (
                                                <span key={i} className="px-3 py-2 rounded-pill bg-success bg-opacity-10 text-success fw-600 shadow-xs smallest">
                                                    ✨ {f}
                                                </span>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>

                                {/* Gallery Row */}
                                <h6 className="fw-bold text-uppercase smallest text-muted tracking-widest mb-3">Visual Showcase</h6>
                                <div className="d-flex gap-3 overflow-auto pb-2 scrollbar-hide">
                                    {images.map((img, i) => (
                                        <motion.div 
                                            key={i}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="flex-shrink-0 cursor-pointer overflow-hidden rounded-4 shadow-sm"
                                            style={{ width: '220px', height: '150px' }}
                                            onClick={() => { setCurrentImageIndex(i); setLightboxOpen(true); }}
                                        >
                                            <img src={img} className="w-100 h-100 object-fit-cover" alt={`Gallery ${i}`} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Specialists / Team */}
                            {specialists.length > 0 && (
                                <motion.div variants={itemVariants} className="bg-white rounded-5 shadow-sm p-4 p-md-5 mb-4 border border-light">
                                    <h4 className="fw-900 mb-4 font-heading d-flex align-items-center gap-3">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                                            <FaUserTie size={20} />
                                        </div>
                                        Elite Professional Team
                                    </h4>
                                    <Row className="g-4">
                                        {specialists.map((spec, i) => (
                                            <Col sm={6} md={4} lg={3} key={spec.id}>
                                                <motion.div 
                                                    whileHover={{ y: -10 }}
                                                    className="text-center p-3 rounded-4 border border-light hover-shadow-lg transition-all"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/user/booking/${department}/${property.id}`, { state: { selectedSpecialist: spec } })}
                                                >
                                                    <div className="mx-auto position-relative mb-3" style={{ width: '100px', height: '100px' }}>
                                                        <img src={spec.imageUrl} className="w-100 h-100 rounded-circle object-fit-cover shadow-sm border border-4 border-white" alt={spec.name} />
                                                        <div className="position-absolute bottom-0 end-0 bg-white shadow-sm rounded-circle p-2 border d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                                                            <FaStar className="text-warning" size={12} />
                                                        </div>
                                                    </div>
                                                    <h6 className="fw-extra-bold mb-1 text-dark truncate-1">{spec.name}</h6>
                                                    <Badge bg="light" className="text-muted smaller fw-bold px-3 py-1 rounded-pill">{spec.rating} Rating</Badge>
                                                </motion.div>
                                            </Col>
                                        ))}
                                    </Row>
                                </motion.div>
                            )}

                            {/* Offered Services */}
                            {services.length > 0 && (
                                <motion.div variants={itemVariants} className="bg-white rounded-5 shadow-sm p-4 p-md-5 mb-4 border border-light">
                                    <h4 className="fw-900 mb-4 font-heading d-flex align-items-center gap-3">
                                        <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                                            <FaListUl size={20} />
                                        </div>
                                        Elite Curated Services
                                    </h4>
                                    <Row className="g-4">
                                        {services.map((svc, i) => (
                                            <Col md={6} key={svc.id}>
                                                <motion.div 
                                                    whileHover={{ x: 10 }}
                                                    className="d-flex align-items-center gap-4 p-4 rounded-4 border border-light hover-shadow-lg transition-all bg-light bg-opacity-10"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/user/booking/${department}/${property.id}`, { state: { selectedService: svc } })}
                                                >
                                                    <div className="flex-shrink-0" style={{ width: '80px', height: '80px' }}>
                                                        <img src={svc.imageUrl} className="w-100 h-100 rounded-4 object-fit-cover shadow-sm" alt={svc.name} onError={(e) => e.target.src = 'https://via.placeholder.com/800x450?text=Service'} />
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <h6 className="fw-extra-bold mb-0 text-dark">{svc.name}</h6>
                                                            <div className="fw-900 text-success">₹{svc.price}</div>
                                                        </div>
                                                        <p className="text-muted small mb-0 truncate-2">{svc.description}</p>
                                                    </div>
                                                </motion.div>
                                            </Col>
                                        ))}
                                    </Row>
                                </motion.div>
                            )}
                        </Col>

                        {/* Sidebar / Contact */}
                        <Col lg={4}>
                            <motion.div variants={itemVariants} className="bg-white rounded-5 shadow-sm p-4 mb-4 border border-light sticky-top" style={{ top: '100px' }}>
                                <h5 className="fw-900 mb-4 font-heading">Secure Your Slot</h5>
                                <div className="p-4 rounded-4 bg-light mb-4 text-center border shadow-sm">
                                    <h1 className="fw-900 mb-0 text-success">₹{property.price}</h1>
                                </div>
                                <Button 
                                    className={`w-100 py-3 rounded-pill fw-bold shadow-lg border-0 mb-4 ${property.status !== 'Active' ? 'btn-secondary disabled' : 'btn-gold-gradient'}`} 
                                    onClick={handleBook}
                                    disabled={property.status !== 'Active'}
                                >
                                    {property.status !== 'Active' ? 'NOT AVAILABLE' : 'CONTINUE TO BOOKING'}
                                </Button>
                                
                                {/* Elite Guaranteed Badge - Sidebar */}
                                <div className="p-3 rounded-4 bg-gradient-gold text-dark text-start mb-4">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div className="bg-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px' }}>
                                            <FaCheckCircle className="text-gold" size={14} />
                                        </div>
                                        <span className="fw-bold small">Elite Guaranteed</span>
                                    </div>
                                    <p className="mb-0" style={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: '1.2' }}>
                                        Verified premises with our luxury standard checklist.
                                    </p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 hover-bg-light transition-all">
                                        <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success shadow-xs">
                                            <FaPhone size={16} />
                                        </div>
                                        <div>
                                            <div className="smallest text-muted fw-bold text-uppercase">Direct Line</div>
                                            <div className="fw-900 text-dark">{property.phone || "Connect Now"}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 hover-bg-light transition-all">
                                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary shadow-xs">
                                            <FaEnvelope size={16} />
                                        </div>
                                        <div>
                                            <div className="smallest text-muted fw-bold text-uppercase">Business Email</div>
                                            <div className="fw-900 text-dark">{property.email || "Send Inquiry"}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 hover-bg-light transition-all">
                                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning shadow-xs">
                                            <FaBuilding size={16} />
                                        </div>
                                        <div>
                                            <div className="smallest text-muted fw-bold text-uppercase">Headquarters</div>
                                            <div className="fw-900 text-dark truncate-1">{property.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Sidebar elements continue below */}
                        </Col>
                    </Row>
                </motion.div>
            </Container>

            {/* Lightbox - Simple implementation */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed-inset-black z-max d-flex align-items-center justify-content-center p-4"
                        onClick={() => setLightboxOpen(false)}
                        style={{ position: 'fixed', top: 0, left: 0, right:0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999 }}
                    >
                        <Button variant="link" className="position-absolute top-0 right-0 p-4 text-white opacity-50 hover-opacity-100" onClick={() => setLightboxOpen(false)}>
                            <FaPlus size={30} style={{ transform: 'rotate(45deg)' }} />
                        </Button>
                        <motion.img 
                            initial={{ scale: 0.9 }} 
                            animate={{ scale: 1 }}
                            src={images[currentImageIndex]} 
                            className="max-vh-80 max-vw-90 rounded-4 shadow-2xl border border-light border-opacity-20"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="position-absolute bottom-0 w-100 text-center p-5 text-white opacity-50 fw-bold tracking-widest">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .fixed-inset-black { position: fixed; inset: 0; background: #000; }
                .z-max { z-index: 10000; }
                .max-vh-80 { max-height: 80vh; }
                .max-vw-90 { max-width: 90vw; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .fw-900 { font-weight: 950; }
                .smallest { font-size: 0.65rem; }
                .tracking-widest { letter-spacing: 0.2em; }
                .truncate-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .bg-gold-gradient { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); }
                .text-gold-modern { color: #fbbf24; }
                .lead-2 { font-size: 1.15rem; }
                .hover-bg-light:hover { background-color: #f8fafc; }
                .hover-shadow-lg:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .bg-gradient-gold { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
            `}</style>
        </div>
    );
};

export default UserPropertyDetailsPage;
