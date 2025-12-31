import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Container, Row, Col, Badge, Toast, ToastContainer } from "react-bootstrap";
import {
   FaUser,
   FaStar,
   FaMapMarkerAlt,
   FaImage,
   FaCalendarAlt,
   FaReply,
   FaComments,
   FaPaperPlane,
   FaTimes,
   FaEye,
   FaBuilding,
   FaCalendarDay,
   FaCheckCircle,
   FaQuoteLeft,
   FaExclamationCircle,
   FaHistory,
   FaStarHalfAlt,
   FaChevronRight
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/user/UserNavbar";
import Footer from "./Footer";
import { getPropertyImage } from "../../utils/imageUtils";
import {
   fetchBookings,
   fetchAllProperties,
   fetchBookingReview,
   createReview,
   updateReview,
   createReviewReply,
   fetchReviewReplies
} from "../../api";
import { motion, AnimatePresence } from "framer-motion";

const UserReviews = () => {
   const navigate = useNavigate();
   const [userName, setUserName] = useState("");
   const [userId, setUserId] = useState(null);
   const [completedBookings, setCompletedBookings] = useState([]);
   const [properties, setProperties] = useState({});
   const [reviews, setReviews] = useState({});
   const [replies, setReplies] = useState({});
   const [loading, setLoading] = useState(true);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [selectedBooking, setSelectedBooking] = useState(null);
   const [rating, setRating] = useState(0);
   const [hoverRating, setHoverRating] = useState(0);
   const [comment, setComment] = useState("");
   const [submitting, setSubmitting] = useState(false);
   const [replyText, setReplyText] = useState({});
   const [submittingReply, setSubmittingReply] = useState({});
   const [showConversationModal, setShowConversationModal] = useState(false);
   const [selectedReview, setSelectedReview] = useState(null);
   const [selectedReviewReplies, setSelectedReviewReplies] = useState([]);

   // Helper to get just the city/area name from a full address
   const formatLocation = (loc) => {
      if (!loc) return "Premium Location";
      const parts = loc.split(",");
      return parts[parts.length - 1].trim();
   };

   // Toast State
   const [showToast, setShowToast] = useState(false);
   const [toastMessage, setToastMessage] = useState("");
   const [toastVariant, setToastVariant] = useState("success");

   useEffect(() => {
      const loginData = localStorage.getItem("userLoginData");
      if (!loginData) {
         navigate("/user-login");
         return;
      }
      const parsed = JSON.parse(loginData);
      setUserId(parsed.userId);
      setUserName(parsed.userName || "Elite Member");
      loadData(parsed.userId);
   }, [navigate]);

   const loadData = async (uid) => {
      try {
         setLoading(true);
         const bookingsData = await fetchBookings(uid);

         // Normalize booking data to ensure propertyId/propertyName/location are consistent
         const normalized = (Array.isArray(bookingsData) ? bookingsData : []).map(b => ({
            ...b,
            pId: b.propertyId || b.hotel_id || b.hospital_id || b.saloon_id || b.cab_id,
            pName: b.propertyName || b.property_name || "Elite Property",
            pLoc: formatLocation(b.location)
         }));

         const completed = normalized.filter(b => b.status === "Completed");
         setCompletedBookings(completed);

         const propertiesData = await fetchAllProperties();
         const propMap = {};
         if (Array.isArray(propertiesData)) {
            propertiesData.forEach(prop => {
               propMap[prop.id] = prop;
            });
         }
         setProperties(propMap);

         const reviewsMap = {};
         const repliesMap = {};
         for (const booking of completed) {
            try {
               const reviewData = await fetchBookingReview(booking.id);
               if (reviewData.success && reviewData.data) {
                  reviewsMap[booking.id] = reviewData.data;
                  try {
                     const repliesResponse = await fetchReviewReplies(reviewData.data.id);
                     repliesMap[reviewData.data.id] = repliesResponse.data || [];
                  } catch (err) {
                     repliesMap[reviewData.data.id] = [];
                  }
               }
            } catch (error) { }
         }
         setReviews(reviewsMap);
         setReplies(repliesMap);
      } catch (error) {
         showToastMsg("Sync Error: Records unavailable.", "danger");
      } finally {
         setLoading(false);
      }
   };

   const showToastMsg = (msg, variant = "success") => {
      setToastMessage(msg);
      setToastVariant(variant);
      setShowToast(true);
   };

   const handleReviewClick = (booking) => {
      setSelectedBooking(booking);
      const existingReview = reviews[booking.id];
      if (existingReview) {
         setRating(existingReview.rating);
         setComment(existingReview.comment || "");
      } else {
         setRating(0);
         setComment("");
      }
      setShowReviewModal(true);
   };

   const handleMessageHost = (review, replies) => {
      setSelectedReview(review);
      setSelectedReviewReplies(replies || []);
      setShowConversationModal(true);
   };

   const handleSubmitReview = async () => {
      if (rating === 0) {
         showToastMsg("Excellence requires a rating.", "warning");
         return;
      }
      try {
         setSubmitting(true);
         const reviewData = {
            userId: userId,
            bookingId: selectedBooking.id,
            propertyId: selectedBooking.propertyId,
            rating: rating,
            comment: comment
         };
         const existingReview = reviews[selectedBooking.id];
         if (existingReview) {
            await updateReview(existingReview.id, reviewData);
            setReviews({ ...reviews, [selectedBooking.id]: { ...existingReview, ...reviewData } });
            showToastMsg("Review signature updated.");
         } else {
            const response = await createReview(reviewData);
            if (response.success) {
               setReviews({ ...reviews, [selectedBooking.id]: response.data });
               setReplies({ ...replies, [response.data.id]: [] });
               showToastMsg("Review published to vault.");
            }
         }
         setShowReviewModal(false);
      } catch (error) {
         showToastMsg("Publishing failed.", "danger");
      } finally {
         setSubmitting(false);
      }
   };

   const handleReplySubmit = async (reviewId) => {
      const text = replyText[reviewId];
      if (!text?.trim()) return;
      try {
         setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
         const response = await createReviewReply(reviewId, { authorType: "USER", authorId: userId, replyText: text });
         if (response.success) {
            setReplies(prev => ({ ...prev, [reviewId]: [...(prev[reviewId] || []), response.data] }));
            if (showConversationModal && selectedReview?.id === reviewId) setSelectedReviewReplies(prev => [...prev, response.data]);
            setReplyText(prev => ({ ...prev, [reviewId]: "" }));
            showToastMsg("Message dispatched.");
         }
      } catch (err) {
         showToastMsg("Failed to dispatch.", "danger");
      } finally {
         setSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
      }
   };

   const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Standard";
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
   };

   const StarRating = ({ value, onChange, readonly = false, size = 18 }) => {
      return (
         <div className="premium-star-box">
            {[1, 2, 3, 4, 5].map((star) => (
               <FaStar
                  key={star}
                  size={size}
                  className={`elite-star ${star <= (readonly ? value : (hoverRating || value)) ? "is-filled" : ""}`}
                  onClick={() => !readonly && onChange(star)}
                  onMouseEnter={() => !readonly && setHoverRating(star)}
                  onMouseLeave={() => !readonly && setHoverRating(0)}
               />
            ))}
         </div>
      );
   };

   return (
      <div className="vibrant-emerald-wrapper">
         <UserNavbar />

         {/* Immersive Hero Header */}
         <div className="elite-hero-header">
            <div className="emerald-pulse p1"></div>
            <div className="emerald-pulse p2"></div>
            <div className="emerald-pulse p3"></div>

            <Container className="position-relative z-2">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="text-center"
               >
                  <Badge className="premium-pill mb-4 px-4 py-2">
                     <span className="text-gold tracking-widest fw-bold">EXPERIENCE VAULT</span>
                  </Badge>
                  <h1 className="hero-title-max mt-2">
                     My <span className="text-gradient-gold">Reviews</span>
                  </h1>
                  <p className="hero-desc mx-auto opacity-70">
                     A curated history of your elite journeys, direct engagements, and verified hospitality feedback.
                  </p>
               </motion.div>
            </Container>
         </div>

         <Container className="main-ledger-section">
            {loading ? (
               <div className="py-5 text-center">
                  <div className="elite-loader"></div>
                  <p className="mt-3 text-white opacity-40 uppercase tracking-widest fs-8">Mapping your history...</p>
               </div>
            ) : completedBookings.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-vault-state">
                  <div className="empty-icon-ring mb-4">
                     <FaHistory size={40} className="text-gold opacity-30" />
                  </div>
                  <h3 className="fw-900 text-white mb-2">No Verified Exeriences</h3>
                  <p className="text-white opacity-50 mb-0">Complete a journey to unlock your feedback ledger.</p>
                  <Button className="btn-vibrant-emerald mt-4 px-5 py-3 rounded-pill" onClick={() => navigate("/user")}>Explore Properties</Button>
               </motion.div>
            ) : (
               <div className="elite-glass-table">
                  {/* Ledger Header Labels */}
                  <div className="table-row-labels d-none d-lg-flex">
                     <div className="c-prop">PROPERTY / SERVICE</div>
                     <div className="c-date">JOURNEY DATE</div>
                     <div className="c-status">VERIFICATION</div>
                     <div className="c-rating">GUEST RATING</div>
                     <div className="c-actions">ACTIONS</div>
                  </div>

                  <AnimatePresence>
                     {completedBookings.map((booking, index) => {
                        const property = properties[booking.propertyId];
                        const review = reviews[booking.id];
                        const reviewReplies = review ? (replies[review.id] || []) : [];

                        return (
                           <motion.div
                              key={booking.id}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                              whileHover={{ scale: 1.002, backgroundColor: "rgba(255,255,255,0.04)" }}
                              className="glass-row-entry"
                           >
                              <div className="c-prop">
                                 <div className="property-avatar-wrapper">
                                    <img
                                       src={getPropertyImage(property?.imageUrl || property?.image_url || property?.imagePath || property?.image || booking.imageUrl, property?.departmentName || booking.department)}
                                       alt=""
                                       className="prop-img"
                                    />
                                    <div className="dept-tag">
                                       {(property?.departmentName || booking.department || "P").charAt(0)}
                                    </div>
                                 </div>
                                 <div className="property-main-info">
                                    <div className="p-title fw-800 text-white">{booking.pName}</div>
                                    <div className="p-sub text-white opacity-40 uppercase fs-10 tracking-wider">
                                       <FaMapMarkerAlt className="me-1 text-gold" /> {booking.pLoc}
                                    </div>
                                 </div>
                              </div>

                              <div className="c-date text-white fw-700">
                                 <div className="date-pill">
                                    {formatDate(booking.checkInDate || booking.appointmentDate || booking.createdAt)}
                                 </div>
                              </div>

                              <div className="c-status">
                                 <Badge className="status-badge-v3">
                                    <FaCheckCircle className="me-2" /> Verified
                                 </Badge>
                              </div>

                              <div className="c-rating">
                                 {review ? (
                                    <StarRating value={review.rating} readonly={true} size={15} />
                                 ) : (
                                    <span className="pending-text uppercase fs-10 fw-bold text-gold opacity-50">Pending Feedback</span>
                                 )}
                              </div>

                              <div className="c-actions d-flex gap-2">
                                 {review ? (
                                    <>
                                       <button className="elite-btn-round edit" onClick={() => handleReviewClick(booking)} title="Edit Review">
                                          <FaStar />
                                       </button>
                                       <button className="elite-btn-round msg" onClick={() => handleMessageHost(review, reviewReplies)} title="Message Host">
                                          <FaComments />
                                          {reviewReplies.length > 0 && <span className="msg-dot pulse"></span>}
                                       </button>
                                    </>
                                 ) : (
                                    <button className="elite-btn-primary w-100" onClick={() => handleReviewClick(booking)}>
                                       Submit Feedback
                                    </button>
                                 )}
                              </div>
                           </motion.div>
                        );
                     })}
                  </AnimatePresence>
               </div>
            )}
         </Container>

         {/* Modernized Review Modal */}
         <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered className="elite-premium-modal">
            <Modal.Body className="p-0 overflow-hidden">
               <div className="modal-top-accent"></div>
               <div className="p-5">
                  <div className="d-flex justify-content-between align-items-start mb-5">
                     <div>
                        <h3 className="fw-900 text-white mb-2 fs-2 uppercase tracking-wide">Publish <span className="text-gold">Review</span></h3>
                        <p className="text-white opacity-40 uppercase fs-10 tracking-widest fw-bold">Verified Hospitality Feedback</p>
                     </div>
                     <button className="modal-close-lite" onClick={() => setShowReviewModal(false)}><FaTimes /></button>
                  </div>

                  <div className="property-context-card mb-5">
                     <div className="pcc-icon"><FaBuilding size={20} className="text-gold" /></div>
                     <div className="pcc-text">
                        <span className="label opacity-40 uppercase fs-10 fw-900 d-block">FOR PROPERTY</span>
                        <span className="val fw-800 text-white fs-5">{selectedBooking?.pName}</span>
                     </div>
                  </div>

                  <div className="rating-selector-section text-center mb-5">
                     <div className="mb-4 opacity-30 fs-10 uppercase tracking-widest fw-900">Experience Rating</div>
                     <div className="d-inline-flex gap-3 position-relative">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <div
                              key={star}
                              className={`huge-star-item ${star <= (hoverRating || rating) ? 'active' : ''}`}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                           >
                              <FaStar />
                              <div className="star-val">{star}</div>
                           </div>
                        ))}
                     </div>
                     <div className="rating-desc mt-3 text-gold fw-800 uppercase fs-9 tracking-widest">
                        {rating === 1 && "Exceptional Low"}
                        {rating === 2 && "Beneath Expectation"}
                        {rating === 3 && "Standard Experience"}
                        {rating === 4 && "Superior Service"}
                        {rating === 5 && "Elite Perfection"}
                     </div>
                  </div>

                  <div className="textarea-modern-box">
                     <label className="mb-3 opacity-40 fs-10 uppercase tracking-widest fw-900">Detailed Journey (Optional)</label>
                     <textarea
                        className="glass-textarea"
                        rows={5}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe the highlights of your journey..."
                     />
                  </div>
               </div>

               <div className="modal-footer-elite p-4 d-flex justify-content-end gap-3">
                  <Button variant="link" className="text-white opacity-40 text-decoration-none fw-bold uppercase fs-9" onClick={() => setShowReviewModal(false)}>
                     Cancel
                  </Button>
                  <Button className="btn-confirm-publish px-5 py-3 fw-900 rounded-pill uppercase tracking-widest fs-10" onClick={handleSubmitReview} disabled={submitting || rating === 0}>
                     {submitting ? "Signing Records..." : (reviews[selectedBooking?.id] ? "Update Signature" : "Publish to Vault")}
                  </Button>
               </div>
            </Modal.Body>
         </Modal>

         {/* Conversation Modal */}
         <Modal show={showConversationModal} onHide={() => setShowConversationModal(false)} centered size="lg" className="elite-premium-modal conversation">
            <Modal.Body className="p-0 d-flex flex-column h-70vh">
               <div className="p-4 border-bottom border-white border-opacity-5 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                     <div className="msg-icon-box"><FaComments className="text-gold" /></div>
                     <div>
                        <h5 className="m-0 fw-900 text-white tracking-wide">Secure <span className="text-gold">Channel</span></h5>
                        <div className="fs-11 uppercase text-emerald fw-bold tracking-widest mt-1">Direct property link active</div>
                     </div>
                  </div>
                  <button className="modal-close-lite" onClick={() => setShowConversationModal(false)}><FaTimes /></button>
               </div>

               <div className="chat-v3-viewport flex-grow-1 p-4">
                  {selectedReview && (
                     <div className="chat-v3-container">
                        {/* Original Feedback Anchor */}
                        <div className="feedback-anchor mb-5">
                           <div className="fa-header">Your Journey Feedback</div>
                           <div className="fa-body shadow-lg">
                              <div className="mb-2"><StarRating value={selectedReview.rating} readonly={true} size={12} /></div>
                              <div className="m-0 opacity-80">{selectedReview.comment || "Rated experience without text."}</div>
                           </div>
                           <div className="fa-footer">{formatDate(selectedReview.createdAt)}</div>
                        </div>

                        {/* The Thread */}
                        {selectedReviewReplies.map((reply, ridx) => (
                           <div key={reply.id} className={`chat-line ${reply.authorType === 'HOST' ? 'incoming' : 'outgoing'}`}>
                              <div className="chat-bubble">
                                 <div className="cb-meta">{reply.authorType === 'HOST' ? 'PROPERTY HOST' : 'ELITE MEMBER'}</div>
                                 <div className="cb-text">{reply.replyText}</div>
                                 <div className="cb-time text-end">{formatDate(reply.createdAt)}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               <div className="chat-footer-v3 p-4">
                  <div className="glass-reply-box">
                     <textarea
                        placeholder="Message the host regarding your experience..."
                        value={selectedReview ? (replyText[selectedReview.id] || "") : ""}
                        onChange={(e) => selectedReview && setReplyText(prev => ({ ...prev, [selectedReview.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReplySubmit(selectedReview?.id))}
                        rows={1}
                     />
                     <button className="send-btn-elite" disabled={!selectedReview || !replyText[selectedReview.id]?.trim() || submittingReply[selectedReview.id]} onClick={() => handleReplySubmit(selectedReview?.id)}>
                        {submittingReply[selectedReview?.id] ? <Spinner size="sm" /> : <FaPaperPlane />}
                     </button>
                  </div>
               </div>
            </Modal.Body>
         </Modal>

         <ToastContainer position="bottom-end" className="p-4">
            <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide className={`elite-toast ${toastVariant}`}>
               <Toast.Body className="d-flex align-items-center gap-3 py-3 px-4">
                  <FaCheckCircle className="fs-4 text-white" />
                  <div className="text-white fw-800 uppercase tracking-widest fs-10">{toastMessage}</div>
               </Toast.Body>
            </Toast>
         </ToastContainer>

         <Footer />

         <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;700;800;900&display=swap');

         .vibrant-emerald-wrapper {
            background-color: #001A14;
            min-height: 100vh;
            color: #fff;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
         }

         /* Immersive Hero */
         .elite-hero-header {
            background: linear-gradient(180deg, #001a14 0%, #002c22 100%);
            padding: 120px 0 160px;
            position: relative;
            overflow: hidden;
            border-bottom: 1px solid rgba(255,255,255,0.05);
         }

         .emerald-pulse {
            position: absolute;
            border-radius: 50%;
            filter: blur(140px);
            z-index: 1;
            opacity: 0.15;
            animation: moveOrb 20s infinite alternate ease-in-out;
         }
         .p1 { width: 500px; height: 500px; background: #10b981; top: -200px; left: -100px; }
         .p2 { width: 400px; height: 400px; background: #fbbf24; bottom: -100px; right: -50px; animation-duration: 25s; }
         .p3 { width: 300px; height: 300px; background: #059669; top: 10%; right: 20%; animation-duration: 30s; }

         @keyframes moveOrb {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, 30px) scale(1.1); }
         }

         .premium-pill {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 50px !important;
         }

         .hero-title-max {
            font-family: 'Outfit', sans-serif;
            font-weight: 900;
            font-size: 5rem;
            letter-spacing: -2px;
            margin-bottom: 20px;
         }

         .text-gradient-gold {
            background: linear-gradient(to bottom, #fbbf24, #d97706);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
         }

         .hero-desc {
            max-width: 600px;
            font-size: 1.15rem;
            line-height: 1.6;
         }

         /* Main Ledger Table */
         .main-ledger-section { margin-top: -80px; position: relative; z-index: 10; padding-bottom: 100px; }

         .elite-glass-table {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(40px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 35px;
            overflow: hidden;
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
         }

         .table-row-labels {
            display: flex;
            align-items: center;
            padding: 25px 40px;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-family: 'Outfit';
            font-weight: 800;
            font-size: 0.7rem;
            color: #fbbf24;
            letter-spacing: 2.5px;
         }

         .glass-row-entry {
            display: flex;
            align-items: center;
            padding: 30px 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.02);
            transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
         }

         /* Column widths */
         .c-prop { flex: 3; display: flex; align-items: center; gap: 20px; }
         .c-date { flex: 1.5; }
         .c-status { flex: 1.5; }
         .c-rating { flex: 2; }
         .c-actions { flex: 2; justify-content: flex-end; }

         .property-avatar-wrapper {
            position: relative;
            width: 60px;
            height: 60px;
            flex-shrink: 0;
         }

         .prop-img {
            width: 100%; height: 100%; border-radius: 18px; object-fit: cover;
            border: 2px solid rgba(255,255,255,0.05);
         }

         .prop-img-fallback {
            width: 100%; height: 100%; border-radius: 18px; background: rgba(255,255,255,0.05);
            display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #10b981;
         }

         .dept-tag {
            position: absolute; top: -5px; right: -5px;
            width: 22px; height: 22px; background: #fbbf24; color: #000; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900;
            border: 3px solid #002c22;
         }

         .p-title { font-size: 1.15rem; margin-bottom: 4px; }
         .p-sub { display: flex; align-items: center; }

         .date-pill {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05);
            padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; width: fit-content;
         }

         .status-badge-v3 {
            background: rgba(16, 185, 129, 0.15) !important;
            color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 8px 18px !important; border-radius: 10px !important;
            text-transform: uppercase; letter-spacing: 1px; font-weight: 800; font-size: 0.65rem;
         }

         .elite-btn-round {
            width: 44px; height: 44px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.08);
            background: rgba(255,255,255,0.03); color: #fff;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s ease; position: relative;
         }
         .elite-btn-round:hover { transform: translateY(-3px); background: #fff; color: #000; border-color: #fff; }
         .elite-btn-round.msg:hover { background: #fbbf24; color: #000; border-color: #fbbf24; }

         .msg-dot { position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; border: 3px solid #002c22; }
         .pulse { animation: msgPulse 2s infinite; }
         @keyframes msgPulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

         .elite-btn-primary {
            background: linear-gradient(to right, #10b981, #059669); border: none; color: #fff;
            padding: 12px 25px; border-radius: 15px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 1px; font-size: 0.75rem; transition: all 0.3s ease;
         }
         .elite-btn-primary:hover { filter: brightness(1.2); transform: translateY(-3px); box-shadow: 0 10px 20px rgba(16,185,129,0.3); }

         /* Modal Overhaul */
         .elite-premium-modal .modal-content { background: #001A14 !important; border-radius: 40px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 50px 150px rgba(0,0,0,0.8); color: #fff; }
         .modal-top-accent { height: 10px; background: linear-gradient(90deg, #10b981, #fbbf24); }
         .modal-close-lite { background: none; border: none; color: rgba(255,255,255,0.2); font-size: 1.5rem; transition: all 0.3s; }
         .modal-close-lite:hover { color: #fff; transform: rotate(90deg); }

         .property-context-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 25px; display: flex; align-items: center; gap: 20px; }
         .pcc-icon { width: 50px; height: 50px; border-radius: 15px; background: rgba(251, 191, 36, 0.1); display: flex; align-items: center; justify-content: center; }

         .huge-star-item { cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; color: rgba(255,255,255,0.05); font-size: 3rem; }
         .huge-star-item.active { color: #fbbf24; transform: scale(1.2); filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4)); }
         .star-val { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.85rem; font-weight: 900; color: #000; opacity: 0; transition: 0.3s; }
         .huge-star-item.active .star-val { opacity: 1; }

         .textarea-modern-box { background: rgba(0,0,0,0.2); border: 2px solid rgba(255,255,255,0.05); border-radius: 25px; padding: 25px; transition: all 0.3s; }
         .textarea-modern-box:focus-within { border-color: #10b981; background: rgba(0,0,0,0.3); }
         .glass-textarea { width: 100%; background: transparent; border: none; color: #fff; font-size: 1rem; resize: none; outline: none; }

         .btn-confirm-publish { background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; border: none; box-shadow: 0 15px 35px rgba(251, 191, 36, 0.3); }
         .btn-confirm-publish:hover { filter: brightness(1.1); transform: translateY(-3px); }

         /* Chat V3 Viewport */
         .chat-v3-viewport { overflow-y: auto; scrollbar-width: none; background: rgba(0,0,0,0.3); position: relative; }
         .chat-v3-viewport::-webkit-scrollbar { display: none; }
         .chat-v3-container { display: flex; flex-direction: column; }

         .feedback-anchor { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 25px; padding: 25px; position: relative; }
         .fa-header { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #10b981; margin-bottom: 15px; }
         .fa-body { background: #002c22; padding: 20px; border-radius: 20px; font-style: italic; font-size: 0.95rem; border: 1px solid rgba(255,255,255,0.05); }
         .fa-footer { font-size: 0.7rem; font-weight: 700; opacity: 0.3; margin-top: 10px; text-align: right; }

         .chat-line { margin-bottom: 25px; display: flex; }
         .chat-bubble { max-width: 80%; padding: 20px; border-radius: 25px; position: relative; }
         .incoming { justify-content: flex-start; }
         .incoming .chat-bubble { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 4px; }
         .outgoing { justify-content: flex-end; }
         .outgoing .chat-bubble { background: #10b981; color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 10px 30px rgba(16,185,129,0.2); }

         .cb-meta { font-size: 0.6rem; font-weight: 900; letter-spacing: 1px; margin-bottom: 8px; opacity: 0.5; }
         .cb-text { line-height: 1.6; font-size: 0.95rem; }
         .cb-time { font-size: 0.6rem; opacity: 0.3; margin-top: 10px; font-weight: 700; }

         .glass-reply-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 50px; padding: 10px 10px 10px 30px; display: flex; align-items: center; transition: 0.3s; }
         .glass-reply-box:focus-within { background: rgba(255,255,255,0.06); border-color: #fbbf24; }
         .glass-reply-box textarea { background: transparent; border: none; flex: 1; color: #fff; font-size: 0.95rem; resize: none; margin-right: 15px; outline: none; }
         .send-btn-elite { width: 48px; height: 48px; border-radius: 50%; background: #fbbf24; color: #000; border: none; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
         .send-btn-elite:hover:not(:disabled) { transform: scale(1.1) rotate(-15deg); box-shadow: 0 0 25px rgba(251, 191, 36, 0.4); }

         .elite-toast { border: none !important; border-radius: 25px !important; backdrop-filter: blur(20px); }
         .elite-toast.success { background: rgba(16, 185, 129, 0.9) !important; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4); }
         .elite-toast.danger { background: rgba(239, 68, 68, 0.9) !important; }

         .elite-loader { width: 50px; height: 50px; border: 4px solid rgba(251, 191, 36, 0.1); border-top-color: #fbbf24; border-radius: 50%; animation: eliteSpin 1s linear infinite; }
         @keyframes eliteSpin { to { transform: rotate(360deg); } }

         .h-70vh { height: 75vh; }
         .uppercase { text-transform: uppercase; }
         .tracking-widest { letter-spacing: 3px; }
         .fs-2 { font-size: 2rem; }
         .fs-5 { font-size: 1.25rem; }
         .fs-8 { font-size: 0.8rem; }
         .fs-9 { font-size: 0.75rem; }
         .fs-10 { font-size: 0.65rem; }
         .fs-11 { font-size: 0.6rem; }
         .fw-900 { font-weight: 900; }
         .fw-800 { font-weight: 800; }

         .empty-vault-state { text-align: center; padding: 100px 0; background: rgba(255,255,255,0.02); border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); }
         .empty-icon-ring { width: 100px; height: 100px; border-radius: 50%; border: 2px dashed rgba(251, 191, 36, 0.2); display: inline-flex; align-items: center; justify-content: center; }

         @media (max-width: 992px) {
            .hero-title-max { font-size: 3rem; }
            .glass-row-entry { flex-direction: column; align-items: flex-start; gap: 20px; }
            .c-actions { width: 100%; justify-content: flex-start; border-top: 1px solid rgba(255,255,255,0.05); pt-3; }
         }
      `}</style>
      </div>
   );
};

export default UserReviews;
