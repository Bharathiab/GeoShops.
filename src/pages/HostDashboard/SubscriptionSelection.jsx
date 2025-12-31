import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaCheck, FaStar, FaRocket, FaGem, FaCheckCircle, FaShieldAlt, FaExclamationCircle, FaCalendar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import HostNavbar from '../../components/host/HostNavbar';
import "./HostDashboard.css";

const SubscriptionSelection = () => {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

  useEffect(() => {
    if (!hostId) { navigate("/host-login"); return; }
    loadData();
  }, [hostId, navigate]);

  const loadData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        axios.get('https://geoshops-production.up.railway.app/api/subscriptions'),
        axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/subscription`)
      ]);
      setPlans(plansRes.data);
      setCurrentSubscription(subRes.data);
    } catch (error) {
      setAlert({ type: 'danger', message: 'Initialization failed. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (plan) => {
    setProcessingId(plan.id);
    try {
      if (currentSubscription?.status === 'None' || !currentSubscription) {
        await axios.post('https://geoshops-production.up.railway.app/api/host/subscriptions', { hostId, subscriptionId: plan.id });
        setAlert({ type: 'success', message: 'Experience activated! Opening dashboard...' });
        setTimeout(() => navigate('/host/dashboard'), 1500);
      } else {
        // For upgrades, don't create subscription yet. 
        // Just navigate to payment page with plan details.
        navigate('/host/subscription-payment', { 
          state: { 
            plan: { ...plan, price: plan.amount }, 
            subscriptionId: plan.id 
          } 
        });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Action failed. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  const getPlanIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('elite')) return <FaGem size={32} className="text-info" />;
    if (lower.includes('pro')) return <FaCrown size={32} className="text-warning" />;
    return <FaRocket size={32} className="text-success" />;
  };

  const isPopular = (name) => name.toLowerCase().includes('pro');
  const isCurrent = (name) => currentSubscription?.plan_type === name || currentSubscription?.planName === name;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 15 } } };

  if (loading) return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-emerald-gradient">
      <Spinner animation="grow" variant="light" className="mb-3" />
      <div className="text-white font-weight-bold letter-spacing-1">FETCHING YOUR OPTIONS...</div>
    </div>
  );

  return (
    <div className="host-dashboard-container">
      <HostNavbar />
      <div className="host-main-content p-0">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4">
          <AnimatePresence>
            {alert && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }} 
                animate={{ y: 20, opacity: 1 }} 
                exit={{ y: -50, opacity: 0 }} 
                className="position-fixed top-0 start-50 translate-middle-x z-3 w-auto"
                style={{ minWidth: "300px" }}
              >
                  <Alert variant={alert.type} className="border-0 shadow-lg rounded-4 text-center py-3 px-5">
                    <div className="d-flex align-items-center justify-content-center gap-2">
                        {alert.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                        <span className="fw-bold">{alert.message}</span>
                    </div>
                  </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="d-flex justify-content-end mb-4 px-4 pt-4">
              <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold smallest">
                <FaShieldAlt className="me-1"/> SECURE CHECKOUT
              </Badge>
          </div>

          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="success" className="mb-3" />
              <p className="text-muted fw-600 small">Fetching the best plans for you...</p>
            </div>
          ) : (
            <Row className="g-3">
              {plans.map((plan) => {
                const isPop = isPopular(plan.planName);
                const isCurr = isCurrent(plan.planName);
                
                return (
                  <Col lg={4} md={6} key={plan.id}>
                    <motion.div 
                      variants={itemVariants} 
                      whileHover={{ y: -5 }} 
                      className={`modern-card h-100 p-0 border-0 shadow-sm bg-white ${isPop ? 'border-1 border-success border-opacity-25' : ''}`}
                    >
                      {isPop && (
                        <div className="bg-success bg-opacity-10 text-success text-center py-2 fw-bold smallest letter-spacing-1">
                          <FaStar className="me-1 mb-1" /> RECOMMENDED
                        </div>
                      )}
                      
                      <div className="p-4 text-center">
                        <div className="icon-box-md mx-auto mb-3 bg-light text-success rounded-circle" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                          {getPlanIcon(plan.planName)}
                        </div>
                        <h4 className="fw-extra-bold mb-1 fs-5">{plan.planName}</h4>
                        <div className="mb-3 mt-2">
                          <span className="h3 fw-extra-bold text-dark">₹{plan.amount}</span>
                          <span className="text-muted fw-bold smallest"> /MO</span>
                        </div>
                        <div className="d-inline-block px-3 py-1 bg-light rounded-pill border border-emerald-light">
                            <span className="fw-600 text-emerald-dark smallest">
                              <FaCalendar className="me-2" /> {plan.validityDays} Days Access
                            </span>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-0">
                        <hr className="my-3 opacity-10" />
                        <ul className="list-unstyled mb-4">
                          <li className="d-flex align-items-center gap-2 mb-2">
                              <FaCheck className="text-success" size={12} />
                              <span className="fw-bold text-dark smallest">Up to {plan.maxProperties} Properties</span>
                          </li>
                          <li className="d-flex align-items-center gap-2 mb-2">
                              <FaCheck className="text-success" size={12} />
                              <span className="fw-bold text-dark smallest">{plan.maxCoupons} Active Coupons</span>
                          </li>
                          <li className="d-flex align-items-center gap-2 mb-2">
                              <FaCheck className="text-success" size={12} />
                              <span className="fw-bold text-dark smallest">Advanced Analytics</span>
                          </li>
                          <li className="d-flex align-items-center gap-2">
                              <FaCheck className="text-success" size={12} />
                              <span className="fw-bold text-dark smallest">24/7 Priority Support</span>
                          </li>
                        </ul>

                        <Button
                          className={`w-100 py-2 rounded-3 fw-extra-bold transition-all smallest ${isCurr ? 'btn-success disabled opacity-50' : 'btn-vibrant-emerald'}`}
                          onClick={() => !isCurr && handleAction(plan)}
                          disabled={processingId === plan.id}
                        >
                          {processingId === plan.id ? (
                            <Spinner size="sm" animation="border" />
                          ) : isCurr ? (
                            <><FaCheckCircle className="me-2 mb-1" /> CURRENT PLAN</>
                          ) : (
                            <>ACTIVATE NOW</>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center mt-5 mb-5">
          <div className="p-4 bg-white shadow-sm rounded-4 d-inline-block border">
              <div className="d-flex justify-content-center align-items-center gap-5">
                 <div className="d-flex align-items-center gap-2 text-muted fw-600 px-3 border-end">
                    <span className="bg-light p-2 rounded-3">GPay</span>
                 </div>
                 <div className="d-flex align-items-center gap-2 text-muted fw-600 px-3 border-end">
                    <span className="bg-light p-2 rounded-3">UPI QR</span>
                 </div>
                 <div className="d-flex align-items-center gap-2 text-muted fw-600 px-3">
                    <span className="bg-light p-2 rounded-3">Bank Transfer</span>
                 </div>
              </div>
              <p className="mb-0 mt-3 text-muted small px-4">Instant activation for trials. Premium upgrades require financial verification.</p>
          </div>
        </motion.div>
        <style>{`
          .fw-extra-bold { font-weight: 800; }
          .fw-600 { font-weight: 600; }
          .letter-spacing-1 { letter-spacing: 0.1em; }
          .letter-spacing-2 { letter-spacing: 0.2em; }
          
          .mt-n5 { margin-top: -5rem !important; }
          
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
              box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2), 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
          }
          
          .btn-vibrant-emerald {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              border: none;
          }
          .btn-vibrant-emerald:hover {
              transform: translateY(-2px);
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
          
          .text-emerald-dark { color: #065f46; }
          .border-emerald-light { border-color: #a7f3d0 !important; }
          
          .hover-opacity-100:hover { opacity: 1 !important; }
          .transition-all { transition: all 0.3s ease; }
        `}</style>
      </div>
    </div>
  );
};

export default SubscriptionSelection;

