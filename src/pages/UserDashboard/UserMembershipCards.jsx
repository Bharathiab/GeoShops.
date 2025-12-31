import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Modal, Badge, Alert } from "react-bootstrap";
import { FaArrowLeft, FaIdCard, FaCheckCircle, FaStar, FaCalendarAlt, FaMapMarkerAlt, FaCrown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserNavbar from "../../components/user/UserNavbar";
import { fetchUserMembershipRequests } from "../../api";
import axios from "axios";
import Footer from "./Footer";

const UserMembershipCards = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [cardDetails, setCardDetails] = useState({});
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
            if (!userLoginData.userId) {
                navigate("/user-login");
                return;
            }

            try {
                const requests = await fetchUserMembershipRequests(userLoginData.userId);
                const approved = requests.filter(req => req.status === 'Approved');
                setApprovedRequests(approved);

                const details = {};
                await Promise.all(approved.map(async (req) => {
                    const cardId = req.card_design_id || req.cardDesignId;
                    if (cardId) {
                        try {
                            const response = await axios.get(`http://localhost:5000/api/membership/cards/designs/${cardId}`);
                            details[req.id] = response.data;
                        } catch (err) {
                            console.error(`Error fetching card design ${cardId}:`, err);
                            details[req.id] = { error: true }; // Mark as failed
                        }
                    } else {
                        details[req.id] = { error: true };
                    }
                }));
                setCardDetails(details);
            } catch (error) {
                console.error("Error loading membership cards:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const handleViewCard = (request) => {
        const design = cardDetails[request.id];
        if (design) {
            setSelectedCard({ ...design, request });
            setShowCardModal(true);
        }
    };

    return (
        <div className="premium-page-wrapper">
            <UserNavbar />

            {/* Header Section */}
            <div className="membership-hero-premium position-relative overflow-hidden">
                <Container className="position-relative z-index-1">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <Badge className="px-3 py-2 mb-4 border border-white border-opacity-20 rounded-pill backdrop-blur-strong bg-white bg-opacity-10">
                           <span className="text-gold fw-900 tracking-widest fs-8">ENCRYPTED VAULT</span>
                        </Badge>
                        <h1 className="fw-900 display-3 text-white mb-3">
                            Digital <span className="text-gradient-gold">Vault</span>
                        </h1>
                        <p className="lead text-white text-opacity-80 mw-600 mx-auto">
                            Your exclusive membership credentials, secured with elite-tier encryption and premium privileges.
                        </p>
                    </motion.div>
                </Container>
                
                {/* Dynamic Background Elements */}
                <div className="vault-orb vault-orb-1"></div>
                <div className="vault-orb vault-orb-2"></div>
                <div className="vault-grid"></div>
            </div>

            <Container className="py-5 content-shift-up">
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="grow" variant="primary" />
                        <p className="text-muted mt-3 fw-bold">Unlocking vault...</p>
                    </div>
                ) : approvedRequests.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className="text-center py-5 border-0 shadow-premium glass-card rounded-5">
                            <Card.Body className="py-5">
                                <div className="empty-vault-icon mb-4">
                                    <FaIdCard size={50} className="text-gold" />
                                </div>
                                <h3 className="fw-bold mb-3">Your Vault is Empty</h3>
                                <p className="text-muted mb-4 mx-auto mw-400">
                                    You don't have any active membership cards. Start your elite journey today.
                                </p>
                                <Button
                                    className="btn-book-modern px-5 rounded-pill"
                                    onClick={() => navigate("/user/membership-request")}
                                >
                                    Explore Memberships
                                </Button>
                            </Card.Body>
                        </Card>
                    </motion.div>
                ) : (
                    <Row className="g-4">
                        <AnimatePresence>
                            {approvedRequests.map((request, index) => {
                                const design = cardDetails[request.id];
                                return (
                                    <Col md={6} lg={4} key={request.id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.6 }}
                                            whileHover={{ y: -15, scale: 1.02 }}
                                            className="h-100"
                                        >
                                            <Card className="membership-card-premium-v2 border-0 shadow-premium h-100 overflow-hidden">
                                                <Card.Body className="p-4 d-flex flex-column h-100">
                                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                                        <div className="d-flex align-items-center">
                                                            <div className="mini-prop-avatar-v2 me-2">
                                                                <FaStar size={12} className="text-gold" />
                                                            </div>
                                                            <span className="fw-900 text-dark text-truncate fs-7">
                                                                {request.property_name || request.propertyName || "Elite Partner"}
                                                            </span>
                                                        </div>
                                                        <Badge className="badge-active-vault px-2 py-1 small">ACTIVE</Badge>
                                                    </div>

                                                    {design && !design.error ? (
                                                        <div
                                                            className="digital-card-preview-v2 mb-4"
                                                            style={{ 
                                                                background: design.backgroundGradient || design.cardColor || design.background_gradient || design.card_color || "#1e293b",
                                                                boxShadow: `0 15px 35px -10px ${design.cardColor || design.card_color || '#002C22'}66`
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
                                                                    <small className="opacity-60 fw-bold tracking-widest fs-9 text-uppercase">
                                                                        {design.cardLevel} ELITE
                                                                    </small>
                                                                    <h5 className="fw-900 mt-1 mb-0 text-truncate font-heading">{design.cardName}</h5>
                                                                </div>
                                                                <div className="w-100 d-flex justify-content-between align-items-end">
                                                                    <span className="font-monospace fs-7 opacity-70 tracking-tighter">ID: {request.id.toString().padStart(8, '0')}</span>
                                                                    <div className="premium-accent-dot"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : design?.error ? (
                                                        <div className="digital-card-placeholder-v2 mb-4 d-flex flex-column align-items-center justify-content-center text-white text-opacity-50">
                                                            <FaIdCard size={30} className="mb-2" />
                                                            <span className="fs-9 uppercase tracking-widest fw-bold">Design Unavailable</span>
                                                        </div>
                                                    ) : (
                                                        <div className="digital-card-placeholder-v2 mb-4">
                                                            <Spinner size="sm" animation="border" variant="success" className="opacity-50" />
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-3">
                                                        <div className="d-flex align-items-center justify-content-between text-muted mb-4 fs-8 fw-bold px-1">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <FaCalendarAlt size={12} className="text-emerald" />
                                                                <span className="opacity-70">VALID UNTIL</span>
                                                            </div>
                                                            <span className="text-dark">
                                                                {(() => {
                                                                    const dateVal = request.updatedAt || request.createdAt || request.updated_at || request.created_at || new Date();
                                                                    const d = new Date(dateVal);
                                                                    if (isNaN(d.getTime())) return "Valid Membership";
                                                                    d.setDate(d.getDate() + (design?.validityDays || design?.validity_days || 365));
                                                                    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
                                                                })()}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            className="btn-open-vault w-100"
                                                            onClick={() => handleViewCard(request)}
                                                        >
                                                            <span className="z-1">Access Vault Card</span>
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                                <div className="card-texture"></div>
                                            </Card>
                                        </motion.div>
                                    </Col>
                                );
                            })}
                        </AnimatePresence>
                    </Row>
                )}
            </Container>

            <Modal show={showCardModal} onHide={() => setShowCardModal(false)} centered size="lg" className="vault-modal-v2">
                <Modal.Body className="p-0 border-0 bg-transparent">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="vault-modal-content py-5 px-4"
                    >
                        <div className="d-flex justify-content-between align-items-center mb-5 text-white">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center w-100"
                            >
                                <h2 className="fw-900 mb-1 font-heading">Secure <span className="text-gold">Credential</span></h2>
                                <p className="opacity-60 small tracking-widest uppercase mb-0">ENCRYPTED ELITE MEMBER ACCESS</p>
                            </motion.div>
                            <Button variant="link" className="text-white opacity-50 p-0 hover-rotate position-absolute top-0 end-0 m-4" onClick={() => setShowCardModal(false)}>
                                <FaCheckCircle size={30} className="text-success" />
                            </Button>
                        </div>

                        <div className="d-flex justify-content-center align-items-center py-4">
                            {selectedCard && (
                                    <motion.div
                                        initial={{ rotateY: -90, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, type: "spring" }}
                                        whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
                                        className="premium-digital-card-v2"
                                        style={{ background: selectedCard.backgroundGradient || selectedCard.cardColor || selectedCard.background_gradient || selectedCard.card_color || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
                                    >
                                        <div className="glass-glare"></div>
                                        <div className="holographic-overlay"></div>
                                        <div className="shimmer-sweep"></div>
                                        <div className="z-2 h-100 d-flex flex-column justify-content-between position-relative">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <div className="tracking-widest fs-9 opacity-60 fw-bold uppercase mb-1 text-truncate">{selectedCard.propertyName || (selectedCard.request && selectedCard.request.property_name)}</div>
                                                    <h3 className="fw-900 mb-0 display-6 font-heading text-white text-truncate" style={{ maxWidth: '100%' }}>{selectedCard.cardName}</h3>
                                                    <div className="badge-elite-vault mt-2">{selectedCard.cardLevel} ELITE</div>
                                                </div>
                                                <div className="pro-smart-chip"></div>
                                            </div>

                                            <div className="text-center my-3 py-3 border-top border-bottom border-white border-opacity-10">
                                                <h4 className="card-number-v2">
                                                    {selectedCard.card_number || (selectedCard.request && selectedCard.request.card_number) || `5829 •••• •••• ${selectedCard.request.id.toString().padStart(4, '0')}`}
                                                </h4>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-end fs-7">
                                                <div>
                                                    <div className="opacity-50 tracking-widest fs-9 fw-bold uppercase">CARD HOLDER</div>
                                                    <div className="fw-bold text-white text-uppercase">{selectedCard.user_name || selectedCard.userName || (selectedCard.request && (selectedCard.request.user_name || selectedCard.request.userName)) || "Elite Member"}</div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="opacity-50 tracking-widest fs-9 fw-bold uppercase">EXPIRES</div>
                                                    <div className="fw-bold text-white">
                                                        {(() => {
                                                            const req = selectedCard.request || {};
                                                            const dateSource = req.createdAt || req.created_at || selectedCard.createdAt || selectedCard.created_at || new Date();
                                                            const d = new Date(dateSource);
                                                            if (isNaN(d.getTime())) return "Valid";
                                                            d.setDate(d.getDate() + (selectedCard.validityDays || selectedCard.validity_days || 365));
                                                            return `${(d.getMonth() + 1).toString().padStart(2, '0')} / ${d.getFullYear() % 100}`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Real-time security scan */}
                                        <div className="security-scanner"></div>
                                    </motion.div>
                            )}
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

            <Footer />

            <style>{`
                .premium-page-wrapper {
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .membership-hero-premium {
                    background: linear-gradient(145deg, #001A14 0%, #002C22 100%);
                    padding: 120px 0 160px;
                    position: relative;
                    overflow: hidden;
                    border-radius: 0 0 80px 80px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }

                .vault-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.2;
                    z-index: 0;
                }
                .vault-orb-1 { width: 600px; height: 600px; background: #fbbf24; top: -300px; right: -200px; }
                .vault-orb-2 { width: 400px; height: 400px; background: #10b981; bottom: -200px; left: -100px; }

                .vault-grid {
                    position: absolute;
                    inset: 0;
                    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                    opacity: 0.5;
                }

                .content-shift-up {
                    margin-top: -100px;
                    position: relative;
                    z-index: 10;
                }

                .membership-card-premium-v2 {
                    background: white !important;
                    border-radius: 35px !important;
                    transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                    position: relative;
                }

                .badge-active-vault {
                    background: #f0fdf4 !important;
                    color: #10b981 !important;
                    font-weight: 800;
                    letter-spacing: 1px;
                    border-radius: 10px;
                }

                .digital-card-preview-v2 {
                    height: 200px;
                    border-radius: 24px;
                    padding: 25px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
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
                    width: 40px;
                    height: 30px;
                    background: linear-gradient(135deg, #fbbf24, #d97706);
                    border-radius: 6px;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.2);
                }

                .premium-accent-dot {
                    width: 8px;
                    height: 8px;
                    background: #fbbf24;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #fbbf24;
                }

                .btn-open-vault {
                    background: #002C22 !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 18px !important;
                    padding: 14px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s;
                }

                .btn-open-vault:hover {
                    background: #0d9488 !important;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(0,44,34,0.3);
                }

                .vault-modal-v2 .modal-content {
                    background: transparent !important;
                    border: none !important;
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

                .hover-rotate:hover {
                    transform: rotate(90deg);
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .security-scanner {
                    position: absolute;
                    height: 4px;
                    width: 100%;
                    background: linear-gradient(to right, transparent, #fbbf24, #22c55e, #fbbf24, transparent);
                    left: 0;
                    animation: scanning 4s infinite ease-in-out;
                    z-index: 5;
                    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
                }

                @keyframes scanning {
                    0% { top: -5%; opacity: 0 }
                    10% { opacity: 1 }
                    90% { opacity: 1 }
                    100% { top: 105%; opacity: 0 }
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

                .text-emerald { color: #10b981; }
                .tracking-widest { letter-spacing: 4px; }
                .tracking-tighter { letter-spacing: -0.5px; }
                .fw-900 { font-weight: 900; }
                .fs-7 { font-size: 0.95rem; }

                .uppercase-tracking { text-transform: uppercase; letter-spacing: 2px; }
                .mw-600 { max-width: 600px; }
                .mw-400 { max-width: 400px; }
                .fs-8 { font-size: 0.85rem; }
                .fs-9 { font-size: 0.65rem; }
            `}</style>
        </div>
    );
};

export default UserMembershipCards;
