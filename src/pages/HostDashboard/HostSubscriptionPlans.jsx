import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaCrown, FaRocket, FaGem, FaCheckCircle, FaStar, FaShieldAlt } from "react-icons/fa";
import axios from "axios";
import HostNavbar from "../../components/host/HostNavbar";
import "./HostDashboard.css";

const HostSubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const hostLoginData = JSON.parse(localStorage.getItem("hostLoginData") || "{}");
    const hostId = hostLoginData.hostId;

    useEffect(() => {
        if (!hostId) { navigate("/host-login"); return; }
        fetchPlans();
    }, [hostId, navigate]);

    const fetchPlans = async () => {
        try {
            const response = await axios.get("https://geoshops-production.up.railway.app/api/subscriptions");
            setPlans(response.data);
        } catch (err) {
            setError("Failed to load subscription plans.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (planId) => {
        // Find the selected plan details
        const selectedPlan = plans.find(p => p.id === planId);

        if (!selectedPlan) {
            alert("Plan not found. Please try again.");
            return;
        }

        // Navigate to payment page with plan details
        // The subscription will only be created/updated after payment is submitted
        navigate("/host/subscription-payment", {
            state: {
                plan: selectedPlan,
                subscriptionId: planId
            }
        });
    };

    const getPlanIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes("elite") || lower.includes("diamond")) return <FaGem size={32} className="text-info" />;
        if (lower.includes("pro") || lower.includes("gold")) return <FaCrown size={32} className="text-warning" />;
        return <FaRocket size={32} className="text-success" />;
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const itemVariants = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-emerald-gradient p-4">
            <Spinner animation="grow" variant="light" className="mb-3" />
            <div className="text-white font-weight-bold letter-spacing-1">PREPARING YOUR EXPERIENCE...</div>
        </div>
    );

    return (
        <div className="host-dashboard-container">
            <HostNavbar />
            <div className="host-main-content p-0">
                <AnimatePresence>
                    {processing && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 z-index-modal d-flex flex-column justify-content-center align-items-center"
                            style={{ zIndex: 9999 }}
                        >
                            <Spinner animation="grow" variant="success" className="mb-3" />
                            <div className="text-white fw-bold letter-spacing-2">PROCESSING YOUR REQUEST...</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="d-flex justify-content-end mb-4 mt-4 px-4">
                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold smallest">
                        <FaShieldAlt className="me-1" /> SECURE CHECKOUT
                    </Badge>
                </div>

                <Container fluid className="px-4">
                    {error ? (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md mx-auto">
                            <Alert variant="danger" className="text-center border-0 shadow-lg rounded-4 p-5 bg-white">
                                <div className="display-6 text-danger mb-3 font-weight-bold">Oops!</div>
                                <div className="text-muted mb-4">{error}</div>
                                <Button variant="outline-danger" className="px-5 py-2 rounded-pill fw-bold" onClick={fetchPlans}>Try Again</Button>
                            </Alert>
                        </motion.div>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                            <Row className="justify-content-center g-3">
                                {plans.map((plan) => {
                                    const isPro = plan.planName?.toLowerCase().includes('pro');

                                    return (
                                        <Col lg={4} md={6} key={plan.id}>
                                            <motion.div
                                                variants={itemVariants}
                                                whileHover={{ y: -5 }}
                                                className={`modern-card h-100 p-0 overflow-hidden border-0 shadow-sm bg-white ${isPro ? 'border-1 border-success border-opacity-25' : ''}`}
                                                style={{ borderRadius: '1rem' }}
                                            >
                                                {isPro && (
                                                    <div className="bg-success bg-opacity-10 text-success text-center py-1 fw-bold smallest letter-spacing-1">
                                                        <FaStar size={12} className="me-1 mb-1" /> RECOMMENDED
                                                    </div>
                                                )}

                                                <div className="p-4 text-center">
                                                    <div className="icon-box-md mx-auto mb-3 bg-light text-success rounded-circle" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                                        {getPlanIcon(plan.planName)}
                                                    </div>
                                                    <h4 className="fw-extra-bold mb-1 fs-5 text-dark">{plan.planName}</h4>
                                                    <div className="mb-3 mt-2">
                                                        <span className="h3 fw-extra-bold text-dark">₹{plan.amount}</span>
                                                        <span className="text-muted fw-bold smallest"> /MO</span>
                                                    </div>
                                                    <div className="d-inline-block px-4 py-2 bg-light rounded-pill border border-emerald-light">
                                                        <span className="fw-600 text-emerald-dark small">
                                                            <FaCheckCircle className="me-2 mb-1" /> {plan.validityDays} Days Full Access
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="px-5 pb-5 flex-grow-1">
                                                    <div className="feature-divider mb-4 opacity-50"></div>
                                                    <ul className="list-unstyled mb-5">
                                                        <li className="d-flex align-items-center gap-3 mb-4">
                                                            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck size={12} /></div>
                                                            <div className="flex-grow-1">
                                                                <span className="small text-muted d-block text-uppercase fw-bold letter-spacing-1 smallest">Listings</span>
                                                                <span className="fw-bold text-dark">{plan.maxProperties} Property Listings</span>
                                                            </div>
                                                        </li>
                                                        <li className="d-flex align-items-center gap-3 mb-4">
                                                            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck size={12} /></div>
                                                            <div className="flex-grow-1">
                                                                <span className="small text-muted d-block text-uppercase fw-bold letter-spacing-1 smallest">Coupons</span>
                                                                <span className="fw-bold text-dark">{plan.maxCoupons} Active Coupons</span>
                                                            </div>
                                                        </li>
                                                        <li className="d-flex align-items-center gap-3 mb-4">
                                                            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck size={12} /></div>
                                                            <div className="flex-grow-1">
                                                                <span className="small text-muted d-block text-uppercase fw-bold letter-spacing-1 smallest">Design</span>
                                                                <span className="fw-bold text-dark">Monthly Designs</span>
                                                            </div>
                                                        </li>
                                                        <li className="d-flex align-items-center gap-3">
                                                            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck size={12} /></div>
                                                            <div className="flex-grow-1">
                                                                <span className="small text-muted d-block text-uppercase fw-bold letter-spacing-1 smallest">Experience</span>
                                                                <span className="fw-bold text-dark">Premium Support</span>
                                                            </div>
                                                        </li>
                                                    </ul>

                                                    <Button
                                                        className={`w-100 py-3 rounded-pill fw-extra-bold transition-all shadow-sm ${isPro ? 'btn-vibrant-emerald' : 'btn-outline-emerald'}`}
                                                        onClick={() => handleSelectPlan(plan.id)}
                                                        disabled={processing}
                                                        style={{ letterSpacing: '1px' }}
                                                    >
                                                        {processing ? (
                                                            <><Spinner size="sm" className="me-2" animation="border" /> ACTIVATING...</>
                                                        ) : "GET STARTED NOW"}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-5 mb-5 text-muted small">
                        <p className="opacity-75">All plans include a 30-day satisfaction guarantee. Prices are inclusive of all taxes.</p>
                    </motion.div>
                </Container>

                <style>{`
                .fw-extra-bold { font-weight: 800; }
                .fw-600 { font-weight: 600; }
                .letter-spacing-1 { letter-spacing: 0.1em; }
                .letter-spacing-2 { letter-spacing: 0.2em; }
                .mt-n5 { margin-top: -8rem !important; }
                .max-w-lg { max-width: 700px; }
                .max-w-md { max-width: 500px; }
                
                .icon-box-xl {
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bg-emerald-smooth {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }
                
                .shadow-emerald {
                    box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4);
                }
                
                .ring-emerald {
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 25px 30px -5px rgba(0, 0, 0, 0.1) !important;
                }
                
                .btn-vibrant-emerald {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.3) 100%);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    color: #b45309;
                    border: 2px solid rgba(251, 191, 36, 0.4);
                    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
                }
                .btn-vibrant-emerald:hover {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.4) 100%);
                    border-color: rgba(251, 191, 36, 0.6);
                    box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4);
                    color: #92400e;
                    transform: translateY(-2px);
                }
                
                .btn-outline-emerald {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.2) 100%);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 2px solid rgba(251, 191, 36, 0.3);
                    color: #b45309;
                    box-shadow: 0 2px 10px rgba(251, 191, 36, 0.15);
                }
                .btn-outline-emerald:hover {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.3) 100%);
                    border-color: rgba(251, 191, 36, 0.5);
                    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
                    color: #92400e;
                    transform: translateY(-2px);
                }
                
                .feature-divider {
                    height: 1px;
                    background: radial-gradient(circle, #e2e8f0 0%, transparent 100%);
                }
                
                .text-emerald-dark { color: #065f46; }
                .border-emerald-light { border-color: #a7f3d0 !important; }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
            </div>
        </div>
    );
};

export default HostSubscriptionPlans;

