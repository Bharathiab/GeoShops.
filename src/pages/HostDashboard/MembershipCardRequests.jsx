import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Badge, Alert, Spinner, Modal, Form, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import { FaUserCheck, FaCheck, FaTimes, FaIdCard, FaPaperPlane, FaEye, FaCalendar, FaClock, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaUser, FaBuilding, FaSync, FaHome } from "react-icons/fa";
import axios from "axios";
import { fetchHostMembershipRequests } from "../../api";
import "./HostDashboard.css";

const MembershipCardRequests = () => {
    const [requests, setRequests] = useState([]);
    const [cardDesigns, setCardDesigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedCard, setSelectedCard] = useState("");
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [viewReceiptUrl, setViewReceiptUrl] = useState(null);

    const hostId = JSON.parse(localStorage.getItem("hostLoginData"))?.hostId;

    useEffect(() => {
        if (hostId) {
            fetchRequests();
            fetchCardDesigns();
        }
    }, [hostId]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            console.log("Fetching membership requests for hostId:", hostId);
            // Use the centralized api.js function
            const data = await fetchHostMembershipRequests(hostId);
            console.log("Received membership requests data:", data);
            
            // Handle both raw array and ApiResponse wrapper
            if (Array.isArray(data)) {
                setRequests(data);
            } else if (data && data.data && Array.isArray(data.data)) {
                setRequests(data.data);
            } else {
                console.warn("Unexpected data format for membership requests:", data);
                setRequests([]);
            }
        } catch (err) { 
            console.error("Error fetching requests:", err);
            setError("Failed to load membership requests."); 
        } finally { setLoading(false); }
    };

    const fetchCardDesigns = async () => {
        try {
            const response = await axios.get(`https://geoshops-production.up.railway.app/api/membership/host/${hostId}/cards/designs`);
            setCardDesigns(response.data);
        } catch (err) { console.error("Error fetching card designs:", err); }
    };

    const handleAction = async (requestId, action, cardDesignId = null) => {
        try {
            const payload = { status: action === "approve" ? "Approved" : "Rejected" };
            if (cardDesignId) payload.cardDesignId = cardDesignId;
            await axios.put(`https://geoshops-production.up.railway.app/api/membership/host/requests/${requestId}`, payload);
            setSuccess(`Request ${action}d successfully.`);
            fetchRequests();
            setShowApproveModal(false); setSelectedRequest(null); setSelectedCard("");
        } catch (err) { setError(`Failed to ${action} request.`); }
    };

    const openApproveModal = (request) => {
        setSelectedRequest(request);
        setSelectedCard(request.card_design_id ? request.card_design_id.toString() : "");
        setShowApproveModal(true);
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <div className="host-dashboard-wrapper">
            <HostNavbar />
            <div className="host-main-content">
                <Container className="py-5">
                    <header className="dashboard-header mb-4">
                        <div className="header-text">
                            <h1>Membership Requests</h1>
                            <p>Manage incoming guest applications for your loyalty programs.</p>
                        </div>
                        <Button variant="light" size="sm" onClick={fetchRequests} className="btn-modern px-3"><FaSync className="me-2"/> Refresh</Button>
                    </header>

                    <AnimatePresence mode="wait">
                        {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setError("")} dismissible>{error}</Alert></motion.div>}
                        {success && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}><Alert variant="success" className="border-0 shadow-sm rounded-4 mb-4" onClose={() => setSuccess("")} dismissible>{success}</Alert></motion.div>}
                    </AnimatePresence>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <Card className="modern-card border-0 overflow-hidden">
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5"><Spinner animation="grow" variant="success" /></div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <div className="icon-box-lg bg-emerald-lightest mx-auto mb-4 rounded-circle"><FaIdCard size={32} className="opacity-50" /></div>
                                        <h5 className="font-weight-bold text-dark">Clear Skies!</h5>
                                        <p>No pending membership card requests found.</p>
                                    </div>
                                ) : (
                                    <div className="modern-table-wrapper">
                                        <Table hover responsive className="modern-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Guest Info</th>
                                                    <th>Source Property</th>
                                                    <th>Premium Tier</th>
                                                    <th>Transaction</th>
                                                    <th>Submission</th>
                                                    <th>Status</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {requests.map((req) => {
                                                    const assignedCard = req.card_design_id ? 
                                                        cardDesigns.find(card => String(card.id) === String(req.card_design_id)) : null;
                                                    return (
                                                        <tr key={req.id}>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <div className="icon-box-sm bg-light text-muted rounded-circle"><FaUser size={12}/></div>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="font-weight-bold text-dark">{req.user_name}</span>
                                                                        <span className="smallest text-muted lowercase">{req.user_email}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                                    <FaHome size={12}/> {req.property_name || 'General Access'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {assignedCard ? (
                                                                    <div className="d-flex flex-column">
                                                                        <span className="small font-weight-bold text-dark">{assignedCard.cardName}</span>
                                                                        <Badge bg="emerald-lightest" className="text-success uppercase smallest w-fit">{assignedCard.cardLevel}</Badge>
                                                                    </div>
                                                                ) : <span className="text-muted smallest italic">Pending Selection</span>}
                                                            </td>
                                                            <td>
                                                                {req.payment_status === "Paid" ? (
                                                                    <div className="d-flex flex-column">
                                                                        <span className="small font-weight-bold text-success">Verified Paid</span>
                                                                        <span className="smallest text-muted">₹{req.amount_paid}</span>
                                                                    </div>
                                                                ) : req.payment_status === "Free" ? (
                                                                    <Badge bg="light" className="text-muted uppercase smallest">Complimentary</Badge>
                                                                ) : <Badge bg="warning-lightest" className="text-warning uppercase smallest">Due for Review</Badge>}
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                                    <FaCalendar size={12}/> {new Date(req.created_at).toLocaleDateString()}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Badge 
                                                                    bg={req.status === "Pending" ? "warning" : req.status === "Approved" ? "success" : "danger"} 
                                                                    className="rounded-pill px-3 py-2 uppercase smallest letter-spacing-1"
                                                                >
                                                                    {req.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="text-end">
                                                                <div className="d-flex justify-content-end gap-2">
                                                                    {req.receipt_url && (
                                                                        <Button variant="link" className="icon-btn-sm text-primary" title="Audit Receipt" onClick={() => { setViewReceiptUrl({ ...req }); setShowReceiptModal(true); }}><FaFileAlt /></Button>
                                                                    )}
                                                                    {req.status === "Pending" && (
                                                                        <>
                                                                            <Button variant="link" className="icon-btn-sm text-success" title="Approve Request" onClick={() => openApproveModal(req)}><FaCheck /></Button>
                                                                            <Button variant="link" className="icon-btn-sm text-danger" title="Reject Request" onClick={() => handleAction(req.id, "reject")}><FaTimes /></Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Container>
            </div>

            <Modal show={showReceiptModal} onHide={() => { setShowReceiptModal(false); setViewReceiptUrl(null); }} centered size="lg" className="modern-modal">
                <Modal.Header closeButton><Modal.Title className="font-weight-bold h5">Transaction Audit</Modal.Title></Modal.Header>
                <Modal.Body className="p-5">
                    {viewReceiptUrl && (
                        <Row className="g-5">
                            <Col md={6}>
                                <h6 className="uppercase smallest letter-spacing-2 font-weight-bold text-muted mb-4">Verification Shield</h6>
                                <div className="modern-card bg-light p-4 shadow-inner border-0">
                                    <div className="d-flex flex-column gap-3">
                                        <div className="pb-3 border-bottom"><span className="smallest text-muted uppercase block mb-1">Requester</span><span className="font-weight-bold d-block">{viewReceiptUrl.user_name}</span></div>
                                        <div className="pb-3 border-bottom"><span className="smallest text-muted uppercase block mb-1">Validated Amount</span><span className="h4 font-weight-bold text-success mb-0 d-block">₹{viewReceiptUrl.amount_paid}</span></div>
                                        <div className="pb-3 border-bottom"><span className="smallest text-muted uppercase block mb-1">Trace Identifier</span><span className="font-monospace small text-primary d-block">{viewReceiptUrl.transaction_id || "SYSTEM_GENERATED_UUID"}</span></div>
                                        <div className="pb-0"><span className="smallest text-muted uppercase block mb-1">Timestamp</span><span className="small d-block text-muted">{new Date(viewReceiptUrl.created_at).toLocaleString()}</span></div>
                                    </div>
                                </div>
                                <div className="mt-4 d-flex align-items-center gap-2 text-success smallest font-weight-bold">
                                    <FaCheckCircle/> SSL Encrypted Transaction Data
                                </div>
                            </Col>
                            <Col md={6} className="text-center">
                                <h6 className="uppercase smallest letter-spacing-2 font-weight-bold text-muted mb-4">Captured Proof</h6>
                                <div className="modern-card bg-white p-3 shadow-sm border overflow-hidden rounded-4 d-flex align-items-center justify-content-center" style={{ minHeight: '340px' }}>
                                    {viewReceiptUrl.receipt_url ? (
                                        viewReceiptUrl.receipt_url.endsWith('.pdf') ? (
                                            <div className="text-center py-5">
                                                <div className="icon-box-lg bg-emerald-lightest text-success mx-auto mb-3 rounded-circle"><FaFileAlt size={32}/></div>
                                                <p className="small font-weight-bold mb-3">PDF Verification Document</p>
                                                <Button className="btn-modern btn-primary-modern shadow-sm px-4" href={viewReceiptUrl.receipt_url} target="_blank">Access PDF Proof</Button>
                                            </div>
                                        ) : (
                                            <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={viewReceiptUrl.receipt_url} alt="Proof of Payment" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', cursor: 'zoom-in' }} onClick={() => window.open(viewReceiptUrl.receipt_url, '_blank')} title="View Full Dimension" />
                                        )
                                    ) : <div className="text-muted italic small">Digital proof not attached</div>}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered className="modern-modal">
                <Modal.Header closeButton><Modal.Title className="font-weight-bold h5">Issuance Confirmation</Modal.Title></Modal.Header>
                <Modal.Body className="p-5">
                    <div className="text-center mb-5">
                        <div className="icon-box-lg bg-emerald-lightest text-success mx-auto mb-4 rounded-circle"><FaPaperPlane size={24}/></div>
                        <h4 className="font-weight-bold">Approve Request?</h4>
                        <p className="text-muted">You are about to issue a premium membership to <strong>{selectedRequest?.user_name}</strong>. Please select the tier below.</p>
                    </div>

                    <Form.Group className="mb-4">
                        <Form.Label className="smallest uppercase font-weight-bold text-muted">Allocated Tier Design</Form.Label>
                        <Form.Select className="form-select-modern" value={selectedCard} onChange={(e) => setSelectedCard(e.target.value)}>
                            <option value="">-- Choose Access Level --</option>
                            {cardDesigns.map(card => <option key={card.id} value={card.id}>{card.cardName} ({card.cardLevel})</option>)}
                        </Form.Select>
                    </Form.Group>

                    {selectedRequest?.payment_status === "Paid" && (
                        <div className="alert-modern info-modern flex-row align-items-center gap-3 p-4">
                            <FaCheckCircle className="text-success" size={20}/>
                            <div className="small">Payment for <strong>₹{selectedRequest.amount_paid}</strong> has been cleared. Approving will finalize this user's membership.</div>
                        </div>
                    )}

                    {cardDesigns.length === 0 && (
                        <div className="alert-modern warning-modern p-4">
                            <FaExclamationCircle size={20}/>
                            <div className="small">No card designs detected. You must create at least one design in <strong>Membership Designer</strong> before approving.</div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 px-5 pb-5 pt-0">
                    <div className="d-flex gap-3 w-100">
                        <Button variant="light" className="btn-modern flex-grow-1" onClick={() => setShowApproveModal(false)}>Discard</Button>
                        <Button className="btn-modern btn-primary-modern flex-grow-1" onClick={() => handleAction(selectedRequest.id, "approve", selectedCard)} disabled={!selectedCard}>Verify & Issue Card</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MembershipCardRequests;


