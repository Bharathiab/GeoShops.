// Modernized Membership Request Page
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Toast,
  ToastContainer,
  Badge,
  Form,
  Spinner,
  Modal,
  Alert
} from "react-bootstrap";
import { FaArrowLeft, FaIdCard, FaMapMarkerAlt, FaCheckCircle, FaSearch, FaHistory, FaStar, FaEye, FaClock, FaBan, FaCrown, FaTimesCircle, FaFilter, FaBuilding, FaLayerGroup, FaPlus } from 'react-icons/fa';
import { getPropertyImage, handleImageError } from '../../utils/imageUtils';
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/user/UserNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchAllProperties, createMembershipRequest, fetchUserMembershipRequests, fetchDepartments, fetchHostCardDesigns } from "../../api";
import axios from "axios";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";

const UserMembershipRequest = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const [loading, setLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCardDesign, setSelectedCardDesign] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [userName, setUserName] = useState("Elite Member");

  // Card selection modal state
  const [showCardSelectionModal, setShowCardSelectionModal] = useState(false);
  const [availableCards, setAvailableCards] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedCardForRequest, setSelectedCardForRequest] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [selectedCardPrice, setSelectedCardPrice] = useState(0);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
      if (!userLoginData.userId) {
        navigate("/user-login");
        return;
      }
      setUserId(userLoginData.userId);
      setUserName(userLoginData.fullName || userLoginData.username || "Elite Member");
      try {
        const [allProperties, userRequests, allDepartments] = await Promise.all([
          fetchAllProperties(),
          fetchUserMembershipRequests(userLoginData.userId),
          fetchDepartments()
        ]);

        setProperties(allProperties);
        setFilteredProperties(allProperties);
        setRequests(userRequests.sort((a, b) => b.id - a.id));
        setDepartments(allDepartments);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    let result = properties;

    if (selectedDepartment !== "All") {
      result = result.filter(property => property.department === selectedDepartment);
    }
    
    if (searchTerm) {
      result = result.filter(property => 
        property.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProperties(result);
  }, [selectedDepartment, searchTerm, properties]);

  const handleRequestMembership = async (property) => {
    setSelectedProperty(property);
    setCardsLoading(true);
    setShowCardSelectionModal(true);
    try {
      const cards = await fetchHostCardDesigns(property.hostId);
      setAvailableCards(cards);
    } catch (error) {
      console.error("Error fetching card designs:", error);
      setToastMessage("Failed to load available cards.");
      setToastVariant("danger");
      setShowToast(true);
      setShowCardSelectionModal(false);
    } finally {
      setCardsLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedCardForRequest) {
      setToastMessage("Please select a card design");
      setToastVariant("warning");
      setShowToast(true);
      return;
    }

    setRequesting(true);
    try {
      const requestData = {
        userId: userId,
        hostId: selectedProperty.hostId,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.company,
        cardDesignId: selectedCardForRequest
      };
      
      const createdRequest = await createMembershipRequest(requestData);

      if (selectedCardPrice && parseFloat(selectedCardPrice) > 0) {
          const requestId = createdRequest.data ? createdRequest.data.id : createdRequest.id;
          if (!requestId) {
             setToastMessage("Created request but failed to get ID for payment.");
             setToastVariant("danger");
             setShowToast(true);
             return;
          }

          navigate('/user/membership-payment', {
              state: {
                  requestId: requestId,
                  cardName: availableCards.find(c => c.id === selectedCardForRequest)?.cardName,
                  price: selectedCardPrice,
                  propertyName: selectedProperty.company,
                  cardDesign: availableCards.find(c => c.id === selectedCardForRequest)
              }
          });
      } else {
          const updatedRequests = await fetchUserMembershipRequests(userId);
          setRequests(updatedRequests);
          setToastMessage("Membership request submitted successfully!");
          setToastVariant("success");
          setShowToast(true);
      }
      setShowCardSelectionModal(false);
      setSelectedCardForRequest(null);
      setSelectedProperty(null);
    } catch (error) {
      console.error("Error submitting membership request:", error);
      setToastMessage("Failed to submit request. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setRequesting(false);
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      Hotel: "#f43f5e",    // Rose
      Salon: "#10b981",    // Emerald
      Hospital: "#3b82f6", // Blue
      Cab: "#f59e0b",      // Amber
      default: "#6366f1"   // Indigo
    };
    return colors[department] || colors.default;
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="req-badge req-pending"><FaClock size={12} /> Pending</span>;
      case "Approved":
        return <span className="req-badge req-approved"><FaCheckCircle size={12} /> Approved</span>;
      case "Rejected":
        return <span className="req-badge req-rejected"><FaTimesCircle size={12} /> Rejected</span>;
      case "Pending Payment":
        return <span className="req-badge req-payment"><FaIdCard size={12} /> Payment Due</span>;
      default:
        return <span className="req-badge text-muted border">{status}</span>;
    }
  };

  const handleViewCard = async (request, overridePropertyName = null) => {
    if (!request || (!request.cardDesignId && !request.card_design_id)) return;
    const cardDesignId = request.card_design_id || request.cardDesignId;
    const propertyName = overridePropertyName || request.property_name || request.propertyName;
    
    setCardLoading(true);
    setViewingRequest(request);
    setShowCardModal(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/membership/cards/designs/${cardDesignId}`);
      setSelectedCardDesign({ ...response.data, propertyName });
    } catch (error) {
      console.error("Error fetching card design:", error);
      setToastMessage("Failed to load membership card.");
      setToastVariant("danger");
      setShowToast(true);
      setShowCardModal(false);
    } finally {
      setCardLoading(false);
    }
  };

  return (
    <div style={{ 
        background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)", 
        minHeight: "100vh", 
        paddingBottom: "4rem" 
    }}>
      <UserNavbar />
      
      <div className="membership-header-premium position-relative overflow-hidden">
         <Container className="position-relative z-index-1">
            <Row className="align-items-center py-5">
               <Col md={7}>
                 <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                 >
                    <Badge className="px-3 py-2 mb-3 border border-white border-opacity-20 rounded-pill backdrop-blur-strong bg-white bg-opacity-10">
                       <span className="text-gold fw-bold tracking-wider fs-8">ELITE ACCESS</span>
                    </Badge>
                    <h1 className="fw-900 display-3 text-white mb-3 font-heading" style={{ letterSpacing: '-2px', lineHeight: '1' }}>
                      Premium <span className="text-gradient-gold">Memberships</span>
                    </h1>
                    <p className="lead text-white text-opacity-80 mb-0 mw-500">
                      Join exclusive circles and unlock a world of elite privileges across our premium partner network.
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
                            placeholder="Find elite opportunities..." 
                            className="glass-input-v2" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                       </div>
                    </div>
                 </motion.div>
               </Col>
            </Row>
         </Container>
         
         {/* Decorative Elements */}
         <div className="hero-orb hero-orb-1"></div>
         <div className="hero-orb hero-orb-2"></div>
      </div>

      <Container>
         {/* Modern Filter Pills */}
         <div className="d-flex align-items-center gap-3 mb-5 flex-wrap">
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className={`filter-pill-modern ${selectedDepartment === "All" ? "active" : ""}`}
               onClick={() => setSelectedDepartment("All")}
            >
              Discover All
            </motion.button>
            {departments.map((dept) => (
              <motion.button
                key={dept.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`filter-pill-modern ${selectedDepartment === dept.name ? "active" : ""}`}
                style={selectedDepartment === dept.name ? { backgroundColor: getDepartmentColor(dept.name), borderColor: getDepartmentColor(dept.name) } : {}}
                onClick={() => setSelectedDepartment(dept.name)}
              >
                {dept.name}
              </motion.button>
            ))}
         </div>

         {loading ? (
             <div className="text-center py-5">
               <Spinner animation="grow" variant="primary" />
               <p className="text-muted mt-3">Loading properties...</p>
             </div>
         ) : filteredProperties.length === 0 ? (
             <div className="text-center py-5 card border-0 shadow-sm rounded-4">
                <div className="card-body py-5">
                   <FaIdCard size={60} className="text-muted opacity-25 mb-3" />
                   <h4>No Properties Found</h4>
                   <p className="text-muted">Try adjusting your filters or search query.</p>
                </div>
             </div>
         ) : (
            <Row className="g-4">
               <AnimatePresence>
                 {filteredProperties.map((property, index) => {
                    const request = requests.find(r => 
                       (r.property_id === property.id || r.propertyId === property.id) && 
                       (r.host_id === property.hostId || r.hostId === property.hostId)
                    );

                    return (
                       <Col key={property.id} lg={4} md={6}>
                          <motion.div
                             initial={{ opacity: 0, y: 30 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.9 }}
                             transition={{ duration: 0.3, delay: index * 0.05 }}
                             layout
                          >
                             <Card className="modern-property-card">
                                <div className="card-media-wrapper">
                                   <Card.Img 
                                      variant="top" 
                                      src={getPropertyImage(property.imageUrl || property.image_url || property.imagePath || property.image, property.department)}
                                      className="property-main-img"
                                      onError={(e) => handleImageError(e, property.department)}
                                   />
                                   <div className="property-overlay">
                                      <div className="overlay-top">
                                         <Badge className="rating-pill">
                                           <FaStar className="me-1" /> 4.8
                                         </Badge>
                                      </div>
                                      <div className="overlay-bottom">
                                         <Badge 
                                            className="dept-overlay-badge" 
                                            style={{ backgroundColor: getDepartmentColor(property.department) }}
                                         >
                                            {property.department}
                                         </Badge>
                                      </div>
                                   </div>
                                </div>
                                
                                <Card.Body className="property-details-body d-flex flex-column">
                                   <h4 className="property-name h5 mb-2">{property.company}</h4>
                                   <div className="property-location mb-3">
                                      <FaMapMarkerAlt />
                                      <span>{property.location}</span>
                                   </div>
                                   <p className="property-desc flex-grow-1">
                                      {property.description || "Unlock premium benefits by becoming a member of this exclusive property."}
                                   </p>

                                   <div className="property-actions-modern mt-auto w-100">
                                      {request && request.status === "Pending" ? (
                                           request.payment_status === "Pending Payment" ? (
                                              <Button 
                                                 className="btn-book-modern w-100 bg-warning text-dark border-0"
                                                 onClick={() => navigate('/user/membership-payment', { state: { requestId: request.id, price: request.card_price, propertyName: property.company } })}
                                              >
                                                 Complete Payment
                                              </Button>
                                           ) : (
                                              <Button className="btn-book-modern w-100 opacity-50" disabled>
                                                 <FaCheckCircle className="me-2" /> Pending Approval
                                              </Button>
                                           )
                                      ) : request && request.status === "Approved" ? (
                                         <Button className="btn-book-modern w-100 bg-success border-0" onClick={() => handleViewCard(request, property.company)}>
                                            <FaEye className="me-2" /> View Elite Card
                                         </Button>
                                      ) : (
                                         <Button 
                                            className="btn-book-modern w-100"
                                            onClick={() => handleRequestMembership(property)}
                                         >
                                            <FaIdCard className="me-2" /> Join Membership
                                         </Button>
                                      )}
                                   </div>
                                </Card.Body>
                             </Card>
                          </motion.div>
                       </Col>
                    );
                 })}
               </AnimatePresence>
            </Row>
         )}
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 pt-5 px-3"
         >
            <div className="d-flex align-items-center justify-content-between mb-5">
               <div>
                  <h2 className="fw-900 text-dark mb-1 font-heading">My Membership <span className="text-gradient-emerald">Journey</span></h2>
                  <p className="text-muted small tracking-widest uppercase mb-0">REAL-TIME STATUS OF YOUR ELITE APPLICATIONS</p>
               </div>
               <Badge bg="white" text="dark" className="border shadow-sm px-3 py-2 rounded-pill fw-bold text-emerald">
                  {requests.length} REQUESTS
               </Badge>
            </div>

            {requests.length === 0 ? (
               <div className="text-center py-5 bg-white bg-opacity-50 rounded-4 border-dashed">
                  <FaClock size={50} className="text-muted opacity-20 mb-3" />
                  <p className="text-muted fw-bold tracking-widest uppercase fs-9">No membership activity yet. Explore properties above.</p>
               </div>
            ) : (
               <div className="membership-requests-container">
                  <AnimatePresence>
                     {requests.map((req, idx) => (
                        <motion.div 
                           key={req.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.8)" }}
                           className="membership-request-card-premium shadow-sm border-0"
                        >
                           <div className="d-flex flex-wrap align-items-center w-100">
                              {/* Property Block */}
                              <div className="req-block property-block">
                                 <div className="req-icon-box bg-emerald-light">
                                    <FaBuilding className="text-emerald" />
                                 </div>
                                 <div className="ms-3">
                                    <div className="text-muted fs-9 fw-bold uppercase-tracking">PROPERTY</div>
                                    <div className="fw-900 text-dark fs-6 text-truncate" style={{ maxWidth: '180px' }}>
                                       {req.property_name || req.propertyName || "Elite Partner"}
                                    </div>
                                 </div>
                              </div>

                              {/* Plan Block */}
                              <div className="req-block plan-block">
                                 <div className="req-icon-box bg-gold-light">
                                    <FaLayerGroup className="text-gold" />
                                 </div>
                                 <div className="ms-3">
                                    <div className="text-muted fs-9 fw-bold uppercase-tracking">MEMBERSHIP PLAN</div>
                                    <div className="d-flex align-items-center gap-2">
                                       <span className="fw-900 text-dark">{req.card_level || req.cardLevel || "Standard"}</span>
                                       <span className="badge-level-mini">LVL {req.card_design_id || "N/A"}</span>
                                    </div>
                                 </div>
                              </div>

                              {/* Status Block */}
                              <div className="req-block status-block flex-grow-1">
                                 <div className="ms-4">
                                    <div className="text-muted fs-9 fw-bold uppercase-tracking mb-1">CURRENT STATUS</div>
                                    {renderStatusBadge(req.status)}
                                 </div>
                              </div>

                              {/* Date Block */}
                              <div className="req-block date-block px-4">
                                 <div className="text-end">
                                    <div className="text-muted fs-9 fw-bold uppercase-tracking mb-1">APPLIED ON</div>
                                    <div className="text-dark fw-bold small">
                                       {new Date(req.createdAt || req.created_at || new Date()).toLocaleDateString(undefined, {
                                          day: '2-digit', month: 'short', year: 'numeric'
                                       })}
                                    </div>
                                 </div>
                              </div>

                              {/* Action Block */}
                              <div className="req-block action-block ps-4 border-start border-light">
                                 {req.status === "Approved" ? (
                                    <Button 
                                       className="btn-vault-view-modern"
                                        onClick={() => handleViewCard(req)}
                                     >
                                        <FaEye className="me-2" /> VIEW VAULT
                                    </Button>
                                 ) : (
                                    <div className="status-timeline-indicator">
                                        <span className="dot pulse-emerald"></span>
                                        <span className="text-muted fs-9 fw-bold">PROCESSING</span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            )}
         </motion.div>
      </Container>


      {/* Selection Modal - Redesigned for Premium Experience */}
      <Modal 
        show={showCardSelectionModal} 
        onHide={() => setShowCardSelectionModal(false)} 
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
                       <p className="text-white opacity-60 small tracking-widest uppercase mb-0">CHOOSE YOUR ELITE PATH FOR {selectedProperty?.company}</p>
                    </motion.div>
                    <Button variant="link" className="text-white opacity-50 p-0 hover-rotate" onClick={() => setShowCardSelectionModal(false)}>
                       <FaPlus size={24} style={{ transform: 'rotate(45deg)' }} />
                    </Button>
                </div>
            </div>

            <div className="p-5">
              {cardsLoading ? (
                  <div className="text-center py-5">
                      <Spinner animation="border" variant="success" />
                  </div>
              ) : availableCards.length === 0 ? (
                  <div className="text-center py-5 text-white opacity-50">
                      <FaIdCard size={50} className="mb-3 opacity-20" />
                      <p>No membership plans available for this property.</p>
                  </div>
              ) : (
                 <Row className="g-4">
                   {availableCards.map((card, index) => (
                     <Col md={6} key={card.id}>
                        <motion.div 
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1 * (index + 1) }}
                           className={`membership-selection-card-v2 ${selectedCardForRequest === card.id ? "selected" : ""}`}
                           onClick={() => {
                               setSelectedCardForRequest(card.id);
                               setSelectedCardPrice(card.price || 0);
                           }}
                        >
                           <div 
                               className="digital-card-preview-v2 mb-0"
                               style={{ 
                                   background: card.backgroundGradient || card.cardColor || "#1e293b",
                                   boxShadow: selectedCardForRequest === card.id ? `0 20px 40px -10px ${card.cardColor || '#fbbf24'}88` : `0 10px 20px rgba(0,0,0,0.2)`
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
                                           <h5 className="fw-900 mb-0 text-truncate font-heading text-white">{card.cardName}</h5>
                                           <div className="premium-price-badge">₹{card.price || "Free"}</div>
                                       </div>
                                       <small className="opacity-60 fw-bold tracking-widest fs-9 text-uppercase mt-1 d-block">
                                           {card.cardLevel} ELITE
                                       </small>
                                   </div>
                                   <div className="w-100 d-flex justify-content-between align-items-end">
                                       <span className="font-monospace fs-9 opacity-70 tracking-widest text-white uppercase">{card.validityDays} DAYS VALIDITY</span>
                                       {selectedCardForRequest === card.id && (
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
                onClick={() => setShowCardSelectionModal(false)}
              >
                DISCARD
              </Button>
              <Button 
                className="btn-confirm-selection" 
                disabled={!selectedCardForRequest} 
                onClick={handleSubmitRequest}
              >
                {requesting ? "PROCESSING..." : "CONFIRM SELECTION"}
              </Button>
            </div>
          </motion.div>
        </Modal.Body>
      </Modal>

      {/* View Card Modal - Rewritten for Hyper-Premium Vault */}
      <Modal show={showCardModal} onHide={() => setShowCardModal(false)} centered size="lg" className="vault-modal-v2">
         <Modal.Body className="p-0 border-0 bg-transparent">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="vault-modal-content py-5 px-4"
            >
                <div className="d-flex justify-content-center align-items-center mb-5 text-white position-relative">
                   <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                   >
                      <h2 className="fw-900 mb-1 font-heading">Secure <span className="text-gold">Credential</span></h2>
                      <p className="opacity-60 small tracking-widest uppercase mb-0">ENCRYPTED ELITE MEMBER ACCESS</p>
                   </motion.div>
                   <Button variant="link" className="text-white opacity-50 p-0 hover-rotate position-absolute end-0" style={{ right: '0', top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowCardModal(false)}>
                      <FaPlus size={24} style={{ transform: 'rotate(45deg)' }} />
                   </Button>
                </div>

               <div className="d-flex justify-content-center align-items-center py-4">
                  {selectedCardDesign && viewingRequest && (
                     <motion.div
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="premium-digital-card-v2"
                        style={{ background: selectedCardDesign.backgroundGradient || selectedCardDesign.cardColor || selectedCardDesign.background_gradient || selectedCardDesign.card_color || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
                        whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
                     >
                        <div className="glass-glare"></div>
                        <div className="holographic-overlay"></div>
                        <div className="shimmer-sweep"></div>
                        <div className="z-2 h-100 d-flex flex-column justify-content-between position-relative">
                           <div className="d-flex justify-content-between align-items-start">
                              <div>
                                 <div className="tracking-widest fs-9 opacity-60 fw-bold uppercase mb-1 text-truncate">{selectedCardDesign.propertyName || (viewingRequest && viewingRequest.property_name)}</div>
                                 <h3 className="fw-900 mb-0 display-6 font-heading text-white text-truncate" style={{ maxWidth: '100%' }}>{selectedCardDesign.cardName}</h3>
                                 <div className="badge-elite-vault mt-2">{selectedCardDesign.cardLevel} ELITE</div>
                              </div>
                              <div className="pro-smart-chip"></div>
                           </div>

                           <div className="text-center my-3 py-3 border-top border-bottom border-white border-opacity-10">
                              <h4 className="card-number-v2">
                                 5829 •••• •••• {viewingRequest.id.toString().padStart(4, '0')}
                              </h4>
                           </div>

                           <div className="d-flex justify-content-between align-items-end fs-7">
                              <div>
                                 <div className="opacity-50 tracking-widest fs-9 fw-bold uppercase">CARD HOLDER</div>
                                 <div className="fw-bold text-white text-uppercase">{viewingRequest.user_name || viewingRequest.userName || userName || JSON.parse(localStorage.getItem("userLoginData") || "{}").userName || "Elite Member"}</div>
                              </div>
                              <div className="text-end">
                                 <div className="opacity-50 tracking-widest fs-9 fw-bold uppercase">EXPIRES</div>
                                 <div className="fw-bold text-white">
                                    {(() => {
                                       const dateVal = viewingRequest.createdAt || viewingRequest.created_at || new Date();
                                       const d = new Date(dateVal);
                                       if (isNaN(d.getTime())) return "Valid";
                                       d.setDate(d.getDate() + (selectedCardDesign.validityDays || selectedCardDesign.validity_days || 365));
                                       return `${(d.getMonth() + 1).toString().padStart(2, '0')} / ${d.getFullYear() % 100}`;
                                    })()}
                                 </div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="security-scanner"></div>
                     </motion.div>
                  )}
                  {cardLoading && <Spinner animation="border" variant="success" />}
               </div>
               
               <div className="text-center mt-5">
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 1 }}
                     className="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill bg-black bg-opacity-30 text-white border border-white border-opacity-10"
                  >
                     <span className="pulse-dot"></span>
                     <span className="fs-8 fw-bold tracking-widest">VERIFIED IDENTITY SYSTEM</span>
                  </motion.div>
               </div>
            </motion.div>
         </Modal.Body>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Footer />
      
      <style>{`
        .text-gradient-emerald {
            background: linear-gradient(135deg, #0f766e 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .text-emerald { color: #0f766e; }

        .fw-900 { font-weight: 900; }
        .mw-500 { max-width: 500px; }
        .fs-8 { font-size: 0.8rem; }
        .tracking-wider { letter-spacing: 2px; }
        .backdrop-blur-strong { backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); }

        .membership-header-premium {
            background: linear-gradient(145deg, #001A14 0%, #002C22 100%);
            padding: 100px 0;
            margin-bottom: 60px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            border-radius: 0 0 60px 60px;
            position: relative;
        }

        .hero-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 0;
            opacity: 0.3;
        }
        .hero-orb-1 { width: 500px; height: 500px; background: #fbbf24; top: -200px; right: -100px; }
        .hero-orb-2 { width: 400px; height: 400px; background: #10b981; bottom: -150px; left: -100px; }

        .glass-search-container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }

        .glass-search-wrapper-v2 {
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 22px;
            padding: 5px 15px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .search-icon-gold-v2 { color: #fbbf24; font-size: 1.1rem; }
        .glass-input-v2 {
            background: transparent !important;
            border: none !important;
            color: white !important;
            padding: 15px 12px !important;
            box-shadow: none !important;
            font-weight: 500;
        }
        .glass-input-v2::placeholder { color: rgba(255,255,255,0.4); }

        /* Restored and Enhanced Filter Pills */
        .filter-pill-modern {
            padding: 12px 28px;
            border-radius: 100px;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(15, 118, 110, 0.1);
            color: #64748b;
            font-weight: 700;
            font-size: 0.85rem;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .filter-pill-modern:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 20px rgba(0,0,0,0.06);
            border-color: #0f766e;
            color: #0f766e;
            background: white;
        }

        .filter-pill-modern.active {
            background: #002C22;
            color: white;
            border-color: #002C22;
            box-shadow: 0 10px 25px rgba(0, 44, 34, 0.3);
            transform: scale(1.05);
        }

        /* Restored and Enhanced Property Cards */
        .modern-property-card {
            border: none !important;
            border-radius: 32px !important;
            background: white !important;
            box-shadow: 0 15px 35px rgba(0,0,0,0.05) !important;
            transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1) !important;
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .modern-property-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 40px 70px rgba(0,0,0,0.12) !important;
        }

        .card-media-wrapper {
            position: relative;
            height: 240px;
            overflow: hidden;
        }

        .property-main-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
        }

        .modern-property-card:hover .property-main-img {
            transform: scale(1.15);
        }

        .property-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8) 100%);
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .rating-pill {
            background: rgba(255, 255, 255, 0.9) !important;
            color: #1e293b !important;
            padding: 8px 16px !important;
            border-radius: 100px !important;
            font-weight: 800 !important;
            font-size: 0.8rem !important;
            box-shadow: 0 8px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(5px);
        }

        .dept-overlay-badge {
            border-radius: 12px !important;
            padding: 6px 16px !important;
            font-size: 0.7rem !important;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 800;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .property-details-body {
            padding: 2rem !important;
        }

        .property-name {
            color: #1e293b;
            font-weight: 900 !important;
            font-size: 1.35rem;
        }

        .property-location {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .property-location svg { color: #ef4444; }

        .property-desc {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 25px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        /* Modernized Request Cards - Clean Table Look */
        .membership-request-card-premium {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 20px;
            padding: 15px 25px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            margin-bottom: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.03);
            position: relative;
            overflow: hidden;
        }

        .membership-request-card-premium:hover {
            box-shadow: 0 20px 50px rgba(0,0,0,0.08);
            transform: translateX(5px);
            background: rgba(255, 255, 255, 0.9);
        }

        .req-block {
            display: flex;
            align-items: center;
            padding-right: 25px;
        }

        .req-icon-box {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            flex-shrink: 0;
        }

        .bg-emerald-light { background: #ecfdf5; }
        .bg-gold-light { background: #fffbeb; }
        .text-emerald { color: #059669; }
        
        .badge-level-mini {
            padding: 2px 10px;
            background: rgba(0,0,0,0.05);
            border: 1px solid rgba(0,0,0,0.05);
            border-radius: 100px;
            font-size: 0.6rem;
            font-weight: 800;
            color: #4b5563;
        }

        .btn-vault-view-modern {
            background: linear-gradient(135deg, #001A14 0%, #002C22 100%);
            color: white !important;
            border: none;
            padding: 8px 20px;
            border-radius: 100px;
            font-weight: 800;
            font-size: 0.7rem;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-vault-view-modern:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
            filter: brightness(1.2);
        }

        .status-timeline-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .pulse-emerald {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse-simple 2s infinite;
        }

        @keyframes pulse-simple {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .req-badge {
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .req-pending { background: #fff7ed; color: #f97316; border: 1px solid #ffedd5; }
        .req-approved { background: #f0fdf4; color: #10b981; border: 1px solid #dcfce7; }
        .req-rejected { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
        .req-payment { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }

        .btn-book-modern {
            padding: 16px !important;
            border-radius: 20px !important;
            font-weight: 800 !important;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            background: #002C22;
            color: white;
            border: none;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-size: 0.9rem !important;
            margin-top: auto;
        }

        .btn-book-modern:hover:not(:disabled) {
            background: #0f766e;
            transform: scale(1.02);
            box-shadow: 0 12px 25px rgba(0, 44, 34, 0.3);
        }

        .uppercase-tracking { letter-spacing: 1px; text-transform: uppercase; }
        .fs-8 { font-size: 0.8rem; }
        .fs-9 { font-size: 0.7rem; }

        /* Vault Modal Styles */
        .vault-modal-v2 .modal-content {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        .vault-modal-content {
            background: linear-gradient(165deg, #001A14 0%, #002C22 100%);
            border-radius: 50px;
            border: 2px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(50px);
            box-shadow: 0 50px 100px rgba(0,0,0,0.8);
            overflow: hidden;
            position: relative;
        }

        .premium-digital-card-v2 {
            width: 100%;
            max-width: 520px;
            height: 340px;
            border-radius: 40px;
            padding: 45px;
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
            width: 70px;
            height: 50px;
            background: linear-gradient(135deg, #ffd700, #daa520);
            border-radius: 12px;
            box-shadow: inset 0 0 15px rgba(0,0,0,0.4);
        }

        .card-number-v2 {
            font-family: 'Outfit', sans-serif;
            letter-spacing: 12px;
            font-weight: 500;
            text-shadow: 0 4px 10px rgba(0,0,0,0.5);
            font-size: 1.8rem;
        }

        .badge-elite-vault {
            display: inline-block;
            padding: 6px 16px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 100px;
            font-weight: 800;
            font-size: 0.65rem;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .security-scanner {
            position: absolute;
            height: 3px;
            width: 100%;
            background: linear-gradient(to right, transparent, #fbbf24, #10b981, #fbbf24, transparent);
            left: 0;
            animation: scanning 4s infinite ease-in-out;
            z-index: 5;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
        }

        @keyframes scanning {
            0% { top: -5%; opacity: 0 }
            10% { opacity: 1 }
            90% { opacity: 1 }
            100% { top: 105%; opacity: 0 }
        }

        .pulse-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .shimmer-sweep {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: skewX(-20deg);
            animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 200%; }
        }

        /* Selection Modal V2 Styling */
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

        .digital-card-preview-v2 {
            height: 240px;
            border-radius: 30px;
            padding: 30px;
            position: relative;
            overflow: hidden;
            transition: all 0.4s ease;
        }

        .smart-chip-mini {
            width: 45px;
            height: 32px;
            background: linear-gradient(135deg, #fbbf24, #d97706);
            border-radius: 8px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
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

        .text-gold { color: #fbbf24; }
        .font-heading { font-family: 'Outfit', sans-serif; }
        .tracking-widest { letter-spacing: 4px; }
        .tracking-tighter { letter-spacing: -0.5px; }
        .fs-9 { font-size: 0.65rem; }
        .fs-8 { font-size: 0.85rem; }
        .hover-rotate:hover {
            transform: rotate(90deg);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

      `}</style>
    </div>
  );
};

export default UserMembershipRequest;
