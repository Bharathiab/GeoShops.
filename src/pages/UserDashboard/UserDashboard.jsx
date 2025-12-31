import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge
} from "react-bootstrap";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaPlus,
  FaArrowLeft,
  FaIdCard,
  FaEye,
  FaFilter,
  FaHeart
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import UserNavbar from "../../components/user/UserNavbar";
import CityCarousel from "./CityCarousel";
import DashboardOffers from "./DashboardOffers";
import Flagship from "./Flagship";
import "bootstrap/dist/css/bootstrap.min.css";

import Getitnow from "./Getitnow";
import Footer from "./Footer";
import { fetchProperties, createBooking, fetchHostDesigns, createMembershipRequest } from "../../api";

const UserDashboard = ({ department }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(department || "Hotel");
  const [properties, setProperties] = useState([]);

  // Membership Request State
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [hostDesigns, setHostDesigns] = useState([]);
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [selectedHostId, setSelectedHostId] = useState(null);

  // Property Details Modal State
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/user/hotel") setSelectedDepartment("Hotel");
    else if (path === "/user/hospital") setSelectedDepartment("Hospital");
    else if (path === "/user/salon") setSelectedDepartment("Salon");
    else if (path === "/user/cab") setSelectedDepartment("Cab");
    else setSelectedDepartment(department || "Hotel");
  }, [location.pathname, department]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const departments = ['Hotel', 'Salon', 'Hospital', 'Cab'];
        const propertyPromises = departments.map(dept => fetchProperties(dept));
        const results = await Promise.all(propertyPromises);

        const finalProperties = [];
        results.forEach((deptProps, index) => {
          const deptName = departments[index];
          deptProps.forEach(p => {
            if (p.status !== 'Inactive') {
              finalProperties.push({
                ...p,
                id: p.id,
                hostId: p.hostId,
                department: deptName
              });
            }
          });
        });
        setProperties(finalProperties);
      } catch (error) {
        console.error("Error loading properties:", error);
      }
    };
    loadProperties();
  }, []);

  const filteredProperties = properties.filter(
    (property) =>
      property.department === selectedDepartment &&
      (property.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBook = (property) => {
    const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
    if (!userLoginData.userId) {
      if (window.confirm("You need to login to book a property. Proceed to login?")) {
        navigate("/user-login");
      }
      return;
    }
    navigate(`/user/booking/${property.department}/${property.id}`);
  };

  const handleConfirmBooking = async () => {
    // Logic removed as it's now handled by UserBookingPage.jsx
  };

  const resetForm = () => {
    // Logic removed
  };

  const handleRequestMembership = async (hostId) => {
    const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
    if (!userLoginData.userId) {
      if (window.confirm("Please login to request a membership card! Proceed to login?")) {
        navigate("/user-login");
      }
      return;
    }
    setSelectedHostId(hostId);
    try {
      const designs = await fetchHostDesigns(hostId);
      setHostDesigns(designs);
      setShowMembershipModal(true);
    } catch (error) {
      console.error("Error fetching designs:", error);
      alert("Failed to load membership options.");
    }
  };

  const submitMembershipRequest = async () => {
    const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
    if (!selectedDesignId) {
      alert("Please select a membership card design.");
      return;
    }

    try {
      await createMembershipRequest({
        userId: userLoginData.userId,
        hostId: selectedHostId,
        cardDesignId: selectedDesignId
      });
      alert("Membership request sent successfully!");
      setShowMembershipModal(false);
      setSelectedDesignId("");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send membership request.");
    }
  };

  const handleDepartmentChange = (department) => {
    if (department === "Home") navigate("/user");
    else navigate(`/user/${department.toLowerCase()}`);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <UserNavbar selectedDepartment={selectedDepartment} onDepartmentChange={handleDepartmentChange} />
      
      {/* Premium Hero Section */}
      <div className="modern-hero" style={{
        background: "linear-gradient(135deg, rgba(0, 44, 34, 0.95) 0%, rgba(15, 118, 110, 0.9) 100%)",
        minHeight: "450px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "100px 0",
        borderRadius: "0 0 80px 80px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
      }}>
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", top: "-100px", left: "-100px", width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)", pointerEvents: "none"
          }}
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", bottom: "-100px", right: "-100px", width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(15, 118, 110, 0.2) 0%, transparent 70%)",
            filter: "blur(80px)", pointerEvents: "none"
          }}
        />

        <Container>
          <div className="hero-content text-center position-relative z-index-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Badge bg="transparent" className="px-3 py-2 mb-4 border border-white border-opacity-20 rounded-pill backdrop-blur" style={{ letterSpacing: '2px' }}>
                <span className="text-gold fw-bold">EXPERIENCE EXCELLENCE</span>
              </Badge>
              <h1 className="display-3 fw-extra-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Find Your <span className="text-gradient">Premium</span> {selectedDepartment}
              </h1>
              <p className="lead text-white text-opacity-80 mb-5 mx-auto" style={{ maxWidth: '650px' }}>
                Discover hand-picked {selectedDepartment.toLowerCase()}s with world-class amenities and unparalleled comfort.
              </p>
              
              <div className="search-container-modern mx-auto">
                <div className="glass-search-box">
                  <FaSearch className="search-icon-modern" />
                  <input
                    type="text"
                    placeholder={`Where are you heading? Search ${selectedDepartment.toLowerCase()}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button className="btn-vibrant-gold rounded-pill px-5 py-3 fw-bold">
                    EXPLORE
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      <DashboardOffers />

      <Container fluid className="px-lg-5" style={{ marginTop: "60px", paddingBottom: "80px" }}>
        <div className="section-header-modern mb-5">
           <motion.h2 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="fw-bold" 
             style={{ color: "#002C22", fontSize: '2.5rem' }}
           >
             Top Recommended {selectedDepartment}s
           </motion.h2>
           <motion.div 
             initial={{ width: 0 }}
             whileInView={{ width: 80 }}
             transition={{ delay: 0.2, duration: 0.8 }}
             className="emerald-accent-line"
           ></motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDepartment + searchTerm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {filteredProperties.length === 0 ? (
              <div className="text-center py-5">
                <motion.h4 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="text-muted"
                >
                  No properties found.
                </motion.h4>
              </div>
            ) : (
              <div className="properties-scroll-container" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "2rem",
                padding: "1rem"
              }}>
                {filteredProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                        duration: 0.5, 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                  >
                    <Card className="modern-property-card">
                      <div className="card-media-wrapper">
                        <Card.Img 
                          variant="top" 
                          src={property.imageUrl} 
                          className="property-main-img"
                        />
                        <div className="property-overlay">
                           <div className="overlay-top">
                              <Badge className="rating-pill">
                                <FaStar className="me-1 text-warning" /> {property.rating || "4.8"}
                              </Badge>
                              <motion.button 
                                whileHover={{ scale: 1.2, backgroundColor: "#ef4444", borderColor: "#ef4444" }}
                                whileTap={{ scale: 0.9 }}
                                className="wishlist-btn"
                              >
                                <FaHeart />
                              </motion.button>
                           </div>
                           <div className="overlay-bottom">
                             <div className="price-tag">₹{property.price} <small>/ night</small></div>
                           </div>
                        </div>
                      </div>

                      <Card.Body className="property-details-body">
                        <div className="property-category">{property.department}</div>
                        <Card.Title className="property-name">{property.company}</Card.Title>
                        
                        <div className="property-location">
                          <FaMapMarkerAlt className="text-emerald" />
                          <span>{property.location}</span>
                        </div>

                        <p className="property-desc">
                          {property.description || "Indulge in a premium experience with state-of-the-art facilities and exceptional hospitality."}
                        </p>

                        <div className="property-actions-modern">
                          <Button 
                            className="btn-book-modern"
                            onClick={() => handleBook(property)}
                          >
                             Secure Booking
                          </Button>
                          <motion.button 
                            whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                            whileTap={{ scale: 0.9 }}
                            className="btn-info-modern"
                            onClick={() => navigate(`/user/property-details/${property.department}/${property.id}`)}
                          >
                            <FaEye className="text-primary" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1, backgroundColor: "#fffbeb", borderColor: "#fbbf24" }}
                            whileTap={{ scale: 0.9 }}
                            className="btn-membership-modern"
                            onClick={() => handleRequestMembership(property.hostId)}
                          >
                             <FaIdCard className="text-warning" />
                          </motion.button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>

      {selectedDepartment === "Hotel" && <Flagship />}
      {selectedDepartment === "Hotel" && <CityCarousel />}
      
      <div className="py-5"></div>

      <Getitnow />
      <Footer />

      {/* Selection Modal - Redesigned for Premium Experience */}
      <Modal 
        show={showMembershipModal} 
        onHide={() => setShowMembershipModal(false)} 
        centered 
        size="lg"
        className="selection-modal-v2"
      >
        <Modal.Body className="p-0 border-0 bg-transparent">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="selection-modal-content overflow-hidden"
          >
            {/* Premium Header */}
            <div className="modal-premium-header">
                <div className="d-flex justify-content-between align-items-center w-100 px-5 py-4">
                    <motion.div
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.2 }}
                    >
                       <h2 className="fw-900 mb-1 font-heading text-white">Select <span className="text-gold">Membership</span></h2>
                       <p className="text-white opacity-60 small tracking-widest uppercase mb-0">CHOOSE YOUR ELITE PATH</p>
                    </motion.div>
                    <Button variant="link" className="text-white opacity-50 p-0 hover-rotate" onClick={() => setShowMembershipModal(false)}>
                       <FaPlus size={24} style={{ transform: 'rotate(45deg)' }} />
                    </Button>
                </div>
            </div>

            <div className="p-5">
              {hostDesigns.length === 0 ? (
                <div className="text-center py-5 text-white opacity-50">
                    <FaIdCard size={50} className="mb-3 opacity-20" />
                    <p>No membership plans available for this property.</p>
                </div>
              ) : (
                 <Row className="g-4">
                   {hostDesigns.map((design, index) => (
                     <Col md={6} key={design.id}>
                        <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1 * (index + 1) }}
                           className={`membership-selection-card-v2 ${selectedDesignId === design.id ? "selected" : ""}`}
                           onClick={() => setSelectedDesignId(design.id)}
                        >
                           <div 
                               className="digital-card-preview-v2 mb-0"
                               style={{ 
                                   background: design.backgroundGradient || design.cardColor || design.background_gradient || design.card_color || "#1e293b",
                                   boxShadow: selectedDesignId === design.id ? `0 20px 40px -10px ${design.cardColor || design.card_color || '#fbbf24'}88` : `0 10px 20px rgba(0,0,0,0.2)`
                               }}
                           >
                               <div className="card-shine-v2"></div>
                               <div className="glass-reflection"></div>
                               <div className="d-flex justify-content-between align-items-start h-100 flex-column position-relative z-1">
                                   <div className="w-100">
                                       <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="smart-chip-mini"></div>
                                            <FaCrown className="text-gold opacity-80" />
                                       </div>
                                       <div className="d-flex justify-content-between align-items-center">
                                           <h5 className="fw-900 mb-0 text-truncate font-heading text-white">{design.cardName || design.card_name}</h5>
                                           <div className="premium-price-badge">₹{design.price || "Free"}</div>
                                       </div>
                                       <small className="opacity-60 fw-bold tracking-widest fs-9 text-uppercase mt-1 d-block">
                                           {design.cardLevel || design.card_level} ELITE
                                       </small>
                                   </div>
                                   <div className="w-100 d-flex justify-content-between align-items-end">
                                       <span className="font-monospace fs-9 opacity-70 tracking-widest text-white uppercase">{design.validityDays || design.validity_days} DAYS VALIDITY</span>
                                       {selectedDesignId === design.id && (
                                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="selection-checkmark-v2">
                                               <FaCheckCircle size={24} className="text-white" />
                                           </motion.div>
                                       )}
                                   </div>
                               </div>
                           </div>
                        </motion.div>
                     </Col>
                   ))}
                 </Row>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-premium-footer p-4 d-flex justify-content-center gap-3">
              <Button 
                variant="link" 
                className="text-white opacity-60 text-decoration-none fw-bold tracking-widest fs-9"
                onClick={() => setShowMembershipModal(false)}
              >
                BACK TO PROPERTY
              </Button>
              <Button 
                className="btn-confirm-selection" 
                disabled={!selectedDesignId} 
                onClick={submitMembershipRequest}
              >
                {loading ? "INITIALIZING..." : "CONFIRM SELECTION"}
              </Button>
            </div>
          </motion.div>
        </Modal.Body>
      </Modal>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

        .fw-extra-bold { font-weight: 800; }
        .text-gradient {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .backdrop-blur {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        /* Search Section */
        .search-container-modern {
            max-width: 800px;
        }
        
        .glass-search-box {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 100px;
            padding: 10px 10px 10px 30px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-search-box:focus-within {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(251, 191, 36, 0.4);
            transform: translateY(-5px);
        }

        .search-icon-modern {
            color: #fbbf24;
            font-size: 1.4rem;
        }

        .glass-search-box input {
            background: transparent;
            border: none;
            outline: none;
            color: white;
            flex: 1;
            font-size: 1.1rem;
            font-weight: 500;
        }
        
        .glass-search-box input::placeholder {
            color: rgba(255,255,255,0.5);
        }

        .btn-vibrant-gold {
            background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
            border: none;
            color: #000;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(251, 191, 36, 0.2);
        }

        .btn-vibrant-gold:hover {
            transform: scale(1.05);
            box-shadow: 0 15px 30px rgba(251, 191, 36, 0.4);
            color: #000;
            background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
        }

        /* Section Header */
        .section-header-modern {
            text-align: left;
            position: relative;
        }
        .emerald-accent-line {
            width: 80px;
            height: 6px;
            background: linear-gradient(90deg, #0f766e, #fbbf24);
            border-radius: 10px;
            margin-top: 15px;
        }

        /* Property Card Redesign */
        .modern-property-card {
            border: none !important;
            border-radius: 28px !important;
            background: white !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .modern-property-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.12) !important;
        }

        .card-media-wrapper {
            position: relative;
            height: 260px;
            overflow: hidden;
        }

        .property-main-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.8s ease;
        }

        .modern-property-card:hover .property-main-img {
            transform: scale(1.15);
        }

        .property-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%);
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .overlay-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .rating-pill {
            background: rgba(255, 255, 255, 0.95) !important;
            color: #1e293b !important;
            padding: 8px 14px !important;
            border-radius: 50px !important;
            font-weight: 700 !important;
            display: flex !important;
            align-items: center !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .wishlist-btn {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .wishlist-btn:hover {
            background: #ef4444;
            border-color: #ef4444;
        }

        .price-tag {
            color: #fff;
            font-size: 1.6rem;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .price-tag small {
            font-size: 0.9rem;
            font-weight: 400;
            opacity: 0.8;
        }

        .property-details-body {
            padding: 1.8rem !important;
        }

        .property-category {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #0f766e;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .property-name {
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            color: #1e293b !important;
            margin-bottom: 12px !important;
        }

        .property-location {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            font-size: 0.95rem;
            margin-bottom: 15px;
        }
        .property-location svg { color: #ef4444; }

        .property-desc {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 25px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .property-actions-modern {
            display: flex;
            gap: 12px;
            margin-top: auto;
        }

        .btn-book-modern {
            flex: 1;
            background: #002C22 !important;
            border: none !important;
            padding: 12px !important;
            border-radius: 14px !important;
            font-weight: 700 !important;
            transition: all 0.3s ease !important;
        }

        .btn-book-modern:hover {
            background: #0f766e !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(15, 118, 110, 0.2) !important;
        }

        .btn-info-modern, .btn-membership-modern {
            width: 50px;
            height: 50px;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            background: #fff;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .btn-info-modern:hover {
            background: #f0fdfa;
            color: #0f766e;
            border-color: #0f766e;
        }

        .btn-membership-modern:hover {
            background: #fffbeb;
            color: #fbbf24;
            border-color: #fbbf24;
        }

        /* Selection Modal Enhancements */
        .membership-selection-card {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 28px;
            padding: 4px;
        }
        .membership-selection-card:hover {
            transform: translateY(-5px);
        }
        .membership-selection-card.selected {
            transform: scale(1.02);
        }

        .digital-card-preview-v2 {
            height: 180px;
            border-radius: 24px;
            padding: 20px;
            color: white;
            position: relative;
            overflow: hidden;
            z-index: 1;
            transition: all 0.3s ease;
        }

        .card-shine-v2 {
            position: absolute;
            inset: 0;
            background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
            filter: blur(20px);
            animation: card-glow 6s infinite linear;
        }

        @keyframes card-glow {
            0% { transform: translateX(-100%) }
            20% { transform: translateX(200%) }
            100% { transform: translateX(200%) }
        }

        .glass-reflection {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
            pointer-events: none;
        }

        .smart-chip-mini {
            width: 35px;
            height: 25px;
            background: linear-gradient(135deg, #fbbf24, #d97706);
            border-radius: 6px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
        }

        .selection-checkmark {
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }

        .vault-modal-content {
            background: linear-gradient(165deg, #001A14 0%, #002C22 100%);
            border-radius: 50px;
            border: 1px solid rgba(255,255,255,0.15);
            backdrop-filter: blur(50px);
            box-shadow: 0 50px 100px rgba(0,0,0,0.6);
        }

        .premium-digital-card-v2 {
            width: 100%;
            max-width: 480px;
            height: 320px;
            border-radius: 35px;
            padding: 40px;
            color: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.9);
            perspective: 1200px;
            transform-style: preserve-3d;
        }

        .glass-glare {
            position: absolute;
            inset: 0;
            background: linear-gradient(115deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%);
            z-index: 2;
        }

        .holographic-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            opacity: 0.5;
            z-index: 1;
            pointer-events: none;
        }

        .pro-smart-chip {
            width: 60px;
            height: 45px;
            background: linear-gradient(135deg, #ffd700, #daa520);
            border-radius: 10px;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.4), 0 5px 15px rgba(218, 165, 32, 0.3);
        }

        .shimmer-sweep {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.2),
                transparent
            );
            transform: skewX(-20deg);
            animation: shimmer 3s infinite;
            z-index: 3;
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 200%; }
        }

        .card-number-v2 {
            font-family: 'Outfit', sans-serif;
            letter-spacing: 8px;
            font-weight: 500;
            text-shadow: 0 4px 15px rgba(0,0,0,0.6);
            font-size: 1.5rem;
        }

        .badge-elite-vault {
            display: inline-block;
            padding: 8px 20px;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 100px;
            font-weight: 900;
            font-size: 0.75rem;
            letter-spacing: 3px;
        }

        .pulse-dot {
            width: 10px;
            height: 10px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 2s infinite;
            box-shadow: 0 0 15px #22c55e;
        }

        @keyframes pulse {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.8); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        .tracking-widest { letter-spacing: 4px; }
        .tracking-tighter { letter-spacing: -0.5px; }
        .fs-9 { font-size: 0.65rem; }
        .fs-8 { font-size: 0.85rem; }
        .font-heading { font-family: 'Outfit', sans-serif; }
        /* Selection Modal V2 */
        .selection-modal-v2 .modal-content {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        .selection-modal-content {
            background: #001A14;
            border-radius: 40px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 40px 100px rgba(0,0,0,0.8);
        }

        .modal-premium-header {
            background: linear-gradient(135deg, #002C22 0%, #001A14 100%);
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .membership-selection-card-v2 {
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            border-radius: 30px;
        }

        .membership-selection-card-v2:hover {
            transform: translateY(-10px) scale(1.02);
        }

        .membership-selection-card-v2.selected {
            transform: scale(1.05);
            z-index: 2;
        }

        .premium-price-badge {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 6px 15px;
            border-radius: 100px;
            color: white;
            font-weight: 800;
            font-size: 0.85rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .selection-checkmark-v2 {
            background: #22c55e;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 20px rgba(34, 197, 94, 0.4);
            border: 3px solid rgba(255,255,255,0.2);
        }

        .modal-premium-footer {
            background: rgba(255,255,255,0.02);
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .btn-confirm-selection {
            background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%) !important;
            border: none !important;
            color: #000 !important;
            font-weight: 800 !important;
            padding: 12px 40px !important;
            border-radius: 100px !important;
            letter-spacing: 2px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3) !important;
        }

        .btn-confirm-selection:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(251, 191, 36, 0.5) !important;
            background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%) !important;
        }

        .btn-confirm-selection:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            filter: grayscale(1);
        }

        .hover-rotate {
            transition: transform 0.4s ease;
        }
        .hover-rotate:hover {
            transform: rotate(90deg);
        }

        .uppercase-tracking { letter-spacing: 2px; text-transform: uppercase; }
        .text-gold { color: #fbbf24; }
      `}</style>
    </div>
  );
};

export default UserDashboard;
