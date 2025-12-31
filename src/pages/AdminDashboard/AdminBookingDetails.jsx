import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Image,
  Spinner,
  ListGroup
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUser,
  FaHotel,
  FaMoneyBillWave,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { fetchAllBookings, getBookingPayment } from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import "../../components/admin/AdminDashboardModern.css";

const AdminBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Fetch all bookings to find the specific one
        // (Since there is no single admin booking endpoint yet)
        const allBookings = await fetchAllBookings();
        const foundBooking = allBookings.find(b => b.id.toString() === id);

        if (!foundBooking) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        // Map fields similar to AdminDepartments for consistency
        const mappedBooking = {
            ...foundBooking,
            userName: foundBooking.userName || foundBooking.user_name || 'N/A',
            propertyName: foundBooking.propertyName || foundBooking.property_name || 'N/A',
            department: foundBooking.department || foundBooking.propertyType || 'N/A',
            checkInDate: foundBooking.check_in_date || foundBooking.checkInDate,
            appointmentDate: foundBooking.appointment_date || foundBooking.appointmentDate,
            finalPrice: foundBooking.final_price || foundBooking.finalPrice || 0,
            status: foundBooking.status || 'Pending'
        };

        setBooking(mappedBooking);

        // 2. Fetch payment details
        try {
          const paymentData = await getBookingPayment(id);
          setPayment(paymentData);
        } catch (err) {
          console.log("No payment details found or error fetching payment:", err);
          // It's possible there is no payment record yet
          setPayment(null);
        }

      } catch (err) {
        console.error("Error loading booking details:", err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    let variant = 'secondary';
    if (status === 'Confirmed') variant = 'success';
    else if (status === 'Pending') variant = 'warning';
    else if (status === 'Completed') variant = 'info';
    else if (status === 'Cancelled') variant = 'danger';
    
    return <Badge bg={variant}>{status}</Badge>;
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <AdminNavbar />
        <Container className="py-5">
           <Button 
            variant="outline-secondary" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <FaArrowLeft className="me-2" /> Back
          </Button>
          <Card className="text-center p-5 shadow-sm">
            <h3 className="text-danger mb-3">Error</h3>
            <p className="lead">{error || "Booking not found"}</p>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <div className="dashboard-container">
      <AdminNavbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Container fluid className="py-4">
          <Button 
            variant="link" 
            onClick={() => navigate(-1)}
            className="mb-4 text-decoration-none text-secondary d-flex align-items-center ps-0"
          >
            <FaArrowLeft className="me-2" /> Back to List
          </Button>

          <Row className="mb-4 align-items-center">
            <Col>
              <h2 className="fw-bold mb-1" style={{ color: "#065f46" }}>
                Booking Details #{booking.id}
              </h2>
              <p className="text-secondary mb-0">
                View detailed information for this booking
              </p>
            </Col>
            <Col className="text-end">
               <motion.div whileHover={{ scale: 1.05 }}>
                {getStatusBadge(booking.status)}
               </motion.div>
            </Col>
          </Row>

          <Row className="g-4">
            {/* Left Column: Property & Image */}
            <Col lg={4}>
              <Card className="modern-card border-0 h-100 overflow-hidden">
                <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
                    {booking.imageUrl ? (
                        <Image 
                            src={booking.imageUrl} 
                            alt={booking.propertyName} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-light text-muted">
                            <FaHotel size={40} className="mb-3 opacity-50" />
                            <span>No Image Available</span>
                        </div>
                    )}
                    <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                       <Badge bg="light" text="dark" className="shadow-sm">{booking.department}</Badge>
                    </div>
                </div>
                <Card.Body className="p-4">
                  <h4 className="fw-bold text-dark mb-2">{booking.propertyName}</h4>
                  <div className="text-muted mb-4 d-flex align-items-start">
                    <FaMapMarkerAlt className="me-2 mt-1 text-danger flex-shrink-0" />
                    <span>{booking.location || 'Location information not available'}</span>
                  </div>
                  
                  <div className="p-3 bg-light rounded-3">
                     <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary small fw-bold">SERVICE TYPE</span>
                        <span className="fw-bold text-dark">{booking.department}</span>
                     </div>
                     <div className="d-flex justify-content-between">
                        <span className="text-secondary small fw-bold">PRICE</span>
                        <span className="fw-bold text-success">₹{booking.finalPrice.toFixed(2)}</span>
                     </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Right Column: Details */}
            <Col lg={8}>
              {/* User Details */}
              <Card className="modern-card border-0 mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0 text-success fw-bold text-uppercase small ls-1"><FaUser className="me-2" /> User Details</h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-4">
                        <Col md={6}>
                            <div className="d-flex align-items-center mb-3">
                                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3 text-success">
                                   <FaUser />
                                </div>
                                <div>
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>FULL NAME</small>
                                    <span className="fw-bold text-dark">{booking.userName}</span>
                                </div>
                            </div>
                             <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3 text-success">
                                   <FaEnvelope />
                                </div>
                                <div>
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>EMAIL ADDRESS</small>
                                    <span className="fw-medium text-dark">{booking.userEmail || 'N/A'}</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex align-items-center mb-3">
                                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3 text-success">
                                   <FaCheckCircle />
                                </div>
                                <div>
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>USER ID</small>
                                    <span className="fw-bold text-dark">#{booking.user_id}</span>
                                </div>
                            </div>
                             <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3 text-success">
                                   <FaPhone />
                                </div>
                                <div>
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>PHONE NUMBER</small>
                                    <span className="fw-medium text-dark">{booking.userPhone || 'N/A'}</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
              </Card>

              {/* Booking Information */}
              <Card className="modern-card border-0 mb-4">
                <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0 text-success fw-bold text-uppercase small ls-1"><FaCalendarAlt className="me-2" /> Booking Information</h6>
                </Card.Header>
                <Card.Body className="p-4">
                     <Row className="g-4">
                        <Col md={6}>
                            <div className="mb-3">
                                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Check-in / Appointment</small>
                                <span className="fs-5 fw-bold text-dark">{formatDate(booking.checkInDate || booking.appointmentDate)}</span>
                            </div>
                            <div>
                                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Booking Created</small>
                                <span className="fw-medium text-dark">{formatDate(booking.created_at)}</span>
                            </div>
                        </Col>
                        <Col md={6}>
                            {booking.check_out_date && (
                                <div className="mb-3">
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Check-out Date</small>
                                    <span className="fs-5 fw-bold text-dark">{formatDate(booking.check_out_date)}</span>
                                </div>
                            )}
                             <div>
                                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Service / Room Type</small>
                                <span className="fw-medium text-dark">{booking.room_type || booking.service_name || 'Standard Service'}</span>
                            </div>
                        </Col>
                     </Row>
                </Card.Body>
              </Card>

              {/* Payment Details */}
               <Card className="modern-card border-0">
                <Card.Header className="bg-white border-bottom py-3">
                    <h6 className="mb-0 text-success fw-bold text-uppercase small ls-1"><FaMoneyBillWave className="me-2" /> Payment Details</h6>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-4">
                         <Col md={6}>
                            <div className="mb-3">
                               <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Total Amount</small>
                               <span className="h4 text-primary fw-bold">₹{booking.finalPrice.toFixed(2)}</span>
                            </div>
                             <div>
                               <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Payment Method</small>
                               {payment ? (
                                    <Badge bg="light" text="dark" className="border px-3 py-2 fw-medium">{payment.paymentMethod}</Badge>
                                ) : (
                                    <span className="text-muted fst-italic">Pending / Not Recorded</span>
                                )}
                            </div>
                        </Col>
                        {payment && (
                            <Col md={6}>
                                <div className="mb-3">
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Payment Status</small>
                                     <span className={`badge ${payment.paymentStatus === 'Verified' ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2 rounded-pill`}>
                                        {payment.paymentStatus}
                                     </span>
                                </div>
                                <div>
                                    <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.7rem'}}>Transaction ID</small>
                                    <code className="bg-light px-2 py-1 rounded text-dark">{payment.transactionId || 'N/A'}</code>
                                </div>
                            </Col>
                        )}
                        {booking.couponCode && (
                            <Col md={12}>
                                <div className="d-flex align-items-center p-3 bg-success bg-opacity-10 rounded border border-success border-opacity-25">
                                    <FaCheckCircle className="text-success me-2" />
                                    <div>
                                        <small className="d-block text-success fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>COUPON APPLIED</small>
                                        <span className="fw-bold text-dark">{booking.couponCode}</span>
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Card.Body>
              </Card>

            </Col>
          </Row>
        </Container>
      </motion.div>
    </div>
  );
};

export default AdminBookingDetails;
