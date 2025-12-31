import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Alert, Form, Toast, ToastContainer } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import { fetchNotifications, markNotificationRead } from "../../api";
import { FaBell, FaCheck, FaTrash, FaInfoCircle, FaHistory, FaCheckDouble } from "react-icons/fa";
import "./HostDashboard.css";

const HostNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    // Initialize toggles from localStorage (default false)
    const [showPopups, setShowPopups] = useState(() => {
        return localStorage.getItem("host_notification_popups") === "true";
    });
    const [showToast, setShowToast] = useState(false);
    const [toastContent, setToastContent] = useState({ title: "", message: "", time: "" });
    
    // Refs to avoid stale closures in interval
    const lastKnownIdRef = React.useRef(0);
    const showPopupsRef = React.useRef(showPopups);
    
    const navigate = useNavigate();

    // effective way to keep ref synced with state
    useEffect(() => {
        showPopupsRef.current = showPopups;
        localStorage.setItem("host_notification_popups", showPopups);
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
        const loginData = localStorage.getItem("hostLoginData");
        if (!loginData) { navigate("/host-login"); return; }
        try {
            const parsed = JSON.parse(loginData);
            console.log("HostNotifications: Parsed login data:", parsed);
            if (parsed.hostId) {
                console.log(`HostNotifications: Fetching notifications for hostId=${parsed.hostId}, type=HOST`);
                const data = await fetchNotifications(parsed.hostId, "HOST");
                console.log("HostNotifications: Received data:", data);
                console.log("HostNotifications: Data type:", typeof data, "Is Array:", Array.isArray(data));
                
                // If we have data
                if (data && data.length > 0) {
                    console.log(`HostNotifications: Found ${data.length} notifications`);
                    const sorted = data.sort((a, b) => b.id - a.id); // Descending ID
                    const newestId = sorted[0].id;
                    
                    // On initial load, just set the reference ID
                    if (isInitialLoad) {
                        console.log("HostNotifications: Initial load, setting notifications");
                        setNotifications(sorted);
                        lastKnownIdRef.current = newestId;
                        setLoading(false);
                        return;
                    }

                    // On subsequent polls, check for new items
                    if (newestId > lastKnownIdRef.current) {
                        const newItems = sorted.filter(n => n.id > lastKnownIdRef.current);
                        
                        // Update state
                        setNotifications(sorted);
                        lastKnownIdRef.current = newestId;
                        
                        // Trigger Popup if enabled
                        if (showPopupsRef.current && newItems.length > 0) {
                            const latest = newItems[0]; // Show the most recent one
                            setToastContent({
                                title: latest.title,
                                message: latest.message,
                                time: new Date(latest.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            });
                            setShowToast(true);
                        }
                    } else {
                        // Even if no new items, update list in case read status changed elsewhere (optional, but good practice)
                         setNotifications(sorted);
                    }
                } else {
                    console.log("HostNotifications: No notifications found or empty array");
                     setNotifications([]);
                }
            } else {
                console.error("HostNotifications: No hostId found in parsed data");
            }
        } catch (error) {
            console.error("HostNotifications: Failed to load notifications", error);
            console.error("HostNotifications: Error stack:", error.stack);
        } finally {
            if(isInitialLoad) setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        for (const note of unread) {
            try { await markNotificationRead(note.id); } catch (e) {}
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="host-dashboard-container">
            <HostNavbar />
            <div className="host-main-content">
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4">
                    <header className="dashboard-header mb-4 d-flex justify-content-between align-items-end">
                        <div className="header-text">
                            <h1>Notifications & Alerts</h1>
                            <p>Stay updated with your latest bookings and platform activities.</p>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-2">
                             
                             <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
                                <span className="small fw-bold text-muted">Show Popups</span>
                                <Form.Check 
                                    type="switch"
                                    id="popup-switch"
                                    checked={showPopups}
                                    onChange={(e) => setShowPopups(e.target.checked)}
                                    className="custom-switch"
                                    style={{ cursor: 'pointer' }}
                                />
                             </div>

                             {unreadCount > 0 && (
                                <Button className="btn-modern btn-primary-modern" onClick={handleMarkAllRead}>
                                    <FaCheckDouble className="me-2" /> Mark All as Read
                                </Button>
                             )}
                        </div>
                    </header>

                    {/* Toast Container for Popups */}
                    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050, marginTop: '80px' }}>
                        <Toast onClose={() => setShowToast(false)} show={showToast} delay={5000} autohide className="shadow-lg border-0 rounded-4 overflow-hidden">
                            <Toast.Header className="bg-success text-white border-0">
                                <FaBell className="me-2" />
                                <strong className="me-auto">New Notification</strong>
                                <small>{toastContent.time}</small>
                            </Toast.Header>
                            <Toast.Body className="bg-white text-dark fw-bold">
                                <div>{toastContent.title}</div>
                                <div className="small text-muted fw-normal mt-1">{toastContent.message}</div>
                            </Toast.Body>
                        </Toast>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status"></div>
                            <p className="mt-3 text-muted">Loading your updates...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <motion.div variants={itemVariants} className="modern-card text-center py-5">
                            <FaBell size={64} className="text-light mb-3" />
                            <h4 className="text-muted font-weight-bold">All caught up!</h4>
                            <p className="text-muted small">You don't have any notifications at the moment.</p>
                        </motion.div>
                    ) : (
                        <Row>
                            <Col lg={10} xl={8} className="mx-auto">
                                <motion.div layout className="d-flex flex-column gap-3">
                                    <AnimatePresence mode="popLayout">
                                        {notifications.map(note => (
                                            <motion.div 
                                                key={note.id} 
                                                variants={itemVariants}
                                                layout
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className={`modern-card p-3 border hover-lift d-flex gap-3 align-items-center ${!note.isRead ? 'border-success' : 'opacity-75'}`}
                                                style={{ cursor: 'pointer', borderLeft: !note.isRead ? '4px solid #10b981' : '1px solid #eee' }}
                                                onClick={() => {
                                                    handleMarkAsRead(note.id);
                                                    if (note.entityType === 'SUPPORT_TICKET' && note.referenceId) {
                                                        navigate('/host/support', { state: { ticketId: note.referenceId } });
                                                    }
                                                }}
                                            >
                                                <div className={`icon-box rounded-circle ${!note.isRead ? 'bg-success-light text-success' : 'bg-light text-muted'}`} style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                                                    <FaInfoCircle size={20} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <h6 className={`mb-0 ${!note.isRead ? 'font-weight-bold' : ''}`}>{note.title}</h6>
                                                        <div className="smallest text-muted d-flex align-items-center gap-1"><FaHistory size={10}/> {new Date(note.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                                    </div>
                                                    <p className="mb-0 text-muted small">{note.message}</p>
                                                </div>
                                                {!note.isRead && (
                                                    <Button variant="light" size="sm" className="btn-icon text-success shadow-none" onClick={(e) => { e.stopPropagation(); handleMarkAsRead(note.id); }} title="Mark as Read">
                                                        <FaCheck />
                                                    </Button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </Col>
                        </Row>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default HostNotifications;

