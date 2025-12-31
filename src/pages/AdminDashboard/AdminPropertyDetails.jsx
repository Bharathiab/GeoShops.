import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Badge, Carousel } from "react-bootstrap";
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone, 
  FaEnvelope, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaClock, 
  FaUserTie,
  FaCheckCircle,
  FaImages,
  FaInfoCircle
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";

const API_URL = 'http://localhost:5000/api';

const AdminPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/properties/details/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch property details");
        }
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <h3 className="text-danger">Error: {error}</h3>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  if (!property) return null;

  // Base URL for images
  const BASE_URL = API_URL.replace('/api', '');

  return (
    <>
      <div className="admin-main-content">
        <AdminNavbar />
        <Container fluid className="p-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4"
          >
            {/* Header Section */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <Button 
                    variant="link" 
                    className="text-decoration-none text-secondary fw-bold p-0 d-flex align-items-center"
                    onClick={() => navigate(-1)}
                >
                    <div className="bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '40px', height: '40px'}}>
                         <FaArrowLeft className="text-primary" />
                    </div>
                    Back to Properties
                </Button>
                <Badge bg={property.status === 'Active' ? 'success' : 'secondary'} className="px-4 py-2 rounded-pill fw-medium fs-6 shadow-sm">
                    {property.status}
                </Badge>
            </div>

            {/* Title & Location Card */}
            <Card className="modern-card border-0 shadow-sm overflow-hidden mb-4">
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                         <Col md={8}>
                             <h2 className="fw-bold text-dark mb-2 display-6">{property.company}</h2>
                             <div className="d-flex align-items-center text-muted">
                                <FaMapMarkerAlt className="me-2 text-danger opacity-75" />
                                <span className="fw-medium">{property.location}</span>
                             </div>
                         </Col>
                         <Col md={4} className="text-md-end mt-3 mt-md-0">
                             <div className="d-inline-flex align-items-center bg-light rounded-pill px-4 py-2">
                                 <FaMoneyBillWave className="text-success me-2" />
                                 <span className="fw-bold text-dark h5 mb-0">₹{property.price || "0"}</span>
                                 <span className="small text-muted ms-1">
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
                    </Row>
                </Card.Body>
            </Card>

            <Row className="g-4">
                {/* Main Content Column */}
                <Col lg={8}>
                    {/* Image Gallery */}
                    <Card className="modern-card border-0 shadow-sm overflow-hidden mb-4">
                        <Card.Header className="bg-white border-bottom py-3 px-4 d-flex align-items-center text-primary fw-bold">
                            <FaImages className="me-2" /> Property Gallery
                        </Card.Header>
                        <div className="bg-light">
                            {property.images && property.images.length > 0 ? (
                                <Carousel interval={null} className="property-carousel">
                                    {property.images.map((img, index) => {
                                        const getImageUrl = (url) => {
                                            if (!url) return "https://via.placeholder.com/800x400?text=No+Image";
                                            if (url.startsWith('http')) return url;
                                            return `${BASE_URL}${url}`;
                                        };

                                        return (
                                            <Carousel.Item key={img.id}>
                                                <div style={{ height: "450px", background: "#eef2f6" }} className="d-flex align-items-center justify-content-center position-relative">
                                                    <img
                                                        className="d-block w-100 h-100"
                                                        src={getImageUrl(img.imageUrl)}
                                                        alt={`Property View ${index + 1}`}
                                                        style={{ objectFit: "cover" }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/800x400?text=Error+Loading+Image"; }}
                                                    />
                                                    <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-dark bg-opacity-50 text-white text-center small">
                                                        Image {index + 1} of {property.images.length}
                                                    </div>
                                                </div>
                                            </Carousel.Item>
                                        );
                                    })}
                                </Carousel>
                            ) : (
                                <div className="text-center p-5">
                                    <div className="text-muted opacity-25 mb-3 display-4"><FaImages /></div>
                                    <p className="text-muted mb-0">No images uploaded for this property.</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Details Tabs/Sections */}
                    <Card className="modern-card border-0 shadow-sm p-4 mb-4">
                        <h5 className="fw-bold text-dark mb-4 border-bottom pb-2 d-flex align-items-center">
                            <FaInfoCircle className="me-2 text-info" /> Description
                        </h5>
                        <p className="text-secondary leading-relaxed mb-4" style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                            {property.description || "No detailed description provided for this property."}
                        </p>

                        <Row className="g-4 mb-2">
                             <Col md={6}>
                                 <h6 className="fw-bold text-dark mb-3">Amenities</h6>
                                 {property.amenities ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {property.amenities.split(',').map((item, i) => (
                                            <Badge key={i} bg="light" text="dark" className="border px-3 py-2 fw-normal">
                                                <FaCheckCircle className="text-success me-1 size-sm" style={{fontSize: '0.8rem'}}/> {item.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                 ) : <span className="text-muted fst-italic">None listed</span>}
                             </Col>
                             <Col md={6}>
                                 <h6 className="fw-bold text-dark mb-3">Features</h6>
                                 {property.features ? (
                                     <div className="d-flex flex-wrap gap-2">
                                         {/* Safe parse if JSON, else split string */}
                                         {(() => {
                                             try {
                                                  // Attempt JSON parse first
                                                  const parsed = JSON.parse(property.features);
                                                  return Array.isArray(parsed) ? parsed.map((f, i) => (
                                                      <Badge key={i} bg="indigo-soft" className="text-indigo px-3 py-2 fw-normal border-0" style={{backgroundColor: '#e0e7ff', color: '#4338ca'}}>
                                                          {f}
                                                      </Badge>
                                                  )) : property.features;
                                              } catch {
                                                  // Fallback to string display
                                                  return property.features.split(',').map((f, i) => (
                                                      <Badge key={i} bg="indigo-soft" className="text-indigo px-3 py-2 fw-normal border-0" style={{backgroundColor: '#e0e7ff', color: '#4338ca'}}>
                                                          {f.trim()}
                                                      </Badge>
                                                  ));
                                              }
                                         })()}
                                     </div>
                                 ) : <span className="text-muted fst-italic">None listed</span>}
                             </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Sidebar Column */}
                <Col lg={4}>
                    {/* Host/Contact Card */}
                    <Card className="modern-card border-0 shadow-sm mb-4">
                        <Card.Header className="text-white border-0 py-3 px-4" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }}>
                            <h5 className="mb-0 fw-bold d-flex align-items-center"><FaUserTie className="me-2" /> Host Details</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="mb-4 text-center">
                                <div className="rounded-circle bg-light border d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                                    <span className="text-primary fw-bold">{property.owner?.charAt(0) || <FaUserTie />}</span>
                                </div>
                                <h5 className="fw-bold text-dark mb-1">{property.owner}</h5>
                                <div className="text-muted small">Property Owner</div>
                            </div>
                            
                            <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                <FaPhone className="text-secondary me-3 fs-5" />
                                <div>
                                    <div className="small text-uppercase fw-bold text-muted" style={{fontSize: '0.7rem'}}>Phone</div>
                                    <div className="fw-medium text-dark">{property.phone}</div>
                                </div>
                            </div>
                            
                            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                                <FaEnvelope className="text-secondary me-3 fs-5" />
                                <div>
                                    <div className="small text-uppercase fw-bold text-muted" style={{fontSize: '0.7rem'}}>Email</div>
                                    <div className="fw-medium text-dark">{property.email}</div>
                                </div>
                            </div>

                            <Button variant="primary" className="w-100 rounded-pill py-2 shadow-sm d-flex align-items-center justify-content-center" href={`tel:${property.phone}`}>
                                <FaPhone className="me-2" /> Contact Host
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Quick Info Card */}
                    <Card className="modern-card border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">Property Info</h6>
                            <div className="mb-3 d-flex justify-content-between">
                                <span className="text-muted small"><FaBuilding className="me-2"/> Department</span>
                                <span className="fw-medium text-dark">{property.department}</span>
                            </div>
                             <div className="mb-3 d-flex justify-content-between">
                                <span className="text-muted small"><FaStar className="me-2 text-warning"/> Rating</span>
                                <span className="fw-medium text-dark">{property.rating || "N/A"}</span>
                            </div>
                            <div className="mb-3 d-flex justify-content-between">
                                <span className="text-muted small"><FaClock className="me-2"/> Listed On</span>
                                <span className="fw-medium text-dark">{property.createdAt ? new Date(property.createdAt).toLocaleDateString() : "N/A"}</span>
                            </div>
                             {property.gstNumber && (
                                <div className="mb-0 d-flex justify-content-between">
                                    <span className="text-muted small">GST No.</span>
                                    <span className="fw-medium text-dark small">{property.gstNumber}</span>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

          </motion.div>
        </Container>
      </div>
    </>
  );
};

export default AdminPropertyDetails;
