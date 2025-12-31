import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaQrcode, FaFileUpload, FaCheckCircle, FaMobileAlt, FaUniversity, FaArrowLeft, FaShieldAlt, FaInfoCircle, FaImage } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HostNavbar from '../../components/host/HostNavbar';
import "./HostDashboard.css";

const SubscriptionPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;
  const subscriptionId = location.state?.subscriptionId;

  // Normalize plan data
  const normalizedPlan = {
    name: plan?.name || plan?.planName || 'Standard Plan',
    price: plan?.price || plan?.amount || 0,
    id: plan?.id || plan?.plan_type
  };

  const [paymentMethod, setPaymentMethod] = useState('GPay');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const hostId = JSON.parse(localStorage.getItem('hostLoginData'))?.hostId;

  useEffect(() => {
     if (!hostId) navigate("/host-login");
  }, [hostId, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile) {
      setAlert({ type: 'danger', message: 'Please upload payment receipt' });
      return;
    }

    if (!transactionId.trim()) {
      setAlert({ type: 'danger', message: 'Please enter Transaction ID (UTR No / Ref No)' });
      return;
    }

    try {
      setSubmitting(true);
      setAlert(null);

      // Create subscription and submit payment in one go
      // This ensures the subscription is only created when payment proof is actually submitted
      console.log('Creating subscription for host:', hostId, 'with plan ID:', subscriptionId);
      const subscriptionResponse = await axios.post('http://localhost:5000/api/host/subscriptions', {
        hostId: hostId,
        subscriptionId: subscriptionId
      });

      console.log('Subscription creation response:', subscriptionResponse.data);
      
      // The backend returns ApiResponse { success, message, data: { subscriptionId: ... } }
      const createdHostSubscriptionId = subscriptionResponse.data?.data?.subscriptionId;

      if (!createdHostSubscriptionId) {
        console.error('Failed to extract subscription ID from response:', subscriptionResponse.data);
        throw new Error('Failed to create subscription record (Invalid response structure)');
      }

      console.log('Successfully created host subscription #', createdHostSubscriptionId);

      // Immediately submit payment proof
      const formData = new FormData();
      formData.append('hostId', hostId);
      formData.append('subscriptionId', createdHostSubscriptionId);
      formData.append('amount', normalizedPlan.price);
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionId', transactionId);
      formData.append('receipt', receiptFile);

      await axios.post('http://localhost:5000/api/host/subscription-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAlert({ type: 'success', message: 'Payment submitted! Redirecting to dashboard...' });
      setTimeout(() => navigate('/host/dashboard'), 2000);
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || error.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Prevent navigation away without warning if receipt is uploaded
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (receiptFile && !submitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [receiptFile, submitting]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (!plan || !subscriptionId) {
    return (
      <div className="host-dashboard-container d-flex align-items-center justify-content-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modern-card text-center p-5 max-w-md">
           <FaInfoCircle size={50} className="text-warning mb-4" />
           <h3 className="font-weight-bold">Session Timed Out</h3>
           <p className="text-muted mb-4">We couldn't find your session details. Please select your plan again to continue.</p>
           <Button className="btn-modern btn-primary-modern w-100" onClick={() => navigate('/host/subscription')}>Return to Plans</Button>
        </motion.div>
      </div>
    );
  }

    return (
    <div className="host-dashboard-container">
      <HostNavbar />
      <div className="host-main-content p-0">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Trusted Transaction Badge */}
          <div className="position-relative">
            <Badge 
              bg="success" 
              className="bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-bold position-absolute" 
              style={{ fontSize: '0.65rem', top: '1rem', right: '2rem', zIndex: 10 }}
            >
              TRUSTED TRANSACTION
            </Badge>
          </div>

          <Container fluid className="pb-5 pt-5 mt-3">
            <Row className="justify-content-center g-4">
              <Col lg={7}>
                <AnimatePresence>
                  {alert && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <Alert variant={alert.type} className="border-0 shadow-lg rounded-4 mb-4 p-4 d-flex align-items-center gap-3">
                        {alert.type === 'success' ? <FaCheckCircle size={24}/> : <FaInfoCircle size={24}/>}
                        <span className="fw-bold">{alert.message}</span>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants} className="modern-card p-0 overflow-hidden mb-4 border-0 shadow-sm bg-white" style={{ borderRadius: '1rem' }}>
                  <div className="p-3 border-bottom bg-light bg-opacity-50 d-flex justify-content-between align-items-center">
                    <h6 className="fw-extra-bold mb-0 d-flex align-items-center gap-2">
                       <FaCreditCard className="text-success" /> Payment Method
                    </h6>
                    <Badge bg="success" className="px-3 py-1 rounded-pill shadow-xs smallest fw-bold letter-spacing-1">FINAL STEP</Badge>
                  </div>
                  
                  <div className="p-4">
                    <Row className="g-3 mb-5">
                      {[
                        { id: 'GPay', icon: FaCreditCard, color: '#4285F4', label: 'GPay' },
                        { id: 'PhonePe', icon: FaMobileAlt, color: '#5f259f', label: 'PhonePe' },
                        { id: 'UPI', icon: FaQrcode, color: '#ff6b00', label: 'Any UPI' },
                        { id: 'Bank', icon: FaUniversity, color: '#10b981', label: 'NEFT/IMPS' }
                      ].map((method) => (
                        <Col xs={6} md={3} key={method.id}>
                          <motion.div 
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -5 }}
                            className={`p-4 text-center rounded-4 cursor-pointer transition-all border-2 h-100 d-flex flex-column align-items-center justify-content-center ${paymentMethod === method.id ? 'border-success bg-emerald-lightest shadow-emerald' : 'border-light bg-light hover-bg-white border-opacity-50 shadow-xs'}`}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <div className={`p-3 rounded-circle mb-3 ${paymentMethod === method.id ? 'bg-success text-white shadow-sm' : 'bg-white text-muted shadow-xs'}`}>
                               <method.icon size={24} />
                            </div>
                            <div className="smallest fw-extra-bold text-uppercase letter-spacing-1">{method.label}</div>
                            {paymentMethod === method.id && (
                                <motion.div layoutId="payment-active" className="mt-2 text-success"><FaCheckCircle size={12}/></motion.div>
                            )}
                          </motion.div>
                        </Col>
                      ))}
                    </Row>

                    <div className="p-4 rounded-4 text-center mb-4 position-relative overflow-hidden" style={{ background: '#f8fafc', border: '2px solid #e2e8f0' }}>
                      <div className="position-absolute top-0 start-0 w-100 h-100 opacity-5" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      
                      <div className="position-relative z-1">
                        <h5 className="fw-extra-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                            Pay ₹{normalizedPlan.price}
                        </h5>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            key={paymentMethod}
                            className="bg-white p-3 d-inline-block rounded-5 shadow-lg mb-3"
                        >
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pay-to-business&color=${paymentMethod === 'GPay' ? '4285F4' : paymentMethod === 'PhonePe' ? '5f259f' : '059669'}`} 
                            alt="Payment QR" 
                            style={{ width: '160px', height: '160px' }}
                            className="rounded-3"
                          />
                        </motion.div>
                        <p className="smallest text-muted mb-0 fw-600">Scan using any payment app. Transaction recipient: <span className="text-dark fw-bold">GREEN_REWARDS_LLP</span></p>
                      </div>
                    </div>

                    <Form.Group className="mb-4">
                      <Form.Label className="smallest fw-extra-bold text-muted text-uppercase letter-spacing-1">Transaction ID (UTR / Reference No)</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="Enter 12-digit UTR or Reference Number" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="py-3 px-4 rounded-4 border-2 shadow-xs fw-bold"
                        style={{ fontSize: '0.9rem' }}
                      />
                    </Form.Group>

                    <div className="p-4 rounded-4 border-info bg-primary-lightest border d-flex gap-3 align-items-start shadow-xs">
                      <FaInfoCircle size={20} className="text-primary mt-1 flex-shrink-0" />
                      <div className="smallest fw-600 text-dark">
                        <strong>Important:</strong> Please ensure the transaction amount matches ₹{normalizedPlan.price} exactly. Include your Host ID in the payment remarks to expedite verification.
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Col>

              <Col lg={5}>
                <motion.div variants={itemVariants} className="modern-card p-0 overflow-hidden border-0 shadow-sm bg-white h-100 d-flex flex-column" style={{ borderRadius: '1rem' }}>
                  <div className="p-3 border-bottom bg-light bg-opacity-50">
                    <h6 className="fw-extra-bold mb-0 d-flex align-items-center gap-2">
                       <FaFileUpload className="text-success" /> Submit Proof
                    </h6>
                  </div>
                  <div className="p-4 flex-grow-1 d-flex flex-column">
                    <Form.Group className="mb-4 flex-grow-1">
                      <div className={`rounded-4 text-center p-4 border-2 border-dashed transition-all h-100 d-flex flex-column align-items-center justify-content-center ${receiptFile ? 'bg-emerald-lightest border-success border-opacity-50' : 'bg-light hover-bg-white border-muted border-opacity-30'}`}>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="d-none" id="receipt-upload" />
                        <label htmlFor="receipt-upload" className="cursor-pointer mb-0 w-100 d-block">
                          {receiptPreview ? (
                            <div className="position-relative">
                              <img src={receiptPreview} alt="Receipt" className="img-fluid rounded-4 shadow-sm mb-3" style={{ maxHeight: '250px' }} />
                              <div className="fw-extra-bold text-success d-flex align-items-center justify-content-center gap-2 smallest"><FaCheckCircle/> RECEIPT ATTACHED</div>
                              <div className="smallest text-muted mt-1">Click to replace file</div>
                            </div>
                          ) : (
                            <>
                              <div className="p-3 bg-white shadow-emerald rounded-circle d-inline-block mb-3 text-success ring-emerald ring-opacity-10">
                                 <FaImage size={24} />
                              </div>
                              <div className="fw-extra-bold fs-6 mb-1">Upload Transaction Receipt</div>
                              <div className="smallest text-muted fw-semi-bold letter-spacing-1">Supports JPG, PNG (Maximum 5.0 MB)</div>
                            </>
                          )}
                        </label>
                      </div>
                    </Form.Group>

                    <div className="mt-auto">
                      <Button 
                        className="btn-vibrant-emerald w-100 py-3 fw-extra-bold shadow-xs mb-3 transition-all smallest"
                        onClick={handleSubmitPayment}
                        disabled={submitting || !receiptFile}
                        style={{ borderRadius: '0.75rem', letterSpacing: '0.5px' }}
                      >
                        {submitting ? <><Spinner size="sm" className="me-3"/> SECURING SUBMISSION...</> : 'COMPLETE ENROLLMENT'}
                      </Button>
                      <div className="text-center px-4">
                        <p className="smallest text-muted fw-600">By finalizing this payment, you agree to our <span className="text-success cursor-pointer fw-bold border-bottom border-success">Terms of Service</span> and <span className="text-success cursor-pointer fw-bold border-bottom border-success">Privacy Policy</span>.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>

            <motion.div variants={itemVariants} className="text-center mt-5">
               <div className="p-4 bg-white shadow-xs rounded-pill d-inline-flex justify-content-center align-items-center gap-5 border border-light">
                  <div className="smallest fw-extra-bold letter-spacing-2 d-flex align-items-center gap-2 text-muted opacity-60">
                     <FaShieldAlt className="text-success"/> SSL ENCRYPTED
                  </div>
                  <div className="smallest fw-extra-bold letter-spacing-2 d-flex align-items-center gap-2 text-muted opacity-60">
                     <FaCheckCircle className="text-success"/> PCI COMPLIANT
                  </div>
                  <div className="smallest fw-extra-bold letter-spacing-2 d-flex align-items-center gap-2 text-muted opacity-60">
                     <FaShieldAlt className="text-success"/> SECURE STORAGE
                  </div>
               </div>
            </motion.div>
          </Container>
        </motion.div>
      </div>

      <style>{`
          .mt-n5 { margin-top: -6rem !important; }
          .bg-emerald-lightest { background-color: #ecfdf5; }
          .bg-primary-lightest { background-color: #f0f9ff; }
          .border-info { border-color: #bae6fd !important; }
          .smallest { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default SubscriptionPayment;

