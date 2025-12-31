import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Table, Badge, Modal, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import { FaHeadset, FaPaperPlane, FaComments, FaTimes, FaUser, FaUserShield, FaBuilding, FaHistory, FaCheckCircle, FaInbox, FaLifeRing, FaInfoCircle } from "react-icons/fa";
import { submitSupportQuery, fetchHostTickets, fetchTicketMessages, sendSupportMessage } from "../../api";
import "./HostDashboard.css";

const HostSupport = () => {
  const navigate = useNavigate();
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
  
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const hostId = JSON.parse(localStorage.getItem("hostLoginData") || "{}").hostId;

  useEffect(() => {
    if (!hostId) { navigate("/host-login"); return; }
    loadQueries();
  }, [hostId, navigate]);

  useEffect(() => {
    let interval;
    if (showChatModal && selectedTicket) {
      loadMessages(selectedTicket.id);
      interval = setInterval(() => { loadMessages(selectedTicket.id); }, 4000);
    }
    return () => clearInterval(interval);
  }, [showChatModal, selectedTicket]);

  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  const loadQueries = async () => {
    try {
      const data = await fetchHostTickets(hostId);
      const sorted = data.sort((a, b) => b.id - a.id);
      setQueries(sorted);

      if (location.state?.ticketId) {
          const targetId = parseInt(location.state.ticketId);
          const found = sorted.find(q => q.id === targetId);
          if (found) {
              handleOpenChat(found);
              window.history.replaceState({}, document.title);
          }
      }
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
    setError(""); setShowSuccess(false);
    if (!hostId) { setError("Please login to submit a query."); return; }
    try {
      await submitSupportQuery({ hostId, userType: "HOST", subject, message });
      setShowSuccess(true); setSubject(""); setMessage(""); loadQueries();
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
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
      await sendSupportMessage(selectedTicket.id, { senderType: "HOST", senderId: hostId, message: newMessage });
      setNewMessage(""); loadMessages(selectedTicket.id);
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="host-dashboard-container">
      <HostNavbar />
      <div className="host-main-content">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4">
          <header className="dashboard-header mb-4">
            <div className="header-text">
                <h1>Help & Support</h1>
                <p>Having issues? Submit a ticket or chat with our support team.</p>
            </div>
            <div className="header-actions">
              <div className="badge-modern badge-primary px-3 py-2 d-flex align-items-center gap-2">
                <FaLifeRing /> Support Center Active
              </div>
            </div>
          </header>

          <Row className="g-4">
            <Col lg={5}>
              <motion.div variants={itemVariants} className="modern-card p-4">
                <h5 className="font-weight-bold mb-4 d-flex align-items-center gap-2 text-success"><FaHeadset/> New Support Ticket</h5>
                <AnimatePresence>
                  {showSuccess && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <Alert variant="success" className="border-0 shadow-sm rounded-4 mb-3">
                          <FaCheckCircle className="me-2"/> Query submitted successfully!
                        </Alert>
                     </motion.div>
                  )}
                  {error && (
                     <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <Alert variant="danger" className="border-0 shadow-sm rounded-4 mb-3">{error}</Alert>
                     </motion.div>
                  )}
                </AnimatePresence>

                <Form onSubmit={handleSubmit} className="space-y-4">
                  <Form.Group>
                    <Form.Label className="small font-weight-bold">Subject / Inquiry Title</Form.Label>
                    <Form.Control type="text" className="form-control-modern" placeholder="e.g., Booking Cancellation Issue" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="small font-weight-bold">Description of the Issue</Form.Label>
                    <Form.Control as="textarea" rows={5} className="form-control-modern" placeholder="Provide as much detail as possible..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                  </Form.Group>
                  <Button type="submit" className="btn-modern btn-primary-modern w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                    <FaPaperPlane /> Open Support Ticket
                  </Button>
                </Form>

                <div className="mt-4 p-3 bg-emerald-lightest rounded-4 border-emerald-light">
                  <div className="smallest text-success d-flex align-items-center gap-2">
                    <FaInfoCircle/> Typical response time is under 12 hours.
                  </div>
                </div>
              </motion.div>
            </Col>

            <Col lg={7}>
              <motion.div variants={itemVariants} className="modern-card h-100">
                <div className="p-4 border-bottom">
                   <h5 className="font-weight-bold mb-0 d-flex align-items-center gap-2"><FaInbox className="text-primary-light"/> Your Ticket History</h5>
                </div>
                
                {queries.length === 0 ? (
                  <div className="text-center py-5">
                    <FaComments size={48} className="text-light mb-3" />
                    <p className="text-muted small">No tickets found. Need help? Open one on the left.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table className="modern-table mb-0">
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="popLayout">
                          {queries.map((q) => (
                            <motion.tr 
                              key={q.id} 
                              layout 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }}
                              className="hover-lift"
                              onClick={() => handleOpenChat(q)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td><span className="font-weight-bold">#{q.id}</span></td>
                              <td><div className="truncate-1 font-weight-bold text-dark" style={{ maxWidth: '180px' }}>{q.subject}</div></td>
                              <td>
                                <span className={`badge-modern p-2 ${
                                  q.status === 'Resolved' ? 'badge-success' : 
                                  q.status === 'In Progress' ? 'badge-warning' : 'badge-primary'
                                }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="small text-muted">{new Date(q.createdAt || q.created_at).toLocaleDateString()}</td>
                              <td className="text-end">
                                <Button size="sm" variant="light" className="btn-icon text-success hover-lift" onClick={(e) => { e.stopPropagation(); handleOpenChat(q); }}>
                                  <FaComments />
                                </Button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </Col>
          </Row>

          <Modal show={showChatModal} onHide={() => setShowChatModal(false)} centered size="lg" className="modern-modal">
            <Modal.Header closeButton className="bg-primary-modern text-white border-0 py-3 shadow-sm">
              <Modal.Title className="d-flex align-items-center gap-3 w-100">
                <div className="icon-box-sm bg-white text-success rounded-circle shadow-sm">
                  <FaHeadset size={14}/>
                </div>
                <div className="flex-grow-1">
                  <div className="fs-6 fw-extra-bold mb-0" style={{ letterSpacing: '0.5px' }}>{selectedTicket?.subject}</div>
                  <div className="smallest opacity-80 fw-bold">TICKET ID: #{selectedTicket?.id}</div>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-light">
              <div className="chat-window d-flex flex-column" style={{ height: "450px" }}>
                <div className="chat-messages flex-grow-1 p-4 overflow-auto" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {loadingMessages ? (
                    <div className="text-center py-5 text-muted smallest">Gathering conversation details...</div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center py-5">
                      <FaInbox size={48} className="text-light mb-2 opacity-50" />
                      <p className="text-muted small">The conversation hasn't started yet.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const isAdmin = msg.senderType === 'ADMIN';
                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, x: isAdmin ? -10 : 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          key={idx} 
                          className={`d-flex gap-3 ${isAdmin ? 'justify-content-start' : 'justify-content-end align-items-end'}`}
                        >
                          {isAdmin && (
                            <div className="flex-shrink-0 avatar-circle bg-success bg-opacity-10 text-success border border-success border-opacity-10 shadow-xs">
                              <FaUserShield size={16}/>
                            </div>
                          )}
                          <div
                            className={`p-3 shadow-sm border-0 ${isAdmin ? 'rounded-tl-0 bg-white border border-light' : 'rounded-tr-0 bg-emerald-smooth text-white'}`}
                            style={{ maxWidth: "80%", borderRadius: '1.25rem' }}
                          >
                            <div className={`smallest mb-1 font-weight-bold ${isAdmin ? 'text-success' : 'text-emerald-lightest'}`}>
                              {isAdmin ? "Platform Support" : "Account Owner (You)"}
                            </div>
                            <div className="small" style={{ whiteSpace: "pre-wrap" }}>{msg.message}</div>
                            <div className={`smallest mt-2 text-end opacity-50 ${isAdmin ? 'text-muted' : 'text-white'}`}>
                               <FaHistory size={8} className="me-1"/> {formatDate(msg.createdAt)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="chat-input-area p-3 bg-white border-top">
                  <Form onSubmit={handleSendMessage} className="d-flex gap-2 align-items-center">
                    <Form.Control
                      type="text"
                      className="form-control-modern py-2 border-0 bg-light"
                      placeholder="Write your response here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="btn-icon btn-primary-modern rounded-circle"
                      style={{ width: '45px', height: '45px', flexShrink: 0 }}
                    >
                      <FaPaperPlane size={16} />
                    </Button>
                  </Form>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default HostSupport;
