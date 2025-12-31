import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Spinner } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import { FaCheck, FaCrown, FaRocket, FaGem, FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./HostDashboard.css";

const HostSubscription = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [statusModal, setStatusModal] = useState({ show: false, title: "", message: "", type: "success" });

    const hostId = JSON.parse(localStorage.getItem("hostLoginData") || "{}").hostId;

    useEffect(() => {
        if (!hostId) { navigate("/host-login"); return; }
        fetchPlans();
        fetchCurrentSubscription();
    }, [hostId, navigate]);

    const fetchPlans = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/subscriptions/plans");
            if (response.ok) {
                const data = await response.json();
                setPlans(data);
            }
        } catch (err) {
            console.error("Error fetching plans:", err);
        }
    };

    const fetchCurrentSubscription = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/host/${hostId}/subscription`);
            if (response.ok) {
                const data = await response.json();
                setCurrentSubscription(data);
            }
        } catch (err) {
            console.error("Error fetching subscription:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmSubscribe = (plan) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handleSubscribe = async () => {
        if (!hostId || !selectedPlan) return;
        setShowPaymentModal(false);
        try {
            const response = await fetch("http://localhost:5000/api/host/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hostId, planType: selectedPlan.id }),
            });

            if (response.ok) {
                setStatusModal({ show: true, title: "Subscription Updated", message: "Congratulations! Your account has been upgraded successfully.", type: "success" });
                fetchCurrentSubscription();
            } else {
                const errorData = await response.json();
                setStatusModal({ show: true, title: "Upgrade Failed", message: errorData.error || "We couldn't process your upgrade at this time.", type: "danger" });
            }
        } catch (err) {
            setStatusModal({ show: true, title: "System Error", message: "A network error occurred. Please try again later.", type: "danger" });
        }
    };

    const getPlanIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes("pro") || lower.includes("gold")) return <FaCrown size={28} className="text-warning" />;
        if (lower.includes("elite") || lower.includes("diamond")) return <FaGem size={28} className="text-info" />;
        return <FaRocket size={28} className="text-success" />;
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    if (loading) return (
        <div className="host-dashboard-container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Spinner animation="border" variant="success" />
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            <HostNavbar />
            <div className="host-main-content p-0">
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    {/* Standard Dashboard Header */}
                    <header className="dashboard-header mb-4 mt-4">
                        <div className="header-text">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <FaRocket className="text-success" />
                                <h1 className="h3 mb-0">Subscription Management</h1>
                            </div>
                            <p className="text-muted small">Unlock exclusive features and scale your property management business.</p>
                        </div>
                    </header>

                    <Container fluid className="px-4">
                        {currentSubscription && (
                            <motion.div variants={itemVariants} className="modern-card p-4 border-emerald-light bg-white mb-4 shadow-sm" style={{ borderRadius: '1rem' }}>
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-4 px-3">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="bg-success text-white p-2 rounded-3 shadow-emerald" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaStar size={18}/>
                                        </div>
                                        <div>
                                            <div className="small text-muted text-uppercase fw-bold letter-spacing-1 mb-0" style={{ fontSize: '0.7rem' }}>Active Membership Tier</div>
                                            <div className="fw-extra-bold fs-5 text-dark">{currentSubscription.plan_name}</div>
                                            <div className="small text-muted mt-0">Next Renewal: <span className="fw-bold text-dark">{new Date(currentSubscription.end_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span></div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold smallest">ACTIVE ENROLLMENT</Badge>
                                        <Button 
                                            variant="light" 
                                            className="btn-modern px-3 py-2 fw-600 border shadow-xs smallest"
                                            onClick={() => navigate('/host/subscription-details')}
                                        >
                                            <FaHistory className="me-2" /> View History
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <Row className="justify-content-center g-4 pb-5">
                            {plans.map((plan) => {
                                const isCurrent = currentSubscription?.plan_id === plan.id;
                                const isPro = plan.name.toLowerCase().includes('pro');
                                
                                return (
                                    <Col key={plan.id} md={6} lg={4}>
                                        <motion.div 
                                            variants={itemVariants} 
                                            whileHover={{ y: -15 }} 
                                            className={`modern-card h-100 p-0 overflow-hidden border-0 shadow-lg bg-white ${isPro ? 'ring-emerald' : ''}`}
                                            style={{ borderRadius: '2.5rem' }}
                                        >
                                            {isPro && (
                                                <div className="bg-warning text-dark text-center py-2 fw-extra-bold letter-spacing-2 fs-6">
                                                   <FaCrown size={14} className="me-2 mb-1" /> MOST POPULAR CHOICE
                                                </div>
                                            )}
                                            
                                            <div className="p-5 text-center">
                                                <div className="icon-box-xl mx-auto mb-4 bg-emerald-smooth text-white rounded-4 shadow-emerald">
                                                    {getPlanIcon(plan.name)}
                                                </div>
                                                <h3 className="fw-extra-bold mb-2 text-dark">{plan.name}</h3>
                                                <div className="my-4">
                                                    <span className="display-4 fw-extra-bold text-dark">₹{plan.price}</span>
                                                    <span className="text-muted fw-bold"> / {plan.duration_days}D</span>
                                                </div>
                                                <div className="feature-divider mb-4 opacity-50"></div>
                                            </div>
                                            
                                            <div className="px-5 pb-5 flex-grow-1">
                                                <ul className="list-unstyled mb-5">
                                                    {plan.features && typeof plan.features === 'string' ? JSON.parse(plan.features).map((feature, idx) => (
                                                        <li key={idx} className="d-flex align-items-center gap-3 mb-4">
                                                            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                                <FaCheck size={12}/>
                                                            </div>
                                                            <span className="fw-600 text-dark small">{feature}</span>
                                                        </li>
                                                    )) : (
                                                        <li className="d-flex align-items-center gap-3 mb-4">
                                                            <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                                <FaCheck size={12}/>
                                                            </div>
                                                            <span className="fw-600 text-dark small">Priority Support and Assistance</span>
                                                        </li>
                                                    )}
                                                    <li className="d-flex align-items-center gap-3">
                                                        <div className="bg-success bg-opacity-10 text-success p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                                            <FaCheck size={12}/>
                                                        </div>
                                                        <span className="fw-600 text-dark small"><strong>{plan.max_listings || 'Unlimited'}</strong> Active Listings</span>
                                                    </li>
                                                </ul>

                                                <Button
                                                    className={`w-100 py-3 rounded-pill fw-extra-bold shadow-sm transition-all ${isCurrent ? 'btn-outline-success disabled bg-success bg-opacity-10 border-success text-success' : isPro ? 'btn-vibrant-emerald' : 'btn-outline-emerald'}`}
                                                    onClick={() => confirmSubscribe(plan)}
                                                    disabled={isCurrent}
                                                    style={{ letterSpacing: '1px' }}
                                                >
                                                    {isCurrent ? <><FaCheckCircle className="me-2 mb-1" /> ACTIVE PLAN</> : "CHOOSE THIS PLAN"}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Container>
                </motion.div>
            </div>

            {/* Premium Confirmation Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered className="modern-modal border-0 overflow-hidden">
                <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                    <Modal.Title className="fw-extra-bold">Upgrade Verification</Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4 px-4">
                    <div className="p-4 rounded-4 text-center mb-4 shadow-sm border" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                        <div className="small fw-600 opacity-90 mb-2 text-uppercase letter-spacing-1">Target Tier</div>
                        <h4 className="fw-extra-bold mb-1">{selectedPlan?.name}</h4>
                        <div className="display-5 fw-extra-bold mb-2">₹{selectedPlan?.price}</div>
                        <div className="small opacity-80 fw-bold">{selectedPlan?.duration_days} Days Full Access</div>
                    </div>
                    <div className="p-3 bg-light rounded-4 text-center">
                        <p className="text-muted small mb-0 fw-600 px-3">
                            Upgrading will immediately adjust your service limits. Pro-rated billing might apply to your next cycle.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 flex-column gap-3 mb-4 px-4">
                    <Button className="w-100 py-3 rounded-pill fw-extra-bold btn-vibrant-emerald" onClick={handleSubscribe}>
                        CONFIRM & ACTIVATE
                    </Button>
                    <Button variant="link" className="w-100 text-muted small text-decoration-none fw-bold" onClick={() => setShowPaymentModal(false)}>
                        NEVER MIND, TAKE ME BACK
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Premium Status Modal */}
            <Modal show={statusModal.show} onHide={() => setStatusModal({ ...statusModal, show: false })} centered className="modern-modal">
                <Modal.Body className="p-5 text-center">
                    <div className={`mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center shadow-lg ${statusModal.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`} style={{ width: '80px', height: '80px' }}>
                        {statusModal.type === 'success' ? <FaCheckCircle size={40}/> : <FaExclamationCircle size={40}/>}
                    </div>
                    <h3 className="fw-extra-bold mb-3">{statusModal.title}</h3>
                    <p className="text-muted fs-5 mb-4">{statusModal.message}</p>
                    <Button className={`btn-modern px-5 py-3 rounded-pill fw-extra-bold w-100 ${statusModal.type === 'success' ? 'btn-vibrant-emerald' : 'btn-danger'}`} onClick={() => setStatusModal({ ...statusModal, show: false })}>
                        {statusModal.type === 'success' ? "EXCELLENT" : "UNDERSTOOD"}
                    </Button>
                </Modal.Body>
            </Modal>

            <style>{`
                .fw-extra-bold { font-weight: 800; }
                .fw-600 { font-weight: 600; }
                .letter-spacing-1 { letter-spacing: 0.1em; }
                .letter-spacing-2 { letter-spacing: 0.2em; }
                .mt-n5 { margin-top: -5rem !important; }
                .max-w-lg { max-width: 600px; }
                
                .icon-box-xl {
                    width: 70px;
                    height: 70px;
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
                
                .shadow-xs { box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                
                .ring-emerald {
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
                }
                
                .btn-vibrant-emerald {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                }
                .btn-vibrant-emerald:hover {
                    box-shadow: 0 8px 15px rgba(16, 185, 129, 0.4);
                    color: white;
                }
                
                .btn-outline-emerald {
                    border: 2px solid #10b981;
                    color: #059669;
                    background: transparent;
                }
                .btn-outline-emerald:hover {
                    background: #10b981;
                    color: white;
                }
                
                .feature-divider {
                    height: 1px;
                    background: radial-gradient(circle, #e2e8f0 0%, transparent 100%);
                }
                
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
};

export default HostSubscription;

