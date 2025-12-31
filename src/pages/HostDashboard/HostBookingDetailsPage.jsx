import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { 
  FaUser, FaCalendarAlt, FaClock, FaTag, FaInfoCircle, FaPhone, 
  FaEnvelope, FaBuilding, FaUserTie, FaCheckCircle, FaMoneyBillWave, 
  FaArrowLeft, FaPrint, FaDownload, FaHistory
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import HostNavbar from '../../components/host/HostNavbar';
import { fetchHostBookings } from '../../api'; // We'll filter for the specific ID
import Toast from '../../utils/toast';

const HostBookingDetailsPage = () => {
  const { department, id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const hostLoginData = JSON.parse(localStorage.getItem('hostLoginData') || '{}');
      if (!hostLoginData.hostId) {
        navigate('/host-login');
        return;
      }
      
      const allBookings = await fetchHostBookings(hostLoginData.hostId);
      const foundBooking = allBookings.find(b => b.id.toString() === id);
      
      if (foundBooking) {
        setBooking(foundBooking);
      } else {
        Toast.error("Booking not found");
        navigate('/host/bookings');
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      Toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'Completed': return 'info';
      case 'Cancelled': 
      case 'Cancelled by Customer': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-vh-100 bg-light-soft">
      <HostNavbar />
      
      <Container className="py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Actions */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button 
              variant="outline-dark" 
              className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> Back
            </Button>
            <div className="d-flex gap-2">
              <Button variant="light" className="btn-modern shadow-sm rounded-pill px-4">
                <FaPrint className="me-2" /> Print
              </Button>
              <Button variant="success" className="btn-modern shadow-sm rounded-pill px-4">
                <FaDownload className="me-2" /> Download Invoice
              </Button>
            </div>
          </div>

          <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-5">
            <div className="bg-premium-dark p-4 text-white" style={{ background: 'linear-gradient(135deg, #001A14 0%, #002C22 100%)' }}>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center gap-4">
                    <motion.div 
                      className="avatar-circle bg-white text-dark fw-bold shadow-lg"
                      style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      {booking.userName?.charAt(0).toUpperCase()}
                    </motion.div>
                    <div>
                      <h2 className="mb-1 fw-900 font-heading">Booking #{booking.id}</h2>
                      <div className="d-flex gap-2">
                        <Badge bg={getStatusColor(booking.status)} className="rounded-pill px-3 py-2 shadow-sm">
                          {booking.status}
                        </Badge>
                        <Badge bg="white" text="dark" className="rounded-pill px-3 py-2 shadow-sm">
                          {booking.department}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <div className="text-white text-opacity-70 small mb-1">Final Amount</div>
                  <h1 className="fw-900 text-gold-modern mb-0">₹{(booking.finalPrice || booking.totalPrice || 0).toLocaleString('en-IN')}</h1>
                </Col>
              </Row>
            </div>

            <Card.Body className="p-0">
              <div className="p-4 bg-white border-bottom">
                <Row className="g-4">
                  {/* Customer Information */}
                  <Col md={4}>
                    <div className="p-4 rounded-4 bg-light h-100 border border-light">
                      <h6 className="text-uppercase text-muted fw-bold mb-4 small letter-spacing-1 d-flex align-items-center gap-2">
                        <FaUser className="text-success" /> Customer Details
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <div className="small text-muted mb-1">Full Name</div>
                          <div className="fw-bold fs-5 text-dark">{booking.userName || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="small text-muted mb-1">Phone Number</div>
                          <div className="fw-bold text-dark"><FaPhone className="text-muted small me-2" />{booking.userPhone || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="small text-muted mb-1">Email Address</div>
                          <div className="fw-bold text-dark"><FaEnvelope className="text-muted small me-2" />{booking.userEmail || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Booking Specifics */}
                  <Col md={4}>
                    <div className="p-4 rounded-4 bg-light h-100 border border-light">
                      <h6 className="text-uppercase text-muted fw-bold mb-4 small letter-spacing-1 d-flex align-items-center gap-2">
                        <FaCalendarAlt className="text-success" /> Booking Information
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <div className="small text-muted mb-1">Scheduled At</div>
                          <div className="fw-bold fs-5 text-dark">
                            <FaClock className="text-muted small me-2" />
                            {formatDate(booking.checkInDate || booking.appointmentDate)}
                          </div>
                        </div>
                        <div>
                          <div className="small text-muted mb-1">Property Details</div>
                          <div className="fw-bold text-dark">
                            <FaBuilding className="text-muted small me-2" />
                            {booking.propertyName}
                          </div>
                        </div>
                        {booking.specialistName && (
                          <div className="mt-2 p-2 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-20">
                            <div className="small text-primary fw-bold mb-1">Assigned Specialist</div>
                            <div className="fw-bold text-primary d-flex align-items-center gap-2">
                              <FaUserTie /> {booking.specialistName}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>

                  {/* Payment Overview */}
                  <Col md={4}>
                    <div className="p-4 rounded-4 bg-white shadow-sm border h-100">
                      <h6 className="text-uppercase text-muted fw-bold mb-4 small letter-spacing-1 d-flex align-items-center gap-2">
                        <FaMoneyBillWave className="text-success" /> Payment Summary
                      </h6>
                      <div className="d-flex flex-column gap-2 mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Base Amount:</span>
                          <span className="fw-bold text-dark">₹{(booking.totalPrice || 0).toLocaleString('en-IN')}</span>
                        </div>
                        {booking.discountAmount > 0 && (
                          <div className="d-flex justify-content-between align-items-center text-danger">
                            <span>Discount Applied:</span>
                            <span className="fw-bold">-₹{booking.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {booking.couponCode && (
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                              <FaTag size={10} className="me-1" /> {booking.couponCode}
                            </Badge>
                            <span className="small text-muted font-italic">Coupon code used</span>
                          </div>
                        )}
                        <hr className="my-2 border-dashed" />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-900 fs-5 text-dark">Total Paid:</span>
                          <span className="fw-900 fs-4 text-success">₹{(booking.finalPrice || booking.totalPrice || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <Button variant="outline-success" className="w-100 rounded-pill px-4 fw-bold shadow-sm">
                        View Payment Proof
                      </Button>
                    </div>
                  </Col>

                  {/* Services & Notes */}
                  <Col md={12}>
                    <div className="p-4 rounded-4 bg-light border border-light">
                      <h6 className="text-uppercase text-muted fw-bold mb-3 small letter-spacing-1 d-flex align-items-center gap-2">
                        <FaInfoCircle className="text-success" /> Service & Description
                      </h6>
                      <div className="bg-white p-4 rounded-4 shadow-sm border">
                        <div className="mb-4">
                          <div className="small text-muted mb-2 fw-bold text-uppercase">Requested Services</div>
                          <div className="fs-5 fw-600 text-dark p-3 bg-light rounded-3">
                            {booking.serviceName || booking.description || 'Details not specified'}
                          </div>
                        </div>
                        {booking.reason && (
                          <div>
                            <div className="small text-muted mb-2 fw-bold text-uppercase">Additional Notes</div>
                            <div className="p-3 bg-light rounded-3 text-muted border-start border-4 border-success border-opacity-50">
                              {booking.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>

            <Card.Footer className="bg-white p-4 border-0 d-flex justify-content-end gap-3">
              <div className="me-auto text-muted small d-flex align-items-center gap-2">
                <FaHistory /> Last updated: {formatDate(booking.updatedAt || new Date())}
              </div>
              {booking.status === 'Pending' && (
                <>
                  <Button variant="outline-danger" className="rounded-pill px-5 fw-bold shadow-sm">
                    Reject Booking
                  </Button>
                  <Button variant="success" className="rounded-pill px-5 fw-bold shadow-sm">
                    Confirm & Accept
                  </Button>
                </>
              )}
            </Card.Footer>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
};

export default HostBookingDetailsPage;
