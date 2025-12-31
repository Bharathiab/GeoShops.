import React from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { FaUser, FaCalendarAlt, FaClock, FaTag, FaInfoCircle, FaPhone, FaEnvelope, FaBuilding, FaUserTie, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { motion } from 'framer-motion';

const BookingDetailsModal = ({ show, onHide, booking }) => {
  if (!booking) return null;

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
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered contentClassName="border-0 rounded-4 shadow-lg overflow-hidden">
      <Modal.Header closeButton className="bg-dark text-white border-0 py-3 px-4">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <FaInfoCircle className="text-success" />
          Booking Details #{booking.id}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="bg-light p-0">
        <div className="p-4 bg-white border-bottom">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle bg-success text-white fw-bold" style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}>
                  {booking.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="mb-1 fw-bold text-dark">{booking.userName}</h4>
                  <Badge bg={getStatusColor(booking.status)} className="rounded-pill px-3">
                    {booking.status}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <div className="text-muted small mb-1">Total Amount</div>
              <h3 className="fw-bold text-success mb-0">₹{booking.finalPrice || booking.totalPrice || 0}</h3>
            </Col>
          </Row>
        </div>

        <div className="p-4">
          <Row className="g-4">
            {/* Customer Details */}
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small letter-spacing-1">Customer Information</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <FaUser className="text-success" />
                      <div>
                        <div className="small text-muted">Full Name</div>
                        <div className="fw-600">{booking.userName || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <FaPhone className="text-success" />
                      <div>
                        <div className="small text-muted">Phone Number</div>
                        <div className="fw-600">{booking.userPhone || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <FaEnvelope className="text-success" />
                      <div>
                        <div className="small text-muted">Email Address</div>
                        <div className="fw-600">{booking.userEmail || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Booking Specifics */}
            <Col md={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body>
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small letter-spacing-1">Booking Information</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <FaCalendarAlt className="text-success" />
                      <div>
                        <div className="small text-muted">Date & Time</div>
                        <div className="fw-600">{formatDate(booking.checkInDate || booking.appointmentDate)}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <FaBuilding className="text-success" />
                      <div>
                        <div className="small text-muted">Department & Property</div>
                        <div className="fw-600">{booking.department} - {booking.propertyName}</div>
                      </div>
                    </div>
                    {booking.specialistName && (
                      <div className="d-flex align-items-center gap-3">
                        <FaUserTie className="text-primary" />
                        <div>
                          <div className="small text-muted">Selected Specialist</div>
                          <div className="fw-600 text-primary">{booking.specialistName}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Service & Price */}
            <Col md={12}>
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body>
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small letter-spacing-1">Services & Payment</h6>
                  <Row>
                    <Col md={8}>
                      <div className="p-3 bg-light rounded-3 mb-3">
                        <div className="small text-muted mb-1">Service Description</div>
                        <div className="fw-600">{booking.serviceName || booking.description || 'Details not specified'}</div>
                      </div>
                      {booking.reason && (
                        <div className="p-3 bg-light rounded-3">
                          <div className="small text-muted mb-1">Reason / Notes</div>
                          <div>{booking.reason}</div>
                        </div>
                      )}
                    </Col>
                    <Col md={4}>
                      <div className="d-flex flex-column gap-2 mt-3 mt-md-0">
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Base Price:</span>
                          <span className="fw-600">₹{booking.totalPrice || 0}</span>
                        </div>
                        {booking.discountAmount > 0 && (
                          <div className="d-flex justify-content-between text-danger">
                            <span>Discount:</span>
                            <span className="fw-600">-₹{booking.discountAmount}</span>
                          </div>
                        )}
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">Paid Amount:</span>
                          <span className="fw-bold text-success fs-5">₹{booking.finalPrice || booking.totalPrice || 0}</span>
                        </div>
                        {booking.couponCode && (
                          <div className="mt-2 text-center">
                            <Badge bg="outline-success" className="text-success border border-success p-2 w-100">
                              <FaTag size={10} className="me-1" /> {booking.couponCode} Applied
                            </Badge>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="border-0 bg-white py-3 px-4">
        <Button variant="secondary" className="rounded-pill px-4 fw-bold" onClick={onHide}>
          Close
        </Button>
        {booking.status === 'Pending' && (
          <Button variant="success" className="rounded-pill px-4 fw-bold">
            Confirm Booking
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BookingDetailsModal;
