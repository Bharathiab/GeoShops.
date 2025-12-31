import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Badge,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCar,
  FaMapMarkerAlt,
  FaStar,
  FaEye,
  FaSearch,
} from 'react-icons/fa';
import UserNavbar from '../../components/user/UserNavbar';
import MapView from '../../components/user/MapView';
import { fetchProperties } from '../../api';
import { parseFeatures } from '../../utils';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';
import './DepartmentBooking.css';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/PremiumHeader.css';

const CabBooking = () => {
  const navigate = useNavigate();
  const [cabs, setCabs] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCabs();
  }, []);

  const loadCabs = async () => {
    try {
      const data = await fetchProperties('Cab');
      const activeCabs = data.filter((c) => c.status !== 'Inactive');
      setCabs(activeCabs);
    } catch (error) {
      console.error('Error loading cabs:', error);
    }
  };

  const filteredCabs = cabs.filter((cab) =>
    cab.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cab.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookCab = (cab) => {
    navigate(`/user/booking/Cab/${cab.id}`);
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)", minHeight: "100vh" }}>
      <UserNavbar selectedDepartment="Cab" onDepartmentChange={(dept) => { if (dept === 'Home') navigate('/user'); }} />

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
                  <span className="text-gold fw-bold tracking-wider fs-8">ELITE RIDES</span>
                </Badge>
                <h1 className="fw-900 display-3 text-white mb-3 font-heading" style={{ letterSpacing: '-2px', lineHeight: '1' }}>
                  Premium <span className="text-gradient-gold">Cabs</span>
                </h1>
                <p className="lead text-white text-opacity-80 mb-0 mw-500">
                  Safe, fast, and affordable transportation at your fingertips with our trusted elite partner network.
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
                      placeholder="Where to next?..."
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

      {/* CAB LISTINGS */}
      <Container className="py-5">
        <Row>
          <Col lg={showMap ? 6 : 12}>
            <h2 className="mb-5 text-center fw-bold">Available Cab Services</h2>

            <Row className="g-4">
              <AnimatePresence mode="popLayout">
                {filteredCabs.length === 0 ? (
                  <Col xs={12}>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="no-properties p-5 text-center bg-white rounded-4 shadow-sm"
                    >
                      <FaCar size={50} className="text-muted opacity-25 mb-3" />
                      <p className="fs-4 text-muted">No elite cab services found matching your search.</p>
                    </motion.div>
                  </Col>
                ) : (
                  filteredCabs.map((cab, index) => (
                    <Col key={cab.id} xs={12} md={6} lg={showMap ? 12 : 4}>
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="elite-property-card h-100"
                      >
                        <div className="elite-card-image-wrapper">
                          <img
                            src={getPropertyImage(cab.imageUrl || cab.image_url || cab.imagePath || cab.image, 'Cab')}
                            alt={cab.company}
                            className={`elite-card-image ${cab.status !== 'Active' ? 'grayscale opacity-50' : ''}`}
                            onError={(e) => handleImageError(e, 'Cab')}
                          />
                          {cab.status !== 'Active' && (
                            <div className="not-available-overlay">
                              <span className="not-available-text">NOT AVAILABLE</span>
                            </div>
                          )}
                          <div className="elite-rating-badge shadow-sm">
                            <FaStar className="text-warning" /> 
                            <span>{cab.rating || '4.7'}</span>
                          </div>
                        </div>
                        
                        <div className="elite-card-body">
                          <h3 className="elite-card-title">{cab.company}</h3>
                          <div className="elite-card-location">
                            <FaMapMarkerAlt className="text-primary" />
                            {cab.location}
                          </div>
                          
                          <div className="d-flex flex-wrap gap-2 mb-4">
                            {parseFeatures(cab.features).slice(0, 3).map((feature, idx) => (
                              <span key={idx} className="elite-tag-pill">{feature}</span>
                            ))}
                            {parseFeatures(cab.features).length > 3 && (
                              <span className="elite-tag-pill">+{parseFeatures(cab.features).length - 3} more</span>
                            )}
                            {parseFeatures(cab.features).length === 0 && (
                              <>
                                <span className="elite-tag-pill">AC</span>
                                <span className="elite-tag-pill">Verified Driver</span>
                                <span className="elite-tag-pill">24/7 Support</span>
                              </>
                            )}
                          </div>

                          <div className="elite-price-display">
                            <div>
                              <span className="elite-price-label">Base Fare</span>
                              <span className="elite-price-val">₹{cab.price || '200'}</span>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn-elite-icon"
                                onClick={() => navigate(`/user/property-details/Cab/${cab.id}`)}
                                disabled={cab.status !== 'Active'}
                              >
                                <FaEye size={20} />
                              </button>
                              <button 
                                className={`btn-elite-primary ${cab.status !== 'Active' ? 'disabled' : ''}`}
                                onClick={() => cab.status === 'Active' && handleBookCab(cab)}
                                disabled={cab.status !== 'Active'}
                              >
                                {cab.status !== 'Active' ? 'Unavailable' : 'Book Now'}
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
              <div className="sticky-top" style={{ top: '20px', height: '600px' }}>
                <MapView
                  properties={filteredCabs}
                  department="Cab"
                  onPropertyClick={handleBookCab}
                />
              </div>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default CabBooking;