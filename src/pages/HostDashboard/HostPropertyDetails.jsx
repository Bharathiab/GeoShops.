import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Badge, Carousel } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaPhone, FaEnvelope, FaBuilding, FaMoneyBillWave, FaClock, FaUserTie, FaCheckCircle, FaExclamationTriangle, FaImages, FaInfoCircle, FaListUl } from "react-icons/fa";
import HostNavbar from "../../components/host/HostNavbar";
import "./HostDashboard.css";

const API_URL = 'http://localhost:5000/api';

const HostPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/properties/details/${id}`);
        if (!response.ok) throw new Error("Failed to fetch property details");
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPropertyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="host-dashboard-container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="host-dashboard-container">
        <HostNavbar />
        <Container className="py-5 text-center">
          <div className="modern-card p-5">
            <FaExclamationTriangle size={64} className="text-danger mb-3" />
            <h3 className="text-danger font-weight-bold">Error Loading Details</h3>
            <p className="text-muted mb-4">{error}</p>
            <Button className="btn-modern btn-primary-modern px-4" onClick={() => navigate(-1)}><FaArrowLeft className="me-2"/> Go Back</Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!property) return null;
  const BASE_URL = API_URL.replace('/api', '');

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="host-dashboard-container">
      <HostNavbar />
      <div className="host-main-content">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4">
          <header className="dashboard-header mb-4">
            <div className="header-text">
              <Button variant="link" className="p-0 text-decoration-none text-muted mb-2 d-flex align-items-center gap-2" onClick={() => navigate("/host/properties")}>
                  <FaArrowLeft size={12}/> Back to Properties
              </Button>
              <h1>Property Showcase</h1>
              <p>Explore full details and performance for <strong>{property.company}</strong></p>
            </div>
            <div className="header-actions">
              <Badge bg={property.status === 'Active' ? 'success' : 'secondary'} className="badge-modern px-3 py-2 fs-6">
                {property.status === 'Active' ? <><FaCheckCircle className="me-2"/> Active</> : property.status}
              </Badge>
            </div>
          </header>

          <Row className="g-4">
            <Col lg={8}>
              <motion.div variants={itemVariants} className="modern-card overflow-hidden mb-4">
                <div className="position-relative">
                   {property.images && property.images.length > 0 ? (
                      <Carousel className="modern-carousel" interval={3000}>
                          {property.images.map((img, index) => (
                              <Carousel.Item key={img.id || index}>
                                  <div style={{ height: "450px", backgroundColor: "#f8f9fa" }} className="d-flex align-items-center justify-content-center">
                                      <img
                                          className="d-block w-100 h-100"
                                          src={img.imageUrl.startsWith('http') ? img.imageUrl : `${BASE_URL}${img.imageUrl}`}
                                          alt={`Slide ${index + 1}`}
                                          style={{ objectFit: "cover" }}
                                          onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x450?text=Image+Unavailable"; }}
                                      />
                                  </div>
                              </Carousel.Item>
                          ))}
                      </Carousel>
                  ) : (
                      <div className="bg-light d-flex flex-column align-items-center justify-content-center py-5" style={{ height: "400px" }}>
                          <FaImages size={64} className="text-muted mb-3 opacity-25" />
                          <p className="text-muted">No images available for this property</p>
                      </div>
                  )}
                  <div className="carousel-overlay p-4 text-white d-flex flex-column justify-content-end" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)', position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', pointerEvents: 'none' }}>
                    <h2 className="mb-0 font-weight-bold">{property.company}</h2>
                    <div className="d-flex align-items-center smallest opacity-75">
                      <FaMapMarkerAlt className="me-2" /> {property.location}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="icon-box-sm bg-success-light text-success"><FaInfoCircle size={14}/></div>
                    <h5 className="font-weight-bold mb-0 text-dark">About the Property</h5>
                  </div>
                  <p className="text-muted" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {property.description || "No detailed description available for this property yet."}
                  </p>

                  <hr className="my-4 opacity-50"/>

                  <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="icon-box-sm bg-primary-light text-primary"><FaListUl size={14}/></div>
                    <h5 className="font-weight-bold mb-0 text-dark">Amenities & Offerings</h5>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-5">
                    {(property.amenities || "").split(',').filter(a => a.trim()).map((amenity, idx) => (
                      <span key={idx} className="badge-modern badge-primary font-weight-bold px-3 py-2">{amenity.trim()}</span>
                    )) || <span className="text-muted italic">No amenities listed</span>}
                  </div>
                  
                  <div className="bg-light p-4 rounded-4">
                    <Row className="g-4 text-center">
                       <Col xs={6} md={3}>
                          <div className="smallest text-muted mb-1">Price Point</div>
                           <div className="font-weight-bold text-success fs-5">₹{property.price || "0"}
                             <span className="small text-muted ms-1" style={{ fontSize: '0.8rem' }}>
                               {(() => {
                                 const dept = property.department?.toLowerCase();
                                 if (dept === 'cab' || (property.features && property.features.includes('cabRates'))) return '/ km';
                                 if (dept === 'hotel') return '/ night';
                                 if (dept === 'hospital') return ' (Consultation)';
                                 if (dept === 'salon') return ' (Base Price)';
                                 return '';
                               })()}
                             </span>
                           </div>
                       </Col>
                       <Col xs={6} md={3}>
                          <div className="smallest text-muted mb-1">User Rating</div>
                          <div className="font-weight-bold text-warning fs-5"><FaStar className="me-1"/> {property.rating || "New"}</div>
                       </Col>
                       <Col xs={6} md={3}>
                          <div className="smallest text-muted mb-1">Department</div>
                          <div className="font-weight-bold text-primary fs-5">{property.department}</div>
                       </Col>
                       <Col xs={6} md={3}>
                          <div className="smallest text-muted mb-1">Added On</div>
                          <div className="font-weight-bold text-dark fs-5">{property.createdAt ? new Date(property.createdAt).toLocaleDateString() : "N/A"}</div>
                       </Col>
                    </Row>
                  </div>
                </div>
              </motion.div>
            </Col>

            <Col lg={4}>
              <motion.div variants={itemVariants} className="modern-card p-4 mb-4 sticky-top" style={{ top: '2rem' }}>
                <h5 className="font-weight-bold mb-4 d-flex align-items-center gap-2"><FaUserTie className="text-success"/> Primary Contact</h5>
                
                <div className="space-y-4">
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 hover-lift">
                    <div className="icon-box bg-white text-success shadow-sm rounded-circle"><FaUserTie size={16}/></div>
                    <div>
                        <div className="smallest text-muted">Manager / Owner</div>
                        <div className="font-weight-bold text-dark">{property.owner}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 hover-lift">
                    <div className="icon-box bg-white text-primary shadow-sm rounded-circle"><FaPhone size={14}/></div>
                    <div>
                        <div className="smallest text-muted">Phone Number</div>
                        <div className="font-weight-bold text-dark">{property.phone}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 hover-lift">
                    <div className="icon-box bg-white text-warning shadow-sm rounded-circle"><FaEnvelope size={14}/></div>
                    <div>
                        <div className="smallest text-muted">Email Address</div>
                        <div className="font-weight-bold text-dark truncate-1" style={{ maxWidth: '180px' }}>{property.email}</div>
                    </div>
                  </div>
                  {property.gstNumber && (
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 hover-lift">
                      <div className="icon-box bg-white text-danger shadow-sm rounded-circle"><FaBuilding size={14}/></div>
                      <div>
                          <div className="smallest text-muted">GST Number</div>
                          <div className="font-weight-bold text-dark font-mono">{property.gstNumber}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-grid mt-5 gap-2">
                  <Button variant="success" className="btn-modern btn-primary-modern py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => window.location.href = `mailto:${property.email}`}><FaEnvelope/> Email Contact</Button>
                  <Button variant="outline-success" className="btn-modern py-2 d-flex align-items-center justify-content-center gap-2" onClick={() => window.location.href = `tel:${property.phone}`}><FaPhone/> Call Manager</Button>
                </div>

                <div className="mt-4 p-3 border-emerald-light bg-emerald-lightest rounded-4 text-center">
                  <p className="smallest text-success mb-0 font-weight-bold">
                    Property ID: HOST-{property.id}-SEC
                  </p>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

export default HostPropertyDetails;

