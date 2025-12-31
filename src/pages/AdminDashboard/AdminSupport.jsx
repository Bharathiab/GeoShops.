import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button, Modal, Form, Badge, Nav } from "react-bootstrap";
import { 
    FaHeadset, 
    FaComments, 
    FaPaperPlane, 
    FaUser, 
    FaUserShield, 
    FaCheckCircle, 
    FaBuilding,
    FaTicketAlt,
    FaClock,
    FaCheckDouble,
    FaEllipsisH
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Toast from "../../utils/toast";
import { fetchUserQueries, fetchHostQueries } from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/admin/AdminDashboardModern.css";

const AdminSupport = () => {
    const [userQueries, setUserQueries] = useState([]);
    const [hostQueries, setHostQueries] = useState([]);
    const [showChatModal, setShowChatModal] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [activeTab, setActiveTab] = useState('user');
    const [isTyping, setIsTyping] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    
    const location = useLocation();
    const messagesEndRef = useRef(null);
    const adminId = localStorage.getItem("adminId") || 1;

    useEffect(() => {
        loadQueries();
    }, []);

    useEffect(() => {
        let interval;
        if (showChatModal && selectedQuery) {
            fetchMessages(selectedQuery.id);
            interval = setInterval(() => {
                fetchMessages(selectedQuery.id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [showChatModal, selectedQuery]);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadQueries = async () => {
        try {
            const userData = await fetchUserQueries();
            const hostData = await fetchHostQueries();
            const allUser = userData.sort((a, b) => b.id - a.id);
            const allHost = hostData.sort((a, b) => b.id - a.id);
            
            setUserQueries(allUser);
            setHostQueries(allHost);

            if (location.state?.ticketId) {
                const targetId = parseInt(location.state.ticketId);
                const foundUserTicket = allUser.find(q => q.id === targetId);
                const foundHostTicket = allHost.find(q => q.id === targetId);
                
                if (foundUserTicket) {
                    handleOpenChat(foundUserTicket);
                    window.history.replaceState({}, document.title);
                } else if (foundHostTicket) {
                    handleOpenChat(foundHostTicket);
                    window.history.replaceState({}, document.title);
                }
            }
        } catch (error) {
            console.error("Error loading queries:", error);
        }
    };

    const fetchMessages = async (ticketId) => {
        try {
            const response = await fetch(`https://geoshops-production.up.railway.app/api/support/queries/${ticketId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setChatMessages(data);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const handleOpenChat = async (query) => {
        setSelectedQuery(query);
        setShowChatModal(true);
        setLoadingMessages(true);
        await fetchMessages(query.id);
        setLoadingMessages(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                senderType: "ADMIN",
                senderId: adminId,
                message: newMessage
            };

            const response = await fetch(`https://geoshops-production.up.railway.app/api/support/queries/${selectedQuery.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageData),
            });

            if (response.ok) {
                setNewMessage("");
                setIsTyping(false);
                fetchMessages(selectedQuery.id);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            Toast.error("Failed to send message");
        }
    };

    const handleTyping = (value) => {
        setNewMessage(value);
        if (value.trim()) {
            setIsTyping(true);
        } else {
            setIsTyping(false);
        }
    };

    const handleResolveClick = () => {
        setShowResolveModal(true);
    };

    const handleResolveTicket = async () => {
        setShowResolveModal(false);

        try {
            const response = await fetch(`https://geoshops-production.up.railway.app/api/support/queries/${selectedQuery.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reply: "Ticket marked as resolved by Admin.",
                    adminId: adminId
                }),
            });

            if (response.ok) {
                fetchMessages(selectedQuery.id);
                loadQueries();
                Toast.success("Ticket resolved.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Stats
    const allQueries = [...userQueries, ...hostQueries];
    const totalTickets = allQueries.length;
    const pendingTickets = allQueries.filter(q => q.status === 'Pending' || q.status === 'Open').length;
    const resolvedTickets = allQueries.filter(q => q.status === 'Resolved').length;

    const stats = [
        { label: "Total Tickets", value: totalTickets, icon: <FaTicketAlt />, color: "primary" },
        { label: "Pending", value: pendingTickets, icon: <FaClock />, color: "warning" },
        { label: "Resolved", value: resolvedTickets, icon: <FaCheckDouble />, color: "success" }
    ];

    const tableRowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const renderQueriesTable = (queries, type) => (
        <div className="modern-table-wrapper">
            <table className="modern-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sender</th>
                        <th>Subject</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {queries.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-5 text-muted">
                                <FaHeadset size={32} className="mb-2 opacity-50" />
                                <p>No {type} queries found</p>
                            </td>
                        </tr>
                    ) : (
                        queries.map((query, index) => (
                            <motion.tr 
                                key={query.id}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                                whileHover={{ 
                                    scale: 1.01,
                                    backgroundColor: "rgba(99, 102, 241, 0.05)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <td>
                                    <span className="fw-bold text-primary">#{query.id}</span>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className={`rounded-circle p-2 ${type === 'user' ? 'bg-primary' : 'bg-warning'} bg-opacity-10`}>
                                            {type === "user" ? 
                                                <FaUser className={`text-primary`} size={14} /> : 
                                                <FaBuilding className={`text-warning`} size={14} />
                                            }
                                        </div>
                                        <div>
                                            <div className="fw-bold">{type === "user" ? query.userName : query.hostName}</div>
                                            <div className="small text-muted">{type === "user" ? query.userEmail : query.hostEmail}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{query.subject}</td>
                                <td className="text-muted small">{formatDate(query.created_at || query.createdAt)}</td>
                                <td>
                                    <Badge
                                        bg={
                                            query.status === "Pending" || query.status === "Open"
                                                ? "warning"
                                                : query.status === "Resolved"
                                                    ? "success"
                                                    : "secondary"
                                        }
                                        className="px-3 py-1"
                                    >
                                        {query.status}
                                    </Badge>
                                </td>
                                <td>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        onClick={() => handleOpenChat(query)}
                                        className="btn-outline-modern text-primary fw-bold"
                                    >
                                        <FaComments className="me-1" /> Chat
                                    </Button>
                                </td>
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="d-flex bg-light min-vh-100">
            <AdminNavbar />
            <div className="dashboard-container flex-grow-1">
                <Container fluid className="pb-4">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                        className="modern-header-vibrant mb-4 p-4 rounded-xl shadow-lg d-flex justify-content-between align-items-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="fw-bold mb-1 text-white d-flex align-items-center gap-3">
                                <motion.div 
                                    animate={{ 
                                        rotate: [0, -10, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="bg-white bg-opacity-20 p-3 rounded-circle shadow-inner"
                                >
                                    <FaHeadset className="text-white" size={28} />
                                </motion.div>
                                Support Center
                            </h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.3 }}
                                className="text-white mb-0 ms-1"
                            >
                                Manage and respond to support queries from users and hosts
                            </motion.p>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="d-none d-md-block"
                        >
                            <motion.div
                                animate={{ 
                                    boxShadow: [
                                        "0 0 0 0 rgba(255, 255, 255, 0)",
                                        "0 0 0 10px rgba(255, 255, 255, 0.2)",
                                        "0 0 0 0 rgba(255, 255, 255, 0)"
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Badge bg="white" text="primary" className="px-3 py-2 rounded-pill shadow-sm">
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        style={{ display: "inline-block" }}
                                    >
                                        <FaTicketAlt className="me-2" />
                                    </motion.span>
                                    {totalTickets} Active Tickets
                                </Badge>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Stats Cards */}
                    <Row className="mb-4 g-4">
                        {stats.map((stat, index) => (
                            <Col md={4} key={index}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: index * 0.15, type: "spring", stiffness: 150 }}
                                    whileHover={{ 
                                        y: -10, 
                                        scale: 1.03,
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                                        transition: { duration: 0.3 }
                                    }}
                                    className="modern-card p-4 stats-card border-0 h-100 shadow-sm"
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <motion.p 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.15 + 0.2 }}
                                                className="stat-label mb-1"
                                            >
                                                {stat.label}
                                            </motion.p>
                                            <motion.h3 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                                                className="stat-value mb-0"
                                            >
                                                {stat.value}
                                            </motion.h3>
                                        </div>
                                        <motion.div 
                                            initial={{ rotate: -180, scale: 0 }}
                                            animate={{ rotate: 0, scale: 1 }}
                                            transition={{ delay: index * 0.15 + 0.4, type: "spring" }}
                                            whileHover={{ rotate: 360, scale: 1.2 }}
                                            className={`stat-icon-wrapper bg-${stat.color} bg-opacity-10 text-${stat.color} shadow-sm`}
                                        >
                                            {stat.icon}
                                        </motion.div>
                                    </div>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ delay: index * 0.15 + 0.5, duration: 0.6 }}
                                        className={`mt-3 pt-3 border-top border-light small text-${stat.color} fw-bold`}
                                    >
                                        {Math.round((stat.value / (totalTickets || 1)) * 100)}% of total
                                    </motion.div>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    {/* Tabs */}
                    <div className="modern-card p-0 border-0 shadow-sm">
                        <div className="p-3 border-bottom">
                            <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                <Nav.Item>
                                    <Nav.Link eventKey="user" className="rounded-pill px-4 fw-bold position-relative">
                                        <FaUser className="me-2" size={12} />
                                        User Queries
                                        <Badge 
                                            className="support-badge ms-2"
                                        >
                                            {userQueries.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="ms-2">
                                    <Nav.Link eventKey="host" className="rounded-pill px-4 fw-bold position-relative">
                                        <FaBuilding className="me-2" size={12} />
                                        Host Queries
                                        <Badge 
                                            className="support-badge ms-2"
                                        >
                                            {hostQueries.length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                        <div className="p-3">
                            {activeTab === 'user' ? renderQueriesTable(userQueries, "user") : renderQueriesTable(hostQueries, "host")}
                        </div>
                    </div>

                    {/* Chat Modal */}
                    <Modal
                        show={showChatModal}
                        onHide={() => setShowChatModal(false)}
                        size="lg"
                        centered
                        contentClassName="border-0 shadow-lg"
                    >
                        <Modal.Header closeButton className="bg-gradient-vibrant text-white border-0">
                            <Modal.Title className="d-flex align-items-center gap-2">
                                <div className="bg-white bg-opacity-20 rounded-circle p-2">
                                    <FaUserShield className="text-white" size={20} />
                                </div>
                                <div>
                                    <div className="fs-6 fw-normal opacity-90">Ticket #{selectedQuery?.id}</div>
                                    <div className="fw-bold">{selectedQuery?.subject}</div>
                                </div>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-0" style={{ background: "#f8f9fa" }}>
                            {/* Ticket Info Bar */}
                            <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <div className={`p-2 rounded-circle ${selectedQuery?.userType === 'host' ? 'bg-warning' : 'bg-primary'} bg-opacity-10`}>
                                        {selectedQuery?.userType === 'host' ? 
                                            <FaBuilding className="text-warning" /> : 
                                            <FaUser className="text-primary" />
                                        }
                                    </div>
                                    <div>
                                        <div className="fw-bold">{selectedQuery?.userType === 'host' ? selectedQuery?.hostName : selectedQuery?.userName}</div>
                                        <div className="small text-muted">{selectedQuery?.userType === 'host' ? selectedQuery?.hostEmail : selectedQuery?.userEmail}</div>
                                    </div>
                                </div>
                                {selectedQuery?.status !== "Resolved" && (
                                    <Button variant="success" size="sm" onClick={handleResolveClick} className="rounded-pill px-3">
                                        <FaCheckCircle className="me-1" /> Mark Resolved
                                    </Button>
                                )}
                            </div>

                            <div className="chat-container">
                                <div className="chat-messages p-4" style={{ height: "400px", overflowY: "auto", background: "linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)" }}>
                                    {loadingMessages ? (
                                        <div className="text-center py-5 text-muted">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : chatMessages.length === 0 ? (
                                        <div className="text-center py-5 text-muted">No messages yet.</div>
                                    ) : (
                                        <AnimatePresence>
                                            {chatMessages.map((msg, idx) => {
                                                const isAdmin = msg.senderType === 'ADMIN';
                                                return (
                                                    <motion.div 
                                                        key={idx} 
                                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                                        className={`d-flex mb-3 ${isAdmin ? 'justify-content-end' : 'justify-content-start'}`}
                                                    >
                                                        {!isAdmin && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 0.1 }}
                                                                className="me-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" 
                                                                style={{ 
                                                                    width: "40px", 
                                                                    height: "40px",
                                                                    background: msg.senderType === 'HOST' ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                                                                }}
                                                            >
                                                                {msg.senderType === 'HOST' ? <FaBuilding size={16} className="text-white" /> : <FaUser size={16} className="text-white" />}
                                                            </motion.div>
                                                        )}
                                                        <div
                                                            className="p-3"
                                                            style={{
                                                                maxWidth: "75%",
                                                                borderRadius: isAdmin ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                                                background: isAdmin ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#FFFFFF",
                                                                color: isAdmin ? "#FFFFFF" : "#333",
                                                                border: isAdmin ? "none" : "1px solid #e5e7eb",
                                                                boxShadow: isAdmin ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
                                                            }}
                                                        >
                                                            <div className="small mb-1 fw-bold" style={{ opacity: isAdmin ? 0.9 : 0.7 }}>
                                                                {isAdmin ? "You" : (msg.senderType === 'HOST' ? "Host" : "User")}
                                                            </div>
                                                            <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{msg.message}</div>
                                                            <div className="small mt-2 text-end" style={{ opacity: 0.6, fontSize: "0.7rem" }}>
                                                                {formatDate(msg.createdAt)}
                                                            </div>
                                                        </div>
                                                        {isAdmin && (
                                                            <motion.div 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 0.1 }}
                                                                className="ms-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" 
                                                                style={{ 
                                                                    width: "40px", 
                                                                    height: "40px",
                                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                                }}
                                                            >
                                                                <FaUserShield size={16} className="text-white" />
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="d-flex justify-content-start mb-3"
                                        >
                                            <div className="me-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" 
                                                style={{ 
                                                    width: "40px", 
                                                    height: "40px",
                                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                }}
                                            >
                                                <FaUserShield size={16} className="text-white" />
                                            </div>
                                            <div className="p-3 rounded-pill bg-white shadow-sm d-flex align-items-center gap-1" style={{ border: "1px solid #e5e7eb" }}>
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                    className="bg-secondary rounded-circle"
                                                    style={{ width: "8px", height: "8px" }}
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                    className="bg-secondary rounded-circle"
                                                    style={{ width: "8px", height: "8px" }}
                                                />
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                    className="bg-secondary rounded-circle"
                                                    style={{ width: "8px", height: "8px" }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="bg-white p-3 border-top" style={{ boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}>
                            <Form onSubmit={handleSendMessage} className="w-100 d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Type your reply..."
                                    value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    style={{ 
                                        borderRadius: "25px", 
                                        padding: "0.75rem 1.5rem",
                                        border: "2px solid #e5e7eb",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                    }}
                                />
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="rounded-circle d-flex align-items-center justify-content-center border-0"
                                        style={{ 
                                            width: "50px", 
                                            height: "50px",
                                            background: newMessage.trim() ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#e5e7eb",
                                            boxShadow: newMessage.trim() ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "none"
                                        }}
                                    >
                                        <FaPaperPlane />
                                    </Button>
                                </motion.div>
                            </Form>
                        </Modal.Footer>
                    </Modal>

                    {/* Resolve Confirmation Modal */}
                    <Modal show={showResolveModal} onHide={() => setShowResolveModal(false)} centered contentClassName="border-0 shadow-lg">
                        <Modal.Header className="bg-success text-white border-0">
                            <Modal.Title className="d-flex align-items-center">
                                <FaCheckCircle className="me-2" /> Confirm Resolution
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4 text-center">
                            <div className="mb-3 text-success">
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <FaCheckCircle size={50} />
                                </motion.div>
                            </div>
                            <h5 className="mb-3">Mark Ticket as Resolved?</h5>
                            <p className="text-muted">
                                This will close the ticket and notify the user that their issue has been resolved.
                            </p>
                        </Modal.Body>
                        <Modal.Footer className="bg-light border-0 justify-content-center">
                            <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={() => setShowResolveModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="success" 
                                className="px-4 rounded-pill d-flex align-items-center" 
                                onClick={handleResolveTicket}
                                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none" }}
                            >
                                <FaCheckCircle className="me-2" /> Confirm
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>
            
            <style>{`
                .nav-pills .nav-link {
                    color: #64748b;
                }
                .nav-pills .nav-link.active {
                    background-color: #6366f1;
                    color: white;
                }
                .bg-gradient-vibrant {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
                }
                .chat-messages::-webkit-scrollbar {
                    width: 6px;
                }
                .chat-messages::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .chat-messages::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                }
                .chat-messages::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                }
                .modern-header-vibrant {
                    background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
                    position: relative;
                    overflow: hidden;
                }
                .modern-header-vibrant::after {
                    content: "";
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    pointer-events: none;
                }
                .support-badge {
                    background-color: #ffffff !important;
                    color: #374151 !important;
                    font-weight: bold;
                    border: 2px solid #d1d5db !important;
                    font-size: 0.85rem;
                    padding: 0.35rem 0.6rem;
                    border-radius: 8px;
                }
                .nav-pills .nav-link {
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }
                .nav-pills .nav-link:hover:not(.active) {
                    background: #f1f5f9;
                    border-color: #e2e8f0;
                }
                .nav-pills .nav-link.active {
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .modern-card {
                    background: white;
                    border-radius: 16px;
                }
                .btn-outline-modern {
                    border-radius: 20px;
                    padding: 0.4rem 1rem;
                }
            `}</style>
        </div>
    );
};

export default AdminSupport;
