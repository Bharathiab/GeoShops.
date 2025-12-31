import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Table, Badge, Modal } from "react-bootstrap";
import UserNavbar from "../../components/user/UserNavbar";
import Footer from "./Footer";
import { FaHeadset, FaPaperPlane, FaComments, FaTimes, FaUser, FaUserShield, FaArrowLeft, FaTicketAlt, FaClock } from "react-icons/fa";
import { submitSupportQuery, fetchUserTickets, fetchTicketMessages, sendSupportMessage } from "../../api";
import Toast from "../../utils/toast";
import { motion } from "framer-motion";

const Support = () => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [queries, setQueries] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [showChatModal, setShowChatModal] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const userId = JSON.parse(localStorage.getItem("userLoginData") || "{}").userId;

    useEffect(() => {
        if (!userId) {
            navigate("/user-login");
            return;
        }
        loadQueries();
    }, [userId, navigate]);

    useEffect(() => {
        let interval;
        if (showChatModal && selectedTicket) {
            loadMessages(selectedTicket.id);
            interval = setInterval(() => {
                loadMessages(selectedTicket.id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [showChatModal, selectedTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadQueries = async () => {
        try {
            const data = await fetchUserTickets(userId);
            setQueries(data.sort((a, b) => b.id - a.id));
        } catch (err) {
            console.error("Error fetching queries:", err);
        }
    };

    const loadMessages = async (ticketId) => {
        try {
            const data = await fetchTicketMessages(ticketId);
            setChatMessages(data);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setShowSuccess(false);

        if (!userId) {
            setError("Please login to submit a query.");
            return;
        }

        try {
            await submitSupportQuery({ userId, userType: "USER", subject, message });
            setShowSuccess(true);
            setSubject("");
            setMessage("");
            loadQueries();
        } catch (err) {
            console.error("Error submitting query:", err);
            setError(err.message || "Failed to submit query. Please try again.");
        }
    };

    const handleOpenChat = async (ticket) => {
        setSelectedTicket(ticket);
        setShowChatModal(true);
        setLoadingMessages(true);
        await loadMessages(ticket.id);
        setLoadingMessages(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendSupportMessage(selectedTicket.id, {
                senderType: "USER",
                senderId: userId,
                message: newMessage
            });
            setNewMessage("");
            loadMessages(selectedTicket.id);
        } catch (err) {
            console.error("Error sending message:", err);
            Toast.error("Failed to send message. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
            <UserNavbar />
            
            {/* Premium Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="support-header-premium"
            >
                <Container>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <motion.button 
                                whileHover={{ scale: 1.1, x: -5, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="back-btn-modern" 
                                onClick={() => navigate("/user")}
                            >
                                <FaArrowLeft />
                            </motion.button>
                            <div className="ms-4">
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="fw-extra-bold text-white mb-0" 
                                    style={{ letterSpacing: '-1px' }}
                                >
                                    <motion.span
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                        style={{ display: 'inline-block' }}
                                    >
                                        <FaHeadset className="me-3" style={{ color: "#fbbf24" }} />
                                    </motion.span>
                                    Help & Support
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.7 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white mb-0"
                                >
                                    Get instant assistance from our dedicated team
                                </motion.p>
                            </div>
                        </div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="header-stats d-none d-md-flex gap-4"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.1, y: -5 }}
                                className="stat-item"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                    className="stat-value"
                                >
                                    {queries.length}
                                </motion.div>
                                <div className="stat-label">Your Tickets</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </Container>
            </motion.div>

            <Container className="pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* New Ticket Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            whileHover={{ y: -5, boxShadow: "0 25px 60px rgba(0,0,0,0.12)" }}
                        >
                            <Card className="premium-support-card mb-4">
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="card-header-support"
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        >
                                            <FaTicketAlt className="text-gold" size={20} />
                                        </motion.div>
                                        <h5 className="mb-0 fw-bold">Submit a New Query</h5>
                                    </div>
                                </motion.div>
                                <Card.Body className="p-4">
                                    {showSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible className="modern-alert">
                                                Query submitted successfully! We will get back to you shortly.
                                            </Alert>
                                        </motion.div>
                                    )}
                                    {error && <Alert variant="danger" className="modern-alert">{error}</Alert>}
                                    <Form onSubmit={handleSubmit}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-600 text-secondary">Subject</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Briefly describe your issue"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    required
                                                    className="modern-input"
                                                />
                                            </Form.Group>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-600 text-secondary">Message</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    placeholder="Describe your issue in detail..."
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    required
                                                    className="modern-input"
                                                />
                                            </Form.Group>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <motion.div
                                                animate={{ 
                                                    boxShadow: [
                                                        "0 0 0 0 rgba(0, 44, 34, 0)",
                                                        "0 0 0 10px rgba(0, 44, 34, 0.1)",
                                                        "0 0 0 0 rgba(0, 44, 34, 0)"
                                                    ]
                                                }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Button type="submit" className="btn-submit-support w-100">
                                                    <FaPaperPlane className="me-2" /> Submit Query
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </motion.div>

                        {/* Recent Queries List */}
                        {queries.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                whileHover={{ y: -5, boxShadow: "0 25px 60px rgba(0,0,0,0.12)" }}
                            >
                                <Card className="premium-support-card">
                                    <div className="card-header-support">
                                        <div className="d-flex align-items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            >
                                                <FaClock className="text-gold" size={20} />
                                            </motion.div>
                                            <h5 className="mb-0 fw-bold">Your Recent Queries</h5>
                                        </div>
                                    </div>
                                    <Card.Body className="p-0">
                                        <div className="table-responsive">
                                            <Table hover className="modern-support-table mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th className="p-3 border-0 fw-bold text-secondary">Ticket ID</th>
                                                        <th className="p-3 border-0 fw-bold text-secondary">Subject</th>
                                                        <th className="p-3 border-0 fw-bold text-secondary">Status</th>
                                                        <th className="p-3 border-0 fw-bold text-secondary">Date</th>
                                                        <th className="p-3 border-0 fw-bold text-secondary text-end">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {queries.map((q, index) => (
                                                        <motion.tr 
                                                            key={q.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.5 + (index * 0.08), type: "spring", stiffness: 100 }}
                                                            className="table-row-hover"
                                                            onClick={() => handleOpenChat(q)}
                                                            whileHover={{ 
                                                                scale: 1.01,
                                                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                                                transition: { duration: 0.2 }
                                                            }}
                                                        >
                                                            <td className="p-3 fw-bold text-primary">#{q.id}</td>
                                                            <td className="p-3 text-dark">{q.subject}</td>
                                                            <td className="p-3">
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.6 + (index * 0.08), type: "spring" }}
                                                                >
                                                                    <Badge
                                                                        bg={q.status === 'Resolved' ? 'success' : q.status === 'In Progress' ? 'warning' : 'secondary'}
                                                                        className="status-badge-modern"
                                                                    >
                                                                        {q.status}
                                                                    </Badge>
                                                                </motion.div>
                                                            </td>
                                                            <td className="p-3 text-muted">
                                                                {new Date(q.createdAt || q.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                                })}
                                                            </td>
                                                            <td className="p-3 text-end">
                                                                <motion.div
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        className="btn-chat-support"
                                                                        onClick={(e) => { e.stopPropagation(); handleOpenChat(q); }}
                                                                    >
                                                                        <FaComments className="me-1" /> View Chat
                                                                    </Button>
                                                                </motion.div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </Container>

            {/* Chat Modal */}
            <Modal
                show={showChatModal}
                onHide={() => setShowChatModal(false)}
                centered
                size="lg"
                className="support-chat-modal-modern"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <Modal.Header closeButton className="modal-header-support">
                        <Modal.Title className="d-flex align-items-center gap-2">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <FaHeadset style={{ color: "#fbbf24" }} />
                            </motion.div>
                            <span>
                                {selectedTicket?.subject}
                                <span className="ms-3 badge bg-light text-dark">#{selectedTicket?.id}</span>
                            </span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0" style={{ background: "#f8f9fa" }}>
                        <div className="chat-viewport-modern">
                            {loadingMessages ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-5 text-muted"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        style={{ display: "inline-block" }}
                                    >
                                        Loading conversation...
                                    </motion.div>
                                </motion.div>
                            ) : chatMessages.length === 0 ? (
                                <div className="text-center py-5 text-muted">No messages yet.</div>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    const isAdmin = msg.senderType === 'ADMIN';
                                    return (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ 
                                                delay: idx * 0.08,
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 20
                                            }}
                                            className={`d-flex mb-3 ${isAdmin ? 'justify-content-start' : 'justify-content-end'}`}
                                        >
                                            {isAdmin && (
                                                <motion.div 
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: idx * 0.08 + 0.1, type: "spring" }}
                                                    className="avatar-support admin-avatar"
                                                >
                                                    <FaUserShield size={14} />
                                                </motion.div>
                                            )}
                                            <motion.div 
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                className={`message-bubble-modern ${isAdmin ? 'admin-bubble' : 'user-bubble'}`}
                                            >
                                                <div className="message-sender-modern">
                                                    {isAdmin ? "Support Team" : "You"}
                                                </div>
                                                <div className="message-text-modern">{msg.message}</div>
                                                <div className="message-time-modern">
                                                    {formatDate(msg.createdAt)}
                                                </div>
                                            </motion.div>
                                            {!isAdmin && (
                                                <motion.div 
                                                    initial={{ scale: 0, rotate: 180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: idx * 0.08 + 0.1, type: "spring" }}
                                                    className="avatar-support user-avatar"
                                                >
                                                    <FaUser size={14} />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="bg-white p-3 border-top">
                        <Form onSubmit={handleSendMessage} className="w-100 d-flex gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="message-input-modern"
                            />
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Button type="submit" disabled={!newMessage.trim()} className="send-btn-modern">
                                    <FaPaperPlane />
                                </Button>
                            </motion.div>
                        </Form>
                    </Modal.Footer>
                </motion.div>
            </Modal>

            <Footer />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

                .fw-extra-bold { font-weight: 800; }
                .text-gold { color: #fbbf24; }
                .fw-600 { font-weight: 600; }

                .support-header-premium {
                    background: linear-gradient(135deg, #002C22 0%, #0f766e 50%, #14b8a6 100%);
                    background-size: 200% 200%;
                    animation: gradientShift 8s ease infinite;
                    padding: 60px 0;
                    margin-bottom: 40px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                    position: relative;
                    overflow: hidden;
                }

                .support-header-premium::before {
                    content: "";
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-30px, -30px) rotate(10deg); }
                }

                .back-btn-modern {
                    width: 50px;
                    height: 50px;
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    cursor: pointer;
                }

                .stat-item {
                    text-align: center;
                }
                .stat-value {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #fbbf24;
                    line-height: 1;
                }
                .stat-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.6);
                    margin-top: 5px;
                }

                .premium-support-card {
                    border: none !important;
                    border-radius: 24px !important;
                    background: white !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
                    overflow: hidden !important;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    position: relative;
                }

                .premium-support-card::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #002C22, #0f766e, #14b8a6);
                    background-size: 200% 100%;
                    animation: shimmer 3s linear infinite;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .premium-support-card:hover::before {
                    opacity: 1;
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .premium-support-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 60px rgba(0,0,0,0.12) !important;
                }

                .card-header-support {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1.5rem 2rem;
                }

                .modern-alert {
                    border-radius: 12px !important;
                    border: none !important;
                    padding: 1rem 1.25rem !important;
                }

                .modern-input {
                    padding: 0.8rem 1rem !important;
                    border-radius: 12px !important;
                    border: 1px solid #e2e8f0 !important;
                    transition: all 0.3s ease !important;
                }

                .modern-input:focus {
                    border-color: #0f766e !important;
                    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important;
                }

                .btn-submit-support {
                    background: #002C22 !important;
                    border: none !important;
                    color: white !important;
                    padding: 0.9rem 2rem !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    gap: 10px !important;
                    transition: all 0.3s ease !important;
                }

                .btn-submit-support:hover {
                    background: #0f766e !important;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 44, 34, 0.2) !important;
                }

                .modern-support-table {
                    color: #1e293b;
                }

                .table-row-hover {
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .table-row-hover:hover {
                    background-color: #f8fafc !important;
                }

                .status-badge-modern {
                    padding: 0.5em 0.8em !important;
                    border-radius: 20px !important;
                    font-size: 0.75rem !important;
                    font-weight: 600 !important;
                }

                .btn-chat-support {
                    background: transparent !important;
                    border: 1px solid #0f766e !important;
                    color: #0f766e !important;
                    padding: 0.5rem 1rem !important;
                    border-radius: 20px !important;
                    font-weight: 600 !important;
                    font-size: 0.85rem !important;
                    transition: all 0.3s ease !important;
                }

                .btn-chat-support:hover {
                    background: #0f766e !important;
                    color: white !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(15, 118, 110, 0.2);
                }

                .support-chat-modal-modern .modal-content {
                    border-radius: 24px !important;
                    border: none !important;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
                }

                .modal-header-support {
                    background: #002C22 !important;
                    color: white !important;
                    border-bottom: none !important;
                    padding: 1.5rem 2rem !important;
                    border-radius: 24px 24px 0 0 !important;
                }

                .chat-viewport-modern {
                    height: 400px;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .avatar-support {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .admin-avatar {
                    background: #002C22;
                    color: #fbbf24;
                    margin-right: 12px;
                }

                .user-avatar {
                    background: #e9ecef;
                    color: #555;
                    margin-left: 12px;
                }

                .message-bubble-modern {
                    max-width: 70%;
                    padding: 1rem 1.25rem;
                    border-radius: 18px;
                }

                .admin-bubble {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-bottom-left-radius: 4px;
                }

                .user-bubble {
                    background: #002C22;
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message-sender-modern {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                    opacity: 0.7;
                }

                .message-text-modern {
                    line-height: 1.5;
                    font-size: 0.95rem;
                    white-space: pre-wrap;
                }

                .message-time-modern {
                    font-size: 0.7rem;
                    opacity: 0.5;
                    margin-top: 8px;
                    text-align: right;
                }

                .message-input-modern {
                    flex: 1;
                    border-radius: 25px !important;
                    padding: 0.7rem 1.2rem !important;
                    border: 1px solid #e2e8f0 !important;
                }

                .message-input-modern:focus {
                    border-color: #0f766e !important;
                    box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1) !important;
                }

                .send-btn-modern {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: #002C22 !important;
                    border: none !important;
                    color: #fbbf24 !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .send-btn-modern:hover:not(:disabled) {
                    background: #0f766e !important;
                    transform: scale(1.05);
                }

                .send-btn-modern:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Support;
