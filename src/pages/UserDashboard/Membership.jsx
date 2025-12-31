import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Alert, Button, Modal } from "react-bootstrap";
import UserNavbar from "../../components/user/UserNavbar";
import Footer from "./Footer";
import { FaIdCard, FaClock, FaCheckCircle, FaTimesCircle, FaCrown, FaStar, FaRocket, FaGem, FaEye } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Membership = () => {
    const [cards, setCards] = useState([]);
    const [requests, setRequests] = useState([]);
    const [hostSubscriptions, setHostSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCardModal, setShowCardModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const navigate = useNavigate();

    const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
    const userId = userLoginData.userId;

    useEffect(() => {
        if (!userId) {
            navigate("/user-login");
            return;
        }
        fetchData();
    }, [userId, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cardsRes, requestsRes] = await Promise.all([
                axios.get(`https://geoshops-production.up.railway.app/api/membership/user/${userId}/cards`),
                axios.get(`https://geoshops-production.up.railway.app/api/membership/user/${userId}/requests`)
            ]);
            setCards(cardsRes.data);
            setRequests(requestsRes.data);

            // Fetch host subscriptions for each unique host
            const uniqueHostIds = [...new Set(cardsRes.data.map(card => card.host_id))];
            const subscriptionPromises = uniqueHostIds.map(hostId =>
                axios.get(`https://geoshops-production.up.railway.app/api/host/${hostId}/subscription`)
                    .then(res => ({ hostId, subscription: res.data }))
                    .catch(err => ({ hostId, subscription: null }))
            );
            const subscriptions = await Promise.all(subscriptionPromises);
            setHostSubscriptions(subscriptions);
        } catch (err) {
            console.error("Error fetching membership data:", err);
            setError("Failed to load membership information.");
        } finally {
            setLoading(false);
        }
    };

    const CardDisplay = ({ card }) => (
        <div
            className="p-4 rounded-4 shadow-lg position-relative overflow-hidden mb-4"
            style={{
                background: card.background_gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: card.text_color || "#FFFFFF",
                height: "220px",
                width: "100%",
                maxWidth: "400px",
                borderRadius: "20px",
                fontFamily: "'Inter', sans-serif",
                margin: "0 auto"
            }}
        >
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <h4 className="fw-bold mb-0" style={{ letterSpacing: "1px" }}>{card.card_name}</h4>
                    <span className="text-uppercase small opacity-75">{card.card_level} Member</span>
                </div>
                <FaCrown size={30} style={{ color: card.accent_color || "#FFD700" }} />
            </div>

            <div className="mt-4">
                <p className="mb-1 small opacity-75">Issued By: {card.host_name}</p>
                <p className="small mb-0" style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                }}>
                    {card.benefits}
                </p>
            </div>

            <div className="position-absolute bottom-0 start-0 w-100 p-4 d-flex justify-content-between align-items-end">
                <div>
                    <p className="mb-0 small opacity-75">Valid Until</p>
                    <p className="mb-0 fw-bold">{new Date(card.expiry_date).toLocaleDateString()}</p>
                </div>
                <div className="text-end">
                    <p className="mb-0 small opacity-75">Card No.</p>
                    <p className="mb-0 fw-bold" style={{ letterSpacing: "2px" }}>{card.card_number}</p>
                </div>
            </div>
        </div>
    );

    const getPlanIcon = (planType) => {
        switch (planType) {
            case 'Basic': return <FaStar size={30} className="text-primary" />;
            case 'Pro': return <FaRocket size={30} className="text-purple" />;
            case 'Elite': return <FaGem size={30} className="text-danger" />;
            default: return <FaCrown size={30} className="text-warning" />;
        }
    };

    const getPlanColor = (planType) => {
        switch (planType) {
            case 'Basic': return '#3498db';
            case 'Pro': return '#9b59b6';
            case 'Elite': return '#e74c3c';
            default: return '#f39c12';
        }
    };

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            <UserNavbar />
            <Container className="py-5" style={{ marginTop: "80px" }}>
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3 text-dark">
                        <FaIdCard className="me-2 text-warning" /> My Membership Wallet
                    </h2>
                    <p className="text-muted lead">
                        Manage your exclusive memberships and track your requests.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : (
                    <>
                        {error && <Alert variant="danger">{error}</Alert>}

                        {/* Active Cards Section */}
                        <div className="mb-5">
                            <h4 className="fw-bold mb-4 border-bottom pb-2">Active Memberships</h4>
                            {cards.length === 0 ? (
                                <Alert variant="info" className="text-center">
                                    You don't have any active membership cards yet.
                                    <br />
                                    Explore properties and request memberships to unlock benefits!
                                    <div className="mt-3">
                                        <Button variant="primary" onClick={() => navigate("/user")}>Explore Properties</Button>
                                    </div>
                                </Alert>
                            ) : (
                                <Row>
                                    {cards.map(card => (
                                        <Col md={6} lg={4} key={card.id}>
                                            <CardDisplay card={card} />
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>



                        {/* Requests Section */}
                        <div>
                            <h4 className="fw-bold mb-4 border-bottom pb-2">Request History</h4>
                            {requests.length === 0 ? (
                                <p className="text-muted">No membership requests found.</p>
                            ) : (
                                <Card className="border-0 shadow-sm">
                                    <Card.Body className="p-0">
                                        {requests.map((req, index) => (
                                            <div key={req.id} className={`d-flex justify-content-between align-items-center p-3 ${index !== requests.length - 1 ? "border-bottom" : ""}`}>
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        {req.status === "Approved" ? <FaCheckCircle className="text-success" size={24} /> :
                                                            req.status === "Rejected" ? <FaTimesCircle className="text-danger" size={24} /> :
                                                                <FaClock className="text-warning" size={24} />}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{req.card_name}</h6>
                                                        <small className="text-dark d-block fw-semibold">{req.propertyName || req.property_name}</small>
                                                        <small className="text-muted">Host: {req.host_name || "N/A"}</small>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <Badge bg={
                                                        req.status === "Approved" ? "success" : 
                                                        req.status === "Rejected" ? "danger" : 
                                                        req.payment_status === "Pending Payment" ? "info" :
                                                        req.payment_status === "Paid" ? "primary" : "warning"
                                                    }>
                                                        {req.status === "Approved" ? "Approved" : 
                                                         req.status === "Rejected" ? "Rejected" : 
                                                         req.payment_status === "Pending Payment" ? "Payment Required" :
                                                         req.payment_status === "Paid" ? "Verification Pending" : "Request Pending"}
                                                    </Badge>
                                                    <div className="small text-muted mt-1">
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="small fw-bold mt-1 text-primary">
                                                        {req.amount_paid > 0 ? `₹${req.amount_paid}` : (req.card_price > 0 ? `₹${req.card_price}` : 'Free')}
                                                    </div>
                                                </div>
                                                
                                                {/* Payment Action Icon */}
                                                {(req.payment_status === "Pending Payment" || (req.status === "Pending" && req.payment_status !== "Paid" && req.payment_status !== "Free")) && (
                                                    <div className="ms-3">
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm"
                                                            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                            style={{ width: "40px", height: "40px" }}
                                                            title="Complete Payment"
                                                            onClick={() => navigate('/user/membership-payment', {
                                                                state: {
                                                                    requestId: req.id,
                                                                    cardName: req.card_name,
                                                                    price: req.card_price,
                                                                    propertyName: req.property_name,
                                                                    cardDesign: {
                                                                        cardName: req.card_name,
                                                                        cardLevel: req.card_level,
                                                                        validityDays: req.card_validity,
                                                                        cardColor: req.card_color,
                                                                        backgroundGradient: req.background_gradient,
                                                                        textColor: req.text_color,
                                                                        accentColor: req.accent_color,
                                                                        logoUrl: req.logo_url
                                                                    }
                                                                }
                                                            })}
                                                        >
                                                            <FaIdCard size={18} />
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* View Order Summary Icon (For Paid/Completed) */}
                                                 {(req.payment_status === "Paid" || req.payment_status === "Free" || req.status === "Approved") && (
                                                    <div className="ms-3">
                                                        <Button 
                                                            variant="outline-secondary" 
                                                            size="sm"
                                                            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                            style={{ width: "40px", height: "40px" }}
                                                            title="View Order Summary"
                                                            onClick={() => {
                                                                setSelectedCard({ ...req, isOrderSummary: true }); 
                                                                setShowCardModal(true);
                                                            }}
                                                        >
                                                            <FaEye size={18} /> 
                                                        </Button>
                                                    </div>
                                                 )}
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </Container>
            
            {/* Order Summary / Card Modal */}
             <Modal show={showCardModal} onHide={() => { setShowCardModal(false); setSelectedCard(null); }} centered size="lg">
                <Modal.Header closeButton style={{ borderBottom: "none" }}>
                    <Modal.Title className="fw-bold">
                        {selectedCard?.isOrderSummary ? "Order Summary" : "Membership Card Details"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4" style={{ backgroundColor: "#f8f9fa" }}>
                    {selectedCard && (
                        <div className="d-flex flex-column align-items-center">
                             {/* Card Preview */}
                            <div
                                style={{
                                    width: "100%",
                                    maxWidth: "400px",
                                    height: "220px",
                                    borderRadius: "20px",
                                    background: selectedCard.background_gradient || selectedCard.card_color || "linear-gradient(135deg, #333 0%, #000 100%)",
                                    color: selectedCard.text_color || "#fff",
                                    padding: "25px",
                                    position: "relative",
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    overflow: "hidden",
                                    marginBottom: "2rem"
                                }}
                            >
                                 <div className="d-flex justify-content-between align-items-start" style={{ zIndex: 1 }}>
                                    <div>
                                        <h5 className="mb-1 opacity-75 small text-uppercase" style={{ letterSpacing: '1px' }}>
                                            {selectedCard.propertyName || selectedCard.property_name}
                                        </h5>
                                        <h3 className="m-0 fw-bold">{selectedCard.card_name || selectedCard.cardName}</h3>
                                        <Badge bg="light" text="dark" className="mt-2 opacity-75">{selectedCard.card_level || selectedCard.cardLevel} Member</Badge>
                                    </div>
                                     <FaCrown size={30} style={{ color: selectedCard.accent_color || "#FFD700" }} />
                                </div>
                                <div className="d-flex justify-content-between align-items-end" style={{ zIndex: 1 }}>
                                    <div>
                                        <div className="small opacity-50 text-uppercase">Card Holder</div>
                                        <div className="fw-bold">{userLoginData.username || "User"}</div>
                                    </div>
                                     <div className="text-end">
                                        <div className="small opacity-50 text-uppercase">Valid Until</div>
                                        <div className="fw-bold">
                                             {selectedCard.createdAt ? 
                                                 new Date(new Date(selectedCard.createdAt).setDate(new Date(selectedCard.createdAt).getDate() + (selectedCard.card_validity || 365))).toLocaleDateString() 
                                                 : "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Order Details Table */}
                             <div className="w-100 bg-white p-4 rounded-4 shadow-sm">
                                 <h5 className="fw-bold mb-3 border-bottom pb-2">Transaction Details</h5>
                                 <Row className="mb-2">
                                     <Col xs={6} className="text-muted">Status</Col>
                                     <Col xs={6} className="text-end fw-bold">
                                         <Badge bg={selectedCard.payment_status === 'Paid' ? 'success' : 'secondary'}>
                                             {selectedCard.payment_status || 'Free'}
                                         </Badge>
                                     </Col>
                                 </Row>
                                 <Row className="mb-2">
                                     <Col xs={6} className="text-muted">Amount Paid</Col>
                                     <Col xs={6} className="text-end fw-bold">₹{selectedCard.amount_paid || 0}</Col>
                                 </Row>
                                 <Row className="mb-2">
                                     <Col xs={6} className="text-muted">Transaction ID</Col>
                                     <Col xs={6} className="text-end small font-monospace">{selectedCard.transactionId || "N/A"}</Col>
                                 </Row>
                                 <Row className="mb-0">
                                     <Col xs={6} className="text-muted">Order Date</Col>
                                     <Col xs={6} className="text-end">
                                         {selectedCard.createdAt ? new Date(selectedCard.createdAt).toLocaleString() : "N/A"}
                                     </Col>
                                 </Row>
                             </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light rounded-bottom-4">
                     <Button variant="secondary" onClick={() => setShowCardModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
            
            <Footer />
        </div>
    );
};

export default Membership;
