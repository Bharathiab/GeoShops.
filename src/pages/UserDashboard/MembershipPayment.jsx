import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { submitMembershipPayment, uploadFile } from '../../api';
import Toast from '../../utils/toast';
import UserNavbar from '../../components/user/UserNavbar';
import { FaCreditCard, FaUpload, FaLock, FaCheckCircle, FaMoneyBillWave, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';

const MembershipPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { requestId, cardName, price, propertyName, cardDesign } = location.state || {}; // Expecting these from previous page

    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [transactionId, setTransactionId] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Redirect if direct access without state
    if (!requestId) {
        return (
            <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
                <UserNavbar />
                <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                    <Card className="shadow-lg border-0 p-5 text-center" style={{ borderRadius: "20px", maxWidth: "500px" }}>
                         <div className="mb-4 text-warning">
                            <FaShieldAlt size={60} />
                         </div>
                        <h3 className="mb-3 fw-bold text-dark">Access Denied</h3>
                        <p className="text-muted mb-4">No membership request found. Please start from the Membership page.</p>
                        <Button variant="primary" onClick={() => navigate('/user/membership')} className="rounded-pill px-4">
                            Go to Memberships
                        </Button>
                    </Card>
                </Container>
            </div>
        );
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                Toast.error('Please upload a valid image or PDF');
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

        if (!transactionId.trim()) {
            Toast.error('Please enter transaction ID');
            return;
        }

        if (!receiptFile) {
            Toast.error('Please upload payment receipt');
            return;
        }

        setUploading(true);

        try {
            // Upload receipt file
            const formData = new FormData();
            formData.append('files', receiptFile);

            const uploadResponse = await uploadFile(formData);
            const receiptUrl = uploadResponse.imageUrls && uploadResponse.imageUrls.length > 0 ? uploadResponse.imageUrls[0] : null;

            if (!receiptUrl) {
                throw new Error('Failed to upload receipt');
            }

            // Submit payment to backend
            // Using the endpoint we created in MembershipController
            await axios.post(`https://geoshops-production.up.railway.app/api/membership/cards/request/${requestId}/payment`, {
                transactionId: transactionId.trim(),
                receiptUrl,
                amount: price,
                paymentMethod
            });

            Toast.success('Payment submitted successfully! Waiting for approval.');
            
            // Success Animation/Redirect
            navigate('/user/membership', { state: { paymentSuccess: true } });

        } catch (error) {
            console.error('Error submitting payment:', error);
            Toast.error(error.response?.data?.message || 'Failed to submit payment.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "50px" }}>
            <UserNavbar />
            
            {/* Background decoration */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "radial-gradient(circle at 10% 20%, rgba(37, 211, 102, 0.05) 0%, rgba(255, 255, 255, 0) 40%), radial-gradient(circle at 90% 80%, rgba(37, 211, 102, 0.05) 0%, rgba(255, 255, 255, 0) 40%)",
                zIndex: 0
            }}></div>

            <Container className="position-relative" style={{ zIndex: 1, marginTop: "40px" }}>
                <Button 
                    variant="link" 
                    className="text-decoration-none text-muted mb-4 ps-0 fw-semibold"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft className="me-2" /> Back
                </Button>

                <Row className="justify-content-center">
                    <Col lg={10} xl={8}>
                        <div className="d-flex align-items-center mb-5">
                            <div className="bg-white p-3 rounded-circle shadow-sm me-3">
                                <FaCreditCard size={32} className="text-success" />
                            </div>
                            <div>
                                <h2 className="fw-bold mb-1" style={{ color: "#1a202c" }}>Secure Payment</h2>
                                <p className="text-muted mb-0">Complete your membership purchase for verified access.</p>
                            </div>
                        </div>

                        <Row>
                            {/* Order Summary & Details */}
                            <Col md={5} className="mb-4 mb-md-0">
                                <Card className="border-0 shadow-lg h-100" style={{ borderRadius: "24px", overflow: "hidden" }}>
                                    {/* Dynamic Card Visual */}
                                    <div className="p-4 text-white" style={{ 
                                        background: cardDesign?.backgroundGradient || cardDesign?.background_gradient || cardDesign?.cardColor || cardDesign?.card_color || "linear-gradient(145deg, #10b981, #059669)",
                                        color: cardDesign?.textColor || cardDesign?.text_color || "white",
                                        minHeight: "200px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between"
                                    }}>
                                        <div>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill bg-opacity-75 backdrop-blur">
                                                    {cardDesign?.cardLevel || "Membership"}
                                                </Badge>
                                                {/* Placeholder for Logo if available */}
                                                {cardDesign?.logoUrl && <img src={cardDesign.logoUrl} alt="Logo" style={{ height: "30px" }} />}
                                            </div>
                                            <h3 className="fw-bold mt-3 mb-0">{cardName}</h3>
                                            <p className="opacity-75 mb-0">{propertyName}</p>
                                        </div>
                                        
                                        <div className="mt-3">
                                            <div className="d-flex justify-content-between align-items-end">
                                                <div>
                                                    <small className="opacity-75 d-block">Valid For</small>
                                                    <span className="fw-semibold">{cardDesign?.validityDays || 365} Days</span>
                                                </div>
                                                <div className="text-end">
                                                    <small className="opacity-75 d-block">Price</small>
                                                    <span className="fs-4 fw-bold">₹{price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Card.Body className="p-4 d-flex flex-column bg-white">
                                        <div className="mb-4">
                                            <h5 className="fw-bold text-dark">Order Summary</h5>
                                        </div>

                                        <div className="mt-auto text-dark">
                                            <div className="d-flex justify-content-between align-items-center mb-3 pt-3 border-top">
                                                <span className="text-muted">Membership Fee</span>
                                                <span className="fw-bold">₹{price}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <span className="opacity-75">Taxes & Fees</span>
                                                <span className="fw-bold">₹0</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                                <span className="fs-5 fw-semibold">Total to Pay</span>
                                                <span className="display-6 fw-bold text-success">₹{price}</span>
                                            </div>
                                        </div>

                                        {/* Security Badge */}
                                        <div className="mt-4 pt-3 text-center border-top">
                                            <small className="d-flex align-items-center justify-content-center text-muted">
                                                <FaLock className="me-2" /> 128-bit SSL Partitioned Connection
                                            </small>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Payment Form */}
                            <Col md={7}>
                                <Card className="border-0 shadow-lg" style={{ borderRadius: "24px" }}>
                                    <Card.Body className="p-4 p-md-5">
                                        <Form onSubmit={handleSubmit}>
                                            <h5 className="fw-bold mb-4">Payment Details</h5>

                                            {/* Payment Method Selection */}
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">Select Payment Method</Form.Label>
                                                <div className="d-flex gap-3 mt-2">
                                                    {['UPI', 'Net Banking', 'Card'].map((method) => (
                                                        <div 
                                                            key={method}
                                                            className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${paymentMethod === method ? 'border-success bg-success bg-opacity-10 text-success fw-bold' : 'border-light bg-light text-muted'}`}
                                                            style={{ flex: 1, cursor: 'pointer', transition: 'all 0.3s' }}
                                                            onClick={() => setPaymentMethod(method)}
                                                        >
                                                            {method}
                                                        </div>
                                                    ))}
                                                </div>
                                            </Form.Group>

                                            {/* Transaction ID */}
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">Transaction ID / UTR Number</Form.Label>
                                                <Form.Control
                                                    size="lg"
                                                    type="text"
                                                    placeholder="e.g. 123456789012"
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    required
                                                    className="bg-light border-0 py-3"
                                                    style={{ borderRadius: "12px", fontSize: "1rem" }}
                                                />
                                            </Form.Group>

                                            {/* Receipt Upload */}
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-muted small fw-bold text-uppercase">Payment Receipt / Screenshot</Form.Label>
                                                <div 
                                                    className="position-relative border-2 border-dashed rounded-4 p-4 text-center hover-shadow transition-all"
                                                    style={{ 
                                                        borderColor: receiptFile ? '#10b981' : '#e2e8f0', 
                                                        backgroundColor: receiptFile ? '#ecfdf5' : '#f8fafc',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {previewUrl ? (
                                                        <div className="d-flex align-items-center justify-content-center flex-column">
                                                            <div className="mb-2 p-1 bg-white rounded shadow-sm border">
                                                                <img src={previewUrl} alt="Preview" style={{ height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                                                            </div>
                                                            <span className="text-success fw-medium text-truncate w-75">{receiptFile.name}</span>
                                                            <small className="text-muted mt-1">Click to change</small>
                                                        </div>
                                                    ) : (
                                                        <div className="py-2">
                                                            <FaUpload className="text-muted mb-3" size={24} />
                                                            <p className="mb-1 fw-medium text-dark">Click to Upload Receipt</p>
                                                            <small className="text-muted">JPG, PNG or PDF (Max 5MB)</small>
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*,application/pdf"
                                                        onChange={handleFileChange}
                                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </Form.Group>

                                            {/* Submit Button */}
                                            <Button 
                                                variant="primary" 
                                                type="submit" 
                                                className="w-100 py-3 rounded-pill fw-bold fs-5 shadow-sm mt-2"
                                                style={{ 
                                                    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)", 
                                                    border: "none",
                                                    letterSpacing: "0.5px"
                                                }}
                                                disabled={uploading}
                                            >
                                                {uploading ? (
                                                    <>Processing Payment...</>
                                                ) : (
                                                    <><FaCheckCircle className="me-2" /> Submit Payment</>
                                                )}
                                            </Button>

                                            <div className="text-center mt-3">
                                                 <small className="text-muted">
                                                    By proceeding, you agree to the payment terms and conditions.
                                                 </small>
                                            </div>

                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default MembershipPayment;
