import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Alert, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HostSubscriptionDetails = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const response = await axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/subscription`);
            if (response.data.status !== 'None') {
                setSubscription(response.data);
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Active': 'success',
            'Pending': 'warning',
            'Expired': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const getPaymentStatusBadge = (status) => {
        const variants = {
            'Verified': 'success',
            'Submitted': 'info',
            'Pending': 'warning',
            'Rejected': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Card className="shadow-sm">
                <Card.Body className="text-center">
                    <p>Loading subscription details...</p>
                </Card.Body>
            </Card>
        );
    }

    if (!subscription) {
        return (
            <Card className="shadow-sm border-warning">
                <Card.Body>
                    <div className="text-center">
                        <FaCrown size={50} className="text-warning mb-3" />
                        <h5>No Active Subscription</h5>
                        <p className="text-muted">Choose a plan to unlock premium features</p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/host/subscription')}
                            style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
                        >
                            View Plans
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    // Calculate trial days remaining
    const trialDaysRemaining = subscription.trial_end_date
        ? Math.max(0, Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;
    const isTrialActive = subscription.is_trial_active && trialDaysRemaining > 0;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-card p-0 overflow-hidden border-0 shadow-sm bg-white mb-4"
            style={{ borderRadius: '1.25rem' }}
        >
            <div className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-emerald-lightest p-2 rounded-3 text-success shadow-xs">
                            <FaCrown size={24} />
                        </div>
                        <div>
                            <h4 className="fw-extra-bold mb-0 text-dark">{subscription.plan_name}</h4>
                            <div className="smallest text-muted fw-bold text-uppercase letter-spacing-1">Current Membership Tier</div>
                        </div>
                    </div>
                    <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold smallest">
                        {subscription.status.toUpperCase()}
                    </Badge>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={4}>
                        <div className="p-3 rounded-4 bg-light border border-transparent hover-border-emerald transition-all h-100">
                            <div className="smallest text-muted fw-bold text-uppercase mb-2">Billing Details</div>
                            <div className="d-flex align-items-end gap-1 mb-2">
                                <span className="fs-4 fw-extra-bold text-dark">₹{subscription.amount}</span>
                                <span className="text-muted fw-bold mb-1 small">/ MONTH</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="smallest text-muted fw-bold">STATUS:</div>
                                {getPaymentStatusBadge(subscription.payment_status)}
                            </div>
                        </div>
                    </Col>
                    <Col md={8}>
                        <div className="p-3 rounded-4 bg-light border border-transparent h-100">
                            <div className="smallest text-muted fw-bold text-uppercase mb-3">Participation Timeline</div>
                            <Row className="g-3">
                                <Col sm={4}>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaCalendarAlt className="text-success smallest" />
                                        <div>
                                            <div className="smallest text-muted fw-bold">STARTED</div>
                                            <div className="small fw-bold text-dark">{formatDate(subscription.start_date)}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={4}>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaClock className="text-danger smallest" />
                                        <div>
                                            <div className="smallest text-muted fw-bold">EXPIRES</div>
                                            <div className="small fw-bold text-danger">{formatDate(subscription.end_date)}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={4}>
                                    <div className="d-flex align-items-center gap-2">
                                        <FaCheckCircle className="text-primary smallest" />
                                        <div>
                                            <div className="smallest text-muted fw-bold">ENROLLED</div>
                                            <div className="small fw-bold text-dark">{formatDate(subscription.created_at)}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>

                {/* Trial Status Section */}
                {isTrialActive && (
                    <div className="p-4 rounded-4 bg-blue-lightest border border-primary border-opacity-10 mb-0 shadow-xs overflow-hidden position-relative">
                        <div className="position-absolute top-0 end-0 p-3 opacity-5"><FaClock size={60} /></div>
                        <div className="position-relative z-1">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-primary text-white p-2 rounded-circle shadow-xs" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaClock size={12} />
                                    </div>
                                    <h6 className="fw-extra-bold mb-0 text-dark">Free Trial Experience Active</h6>
                                </div>
                                <Badge bg="primary" className="shadow-sm px-3 py-2 rounded-pill fw-bold">
                                    {trialDaysRemaining} DAYS REMAINING
                                </Badge>
                            </div>
                            
                            <div className="progress rounded-pill bg-white shadow-inner mb-3" style={{ height: '10px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(trialDaysRemaining / 15) * 100}%` }}
                                    className="progress-bar bg-primary shadow-sm"
                                    role="progressbar"
                                    aria-valuenow={trialDaysRemaining}
                                    aria-valuemin="0"
                                    aria-valuemax="15"
                                ></motion.div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="smallest text-muted fw-bold">
                                    Trial concludes on <span className="text-dark">{formatDate(subscription.trial_end_date)}</span>
                                </div>
                                {trialDaysRemaining <= 3 && (
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="smallest text-warning fw-extra-bold blink">TRIAL ENDING SOON</span>
                                        <Button
                                            className="btn-vibrant-emerald px-3 py-1 rounded-pill fw-bold smallest shadow-sm"
                                            onClick={() => navigate('/host/subscription-payment')}
                                        >
                                            UPGRADE NOW
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {subscription.payment_status === 'Submitted' && (
                    <div className="p-3 rounded-4 bg-info bg-opacity-10 border border-info border-opacity-25 mt-3 d-flex align-items-center gap-3">
                        <div className="bg-info text-white p-2 rounded-circle shadow-xs"><FaClock size={14} /></div>
                        <div className="small fw-600 text-dark">Payment verification in progress. Full status will update shortly.</div>
                    </div>
                )}

                {subscription.payment_status === 'Verified' && subscription.status === 'Active' && !isTrialActive && (
                    <div className="p-3 rounded-4 bg-emerald-lightest border border-success border-opacity-25 mt-3 d-flex align-items-center gap-3">
                        <div className="bg-success text-white p-2 rounded-circle shadow-xs"><FaCheckCircle size={14} /></div>
                        <div className="small fw-600 text-success">Your subscription is active and all features are unlocked!</div>
                    </div>
                )}

                {/* Overdue/Rejected Styles */}
                {subscription.payment_status === 'Rejected' && (
                    <div className="p-3 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-25 mt-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                           <div className="bg-danger text-white p-2 rounded-circle shadow-xs"><FaExclamationCircle size={14} /></div>
                           <div className="small fw-600 text-danger">Payment rejected. Please resolve to avoid service interruption.</div>
                        </div>
                        <Button variant="danger" size="sm" className="rounded-pill px-3 fw-bold smallest" onClick={() => navigate('/host/subscription')}>RETRY</Button>
                    </div>
                )}
            </div>

            <style>{`
                .fw-extra-bold { font-weight: 800; }
                .smallest { font-size: 0.7rem; }
                .letter-spacing-1 { letter-spacing: 0.1em; }
                .shadow-xs { box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .bg-emerald-lightest { background-color: #ecfdf5; }
                .bg-blue-lightest { background-color: #eff6ff; }
                .hover-border-emerald:hover { border-color: #10b981 !important; }
                .blink { animation: blink-animation 1s steps(5, start) infinite; }
                @keyframes blink-animation { to { visibility: hidden; } }
            `}</style>
        </motion.div>
    );
};

export default HostSubscriptionDetails;
