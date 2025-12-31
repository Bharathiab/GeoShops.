import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendar, FaClock, FaCheckCircle, FaUser, FaThLarge, FaPhone, FaUserCheck, FaMapMarkerAlt, FaIdCard, FaBuilding, FaHistory, FaCar, FaCoffee, FaHome, FaHeartbeat, FaCut, FaEllipsisV, FaUserTie } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { fetchHostBookings, updateBookingStatus } from '../../api';
import HostNavbar from '../../components/host/HostNavbar';
import "./HostDashboard.css";

const HostTodayArrivals = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  let hostId;
  try {
    const hostData = localStorage.getItem('hostLoginData');
    hostId = hostData ? JSON.parse(hostData).hostId : null;
  } catch (e) {
    console.error("Error parsing hostLoginData:", e);
    hostId = null;
  }

  useEffect(() => {
    if (!hostId) { navigate("/host-login"); return; }
    loadTodayArrivals();
  }, [hostId, navigate]);

  const loadTodayArrivals = async () => {
    try {
      setLoading(true);
      const allBookings = await fetchHostBookings(hostId);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysBookings = allBookings.filter(b => {
        const dateStr = b.checkInDate || b.appointmentDate;
        if (!dateStr) return false;
        
        const bookingDate = new Date(dateStr);
        bookingDate.setHours(0, 0, 0, 0);
        
        return bookingDate.getTime() === today.getTime();
      });

      setBookings(todaysBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, department, newStatus) => {
    try {
      await updateBookingStatus(department, bookingId, newStatus);
      setBookings(prevBookings => prevBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getDepartmentIcon = (department) => {
    const icons = {
      'Hotel': <FaHome />,
      'Hospital': <FaHeartbeat />,
      'Salon': <FaCut />,
      'Cab': <FaCar />,
      'default': <FaHistory />
    };
    return icons[department] || icons.default;
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      } 
    } 
  };
  
  const itemVariants = { 
    hidden: { y: 20, opacity: 0 }, 
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    } 
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="host-dashboard-container">
      <HostNavbar />
      <div className="host-main-content">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
        >
          <header className="dashboard-header mb-4">
            <div className="header-text">
              <h1>Today's Check-ins</h1>
              <p>Manage and track guests arriving at your properties today.</p>
            </div>
          </header>

          {/* Modern Table Card */}
          <Row>
            <Col lg={12}>
              <motion.div 
                variants={itemVariants} 
                className="modern-card"
                style={{ 
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Table Header with Icon */}
                <div className="card-header-modern d-flex align-items-center gap-3 bg-light" style={{
                  padding: '1.5rem',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <div className="icon-box-sm bg-success bg-opacity-10 text-success rounded-3">
                    <FaHistory size={18} />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-extra-bold text-dark">Guest Arrivals</h5>
                    <p className="mb-0 small text-muted">Manage and track today's check-ins</p>
                  </div>
                </div>

                <div className="table-responsive">
                  <Table className="modern-table mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>
                          <div className="d-flex align-items-center gap-2">
                            <FaUser size={12} className="text-success" />
                            Guest Information
                          </div>
                        </th>
                        <th style={{ width: '15%' }}>
                            <div className="d-flex align-items-center gap-2">
                                <FaUserTie size={12} className="text-success" />
                                Specialist
                            </div>
                        </th>
                        <th style={{ width: '12%' }}>
                          <div className="d-flex align-items-center gap-2">
                            <FaClock size={12} className="text-success" />
                            Arrival Time
                          </div>
                        </th>
                        <th style={{ width: '20%' }}>
                          <div className="d-flex align-items-center gap-2">
                            <FaMapMarkerAlt size={12} className="text-success" />
                            Property Details
                          </div>
                        </th>
                        <th style={{ width: '14%' }}>
                          <div className="d-flex align-items-center gap-2">
                            <FaPhone size={12} className="text-success" />
                            Contact
                          </div>
                        </th>
                        <th style={{ width: '12%' }}>Status</th>
                        <th style={{ width: '20%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="d-flex flex-column align-items-center gap-3"
                            >
                              <Spinner animation="border" variant="success" />
                              <span className="text-muted fw-600">Loading today's arrivals...</span>
                            </motion.div>
                          </td>
                        </tr>
                      ) : bookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="d-flex flex-column align-items-center gap-3"
                            >
                              <div className="icon-box-xl bg-light text-muted rounded-circle">
                                <FaCalendar size={40} />
                              </div>
                              <div>
                                <h5 className="text-dark fw-extra-bold mb-2">No Arrivals Scheduled</h5>
                                <p className="text-muted mb-0">Everything is quiet today. Enjoy the calm!</p>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {bookings.map((booking, index) => (
                            <motion.tr 
                              key={`${booking.department}-${booking.id}`}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              custom={index}
                              layout
                              whileHover={{ 
                                backgroundColor: '#f8fafc',
                                transition: { duration: 0.2 }
                              }}
                            >
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <motion.div 
                                    className="avatar-circle bg-gradient text-white fw-extra-bold"
                                    style={{
                                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                      width: '44px',
                                      height: '44px',
                                      fontSize: '1.1rem',
                                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                                    }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                  >
                                    {booking.userName?.charAt(0).toUpperCase()}
                                  </motion.div>
                                  <div>
                                    <div className="fw-extra-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                      {booking.userName}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                      <FaIdCard size={10} className="text-muted" />
                                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        ID: #{booking.id}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {booking.specialistName ? (
                                    <div className="d-flex align-items-center gap-2 text-dark">
                                        <FaUserTie size={12} className="text-primary text-opacity-75" />
                                        <span className="fw-600" style={{ fontSize: '0.9rem' }}>
                                            {booking.specialistName}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-muted small" style={{ fontStyle: 'italic' }}>None</span>
                                )}
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="icon-box-sm bg-success bg-opacity-10 text-success rounded-2">
                                    <FaClock size={14} />
                                  </div>
                                  <span className="fw-600 text-dark" style={{ fontSize: '0.9rem' }}>
                                    {booking.checkInTime || booking.appointmentTime || "All Day"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div className="icon-box-sm bg-primary bg-opacity-10 text-primary rounded-2">
                                    {getDepartmentIcon(booking.department)}
                                  </div>
                                  <div>
                                    <div className="fw-extra-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                      {booking.propertyName}
                                    </div>
                                    <span className="badge-modern badge-primary" style={{ 
                                      fontSize: '0.7rem',
                                      padding: '0.25rem 0.6rem',
                                      marginTop: '0.25rem'
                                    }}>
                                      {booking.department}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2 text-muted">
                                  <FaPhone size={12} className="text-success" />
                                  <span className="fw-600" style={{ fontSize: '0.85rem' }}>
                                    {booking.userPhone || "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <motion.span 
                                  className={`badge-modern ${
                                    booking.status === 'Confirmed' ? 'badge-success' : 
                                    booking.status === 'Completed' ? 'badge-info' : 
                                    booking.status === 'Pending' ? 'badge-warning' : 
                                    booking.status === 'Cancelled by Customer' ? 'badge-danger' : 'badge-danger'
                                  }`}
                                  style={{ 
                                    padding: '0.5rem 0.9rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '700'
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ type: "spring", stiffness: 400 }}
                                >
                                  {booking.status}
                                </motion.span>
                              </td>
                              <td>
                                {booking.status === 'Confirmed' ? (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="btn-modern btn-primary-modern d-flex align-items-center gap-2 fw-extra-bold"
                                      onClick={() => handleStatusUpdate(booking.id, booking.department, 'Completed')}
                                      style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '0.75rem',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                                      }}
                                    >
                                      <FaCheckCircle /> Mark Completed
                                    </Button>
                                  </motion.div>
                                ) : booking.status === 'Completed' ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="icon-box-sm bg-success bg-opacity-10 text-success rounded-2">
                                      <FaCheckCircle size={16} />
                                    </div>
                                    <span className="text-success fw-extra-bold" style={{ fontSize: '0.85rem' }}>
                                      Fulfilled
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                                    No Actions
                                  </span>
                                )}
                                <Button
                                  variant="light"
                                  className="btn-modern btn-icon ms-2 p-2"
                                  style={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                                  onClick={() => {
                                    setSelectedBookingForDetails(booking);
                                    setShowBookingDetailsModal(true);
                                  }}
                                  title="View Full Details"
                                >
                                  <FaEllipsisV />
                                </Button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      )}
                    </tbody>
                  </Table>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </div>
    </div>
  );
};

export default HostTodayArrivals;

