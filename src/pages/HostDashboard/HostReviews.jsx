import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import HostNavbar from "../../components/host/HostNavbar";
import { fetchHostReviews, fetchHostProperties, createReviewReply, fetchReviewReplies } from "../../api";
import { FaStar, FaRegStar, FaUser, FaBuilding, FaCalendar, FaFilter, FaReply, FaComments, FaPaperPlane, FaTimes, FaEye, FaArrowLeft } from "react-icons/fa";
import "./HostDashboard.css";

const HostReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterProperty, setFilterProperty] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [hostId, setHostId] = useState(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedReviewReplies, setSelectedReviewReplies] = useState([]);

  useEffect(() => {
    const loginData = localStorage.getItem("hostLoginData");
    if (!loginData) { navigate("/host-login"); return; }
    const parsed = JSON.parse(loginData);
    setHostId(parsed.hostId);
    loadReviews(parsed.hostId);
  }, [navigate]);

  const loadReviews = async (hId) => {
    try {
      setLoading(true);
      const [reviewsResponse, propertiesData] = await Promise.all([
        fetchHostReviews(hId),
        fetchHostProperties(hId)
      ]);
      const reviewsData = reviewsResponse.data || [];
      setReviews(reviewsData);
      setProperties(propertiesData || []);

      const repliesData = {};
      for (const review of reviewsData) {
        try {
          const res = await fetchReviewReplies(review.id);
          repliesData[review.id] = res.data || [];
        } catch (err) { repliesData[review.id] = []; }
      }
      setReplies(repliesData);
      setError("");
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews.");
    } finally { setLoading(false); }
  };

  const handleReplySubmit = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    try {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
      const response = await createReviewReply(reviewId, { authorType: "HOST", authorId: hostId, replyText: text });
      if (response.success) {
        setReplies(prev => ({ ...prev, [reviewId]: [...(prev[reviewId] || []), response.data] }));
        setReplyText(prev => ({ ...prev, [reviewId]: "" }));
        if (showConversationModal) {
          setSelectedReviewReplies(prev => [...prev, response.data]);
        }
      }
    } catch (err) { alert("Failed to submit reply."); }
    finally { setSubmittingReply(prev => ({ ...prev, [reviewId]: false })); }
  };

  const handleViewConversation = (review, reviewReplies) => {
    setSelectedReview(review);
    setSelectedReviewReplies(reviewReplies);
    setShowConversationModal(true);
  };

  const getPropertyName = (id) => {
    const p = properties.find(p => p.id == id);
    return p ? (p.company || p.name || p.location) : "All Properties";
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    } 
  };
  
  const itemVariants = { 
    hidden: { y: 30, opacity: 0 }, 
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    } 
  };

  const headerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const filteredReviews = reviews
    .filter(r => (filterProperty === "all" || r.propertyId == filterProperty) && (filterRating === "all" || r.rating == filterRating))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const averageRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <>
      <HostNavbar />
      <div className="host-main-content">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Compact Modern Gradient Header */}
          <motion.div 
            variants={headerVariants}
            className="position-relative overflow-hidden mb-4"
            style={{
              background: 'linear-gradient(135deg, #047857 0%, #10b981 40%, #34d399 80%, #6ee7b7 100%)',
              boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.35)',
              borderRadius: '1.5rem',
              padding: '2.5rem'
            }}
          >
            {/* Animated Background Elements */}
            <motion.div 
              className="position-absolute" 
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                top: '-80px',
                right: '-80px',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(50px)'
              }} 
            />
            <motion.div 
              className="position-absolute" 
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                opacity: [0.08, 0.12, 0.08]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                bottom: '-60px',
                left: '-60px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)'
              }} 
            />

            <div className="position-relative">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <motion.div 
                      className="position-relative"
                      animate={floatingAnimation}
                    >
                      <motion.div 
                        className="d-flex align-items-center justify-content-center rounded-3"
                        style={{
                          width: '70px',
                          height: '70px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)'
                        }}
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.2)'
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <FaComments size={32} className="text-white" />
                      </motion.div>
                      {/* Pulse ring */}
                      <motion.div
                        className="position-absolute top-0 start-0 rounded-3"
                        style={{
                          width: '70px',
                          height: '70px',
                          border: '2px solid rgba(255,255,255,0.5)',
                          pointerEvents: 'none'
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    </motion.div>
                    <div>
                      <motion.h1 
                        className="mb-1 text-white fw-extra-bold" 
                        style={{ 
                          fontSize: '2.25rem', 
                          letterSpacing: '-0.02em',
                          textShadow: '0 2px 15px rgba(0,0,0,0.1)'
                        }}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Guest Reviews & Feedback
                      </motion.h1>
                      <motion.p 
                        className="mb-0 text-white" 
                        style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: '500',
                          opacity: 0.92
                        }}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 0.92, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        Listen to your guests and improve your services
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
                
                <div className="d-flex gap-2">
                  {/* Total Reviews Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
                    }}
                    className="rounded-3 d-flex align-items-center gap-2 position-relative"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)',
                      padding: '0.85rem 1.25rem',
                      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    <motion.div
                      animate={pulseAnimation}
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <FaComments size={22} className="text-white" />
                    </motion.div>
                    <div>
                      <motion.div 
                        className="text-white fw-extra-bold" 
                        style={{ fontSize: '1.75rem', lineHeight: '1' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                      >
                        {reviews.length}
                      </motion.div>
                      <div className="text-white" style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.92 }}>
                        Reviews
                      </div>
                    </div>
                    <motion.div
                      className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        pointerEvents: 'none'
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 2
                      }}
                    />
                  </motion.div>
                  
                  {/* Average Rating Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
                    }}
                    className="rounded-3 d-flex align-items-center gap-2 position-relative"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)',
                      padding: '0.85rem 1.25rem',
                      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    <motion.div
                      animate={pulseAnimation}
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <FaStar size={22} className="text-white" />
                    </motion.div>
                    <div>
                      <motion.div 
                        className="text-white fw-extra-bold" 
                        style={{ fontSize: '1.75rem', lineHeight: '1' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                      >
                        {averageRating}
                      </motion.div>
                      <div className="text-white" style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.92 }}>
                        Rating
                      </div>
                    </div>
                    <motion.div
                      className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        pointerEvents: 'none'
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 2,
                        delay: 0.5
                      }}
                    />
                  </motion.div>

                  {/* Properties Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -3,
                      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)'
                    }}
                    className="rounded-3 d-flex align-items-center gap-2 position-relative"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)',
                      padding: '0.85rem 1.25rem',
                      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    <motion.div
                      animate={pulseAnimation}
                      className="d-flex align-items-center justify-content-center rounded-2"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <FaBuilding size={22} className="text-white" />
                    </motion.div>
                    <div>
                      <motion.div 
                        className="text-white fw-extra-bold" 
                        style={{ fontSize: '1.75rem', lineHeight: '1' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                      >
                        {properties.length}
                      </motion.div>
                      <div className="text-white" style={{ fontSize: '0.8rem', fontWeight: '600', opacity: 0.92 }}>
                        Properties
                      </div>
                    </div>
                    <motion.div
                      className="position-absolute top-0 start-0 w-100 h-100 rounded-3"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        pointerEvents: 'none'
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 2,
                        delay: 1
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="modern-card p-4 mb-4">
            <Row className="g-3 align-items-end">
              <Col md={4}><Form.Group><Form.Label className="small font-weight-bold">Property</Form.Label><Form.Select className="form-control-modern" value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}><option value="all">All Properties</option>{properties.map(p => <option key={p.id} value={p.id}>{p.company || p.name}</option>)}</Form.Select></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label className="small font-weight-bold">Rating</Form.Label><Form.Select className="form-control-modern" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}><option value="all">All Ratings</option>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}</Form.Select></Form.Group></Col>
              <Col md={3}><Form.Group><Form.Label className="small font-weight-bold">Sort By</Form.Label><Form.Select className="form-control-modern" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="highest">Highest Rating</option><option value="lowest">Lowest Rating</option></Form.Select></Form.Group></Col>
              <Col md={2}><Button variant="light" className="w-100 btn-modern" onClick={() => loadReviews(hostId)}><FaFilter className="me-2"/> Reset</Button></Col>
            </Row>
          </motion.div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-success" role="status"></div><p className="mt-3 text-muted">Fetching reviews...</p></div>
          ) : filteredReviews.length === 0 ? (
            <motion.div variants={itemVariants} className="modern-card text-center py-5"><FaStar size={48} className="text-light mb-3"/><h4 className="text-muted">No reviews found</h4><p className="text-muted small">Try adjusting your filters.</p></motion.div>
          ) : (
            <Row className="g-4">
              <AnimatePresence>
                {filteredReviews.map((review) => (
                  <Col md={6} xl={4} key={review.id}>
                    <motion.div variants={itemVariants} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modern-card h-100 p-4 border hover-lift">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>{review.userId.toString().slice(-1)}</div>
                          <div><div className="font-weight-bold truncate-1">User #{review.userId}</div><div className="small text-muted"><FaCalendar size={10} className="me-1"/> {new Date(review.createdAt).toLocaleDateString()}</div></div>
                        </div>
                        <div className="d-flex gap-1">{[1,2,3,4,5].map(s => <FaStar key={s} size={12} color={s <= review.rating ? '#ffc107' : '#e0e0e0'}/>)}</div>
                      </div>
                      <div className="badge-modern badge-primary mb-3 py-1 px-2 small"><FaBuilding size={10} className="me-1"/> {getPropertyName(review.propertyId)}</div>
                      <p className="text-muted small fst-italic mb-4" style={{ minHeight: '3rem', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{review.comment}"</p>
                      
                      <div className="d-flex gap-2">
                        <Button variant="outline-success" size="sm" className="flex-grow-1 btn-modern" onClick={() => handleViewConversation(review, replies[review.id] || [])}><FaComments className="me-1"/> {replies[review.id]?.length || 0} Replies</Button>
                        <Button variant="light" size="sm" className="btn-icon" onClick={() => handleViewConversation(review, replies[review.id] || [])}><FaReply/></Button>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </AnimatePresence>
            </Row>
          )}
        </motion.div>
      </div>

      <Modal show={showConversationModal} onHide={() => setShowConversationModal(false)} size="lg" centered className="modern-modal">
        <Modal.Header closeButton className="border-0 px-4 pt-4"><Modal.Title className="font-weight-bold">Review Conversation</Modal.Title></Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {selectedReview && (
            <div className="d-flex flex-column gap-4">
              <div className="modern-card p-3 bg-light border-0">
                <div className="d-flex justify-content-between mb-2">
                  <span className="font-weight-bold text-success">Guest Review</span>
                  <div className="d-flex gap-1">{[1,2,3,4,5].map(s => <FaStar key={s} size={12} color={s <= selectedReview.rating ? '#ffc107' : '#e0e0e0'}/>)}</div>
                </div>
                <p className="mb-1 fst-italic">"{selectedReview.comment}"</p>
                <div className="text-muted smallest text-end">{new Date(selectedReview.createdAt).toLocaleString()}</div>
              </div>

              <div className="conversation-thread px-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {selectedReviewReplies.length === 0 ? (
                  <div className="text-center py-4 text-muted small">No replies yet. Be the first to respond!</div>
                ) : (
                  selectedReviewReplies.map((reply, idx) => (
                    <div key={idx} className={`d-flex flex-column mb-3 ${reply.authorType === 'HOST' ? 'align-items-end' : 'align-items-start'}`}>
                      <div className={`p-3 rounded-4 shadow-sm smallest ${reply.authorType === 'HOST' ? 'bg-primary text-white' : 'bg-white border'}`} style={{ maxWidth: '80%' }}>
                        <div className="font-weight-bold mb-1">{reply.authorType === 'HOST' ? 'You (Host)' : 'Guest'}</div>
                        <div>{reply.replyText}</div>
                        <div className={`smallest mt-1 ${reply.authorType === 'HOST' ? 'text-white-50' : 'text-muted'}`}>{new Date(reply.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2">
                <Form.Group className="mb-2">
                  <Form.Control as="textarea" rows={3} placeholder="Write your response..." className="form-control-modern" value={replyText[selectedReview.id] || ""} onChange={(e) => setReplyText(prev => ({ ...prev, [selectedReview.id]: e.target.value }))}/>
                </Form.Group>
                <div className="text-end">
                  <Button className="btn-modern btn-primary-modern px-4" onClick={() => handleReplySubmit(selectedReview.id)} disabled={submittingReply[selectedReview.id] || !replyText[selectedReview.id]?.trim()}>
                    {submittingReply[selectedReview.id] ? 'Sending...' : <><FaPaperPlane className="me-2"/> Send Reply</>}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HostReviews;

