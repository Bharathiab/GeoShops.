import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Toast as BootstrapToast,
  ToastContainer,
  Badge
} from "react-bootstrap";
import { 
  FaTrash, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaPrint, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaRupeeSign,
  FaFileInvoiceDollar 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/user/UserNavbar";
import StatusModal from "../../components/common/StatusModal";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchBookings, updateBookingStatus } from "../../api";
import Footer from "./Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";

const UserBookings = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState("Hotel");
  const [bookings, setBookings] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: "success",
    message: "",
    onConfirm: null
  });

  useEffect(() => {
    const loadBookings = async () => {
      const userLoginData = JSON.parse(localStorage.getItem("userLoginData") || "{}");
      if (!userLoginData.userId) {
        navigate("/user-login");
        return;
      }
      setUserId(userLoginData.userId);
      try {
        const userBookings = await fetchBookings(userLoginData.userId);
        const sortedBookings = userBookings.sort((a, b) => b.id - a.id);
        setBookings(sortedBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
      }
    };

    loadBookings();
  }, [navigate]);

  useEffect(() => {
    // Force a re-render or check if we need to filter based on navbar
    // This is optional if UserNavbar doesn't control filtering directly here
  }, [selectedDepartment]);


  const handleDepartmentChange = (department) => {
    if (department === "Home") navigate("/user");
    else navigate(`/user/${department.toLowerCase()}`);
  };

  const handleCancelBooking = (booking) => {
    setModalConfig({
      show: true,
      type: "confirm",
      message: "Are you sure you want to cancel this booking?",
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, show: false })); 
        try {
          const department = booking.department || selectedDepartment;
          await updateBookingStatus(department, booking.id, 'Cancelled by Customer');
          const updatedBookings = bookings.map((b) =>
            b.id === booking.id ? { ...b, status: "Cancelled by Customer" } : b
          );
          setBookings(updatedBookings);
          setModalConfig({
             show: true,
             type: "success",
             message: "Booking cancelled successfully!",
             onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
          });
        } catch (error) {
          console.error("Error cancelling booking:", error);
          setModalConfig({
            show: true,
            type: "error",
            message: "An error occurred. Please try again.",
            onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
          });
        }
      }
    });
  };

  const handlePrintInvoice = (booking) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(15, 118, 110); // Teal color
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.text("GeoBookings", 20, 25);
      
      doc.setFontSize(14);
      doc.text("INVOICE", 170, 25);

      // Info Section
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(12);
      
      doc.text(`Invoice #: INV-${booking.id}`, 20, 60);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 68);
      doc.text(`Status: ${booking.status || 'Confirmed'}`, 20, 76);

      // Customer/Property Info
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Bill To:", 20, 95);
      doc.text("Property Details:", 110, 95);
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      doc.text("Valued Customer", 20, 103); 
      
      doc.text(`${booking.propertyName || 'Property Name'}`, 110, 103);
      doc.text(`${booking.location || 'Location'}`, 110, 109);
      doc.text(`Dept: ${booking.department || 'General'}`, 110, 115);

      // Booking Date
      const bookingDate = booking.checkInDate || booking.appointmentDate || booking.bookingDate || new Date();
      doc.text(`Service Date: ${new Date(bookingDate).toLocaleDateString()}`, 20, 115);

      // Calculation
      const baseAmount = parseFloat(booking.price || booking.totalPrice || booking.estimatedPrice || booking.finalPrice || 0);
      const gstRate = 0.05;
      const gstAmount = baseAmount * gstRate;
      const totalAmount = baseAmount + gstAmount;

      // Table
      autoTable(doc, {
        startY: 130,
        head: [['Description', 'Amount (INR)']],
        body: [
          ['Service Charge / Booking Fee', baseAmount.toFixed(2)],
          ['GST (5%)', gstAmount.toFixed(2)],
          [{ content: 'Total Amount', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: totalAmount.toFixed(2), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }],
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
        styles: { fontSize: 11, cellPadding: 5 },
      });

      // Footer
      const finalY = (doc.lastAutoTable?.finalY || 150) + 30;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for choosing GeoBookings for your services.", 105, finalY, { align: "center" });
      doc.text("This is a computer-generated invoice.", 105, finalY + 6, { align: "center" });

      doc.save(`Invoice_${booking.id}.pdf`);

    } catch (error) {
      console.error("Error generating invoice:", error);
      setModalConfig({
        show: true,
        type: "error",
        message: `Failed to generate invoice: ${error.message}`,
        onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
      });
    }
  };

  const getStatusBadge = (status) => {
    let displayText = status || "Confirmed";
    let className = "badge-status-modern";
    
    if (status === "Cancelled" || status === "Cancelled by Customer") {
      displayText = "Cancelled";
      className += " badge-cancelled";
    } else if (status === "Confirmed" || status === "Active") {
      className += " badge-confirmed";
    } else if (status === "Pending") {
      className += " badge-pending";
    } else if (status === "Completed") {
      className += " badge-completed";
    } else {
      className += " badge-default";
    }

    return (
      <span className={className}>
        {displayText}
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <div className="elite-vault-wrapper">
      <UserNavbar />
      
      {/* Immersive Elite Header */}
      <div className="elite-hero-header">
         <motion.div 
           animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           className="emerald-pulse p1" 
         />
         <motion.div 
           animate={{ x: [0, -60, 0], y: [0, 70, 0] }}
           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           className="emerald-pulse p2" 
         />
         <div className="emerald-pulse p3" />
         
         <Container className="position-relative z-2">
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <motion.button 
                      whileHover={{ scale: 1.1, x: -5, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="back-btn-elite" 
                      onClick={() => navigate("/user")}
                    >
                        <FaArrowLeft />
                    </motion.button>
                    <motion.div 
                      className="ms-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                       <Badge className="elite-badge-pill mb-2">
                          <span className="text-gold tracking-widest fw-bold">SERVICE LEDGER</span>
                       </Badge>
                       <h1 className="hero-title-max mt-2">
                          My <span className="text-gradient-gold">Experience</span>
                       </h1>
                       <p className="hero-desc opacity-70">A comprehensive history of your premium bookings and exclusive service journals.</p>
                    </motion.div>
                </div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, staggerChildren: 0.1 }}
                  className="header-stats d-none d-lg-flex gap-5"
                >
                   <motion.div 
                     whileHover={{ scale: 1.05, y: -5 }}
                     className="stat-box-elite"
                   >
                      <div className="label">Total Journeys</div>
                      <div className="value">{bookings.length}</div>
                   </motion.div>
                   <motion.div 
                     whileHover={{ scale: 1.05, y: -5 }}
                     className="stat-box-elite"
                   >
                      <div className="label">Active Status</div>
                      <div className="value text-emerald">{bookings.filter(b => b.status === 'Confirmed' || b.status === 'Active').length}</div>
                   </motion.div>
                </motion.div>
            </div>
         </Container>
      </div>

      <Container className="main-ledger-section">
        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="empty-vault-state"
          >
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="empty-icon-ring mb-4"
             >
                <FaCalendarAlt size={40} className="text-gold opacity-30" />
             </motion.div>
             <h3 className="fw-900 text-white mb-2">Your Ledger is Blank</h3>
             <p className="text-white opacity-50 mb-0">No premium reservations found in your current records.</p>
             <Button className="btn-vibrant-emerald mt-4 px-5 py-3 rounded-pill" onClick={() => navigate("/user")}>Start Your Journey</Button>
          </motion.div>
        ) : (
          <div className="elite-glass-table">
            {/* Table Header Labels */}
            <div className="table-row-labels d-none d-lg-flex">
               <div className="c-prop">PROPERTY / SERVICE</div>
               <div className="c-date">SERVICE DATE</div>
               <div className="c-status">STATUS</div>
               <div className="c-investment">INVESTMENT</div>
               <div className="c-actions">ACTIONS</div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {bookings.map((booking) => (
                  <motion.div
                     key={booking.id}
                     variants={itemVariants}
                     whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", scale: 1.005, paddingLeft: "45px" }}
                     className="glass-row-entry"
                     layout
                  >
                     <div className="c-prop">
                        <div className="property-avatar-wrapper">
                           <img 
                              src={(() => {
                                const img = booking.imageUrl || booking.image_url;
                                if (!img) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                                return img.startsWith('http') ? img : `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
                              })()}
                              alt="" 
                              className="prop-img" 
                           />
                           <div className="dept-tag">{(booking.department || "P").charAt(0)}</div>
                        </div>
                        <div className="property-main-info">
                           <div className="p-title fw-800 text-white">{booking.propertyName || "Premium Stay"}</div>
                           <div className="p-sub text-white opacity-40 uppercase fs-10 tracking-wider">
                              <FaMapMarkerAlt className="me-1 text-gold" /> {booking.location}
                           </div>
                        </div>
                     </div>

                     <div className="c-date text-white">
                        <div className="date-pill">
                           {new Date(booking.checkInDate || booking.appointmentDate || booking.bookingDate).toLocaleDateString(undefined, {
                             day: '2-digit', month: 'short', year: 'numeric'
                           })}
                        </div>
                     </div>

                     <div className="c-status">
                        {getStatusBadge(booking.status)}
                     </div>

                     <div className="c-investment">
                        <div className="text-gold fw-900 fs-5">
                           ₹{booking.finalPrice || booking.totalPrice || booking.estimatedPrice || "0"}
                        </div>
                     </div>

                     <div className="c-actions d-flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-elite-action invoice" 
                          onClick={() => handlePrintInvoice(booking)}
                          title="Get Invoice"
                        >
                           <FaFileInvoiceDollar /> <span>INVOICE</span>
                        </motion.button>

                        {(booking.status !== "Cancelled" && 
                          booking.status !== "Cancelled by Customer" && 
                          booking.status !== "Confirmed" && 
                          booking.status !== "Completed" && 
                          booking.status !== "Active") && (
                          <motion.button 
                            whileHover={{ scale: 1.05, y: -2, backgroundColor: "#ef4444", color: "#fff" }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-elite-action cancel" 
                            onClick={() => handleCancelBooking(booking)}
                          >
                             <FaTrash />
                          </motion.button>
                        )}
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </Container>

      {/* Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap');

        .elite-vault-wrapper {
            background-color: #001A14;
            min-height: 100vh;
            color: #fff;
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
        }

        /* Immersive Elite Header */
        .elite-hero-header {
            background: linear-gradient(180deg, #001a14 0%, #002c22 100%);
            padding: 100px 0 140px;
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
        }
        .p1 { width: 500px; height: 500px; background: #10b981; top: -200px; left: -100px; }
        .p2 { width: 400px; height: 400px; background: #fbbf24; bottom: -100px; right: -50px; }
        .p3 { width: 300px; height: 300px; background: #059669; top: 10%; right: 20%; }

        .back-btn-elite {
            width: 55px; height: 55px; border-radius: 18px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white; display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px); cursor: pointer; transition: 0.3s;
        }
        .back-btn-elite:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255,255,255,0.3); }

        .elite-badge-pill {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 50px !important;
            padding: 6px 16px !important;
        }

        .hero-title-max {
            font-family: 'Outfit', sans-serif;
            font-weight: 900; font-size: 4rem;
            letter-spacing: -2px; margin-bottom: 10px;
        }
        .text-gradient-gold {
            background: linear-gradient(to bottom, #fbbf24, #d97706);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-desc { max-width: 600px; font-size: 1.1rem; line-height: 1.6; }

        .stat-box-elite { text-align: center; }
        .stat-box-elite .label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 5px; font-weight: 800; }
        .stat-box-elite .value { font-size: 2rem; font-weight: 900; font-family: 'Outfit'; }

        /* Ledger Table Section */
        .main-ledger-section { margin-top: -60px; position: relative; z-index: 10; padding-bottom: 100px; }

        .elite-glass-table {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 35px; overflow: hidden;
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
        }

        .table-row-labels {
            display: flex; align-items: center; padding: 25px 40px;
            background: rgba(255, 255, 255, 0.04);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-family: 'Outfit'; font-weight: 800; font-size: 0.7rem;
            color: #fbbf24; letter-spacing: 2.5px;
        }

        .glass-row-entry {
            display: flex; align-items: center; padding: 30px 40px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            transition: all 0.4s ease;
        }

        /* Column widths */
        .c-prop { flex: 3; display: flex; align-items: center; gap: 20px; }
        .c-date { flex: 1.5; }
        .c-status { flex: 1.5; }
        .c-investment { flex: 1.5; }
        .c-actions { flex: 2; justify-content: flex-end; }

        .property-avatar-wrapper { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
        .prop-img { 
            width: 100%; height: 100%; border-radius: 18px; object-fit: cover;
            border: 2px solid rgba(255,255,255,0.05);
        }
        .dept-tag {
            position: absolute; top: -5px; right: -5px;
            width: 22px; height: 22px; background: #fbbf24; color: #000; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900;
            border: 3px solid #002c22;
        }

        .p-title { font-size: 1.1rem; margin-bottom: 4px; }
        .fs-10 { font-size: 0.65rem; }

        .date-pill {
            background: rgba(255,255,255,0.05); padding: 8px 16px; border-radius: 12px;
            font-size: 0.85rem; width: fit-content; font-weight: 600;
        }

        /* Status Badges */
        .badge-status-modern {
            padding: 8px 16px; border-radius: 10px; font-size: 0.7rem;
            font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
            display: inline-flex; align-items: center; gap: 6px;
        }
        .badge-confirmed { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .badge-cancelled { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .badge-pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
        .badge-completed { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
        .badge-default { background: rgba(255,255,255,0.1); color: #fff; }

        .btn-elite-action {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            color: #fff; padding: 10px 20px; border-radius: 14px; font-weight: 800;
            font-size: 0.7rem; display: flex; align-items: center; gap: 8px;
            letter-spacing: 1px; transition: 0.3s;
        }
        .btn-elite-action.invoice:hover { background: #fff; color: #000; border-color: #fff; }
        .btn-elite-action.cancel { width: 42px; padding: 0; justify-content: center; }

        .empty-vault-state { 
            text-align: center; padding: 100px 0; background: rgba(255,255,255,0.02); 
            border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); 
        }
        .empty-icon-ring { 
            width: 100px; height: 100px; border-radius: 50%; border: 2px dashed rgba(251, 191, 36, 0.2); 
            display: inline-flex; align-items: center; justify-content: center; 
        }

        .btn-vibrant-emerald {
            background: linear-gradient(to right, #10b981, #059669); border: none; color: #fff;
            font-weight: 900; text-transform: uppercase; letter-spacing: 1px;
        }

        .text-emerald { color: #10b981; }
        .fw-900 { font-weight: 900; }

        @media (max-width: 992px) {
            .hero-title-max { font-size: 2.5rem; }
            .glass-row-entry { flex-direction: column; align-items: flex-start; gap: 15px; }
            .c-actions { width: 100%; justify-content: flex-start; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
        }
      `}</style>

      <StatusModal
        show={modalConfig.show}
        onHide={() => setModalConfig(prev => ({ ...prev, show: false }))}
        type={modalConfig.type}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
      />
      
      <Footer />
    </div>
  );
};

export default UserBookings;
