import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Tab, Tabs, Badge, Alert, Spinner, Modal } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaCheckCircle, 
  FaLock, 
  FaThLarge, 
  FaStar, 
  FaShieldAlt, 
  FaInfoCircle, 
  FaImage,
  FaUserPlus,
  FaIdCard,
  FaHistory
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HostDashboard.css";

const CARD_STYLES = [
    { name: 'Royal Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Luxurious Gold', value: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' },
    { name: 'Fresh Mint', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { name: 'Midnight Blue', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
    { name: 'Soft Rose', value: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
    { name: 'Sunset Vibes', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { name: 'Ocean Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Deep Space', value: 'linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)' },
    { name: 'Neon Glow', value: 'linear-gradient(to right, #00dbde, #fc00ff)' },
    { name: 'Premium Dark', value: 'linear-gradient(to right, #434343 0%, black 100%)' },
    { name: 'Lush Green', value: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { name: 'Crimson Tide', value: 'linear-gradient(to right, #ed213a, #93291e)' }
];

const HostMembershipCards = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState("designs");
  const [designs, setDesigns] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newDesign, setNewDesign] = useState({
    cardName: "",
    cardLevel: "Silver",
    validityDays: 365,
    benefits: "",
    cardColor: "#4F46E5",
    backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#FFFFFF",
    accentColor: "#FFD700",
    price: "",
    propertyId: "",
    propertyName: ""
  });

  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState({ show: false, requiredPlan: "", message: "" });
  const [issueCard, setIssueCard] = useState({ email: "", cardId: "" });

  const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

  useEffect(() => {
    if (hostId) {
      fetchDesigns();
      fetchSubscription();
      fetchProperties();
    }
  }, [hostId]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`https://geoshops-production.up.railway.app/api/properties/host/${hostId}`);
      setProperties(response.data);
    } catch (err) { console.error("Error fetching properties:", err); }
  };

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/subscription`);
      setSubscription(response.data);
    } catch (err) { console.error("Error fetching subscription:", err); }
  };

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://geoshops-production.up.railway.app/api/membership/host/${hostId}/cards/designs`);
      setDesigns(response.data);
    } catch (err) { setError("Failed to load card designs."); }
    finally { setLoading(false); }
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!hostId) { setError("Host ID not found. Please log in again."); return; }

    const planName = subscription?.plan_name || "Basic"; 
    const maxDesigns = subscription?.max_membership_card_designs;
    const allowedCardTypes = subscription?.allowed_card_types;

    if (allowedCardTypes) {
      const allowedList = allowedCardTypes.split(',');
      if (!allowedList.includes(newDesign.cardLevel)) {
         setUpgradeModal({
          show: true,
          requiredPlan: "a higher tier",
          message: `Your current plan (${planName}) does not allow ${newDesign.cardLevel} cards.`
        });
        return;
      }
    } else if (planName.toUpperCase().includes("BASIC")) {
        setUpgradeModal({ show: true, requiredPlan: "Pro or Elite", message: "Upgrade your plan to use Membership Cards." });
        return;
    }

    try {
      if (editMode) {
        await axios.put(`https://geoshops-production.up.railway.app/api/membership/cards/designs/${editingId}`, { hostId, ...newDesign });
        setSuccess("Design updated successfully!");
        setEditMode(false); setEditingId(null);
      } else {
        await axios.post("https://geoshops-production.up.railway.app/api/membership/cards/designs", { hostId, ...newDesign });
        setSuccess("Design created successfully!");
      }
      resetForm();
      fetchDesigns();
      setKey("designs");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save design.";
      if (errorMessage.includes("limit reached")) {
         setUpgradeModal({ show: true, requiredPlan: "Pro or Elite", message: "You've reached your design limit." });
      } else { setError(errorMessage); }
    }
  };

  const resetForm = () => {
    setNewDesign({
        cardName: "", cardLevel: "Silver", validityDays: 365, benefits: "",
        cardColor: "#4F46E5", backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textColor: "#FFFFFF", accentColor: "#FFD700", price: ""
    });
    setEditMode(false); setEditingId(null);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://geoshops-production.up.railway.app/api/membership/cards/designs/${deleteId}`);
      setSuccess("Deleted successfully!");
      fetchDesigns();
    } catch (err) { setError("Delete failed."); }
    finally { setShowDeleteModal(false); setDeleteId(null); }
  };

  const handleEdit = (design) => {
    setNewDesign({ 
      ...design, 
      price: design.price || "",
      propertyId: design.propertyId || "",
      propertyName: design.propertyName || ""
    });
    setEditMode(true); setEditingId(design.id);
    setKey("create");
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();
    if (!issueCard.email || !issueCard.cardId) { setError("Please fill all fields."); return; }
    try {
      await axios.post(`https://geoshops-production.up.railway.app/api/membership/issue`, {
        hostId,
        userEmail: issueCard.email,
        cardDesignId: issueCard.cardId
      });
      setSuccess("Card issued successfully!");
      setIssueCard({ email: "", cardId: "" });
    } catch (err) { setError(err.response?.data?.message || "Failed to issue card."); }
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    } 
  };
  
  const itemVariants = { 
    hidden: { y: 30, opacity: 0 }, 
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    } 
  };

  const headerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const CardPreview = ({ design, className = "" }) => {
    const hostName = JSON.parse(localStorage.getItem('hostLoginData'))?.hostName || "Emerald Estates";
    const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId || "2024";
    const displayName = design.propertyName || design.property_name || hostName;
    
    const generateUniqueNumber = (hId, dId) => {
        const seed = (parseInt(hId) || 0) + (parseInt(dId) || 0);
        const part1 = "5829";
        const part2 = (Math.abs(Math.sin(seed + 1) * 9999)).toFixed(0).padStart(4, '0');
        const part3 = (Math.abs(Math.cos(seed + 2) * 9999)).toFixed(0).padStart(4, '0');
        const part4 = ((parseInt(hId) % 100).toString().padStart(2, '0')) + 
                     ((parseInt(dId) || 1).toString().padStart(2, '0'));
        return `${part1} ${part2} ${part3} ${part4.padStart(4, '0')}`;
    };

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}
        animate={{ scale: 1, opacity: 1, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}
        whileHover={{ 
            scale: 1.02,
            rotateX: 2,
            rotateY: -2,
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`membership-card-preview rounded-4 relative overflow-hidden text-start ${className}`}
        style={{ 
          background: design.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: '#FFFFFF', 
          height: "250px", 
          width: "100%", 
          maxWidth: "400px",
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          padding: '1.5rem 1.75rem',
          perspective: '1000px'
        }}
      >
        {/* Shimmer & Background */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />
        <motion.div
           className="position-absolute top-0 start-0 w-100 h-100"
           style={{ background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }}
           animate={{ x: ['-200%', '200%'] }}
           transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />

        {/* Top Header */}
        <div className="relative z-2 d-flex justify-content-between align-items-start h-auto">
          <div style={{ maxWidth: '70%', overflow: 'hidden' }}>
            <p className="mb-0 fw-600 text-uppercase tracking-wider" style={{ fontSize: '0.65rem', opacity: 0.8, letterSpacing: '0.05rem' }}>
              {displayName}
            </p>
            <h2 className="fw-900 mb-1 mt-0 text-truncate" style={{ fontSize: '1.5rem', letterSpacing: '-0.01em', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              {design.cardName || "Elite Member"}
            </h2>
            <div 
              className="d-inline-block px-2 py-0 rounded-pill" 
              style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase' }}
            >
              {design.cardLevel || "Gold"} Tier
            </div>
          </div>

          <div 
            className="rounded-2 shadow-sm" 
            style={{ 
                width: '42px', height: '32px', 
                background: 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)',
                border: '1px solid rgba(0,0,0,0.1)',
                position: 'relative'
            }}
          >
            <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', height: '1px', background: 'rgba(0,0,0,0.1)' }} />
            <div style={{ position: 'absolute', left: '50%', top: '0', width: '1px', height: '100%', background: 'rgba(0,0,0,0.1)' }} />
          </div>
        </div>
  
        {/* Card Number - Single Line Fix */}
        <div className="relative z-2 w-100 text-center my-auto pt-2">
          <div 
            className="font-monospace fw-600 w-100 text-center" 
            style={{ 
              fontSize: '1.3rem', 
              letterSpacing: '0.15rem',
              whiteSpace: 'nowrap',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {generateUniqueNumber(hostId, design.id)}
          </div>
        </div>
  
        {/* Footer - No Clipping Fix */}
        <div className="relative z-2 d-flex justify-content-end align-items-end w-100 pt-3 h-auto">
          <div className="text-end pb-1">
            <p className="mb-0 text-uppercase fw-700" style={{ fontSize: '0.55rem', opacity: 0.6, letterSpacing: '0.05rem' }}>
              Valid Thru
            </p>
            <p className="fw-bold mb-0" style={{ fontSize: '1.05rem', lineHeight: '1' }}>
              {(() => {
                const date = new Date();
                date.setDate(date.getDate() + (design.validityDays || 365));
                return `${(date.getMonth() + 1).toString().padStart(2, '0')} / ${date.getFullYear()}`;
              })()}
            </p>
          </div>
        </div>

        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '45%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)', zIndex: 0 }} />
      </motion.div>
    );
  };

  return (
    <div className="host-dashboard-wrapper">
      <HostNavbar />
      <div className="host-main-content">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <header className="dashboard-header mb-4">
            <div className="header-text">
              <h1>Membership Designer</h1>
              <p>Create and manage exclusive membership cards for your properties.</p>
            </div>
          </header>

          <Container className="py-5">
            <AnimatePresence mode="wait">
            {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setError("")} dismissible>{error}</Alert></motion.div>}
            {success && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Alert variant="success" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setSuccess("")} dismissible>{success}</Alert></motion.div>}
          </AnimatePresence>

          <Tabs id="membership-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="modern-tabs mb-5">
            <Tab eventKey="designs" title={<span><FaThLarge className="me-2"/> Active Designs</span>}>
              {loading ? (
                <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
              ) : designs.length === 0 ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modern-card text-center py-5 border-dashed bg-emerald-lightest">
                  <div className="icon-box-lg bg-white mx-auto mb-4 rounded-circle shadow-sm"><FaIdCard size={32} className="text-muted opacity-50" /></div>
                  <h4 className="font-weight-bold">Zero Designs Found</h4>
                  <p className="text-muted mb-4">Start your loyalty program by creating your first membership card.</p>
                  <Button className="btn-modern btn-primary-modern" onClick={() => setKey("create")}>Initiate Design</Button>
                </motion.div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <Row className="g-4">
                    {designs.map((design) => (
                      <Col xl={4} lg={6} key={design.id} className="mb-4">
                        <motion.div 
                          variants={itemVariants} 
                          whileHover={{ y: -10 }}
                          className="h-100 d-flex flex-column align-items-center"
                        >
                          <CardPreview design={design} className="w-100" />
                           <div className="d-flex justify-content-between align-items-center mt-3 w-100 px-2">
                             <Badge bg="white" text="dark" className="rounded-pill shadow-sm px-3 py-2 border fw-500 opacity-90" style={{ fontSize: '0.8rem' }}>Created {new Date(design.createdAt).toLocaleDateString()}</Badge>
                            <div className="d-flex gap-2">
                              <Button variant="link" className="icon-btn-sm text-primary" onClick={() => handleEdit(design)}><FaEdit /></Button>
                              <Button variant="link" className="icon-btn-sm text-danger" onClick={() => { setDeleteId(design.id); setShowDeleteModal(true); }}><FaTrash /></Button>
                            </div>
                          </div>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </motion.div>
              )}
            </Tab>

            <Tab eventKey="create" title={<span><FaPlus className="me-2"/> {editMode ? "Modify Design" : "New Canvas"}</span>}>
                <Row className="g-5">
                    <Col lg={7}>
                        <motion.div initial={{ x: -25, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="modern-card p-5">
                            <Form onSubmit={handleCreateDesign}>
                                <h5 className="font-weight-bold mb-4 d-flex align-items-center gap-2"><FaInfoCircle className="text-success"/> Card Essentials</h5>
                                <Row className="g-4 mb-5">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Public Display Name</Form.Label>
                                            <Form.Control className="form-control-modern" type="text" placeholder="e.g. Emerald Executive" value={newDesign.cardName} onChange={(e) => setNewDesign({ ...newDesign, cardName: e.target.value })} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Exclusivity Level</Form.Label>
                                            <Form.Select className="form-select-modern" value={newDesign.cardLevel} onChange={(e) => setNewDesign({ ...newDesign, cardLevel: e.target.value })}>
                                                <option value="Silver">Silver (Entry)</option>
                                                <option value="Gold">Gold (Premium)</option>
                                                <option value="Platinum">Platinum (Elite)</option>
                                                <option value="Diamond">Diamond (Luxury)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Associated Property (Optional)</Form.Label>
                                            <Form.Select 
                                              className="form-select-modern" 
                                              value={newDesign.propertyId} 
                                              onChange={(e) => {
                                                const prop = properties.find(p => p.id === parseInt(e.target.value));
                                                setNewDesign({ 
                                                  ...newDesign, 
                                                  propertyId: e.target.value,
                                                  propertyName: prop ? prop.name : ""
                                                });
                                              }}
                                            >
                                                <option value="">All Properties (General Host Card)</option>
                                                {properties.map(prop => (
                                                  <option key={prop.id} value={prop.id}>{prop.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Base Price (₹)</Form.Label>
                                            <Form.Control className="form-control-modern" type="number" placeholder="Free of charge" value={newDesign.price} onChange={(e) => setNewDesign({ ...newDesign, price: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h5 className="font-weight-bold mb-4 d-flex align-items-center gap-2"><FaThLarge className="text-success"/> Visual Identity</h5>
                                <Row className="g-4 mb-5">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Subscirption Validity</Form.Label>
                                            <Form.Control className="form-control-modern" type="number" value={newDesign.validityDays} onChange={(e) => setNewDesign({ ...newDesign, validityDays: e.target.value })} required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Signature Theme</Form.Label>
                                            <Form.Select className="form-select-modern" value={newDesign.backgroundGradient} onChange={(e) => setNewDesign({ ...newDesign, backgroundGradient: e.target.value })}>
                                                {CARD_STYLES.map(style => (
                                                    <option key={style.name} value={style.value}>{style.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-5">
                                    <Form.Label className="small font-weight-bold text-muted uppercase letter-spacing-1">Card Benefits & Narrative</Form.Label>
                                    <Form.Control as="textarea" rows={4} className="form-control-modern" placeholder="Describe the lifestyle and perks associated with this membership..." value={newDesign.benefits} onChange={(e) => setNewDesign({ ...newDesign, benefits: e.target.value })} required />
                                </Form.Group>

                                <div className="d-flex gap-3 pt-3 border-top">
                                    <Button type="submit" className="btn-modern btn-primary-modern px-5">
                                        {editMode ? "Save Evolution" : "Mint Card Design"}
                                    </Button>
                                    <Button variant="light" className="btn-modern px-4" onClick={() => { resetForm(); setKey("designs"); }}>Discard Changes</Button>
                                </div>
                            </Form>
                        </motion.div>
                    </Col>
                    <Col lg={5}>
                        <motion.div initial={{ x: 25, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="sticky-top" style={{ top: '2rem' }}>
                            <div className="modern-card p-5 bg-light border-0 shadow-inner rounded-5">
                                <h5 className="font-weight-bold mb-4 uppercase letter-spacing-2 opacity-50 small text-center">Live High-Fidelity Rendering</h5>
                                <CardPreview design={newDesign} className="mx-auto" />
                                <div className="mt-5 text-muted small px-4">
                                    <p className="mb-0"><FaShieldAlt className="text-success me-2"/> Holographic verification enabled</p>
                                    <p className="mb-0 mt-2">Design updates will propagate instantly to all active member wallets upon save.</p>
                                </div>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Tab>

            <Tab eventKey="assign" title={<span><FaUserPlus className="me-2"/> Direct Issuance</span>}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modern-card p-5 mx-auto max-w-lg">
                <div className="text-center mb-5">
                    <div className="icon-box-lg bg-emerald-lightest text-success mx-auto mb-4 rounded-circle"><FaUserPlus size={32}/></div>
                    <h4 className="font-weight-bold">Grant Immediate Access</h4>
                    <p className="text-muted">Directly assign a membership to a user by email, bypassing the request flow.</p>
                </div>
                <Form onSubmit={handleIssueCard}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small font-weight-bold text-muted uppercase">Guest Email Identifier</Form.Label>
                    <Form.Control className="form-control-modern" type="email" placeholder="guest@example.com" value={issueCard.email} onChange={(e) => setIssueCard({ ...issueCard, email: e.target.value })} />
                  </Form.Group>
                  <Form.Group className="mb-5">
                    <Form.Label className="small font-weight-bold text-muted uppercase">Select Premium Tier</Form.Label>
                    <Form.Select className="form-select-modern" value={issueCard.cardId} onChange={(e) => setIssueCard({ ...issueCard, cardId: e.target.value })}>
                      <option value="" disabled>-- Choose Design --</option>
                      {designs.map(d => <option key={d.id} value={d.id}>{d.cardName} ({d.cardLevel})</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Button type="submit" className="btn-modern btn-primary-modern w-100 py-3 font-weight-bold shadow-lg">Activate Membership</Button>
                </Form>
              </motion.div>
            </Tab>
          </Tabs>

          <Modal show={upgradeModal.show} onHide={() => setUpgradeModal({ ...upgradeModal, show: false })} centered className="modern-modal rounded-5">
            <Modal.Body className="text-center p-5">
              <div className="icon-box-xl bg-warning-lightest text-warning mx-auto mb-4 rounded-circle"><FaLock size={40}/></div>
              <h3 className="font-weight-bold mb-3">Gateway Locked</h3>
              <p className="text-muted mb-5 fs-5 px-3">{upgradeModal.message}</p>
              <div className="d-flex flex-column gap-3 px-4">
                <Button className="btn-modern btn-primary-modern py-3 shadow-lg" onClick={() => navigate('/host/subscription')}>Unlock Premium Tiers</Button>
                <Button variant="link" className="text-muted text-decoration-none font-weight-bold" onClick={() => setUpgradeModal({ ...upgradeModal, show: false })}>Dismiss for Now</Button>
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modern-modal">
            <Modal.Body className="text-center p-5">
                <div className="icon-box-lg bg-danger-lightest text-danger mx-auto mb-4 rounded-circle"><FaTrash size={28}/></div>
                <h4 className="font-weight-bold">Retire Design?</h4>
                <p className="text-muted mb-5">This action will retire the design from your active repertoire. Existing members will retain their cards until expiry.</p>
                <div className="d-flex gap-3">
                    <Button variant="light" className="btn-modern flex-grow-1" onClick={() => setShowDeleteModal(false)}>Keep Design</Button>
                    <Button variant="danger" className="btn-modern flex-grow-1" onClick={handleDelete}>Confirm Retirement</Button>
                </div>
            </Modal.Body>
          </Modal>
          </Container>
        </motion.div>
      </div>
    </div>
  );
};

export default HostMembershipCards;

