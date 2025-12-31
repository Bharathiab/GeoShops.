import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Badge, Spinner } from "react-bootstrap";
import { 
    FaCheck, 
    FaTimes, 
    FaEye, 
    FaDownload, 
    FaFileInvoiceDollar, 
    FaCalendarAlt,
    FaSearch,
    FaMoneyBillWave,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaUser,
    FaCrown
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { fetchPendingSubscriptionPayments, fetchAllSubscriptionPayments, approveSubscriptionPayment, rejectSubscriptionPayment } from "../../api";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/admin/AdminDashboardModern.css";

const AdminSubscriptionRequests = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [filter, setFilter] = useState("pending"); // "pending" or "all"
    const [processingId, setProcessingId] = useState(null);

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'approve' or 'reject'
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    useEffect(() => {
        loadPayments();
    }, [filter]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = filter === "pending"
                ? await fetchPendingSubscriptionPayments()
                : await fetchAllSubscriptionPayments();
            setPayments(data);
        } catch (error) {
            console.error("Error loading subscription payments:", error);
            Toast.error("Failed to load subscription payments");
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (action, paymentId) => {
        setConfirmAction(action);
        setSelectedPaymentId(paymentId);
        setShowConfirmModal(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedPaymentId || !confirmAction) return;

        try {
            setProcessingId(selectedPaymentId);
            const adminData = JSON.parse(localStorage.getItem("adminLoginData"));
            const adminId = adminData?.id || 1;

            if (confirmAction === 'approve') {
                await approveSubscriptionPayment(selectedPaymentId, adminId);
                Toast.success("Subscription payment approved successfully!");
            } else if (confirmAction === 'reject') {
                await rejectSubscriptionPayment(selectedPaymentId, adminId);
                Toast.success("Subscription payment rejected");
            }
            
            loadPayments();
        } catch (error) {
            console.error(`Error ${confirmAction}ing payment:`, error);
            Toast.error(`Failed to ${confirmAction} payment: ` + error.message);
        } finally {
            setProcessingId(null);
            setShowConfirmModal(false);
            setConfirmAction(null);
            setSelectedPaymentId(null);
        }
    };

    const handleViewReceipt = (receiptPath) => {
        setSelectedReceipt(receiptPath);
        setShowReceiptModal(true);
    };

    const getStatusDetails = (status) => {
        switch (status) {
            case 'Approved': return { bg: 'success', icon: <FaCheckCircle />, text: 'Approved' };
            case 'Rejected': return { bg: 'danger', icon: <FaTimesCircle />, text: 'Rejected' };
            default: return { bg: 'warning', icon: <FaClock />, text: 'Pending' };
        }
    };

    // Calculate Stats
    const totalRequests = payments.length;
    const totalAmount = payments.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const pendingCount = payments.filter(p => p.status === 'Pending').length;

    return (
        <div className="dashboard-container">
            <AdminNavbar />
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
            >
                <Container fluid className="pb-4">
                    {/* Header Section */}
                    <Row className="mb-4">
                        <Col md={8}>
                            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                                Subscription Requests
                            </h2>
                            <p className="text-secondary mb-0">
                                Review and manage host subscription payment proofs.
                            </p>
                        </Col>
                        <Col md={4} className="text-md-end d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
                            <div className="bg-white p-2 rounded-pill shadow-sm d-flex align-items-center px-3 border">
                                <FaCalendarAlt className="text-primary me-2" />
                                <span className="fw-bold text-dark">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </Col>
                    </Row>

                    {/* Stats Cards */}
                    <Row className="g-4 mb-4">
                        <Col md={4}>
                            <Card className="modern-card border-0 shadow-sm">
                                <Card.Body className="d-flex align-items-center p-4">
                                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                                        <FaFileInvoiceDollar className="text-primary fs-3" />
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-0">{totalRequests}</h4>
                                        <div className="text-muted small">Total Requests</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="modern-card border-0 shadow-sm">
                                <Card.Body className="d-flex align-items-center p-4">
                                    <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                                        <FaClock className="text-warning fs-3" />
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-0">{pendingCount}</h4>
                                        <div className="text-muted small">Pending Review</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="modern-card border-0 shadow-sm">
                                <Card.Body className="d-flex align-items-center p-4">
                                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                                        <FaMoneyBillWave className="text-success fs-3" />
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-0">₹{totalAmount.toLocaleString()}</h4>
                                        <div className="text-muted small">Total Volume</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Filter & Actions */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="bg-white p-1 rounded-pill shadow-sm border d-inline-flex">
                             <Button
                                variant={filter === "pending" ? "primary" : "light"}
                                onClick={() => setFilter("pending")}
                                className={`rounded-pill px-4 fw-bold ${filter === "pending" ? "shadow-sm" : "bg-transparent border-0 text-secondary"}`}
                                size="sm"
                            >
                                Pending Only
                            </Button>
                            <Button
                                variant={filter === "all" ? "primary" : "light"}
                                onClick={() => setFilter("all")}
                                className={`rounded-pill px-4 fw-bold ${filter === "all" ? "shadow-sm" : "bg-transparent border-0 text-secondary"}`}
                                size="sm"
                            >
                                All Requests
                            </Button>
                        </div>
                    </div>

                    <Card className="modern-card border-0 shadow-sm overflow-hidden mb-5">
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="primary" />
                                    <p className="mt-3 text-muted fw-bold">Loading requests...</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="modern-table mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="px-4 py-3 text-secondary text-uppercase small fw-bold">#</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Host Name</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Subscription</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Amount</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Method</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Date</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold">Status</th>
                                                <th className="py-3 text-secondary text-uppercase small fw-bold text-end px-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-5">
                                                        <div className="text-muted d-flex flex-column align-items-center opacity-75">
                                                            <FaSearch className="fs-1 mb-3 text-secondary opacity-50"/>
                                                            <h6 className="fw-bold">No requests found</h6>
                                                            <p className="small mb-0">Try changing filter settings.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                payments.map((payment, index) => {
                                                    const status = getStatusDetails(payment.status);
                                                    return (
                                                        <motion.tr 
                                                            key={payment.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                                            whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                                                        >
                                                            <td className="px-4 fw-bold text-muted">#{index + 1}</td>
                                                            <td className="fw-bold text-dark">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="bg-light rounded-circle p-2 me-2 text-primary">
                                                                        <FaUser size={12} />
                                                                    </div>
                                                                    {payment.hostName || payment.hostId || 'N/A'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Badge bg="info" className="bg-opacity-10 text-info border border-info fw-normal px-2 d-flex align-items-center w-auto d-inline-flex">
                                                                    <FaCrown className="me-1" size={12} />
                                                                    {payment.planType || payment.hostSubscriptionId}
                                                                </Badge>
                                                            </td>
                                                            <td className="fw-bold text-success">₹{payment.amount}</td>
                                                            <td>
                                                                <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary fw-normal px-2 rounded-pill">
                                                                    {payment.paymentMethod}
                                                                </Badge>
                                                            </td>
                                                            <td className="small text-secondary fw-medium">
                                                                {payment.createdAt
                                                                    ? new Date(payment.createdAt).toLocaleDateString() + ' ' + new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                                                    : "N/A"}
                                                            </td>
                                                            <td>
                                                                <Badge bg={status.bg} className={`bg-opacity-10 text-${status.bg} border border-${status.bg} rounded-pill px-3 d-inline-flex align-items-center`}>
                                                                    {status.icon} <span className="ms-1">{status.text}</span>
                                                                </Badge>
                                                            </td>
                                                            <td className="text-end px-4">
                                                                <div className="d-flex gap-2 justify-content-end">
                                                                    {payment.receiptPath && (
                                                                        <Button
                                                                            variant="light"
                                                                            size="sm"
                                                                            className="btn-icon rounded-circle shadow-sm text-primary"
                                                                            onClick={() => handleViewReceipt(payment.receiptPath)}
                                                                            title="View Receipt"
                                                                            style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                                                        >
                                                                            <FaEye size={14} />
                                                                        </Button>
                                                                    )}
                                                                    {payment.status === "Pending" && (
                                                                        <>
                                                                            <Button
                                                                                variant="light"
                                                                                size="sm"
                                                                                className="btn-icon rounded-circle shadow-sm text-success"
                                                                                onClick={() => openConfirmModal('approve', payment.id)}
                                                                                disabled={processingId === payment.id}
                                                                                title="Approve"
                                                                                style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                                                            >
                                                                                {processingId === payment.id ? (
                                                                                    <Spinner animation="border" size="sm" />
                                                                                ) : (
                                                                                    <FaCheck size={14} />
                                                                                )}
                                                                            </Button>
                                                                            <Button
                                                                                variant="light"
                                                                                size="sm"
                                                                                className="btn-icon rounded-circle shadow-sm text-danger"
                                                                                onClick={() => openConfirmModal('reject', payment.id)}
                                                                                disabled={processingId === payment.id}
                                                                                title="Reject"
                                                                                style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                                                            >
                                                                                {processingId === payment.id ? (
                                                                                    <Spinner animation="border" size="sm" />
                                                                                ) : (
                                                                                    <FaTimes size={14} />
                                                                                )}
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Receipt Modal - Modernized */}
                    <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="lg" centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                        <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)" }} className="border-0 text-white">
                            <Modal.Title className="fw-bold">
                                <FaFileInvoiceDollar className="me-2 mb-1" /> Payment Receipt
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 bg-light text-center">
                            {selectedReceipt ? (
                                <div>
                                    <div className="bg-white p-3 rounded-3 shadow-sm d-inline-block border mb-4" style={{maxWidth: '100%'}}>
                                        <img
                                            src={`http://localhost:5000/${selectedReceipt}`}
                                            alt="Payment Receipt"
                                            style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "8px" }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/400x300?text=Receipt+Not+Available";
                                            }}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <a
                                            href={`http://localhost:5000/${selectedReceipt}`}
                                            download
                                            className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center"
                                            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)", border: 'none' }}
                                        >
                                            <FaDownload className="me-2" />
                                            Download Receipt
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted">No receipt available</p>
                            )}
                        </Modal.Body>
                        <Modal.Footer className="border-0 bg-light justify-content-center pb-4">
                             <Button variant="white" onClick={() => setShowReceiptModal(false)} className="rounded-pill px-4 fw-bold text-secondary border shadow-sm">
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Confirmation Modal - Modernized */}
                    <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
                        <Modal.Header closeButton style={{ background: confirmAction === 'approve' ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }} className="border-0 text-white">
                            <Modal.Title className="fw-bold">
                                {confirmAction === 'approve' ? <><FaCheckCircle className="me-2 mb-1"/> Approve Payment</> : <><FaTimesCircle className="me-2 mb-1"/> Reject Payment</>}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 text-center bg-white">
                            <div className="mb-4 mt-2">
                                <div className={`rounded-circle bg-${confirmAction === 'approve' ? 'success' : 'danger'} bg-opacity-10 d-inline-flex align-items-center justify-content-center bounce-animation`} style={{width: '90px', height: '90px'}}>
                                    {confirmAction === 'approve' ? (
                                        <FaCheck className={`text-${confirmAction === 'approve' ? 'success' : 'danger'} display-5`} />
                                    ) : (
                                        <FaTimes className={`text-${confirmAction === 'approve' ? 'success' : 'danger'} display-5`} />
                                    )}
                                </div>
                            </div>
                            <h4 className="fw-bold text-dark mb-2">Are you sure?</h4>
                            <p className="text-secondary mb-4 px-4">
                                You are about to <strong>{confirmAction}</strong> this subscription payment request. {confirmAction === 'reject' && 'This action cannot be undone.'}
                            </p>
                        </Modal.Body>
                        <Modal.Footer className="border-0 justify-content-center pb-5 bg-white">
                            <Button variant="white" onClick={() => setShowConfirmModal(false)} className="rounded-pill px-4 me-3 text-secondary fw-bold border shadow-sm">
                                Cancel
                            </Button>
                            <Button 
                                variant={confirmAction === 'approve' ? 'success' : 'danger'} 
                                onClick={handleConfirmAction}
                                className="rounded-pill px-5 shadow-sm fw-bold border-0"
                                style={{ background: confirmAction === 'approve' ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                            >
                                Yes, {confirmAction === 'approve' ? 'Approve' : 'Reject'} It
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </motion.div>
        </div>
    );
};

export default AdminSubscriptionRequests;
