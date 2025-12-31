import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCreditCard, FaLock, FaCheckCircle, FaUpload, FaUniversity, FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import { submitBookingPayment, uploadFile } from '../../api';
import Toast from '../../utils/toast';
import UserNavbar from '../../components/user/UserNavbar';

const BookingPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingId, amount, propertyName, department } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [transactionId, setTransactionId] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Form variants for animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (!bookingId) {
        return (
            <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
                <UserNavbar />
                <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-5 bg-white rounded-5 shadow-sm border">
                        <FaLock size={60} className="text-warning mb-4" />
                        <h3 className="fw-900 mb-3">Access Restricted</h3>
                        <p className="text-muted mb-4 opacity-70">
                            No active booking session found. This usually happens if the page is refreshed or accessed directly. 
                            Please try booking your service again from the dashboard.
                        </p>
                        <Button className="btn-gold-gradient px-5 py-3 rounded-pill fw-bold border-0" onClick={() => navigate('/user')}>
                            RETURN TO DASHBOARD
                        </Button>
                    </motion.div>
                </Container>
            </div>
        );
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                Toast.error('Please upload a valid image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                Toast.error('File size must be less than 5MB');
                return;
            }
            setReceiptFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (paymentMethod !== 'Cash') {
            if (!transactionId.trim()) {
                Toast.error('Please enter transaction ID');
                return;
            }
            if (!receiptFile) {
                Toast.error('Please upload payment receipt');
                return;
            }
        }

        setUploading(true);
        try {
            let receiptUrl = null;
            if (paymentMethod !== 'Cash') {
                const formData = new FormData();
                formData.append('files', receiptFile);
                const uploadResponse = await uploadFile(formData);
                receiptUrl = uploadResponse.imageUrls?.[0];
                if (!receiptUrl) throw new Error('Failed to upload receipt');
            }

            const paymentData = {
                amount: parseFloat(amount),
                paymentMethod,
                transactionId: transactionId.trim(),
                receiptUrl
            };

            await submitBookingPayment(bookingId, paymentData);
            Toast.success('Payment submitted! Verification in progress.');
            
            setTimeout(() => {
                navigate('/user/bookings');
            }, 2000);

        } catch (error) {
            console.error('Payment Error:', error);
            Toast.error(error.message || 'Payment submission failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" }}>
            <UserNavbar />
            
            {/* Elite Header */}
            <div style={{ background: 'linear-gradient(135deg, #001A14 0%, #002C22 100%)', padding: '60px 0 100px', color: 'white' }}>
                <Container>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="d-flex align-items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> <span className="fw-bold text-uppercase smallest tracking-widest opacity-70">Back to Details</span>
                    </motion.div>
                    <h2 className="fw-900 mb-1 font-heading">Secure <span className="text-gold">Payment</span></h2>
                    <p className="opacity-60 mb-0">Finalize your booking for {propertyName}</p>
                </Container>
            </div>

            <Container style={{ marginTop: '-60px' }} className="pb-5">
                <Row className="g-4">
                    {/* Payment Form */}
                    <Col lg={7}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-5 shadow-sm p-4 p-md-5 border border-light">
                            <h5 className="fw-900 mb-4 d-flex align-items-center gap-3">
                                <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                                    <FaCreditCard size={18} />
                                </div>
                                Choose Payment Method
                            </h5>

                            <Row className="g-3 mb-5 text-center">
                                {[
                                    { id: 'UPI', label: 'UPI / Scan', icon: <FaWallet /> },
                                    { id: 'Net Banking', label: 'Bank Transfer', icon: <FaUniversity /> },
                                    { id: 'Card', label: 'Credit/Debit', icon: <FaCreditCard /> },
                                    { id: 'Cash', label: 'Legacy Cash', icon: <FaMoneyBillWave /> }
                                ].map((method) => (
                                    <Col xs={6} md={3} key={method.id}>
                                        <div 
                                            className={`p-3 rounded-4 border-2 transition-all cursor-pointer h-100 d-flex flex-column align-items-center gap-2 ${paymentMethod === method.id ? 'border-success bg-success text-white shadow-sm' : 'border-light hover-bg-light text-black'}`}
                                            onClick={() => setPaymentMethod(method.id)}
                                        >
                                            <div style={{ fontSize: '1.2rem' }}>{method.icon}</div>
                                            <span className="fw-bold smaller tracking-tight uppercase" style={{ fontSize: '0.7rem' }}>{method.label}</span>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            <Form onSubmit={handleSubmit}>
                                {paymentMethod !== 'Cash' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2">Transaction ID / Reference</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                className="rounded-4 py-3 border-light bg-light focus-ring-success"
                                                placeholder="Enter unique transaction ID"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4 text-center">
                                            <Form.Label className="fw-bold smallest text-muted text-uppercase tracking-widest mb-2 d-block text-start">Upload Receipt</Form.Label>
                                            <div 
                                                className="border-2 border-dashed rounded-5 p-5 transition-all text-center position-relative"
                                                style={{ borderColor: receiptFile ? '#10b981' : '#e2e8f0', background: receiptFile ? '#f0fdf4' : '#f8fafc' }}
                                            >
                                                {previewUrl ? (
                                                    <div className="d-flex flex-column align-items-center gap-2">
                                                        <img src={previewUrl} className="rounded-3 shadow-sm border" style={{ height: '80px', width: '80px', objectFit: 'cover' }} alt="Preview" />
                                                        <span className="fw-bold text-success smaller">{receiptFile.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="opacity-50">
                                                        <FaUpload size={24} className="mb-2" />
                                                        <p className="mb-0 fw-bold smallest">Click or drag receipt image</p>
                                                    </div>
                                                )}
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" 
                                                    onChange={handleFileChange} 
                                                    required 
                                                />
                                            </div>
                                        </Form.Group>
                                    </motion.div>
                                )}

                                <Button 
                                    type="submit" 
                                    className="btn-gold-gradient w-100 py-3 rounded-pill fw-bold shadow-lg border-0 mt-4 d-flex align-items-center justify-content-center gap-2"
                                    disabled={uploading}
                                >
                                    {uploading ? <Spinner animation="border" size="sm" /> : <FaCheckCircle />}
                                    {uploading ? 'PROCESSING...' : `CONFIRM ₹${amount} PAYMENT`}
                                </Button>
                            </Form>
                        </motion.div>
                    </Col>

                    {/* Order Summary Sidebar */}
                    <Col lg={5}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-5 shadow-sm p-4 p-md-5 border border-light sticky-top" style={{ top: '100px' }}>
                            <h5 className="fw-900 mb-4 font-heading">Order Summary</h5>
                            <div className="p-4 rounded-4 bg-light mb-4 border border-light">
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted fw-bold smallest text-uppercase">Service</span>
                                    <span className="fw-900 text-dark">{propertyName}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted fw-bold smallest text-uppercase">Category</span>
                                    <span className="fw-bold">{department} Selection</span>
                                </div>
                                <div className="d-flex justify-content-between pt-3 border-top border-2">
                                    <span className="text-dark fw-900 fs-5">Amount Due</span>
                                    <span className="text-success fw-900 fs-4">₹{amount}</span>
                                </div>
                            </div>

                            {/* Trust Badge */}
                            <div className="p-4 rounded-4 bg-dark text-white d-flex align-items-center gap-4 border shadow-lg" style={{ background: '#002C22' }}>
                                <div className="bg-gold rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', backgroundColor: '#ffb321' }}>
                                    <FaLock className="text-dark" size={18} />
                                </div>
                                <div>
                                    <h6 className="mb-1 fw-900 text-gold" style={{ color: '#ffb321' }}>Secure Transaction</h6>
                                    <p className="mb-0 smallest opacity-60">Verified SSL encrypted payment channel</p>
                                </div>
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .btn-gold-gradient {
                    background: linear-gradient(90deg, #FF8904 0%, #ff9f2e 100%);
                    color: #fff;
                    transition: all 0.3s ease;
                }
                .btn-gold-gradient:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(255, 137, 4, 0.3);
                    color: #fff;
                }
                .bg-gold { background-color: #ffb321; }
                .text-gold { color: #ffb321; }
                .font-heading { font-family: 'Montserrat', sans-serif; letter-spacing: -0.5px; }
                .smallest { font-size: 0.7rem; }
                .fw-900 { font-weight: 900; }
                .hover-bg-light:hover { background-color: #f8fafc; }
                .text-black { color: #000 !important; }
            `}</style>
        </div>
    );
};

export default BookingPayment;
