import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { fetchNotifications, markNotificationRead } from "../../api";
import { 
    FaBell, 
    FaCheck, 
    FaInfoCircle, 
    FaExclamationCircle, 
    FaUser, 
    FaTicketAlt,
    FaCheckDouble,
    FaFilter
} from "react-icons/fa";
import { Container, Row, Col, Card, Button, Badge, Nav, Form, Toast, ToastContainer } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../components/admin/AdminDashboardModern.css";

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    
    // Toggle State
    const [showPopups, setShowPopups] = useState(() => {
        return localStorage.getItem("admin_notification_popups") === "true";
    });
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState({ title: "", message: "", time: "" });

    // Refs
    const lastKnownIdRef = React.useRef(0);
    const showPopupsRef = React.useRef(showPopups);

    const navigate = useNavigate();

    // Sync Ref & LocalStorage
    useEffect(() => {
        showPopupsRef.current = showPopups;
        localStorage.setItem("admin_notification_popups", showPopups);
    }, [showPopups]);

    useEffect(() => {
        loadNotifications(true);
        // Polling every 10 seconds
        const interval = setInterval(() => {
            loadNotifications(false);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async (isInitialLoad = false) => {
        const loginData = localStorage.getItem("adminLoginData");
        if (loginData) {
            try {
                const parsed = JSON.parse(loginData);
                console.log("AdminNotifications: Parsed login data:", parsed);
                if (parsed.id) {
                    console.log(`AdminNotifications: Fetching notifications for adminId=${parsed.id}, type=ADMIN`);
                    const data = await fetchNotifications(parsed.id, "ADMIN");
                    console.log("AdminNotifications: Received data:", data);
                    console.log("AdminNotifications: Data type:", typeof data, "Is Array:", Array.isArray(data));
                    // Sort by newest first
                    const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    if (sortedData.length > 0) {
                        console.log(`AdminNotifications: Found ${sortedData.length} notifications`);
                        const newestId = sortedData[0].id;

                         // On initial load, just set the reference ID
                        if (isInitialLoad) {
                            console.log("AdminNotifications: Initial load, setting notifications");
                            setNotifications(sortedData);
                            lastKnownIdRef.current = newestId;
                            setLoading(false);
                            return;
                        }

                        // Check for new items
                        if (newestId > lastKnownIdRef.current) {
                            const newItems = sortedData.filter(n => n.id > lastKnownIdRef.current);
                            
                            setNotifications(sortedData);
                            lastKnownIdRef.current = newestId;

                            // Trigger Popup if enabled
                            if (showPopupsRef.current && newItems.length > 0) {
                                const latest = newItems[0];
                                setToastContent({
                                    title: latest.title,
                                    message: latest.message,
                                    time: new Date(latest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                });
                                setShowToast(true);
                            }
                        } else {
                             setNotifications(sortedData);
                        }
                    } else {
                        console.log("AdminNotifications: No notifications found or empty array");
                        setNotifications([]);
                    }
                } else {
                    console.error("AdminNotifications: No id found in parsed data");
                }
            } catch (error) {
                console.error("AdminNotifications: Failed to load notifications", error);
                console.error("AdminNotifications: Error stack:", error.stack);
            } finally {
                if(isInitialLoad) setLoading(false);
            }
        } else {
            console.error("AdminNotifications: No adminLoginData found in localStorage");
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        for (const note of unread) {
            try {
                await markNotificationRead(note.id);
            } catch (e) { }
        }
    };

    const handleNotificationClick = (note) => {
        if (!note.isRead) {
            handleMarkAsRead(note.id);
        }
        
        if (note.entityType === 'SUPPORT_TICKET' && note.referenceId) {
            navigate('/admin/support', { state: { ticketId: note.referenceId } });
        } else if (note.entityType === 'SUPPORT_TICKET') {
            navigate('/admin/support');
        } else if (note.entityType === 'BOOKING') {
            navigate('/admin/bookings');
        } else if (note.entityType === 'SUBSCRIPTION') {
            navigate('/admin/subscription-requests');
        }
    };

    const filteredNotifications = notifications.filter(note => {
        if (filter === 'unread') return !note.isRead;
        if (filter === 'read') return note.isRead;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Animation variants
    const listVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="d-flex bg-light min-vh-100">
            <AdminNavbar />
            <div className="dashboard-container flex-grow-1">
                <Container fluid className="pb-4">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-1" style={{ color: "#1e293b" }}>
                                <FaBell className="me-2 text-primary" />
                                Notifications
                            </h2>
                            <p className="text-muted mb-0">Stay updated with system alerts and activities</p>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                            <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
                                <span className="small fw-bold text-muted">Show Popups</span>
                                <Form.Check 
                                    type="switch"
                                    id="admin-popup-switch"
                                    checked={showPopups}
                                    onChange={(e) => setShowPopups(e.target.checked)}
                                    className="custom-switch"
                                    style={{ cursor: 'pointer' }}
                                />
                             </div>
                            {unreadCount > 0 && (
                                 <Button 
                                    onClick={handleMarkAllRead}
                                    className="btn-vibrant-primary d-flex align-items-center rounded-pill px-4"
                                >
                                    <FaCheckDouble className="me-2" /> Mark All Read
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Toast Container */}
                    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050, marginTop: '80px' }}>
                        <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide className="shadow-lg border-0 rounded-4 overflow-hidden">
                            <Toast.Header className="bg-primary text-white border-0">
                                <FaBell className="me-2" />
                                <strong className="me-auto">New Alert</strong>
                                <small>{toastContent.time}</small>
                            </Toast.Header>
                            <Toast.Body className="bg-white text-dark fw-bold">
                                <div>{toastContent.title}</div>
                                <div className="small text-muted fw-normal mt-1">{toastContent.message}</div>
                            </Toast.Body>
                        </Toast>
                    </div>

                    <Row>
                        <Col lg={8} className="mx-auto">
                            {/* Filter Tabs */}
                            <div className="modern-card p-2 mb-4 d-flex justify-content-between align-items-center rounded-pill">
                                <Nav variant="pills" className="flex-grow-1" activeKey={filter} onSelect={(k) => setFilter(k)}>
                                    <Nav.Item>
                                        <Nav.Link eventKey="all" className="rounded-pill px-4 fw-bold">
                                            All
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="unread" className="rounded-pill px-4 fw-bold position-relative">
                                            Unread
                                            {unreadCount > 0 && (
                                                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-light">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="read" className="rounded-pill px-4 fw-bold">
                                            Read
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                                <div className="text-muted small px-3 d-none d-md-block">
                                    <FaFilter className="me-1" />
                                    {filteredNotifications.length} Result(s)
                                </div>
                            </div>

                            {/* Notifications List */}
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                                        <FaBell size={40} className="text-secondary opacity-50" />
                                    </div>
                                    <h5>No notifications found</h5>
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                <motion.div
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="d-flex flex-column gap-3"
                                >
                                    <AnimatePresence>
                                        {filteredNotifications.map((note) => (
                                            <motion.div
                                                key={note.id}
                                                variants={itemVariants}
                                                layout
                                                className={`modern-card p-0 border-0 shadow-sm overflow-hidden notification-item ${!note.isRead ? 'unread-glow' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNotificationClick(note)}
                                            >
                                                <div className="d-flex p-3 align-items-center">
                                                    {/* Color Bar */}
                                                    <div 
                                                        className={`me-3 rounded-pill`} 
                                                        style={{ 
                                                            width: '4px', 
                                                            height: '50px', 
                                                            backgroundColor: !note.isRead ? '#6366f1' : '#cbd5e1'
                                                        }} 
                                                    />

                                                    {/* Icon */}
                                                    <div 
                                                        className={`rounded-circle p-3 me-3 d-flex align-items-center justify-content-center flex-shrink-0
                                                            ${note.senderType === 'HOST' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'}
                                                        `}
                                                        style={{ width: '50px', height: '50px' }}
                                                    >
                                                        {note.senderType === 'HOST' ? <FaUser size={20} /> : <FaInfoCircle size={20} />}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <h6 className={`mb-0 ${!note.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>
                                                                {note.title}
                                                            </h6>
                                                            <small className="text-muted" style={{fontSize: '0.75rem'}}>
                                                                {new Date(note.createdAt).toLocaleString()}
                                                            </small>
                                                        </div>
                                                        <p className="mb-0 text-muted small pe-4 note-message">
                                                            {note.message}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="ms-3">
                                                        {!note.isRead && (
                                                            <Button 
                                                                variant="light" 
                                                                size="sm" 
                                                                className="rounded-circle text-primary btn-icon-only"
                                                                onClick={(e) => handleMarkAsRead(note.id, e)}
                                                                title="Mark as Read"
                                                            >
                                                                <FaCheck />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
            
            <style>{`
                .nav-pills .nav-link {
                    color: #64748b;
                    border-radius: 50rem;
                }
                .nav-pills .nav-link.active {
                    background-color: #fff;
                    color: #6366f1;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .unread-glow {
                    background-color: #f8fafc;
                    border-left: 1px solid #e0e7ff !important;
                }
                .notification-item:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                    transform: translateY(-1px);
                    transition: all 0.2s ease;
                }
                .btn-icon-only {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .note-message {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default AdminNotifications;
