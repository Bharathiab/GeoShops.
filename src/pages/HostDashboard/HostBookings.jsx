import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, ButtonGroup } from 'react-bootstrap';
import { FaCalendar, FaFilter, FaDownload, FaEye, FaSearch, FaTimes, FaEllipsisV, FaUserTie } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchHostBookings, updateBookingStatus } from '../../api';
import HostNavbar from '../../components/host/HostNavbar';
import StatusModal from '../../components/common/StatusModal';
import PaymentVerificationModal from '../../components/host/PaymentVerificationModal';
import "./HostDashboard.css";

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    type: "success",
    message: "",
    onConfirm: null
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  let hostId;
  try {
    const hostData = localStorage.getItem('hostLoginData');
    hostId = hostData ? JSON.parse(hostData).hostId : null;
  } catch (e) {
    console.error("Error parsing hostLoginData:", e);
    hostId = null;
  }

  const filters = ['All', 'Pending', 'Payment Pending', 'Confirmed', 'Cancelled', 'Cancelled by Customer', 'Completed'];

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [activeFilter, departmentFilter, dateFilter, searchTerm, bookings]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchHostBookings(hostId);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (dateFilter !== 'All Time') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(b => {
        const dateStr = b.checkInDate || b.appointmentDate;
        if (!dateStr) return false;
        const bookingDate = new Date(dateStr);
        bookingDate.setHours(0, 0, 0, 0);
        if (dateFilter === 'Today') return bookingDate.getTime() === today.getTime();
        if (dateFilter === 'Last Week') {
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return bookingDate >= lastWeek && bookingDate <= today;
        }
        if (dateFilter === 'This Month') return bookingDate.getMonth() === today.getMonth() && bookingDate.getFullYear() === today.getFullYear();
        return true;
      });
    }

    if (activeFilter !== 'All') {
      filtered = filtered.filter(b => b.status === activeFilter);
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter(b => b.department === departmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id?.toString().includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId, department, newStatus) => {
    try {
      await updateBookingStatus(department, bookingId, newStatus);
      const updatedBookings = bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      );
      setBookings(updatedBookings);
      setModalConfig({
        show: true,
        type: "success",
        message: "Booking status updated successfully!",
        onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
      });
    } catch (error) {
      setModalConfig({
        show: true,
        type: "error",
        message: "Failed to update booking status.",
        onConfirm: () => setModalConfig(prev => ({ ...prev, show: false }))
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      'Pending': 'badge-warning',
      'Confirmed': 'badge-success',
      'Cancelled': 'badge-danger',
      'Cancelled by Customer': 'badge-danger',
      'Completed': 'badge-info',
      'Payment Pending': 'badge-warning'
    };
    return `badge-modern ${map[status] || 'badge-info'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateFinalPrice = (booking) => {
    return booking.finalPrice || booking.totalPrice || booking.estimatedPrice || 0;
  };

  const exportToCSV = () => {
    const headers = ['Booking ID', 'User', 'Property', 'Dept', 'Date', 'Amount', 'Status'];
    const rows = filteredBookings.map(b => [
      b.id, b.userName, b.propertyName, b.department, 
      formatDate(b.checkInDate || b.appointmentDate), 
      calculateFinalPrice(b), b.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookings_export_${new Date().getTime()}.csv`;
    link.click();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <HostNavbar />
      <div className="host-main-content">
        <StatusModal
          show={modalConfig.show}
          onHide={() => setModalConfig(prev => ({ ...prev, show: false }))}
          type={modalConfig.type}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
        />

        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="bookings-container"
        >
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-text">
              <h1>All Bookings</h1>
              <p>View and manage all your property bookings in one place.</p>
            </div>
            <div className="d-flex gap-2">
              <Button className="btn-modern btn-outline-modern" onClick={exportToCSV}>
                <FaDownload /> Export
              </Button>
            </div>
          </header>

          {/* Filters Card */}
          <motion.div variants={itemVariants} className="modern-card mb-4 p-0 overflow-hidden shadow-sm">
            <div className="p-4 border-bottom bg-light bg-opacity-50">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                        <FaFilter size={14} />
                    </div>
                    <span className="fw-bold text-dark letter-spacing-1 smallest text-uppercase">Booking Filters</span>
                </div>
                
                <div className="d-flex flex-wrap gap-2">
                    {filters.map(filter => {
                        const isActive = activeFilter === filter;
                        return (
                            <button
                                key={filter}
                                className={`px-4 py-2 rounded-pill fw-600 transition-all border shadow-xs smallest ${
                                    isActive 
                                    ? 'bg-success text-white border-success shadow-emerald' 
                                    : 'bg-white text-muted border-light hover-bg-light'
                                }`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4">
                <Row className="g-4">
                    <Col lg={3} md={6}>
                        <div className="filter-group">
                            <span className="smallest text-muted fw-bold text-uppercase mb-2 d-block letter-spacing-1">Time Period</span>
                            <div className="bg-light p-1 rounded-pill d-flex gap-1 border">
                                {['All Time', 'Today', 'This Month'].map(t => (
                                    <button
                                        key={t}
                                        className={`flex-grow-1 py-2 px-3 rounded-pill fw-bold smallest transition-all border-0 ${
                                            dateFilter === t 
                                            ? 'bg-white text-success shadow-sm shadow-xs' 
                                            : 'bg-transparent text-muted'
                                        }`}
                                        onClick={() => setDateFilter(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Col>

                    <Col lg={3} md={6}>
                        <div className="filter-group">
                            <span className="smallest text-muted fw-bold text-uppercase mb-2 d-block letter-spacing-1">Department</span>
                            <div className="position-relative">
                                <Form.Select 
                                    className="px-4 py-2 rounded-pill fw-bold smallest border bg-light bg-opacity-50 text-dark transition-all focus-ring-emerald shadow-xs"
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    style={{ appearance: 'none' }}
                                >
                                    <option value="All">All Departments</option>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Salon">Salon</option>
                                    <option value="Hospital">Hospital</option>
                                    <option value="Cab">Cab</option>
                                </Form.Select>
                                <div className="position-absolute end-0 top-50 translate-middle-y pe-3 pointer-events-none text-muted smallest">
                                    <FaCalendar />
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col lg={6}>
                        <div className="filter-group">
                            <span className="smallest text-muted fw-bold text-uppercase mb-2 d-block letter-spacing-1">Search Bookings</span>
                            <div className="position-relative">
                                <FaSearch className="position-absolute text-muted smallest" style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <Form.Control
                                    type="text"
                                    placeholder="Search ID, customer name, or property..."
                                    className="px-5 py-2 rounded-pill fw-bold smallest border bg-light bg-opacity-50 text-dark transition-all focus-ring-emerald shadow-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button 
                                        className="position-absolute bg-transparent border-0 text-muted hover-text-danger transition-all"
                                        style={{ right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            
            <style>{`
                .focus-ring-emerald:focus {
                    border-color: #10b981 !important;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
                    outline: none;
                }
                .hover-border-emerald:hover {
                    border-color: #10b981 !important;
                }
                .smallest { font-size: 0.725rem; }
                .fw-600 { font-weight: 600; }
                .letter-spacing-1 { letter-spacing: 0.05em; }
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .shadow-emerald { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); }
                .bg-light-faded { background-color: rgba(248, 250, 252, 0.5); }
            `}</style>
          </motion.div>

          {/* Table Card */}
          <motion.div variants={itemVariants} className="modern-table-container">
            <Table hover className="modern-table mb-0">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Property</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Specialist</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-5">Loading...</td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-5 text-muted">No bookings found</td></tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredBookings.map((booking) => (
                      <motion.tr 
                        key={`${booking.department}-${booking.id}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td><span className="font-weight-bold text-dark">#{booking.id}</span></td>
                        <td>{booking.userName}</td>
                        <td className="text-truncate" style={{ maxWidth: '150px' }}>{booking.propertyName}</td>
                        <td><span className="badge-modern badge-info">{booking.department}</span></td>
                        <td className="text-nowrap">{formatDate(booking.checkInDate || booking.appointmentDate)}</td>
                        <td>
                          {booking.specialistName ? (
                            <div className="d-flex align-items-center gap-2">
                              <FaUserTie className="text-primary smaller" />
                              <span className="small fw-600">{booking.specialistName}</span>
                            </div>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td><span className="font-weight-bold">₹{calculateFinalPrice(booking).toLocaleString('en-IN')}</span></td>
                        <td>
                          <Form.Select
                            size="sm"
                            className={`badge-modern border-0 py-1 ${getStatusBadgeClass(booking.status)}`}
                            value={booking.status}
                            onChange={(e) => handleStatusChange(booking.id, booking.department, e.target.value)}
                            disabled={booking.status === 'Cancelled by Customer'}
                            style={{ width: '130px', cursor: 'pointer' }}
                          >
                            <option value="Pending" className="bg-white text-dark">Pending</option>
                            <option value="Confirmed" className="bg-white text-dark">Confirmed</option>
                            <option value="Completed" className="bg-white text-dark">Completed</option>
                            <option value="Cancelled" className="bg-white text-dark">Cancelled</option>
                            <option value="Cancelled by Customer" className="bg-white text-dark">Cancelled by Customer</option>
                            <option value="Payment Pending" className="bg-white text-dark">Payment Pending</option>
                          </Form.Select>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              variant="light"
                              className="btn-modern btn-icon p-2"
                              title="View Payment"
                              onClick={() => {
                                setSelectedBookingForPayment(booking);
                                setShowPaymentModal(true);
                              }}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="light"
                              className="btn-modern btn-icon p-2"
                              title="Booking Details"
                              onClick={() => {
                                navigate(`/host/booking-details/${booking.department}/${booking.id}`);
                              }}
                            >
                              <FaEllipsisV />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </Table>
          </motion.div>
          
          <div className="mt-3 text-muted px-2">
            Showing {filteredBookings.length} bookings
          </div>
        </motion.div>
      </div>

      <PaymentVerificationModal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          setSelectedBookingForPayment(null);
        }}
        booking={selectedBookingForPayment}
        onSuccess={loadBookings}
      />
    </>
  );
};

export default HostBookings;

