import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Table, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaCheckCircle, FaClock, FaTimesCircle, FaCalendar, FaMoneyBill, FaFileInvoice, FaHistory, FaInfoCircle, FaCreditCard, FaStar, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HostNavbar from '../../components/host/HostNavbar';
import "./HostDashboard.css";

const HostSubscriptionDetails = () => {
    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

    useEffect(() => {
        if (!hostId) { navigate("/host-login"); return; }
        fetchSubscriptionDetails();
        fetchPaymentHistory();

        const interval = setInterval(() => {
            fetchSubscriptionDetails();
            fetchPaymentHistory();
        }, 45000);

        return () => clearInterval(interval);
    }, [hostId, navigate]);

    const fetchSubscriptionDetails = async () => {
        try {
            const response = await axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/subscription`);
            setSubscription(response.data);
        } catch (error) {
            setError('Failed to load subscription details');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/subscription/payments`);
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payment history:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Active': 'badge-success',
            'Pending': 'badge-warning',
            'Expired': 'badge-danger',
            'Submitted': 'badge-primary',
            'Completed': 'badge-success'
        };
        return <span className={`badge-modern ${statusConfig[status] || 'badge-secondary'}`}>{status}</span>;
    };

    const formatDate = (dateString, fallbackDate = null) => {
        const actualDate = dateString || fallbackDate;
        if (!actualDate) return 'N/A';
        return new Date(actualDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    if (loading) return (
        <div className="host-dashboard-container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <Spinner animation="border" variant="success" />
        </div>
    );

    if (!subscription || subscription.status === 'None') {
        return (
            <div className="host-dashboard-container">
                <HostNavbar />
                <div className="host-main-content p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modern-card text-center p-5 max-w-lg mx-auto mt-5">
                        <div className="icon-box-lg mx-auto mb-4 bg-emerald-lightest text-success rounded-circle">
                           <FaCrown size={32} />
                        </div>
                        <h3 className="font-weight-bold">No Active Plan</h3>
                        <p className="text-muted mb-4">It looks like you don't have an active subscription. Choose a plan to unlock all features.</p>
                        <Button className="btn-modern btn-primary-modern px-5 py-3" onClick={() => navigate('/host/subscription')}>
                            Explore Plans
                        </Button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="host-dashboard-container">
            <HostNavbar />
            <div className="host-main-content p-0">
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <div className="d-flex justify-content-end mb-4 mt-2 px-4 pt-4">
                        <Button 
                            className="btn-vibrant-emerald px-3 py-2 fw-extra-bold shadow-xs smallest" 
                            onClick={() => navigate('/host/subscription')}
                            style={{ borderRadius: '0.5rem', letterSpacing: '0.5px' }}
                        >
                            <FaCrown className="me-2 mb-1"/> UPGRADE PLAN
                        </Button>
                    </div>

                    <Container fluid className="pb-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                    <Alert variant="danger" className="border-0 shadow-lg rounded-4 mb-4 p-4 d-flex align-items-center gap-3" dismissible onClose={() => setError(null)}>
                                        <FaInfoCircle size={24} />
                                        <span className="fw-bold">{error}</span>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Row className="g-4">
                            <Col lg={8}>
                                <motion.div variants={itemVariants} className="modern-card p-0 overflow-hidden mb-4 border-0 shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
                                    <div className="p-3 border-bottom bg-light bg-opacity-50">
                                        <h6 className="fw-extra-bold mb-0 d-flex align-items-center gap-2">
                                            <FaFileInvoice className="text-success" /> Active Plan Overview
                                        </h6>
                                    </div>
                                    <div className="p-4">
                                        <Row className="g-4">
                                            <Col md={6}>
                                                <div className="p-4 rounded-4 bg-emerald-smooth text-white shadow-emerald position-relative overflow-hidden h-100 d-flex flex-column justify-content-center">
                                                    <div className="position-absolute top-0 end-0 p-2 opacity-10"><FaCrown size={60} /></div>
                                                    <div className="position-relative z-1">
                                                        <div className="smallest opacity-80 mb-1 text-uppercase fw-bold letter-spacing-1">Current Tier</div>
                                                        <div className="fs-3 fw-extra-bold" style={{ lineHeight: '1.1' }}>{subscription.plan_name || subscription.plan_type}</div>
                                                        <div className="mt-3">
                                                            <Badge bg="white" text="success" className="px-3 py-1 rounded-pill fw-bold shadow-sm smallest">
                                                                {subscription.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="p-4 rounded-4 bg-white border shadow-xs h-100 d-flex flex-column justify-content-center">
                                                    <div className="small text-muted mb-2 text-uppercase fw-bold letter-spacing-1">Billing Summary</div>
                                                    <div className="d-flex align-items-end gap-2 mb-3">
                                                        <span className="fs-2 fw-extra-bold text-dark">₹{subscription.amount}</span>
                                                        <span className="text-muted fw-bold mb-2">/ {subscription.duration_days || 30} Days</span>
                                                    </div>
                                                    <div className="smallest text-muted fw-bold text-uppercase">Payment Verification</div>
                                                    <div className="mt-1">{getStatusBadge(subscription.payment_status)}</div>
                                                </div>
                                            </Col>
                                            
                                            <Col md={12}>
                                                <div className="p-3 rounded-4 border bg-light d-flex flex-wrap justify-content-between align-items-center gap-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="bg-white p-2 rounded-circle shadow-xs text-primary"><FaCalendar size={16}/></div>
                                                        <div>
                                                            <div className="smallest text-muted fw-bold text-uppercase">Activation Date</div>
                                                            <div className="small fw-bold">{formatDate(subscription.start_date, subscription.trial_start_date)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="bg-white p-2 rounded-circle shadow-xs text-danger"><FaClock size={16}/></div>
                                                        <div>
                                                            <div className="smallest text-muted fw-bold text-uppercase">Expiration Date</div>
                                                            <div className="small fw-bold text-danger">{formatDate(subscription.end_date, subscription.trial_end_date)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>

                                        {subscription.status === 'Pending' && subscription.payment_status === 'Pending' && (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 rounded-4 border-warning bg-warning-lightest border shadow-sm">
                                                <div className="d-flex gap-4 align-items-center flex-wrap">
                                                    <div className="bg-white p-3 rounded-circle shadow-sm text-warning"><FaInfoCircle size={28}/></div>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-extra-bold text-dark fs-5">Action Required: Payment Pending</div>
                                                        <div className="text-muted small fw-600">Please complete your payment to activate the professional features.</div>
                                                    </div>
                                                    <Button 
                                                        className="btn-vibrant-emerald px-5 py-3 fw-extra-bold shadow-lg"
                                                        onClick={() => navigate('/host/subscription-payment', { 
                                                            state: { 
                                                                plan: { name: subscription.plan_name, price: subscription.amount, id: subscription.plan_type },
                                                                subscriptionId: subscription.id 
                                                            } 
                                                        })}
                                                        style={{ borderRadius: '1rem' }}
                                                    >
                                                        PAY NOW
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {subscription.payment_status === 'Submitted' && (
                                            <div className="mt-4 p-4 rounded-4 border-info bg-primary-lightest border d-flex align-items-center gap-4">
                                                <div className="bg-white p-3 rounded-circle shadow-sm text-primary"><FaClock size={28} className="spin-slow"/></div>
                                                <div>
                                                    <div className="fw-extra-bold text-dark fs-5">Verifying Transaction</div>
                                                    <div className="text-muted small fw-600">Our team is reviewing your receipt. Verification typically takes 2-4 hours.</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="modern-card p-0 overflow-hidden border-0 shadow-lg bg-white" style={{ borderRadius: '2rem' }}>
                                    <div className="p-3 border-bottom bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
                                        <h6 className="fw-extra-bold mb-0 d-flex align-items-center gap-2">
                                            <FaHistory className="text-primary" /> Financial History
                                        </h6>
                                        <Badge bg="white" text="dark" className="rounded-pill p-1 px-3 fw-bold smallest border text-muted shadow-xs">
                                            {payments.length} RECORDS
                                        </Badge>
                                    </div>
                                    <div className="table-responsive p-0">
                                        <Table hover className="modern-table mb-0 align-middle">
                                            <thead>
                                                <tr>
                                                    <th className="ps-5">Submission Date</th>
                                                    <th>Transaction ID</th>
                                                    <th>Method</th>
                                                    <th>Amount Paid</th>
                                                    <th className="pe-5 text-end">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-5">
                                                            <div className="opacity-20 mb-3"><FaInfoCircle size={60} /></div>
                                                            <div className="fw-extra-bold text-muted h5">No Transactional History</div>
                                                            <p className="text-muted small">Once you make a payment, it will appear here.</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    payments.map((payment) => (
                                                        <tr key={payment.id} className="transition-all hover-bg-light">
                                                            <td className="ps-5 py-4">
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="bg-light p-2 rounded-3 text-muted border"><FaCalendar size={14} /></div>
                                                                    <div className="fw-600 font-size-sm">{formatDate(payment.submittedAt)}</div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <code className="bg-light p-2 rounded px-3 text-primary smallest family-mono fw-bold border border-emerald-light">
                                                                    {payment.transactionId || 'N/A'}
                                                                </code>
                                                            </td>
                                                            <td>
                                                                <span className="fw-bold text-dark small">{payment.paymentMethod}</span>
                                                            </td>
                                                            <td className="fw-extra-bold text-dark fs-6">₹{payment.amount}</td>
                                                            <td className="pe-5 text-end">{getStatusBadge(payment.status)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </motion.div>
                            </Col>

                            <Col lg={4}>
                                <motion.div 
                                    variants={itemVariants} 
                                    className="modern-card p-4 mb-4 border-0 shadow-lg bg-white overflow-hidden position-relative" 
                                    style={{ borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}
                                >
                                    <div className="position-absolute top-0 end-0 p-3 text-success opacity-5"><FaRocket size={120} /></div>
                                    <div className="position-relative z-1">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <div className="bg-emerald-lightest p-2 rounded-3 text-success shadow-xs"><FaRocket size={20} /></div>
                                            <h4 className="fw-extra-bold mb-0 text-dark">Pro Perks</h4>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { icon: FaCheckCircle, color: 'text-success', title: 'UNLIMITED REACH', desc: 'Boost your property visibility effortlessly.', bg: 'bg-emerald-lightest' },
                                                { icon: FaShieldAlt, color: 'text-info', title: 'FRAUD PREVENTION', desc: 'Top-tier security for your transactions.', bg: 'bg-blue-lightest' },
                                                { icon: FaCrown, color: 'text-warning', title: 'DEDICATED MANAGER', desc: 'Your own business growth expert.', bg: 'bg-yellow-lightest' }
                                            ].map((perk, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    whileHover={{ x: 5, scale: 1.02 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    className="d-flex align-items-start gap-3 p-3 rounded-4 bg-light border border-transparent hover-border-emerald transition-all mb-3 cursor-default"
                                                >
                                                    <div className={`${perk.bg} ${perk.color} p-2 rounded-circle shadow-xs d-flex align-items-center justify-content-center flex-shrink-0`} style={{ minWidth: '40px', height: '40px' }}>
                                                        <perk.icon size={18}/>
                                                    </div>
                                                    <div>
                                                        <div className="fw-extra-bold smallest letter-spacing-1 text-dark">{perk.title}</div>
                                                        <div className="smallest text-muted mt-1 fw-500" style={{ fontSize: '0.68rem' }}>{perk.desc}</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <hr className="my-4 opacity-10" />
                                        <Button 
                                            className="btn-vibrant-emerald w-100 py-3 rounded-pill fw-extra-bold shadow-lg transition-all smallest" 
                                            onClick={() => navigate('/host/subscription')}
                                            style={{ letterSpacing: '1px' }}
                                        >
                                            UPGRADE NOW
                                        </Button>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="modern-card p-4 border-0 shadow-lg bg-white overflow-hidden" style={{ borderRadius: '2rem' }}>
                                    <div className="p-4 rounded-4 text-center" style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
                                        <FaCreditCard size={40} className="text-muted opacity-20 mb-3" />
                                        <div className="text-muted smallest mb-3 fw-extra-bold letter-spacing-2">GLOBAL SECURITY STANDARDS</div>
                                        <div className="d-flex justify-content-center gap-4 opacity-40">
                                            <Badge bg="light" text="dark" className="border shadow-xs px-2 py-1 smallest fw-bold">SSL</Badge>
                                            <Badge bg="light" text="dark" className="border shadow-xs px-2 py-1 smallest fw-bold">PCI</Badge>
                                            <Badge bg="light" text="dark" className="border shadow-xs px-2 py-1 smallest fw-bold">AES-256</Badge>
                                        </div>
                                    </div>
                                </motion.div>
                            </Col>
                        </Row>
                    </Container>
                </motion.div>

                <style>{`
                    .mt-n5 { margin-top: -6rem !important; }
                    .family-mono { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
                    .smallest { font-size: 0.7rem; }
                    .fw-500 { font-weight: 500; }
                    .letter-spacing-2 { letter-spacing: 0.2em; }
                    .bg-warning-lightest { background-color: #fffbeb; }
                    .bg-emerald-lightest { background-color: #ecfdf5; }
                    .bg-blue-lightest { background-color: #eff6ff; } /* Added for new perk background */
                    .bg-yellow-lightest { background-color: #fffdf0; } /* Added for new perk background */
                    .border-warning { border-color: #fde68a !important; }
                    .border-info { border-color: #bae6fd !important; }
                    .hover-border-emerald:hover { border-color: #10b981 !important; }
                `}</style>
            </div>
        </div>
    );
};

export default HostSubscriptionDetails;

