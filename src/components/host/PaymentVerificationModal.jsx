import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Image, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { getBookingPayment, verifyBookingPayment, rejectBookingPayment, updateBookingStatus } from '../../api';
import Toast from '../../utils/toast';

const PaymentVerificationModal = ({ show, onHide, booking, onSuccess }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (show && booking) {
      loadPaymentDetails();
    }
  }, [show, booking]);

  if (!booking) return null; // Safety check - prevent crash if booking is cleared before modal is fully hidden

  const loadPaymentDetails = async () => {
    try {
      setLoading(true);
      const paymentData = await getBookingPayment(booking.id || booking.bookingId);
      setPayment(paymentData);
    } catch (error) {
      console.log('No payment details found, possibly cash payment or not yet paid');
      setPayment(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePaidByCash = async () => {
    setProcessing(true);
    try {
      // Assuming 'Confirmed' status implies paid for cash transactions, or we just want to confirm it.
      // If we need a specific 'mark as paid', we might need a new API, but updating status is usually enough for MVP.
      // The user asked for "Paid by Cash" button.
      const bookingId = booking.id || booking.bookingId;
      await updateBookingStatus(booking.department, bookingId, 'Confirmed');

      Toast.success('Booking marked as Paid by Cash (Confirmed)');
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Error marking as paid by cash:', error);
      Toast.error('Failed to update booking status');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!payment) return;

    setProcessing(true);
    try {
      const hostData = JSON.parse(localStorage.getItem('hostLoginData') || '{}');

      await verifyBookingPayment(booking.id || booking.bookingId, {
        hostId: hostData.hostId,
        notes: notes.trim() || 'Payment verified successfully'
      });

      Toast.success('Payment verified successfully!');
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Error verifying payment:', error);
      Toast.error(error.message || 'Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!payment) return;

    if (!rejectionReason.trim()) {
      Toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const hostData = JSON.parse(localStorage.getItem('hostLoginData') || '{}');

      await rejectBookingPayment(booking.id || booking.bookingId, {
        hostId: hostData.hostId,
        reason: rejectionReason.trim()
      });

      Toast.success('Payment rejected');
      onSuccess();
      onHide();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      Toast.error(error.message || 'Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Verify Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : payment ? (
          <>
            <Alert variant="info">
              <strong>Booking Details</strong>
              <Row className="mt-2">
                <Col md={6}>
                  <div><strong>Booking ID:</strong> #{booking.id || booking.bookingId}</div>
                  <div><strong>User:</strong> {booking.userName || 'N/A'}</div>
                  <div><strong>Property:</strong> {booking.propertyName || 'N/A'}</div>
                </Col>
                <Col md={6}>
                  <div><strong>Department:</strong> {booking.department || 'N/A'}</div>
                  <div><strong>Amount:</strong> ₹{payment.amount?.toLocaleString('en-IN')}</div>
                  <div><strong>Status:</strong> <span className="badge bg-warning">{payment.paymentStatus}</span></div>
                </Col>
              </Row>
            </Alert>

            {payment.paymentMethod === 'Cash' ? (
              <Alert variant="info" className="mb-3">
                <FaCheckCircle className="me-2" />
                <strong>Cash Payment</strong>
                <div className="mt-1">
                  Customer has selected to pay by Cash.
                </div>
              </Alert>
            ) : (
              <>
                <h6 className="mt-3">Payment Information</h6>
                <div className="mb-3">
                  <div><strong>Payment Method:</strong> {payment.paymentMethod || 'N/A'}</div>
                  <div><strong>Transaction ID:</strong> {payment.transactionId || 'N/A'}</div>
                  <div><strong>Submitted:</strong> {payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : 'N/A'}</div>
                </div>

                <h6>Payment Receipt</h6>
                {payment.receiptUrl ? (
                  <div className="text-center mb-3">
                    <Image
                      src={(() => {
                        const url = payment.receiptUrl;
                        if (url.startsWith('http')) return url;
                        const cleanUrl = url.replace(/\\/g, '/');
                        return `https://geoshops-production.up.railway.app${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
                      })()}
                      alt="Payment Receipt"
                      fluid
                      style={{ maxHeight: '400px', border: '1px solid #ddd', borderRadius: '8px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : (
                  <Alert variant="warning">No receipt uploaded</Alert>
                )}
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Add any notes about this payment verification..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rejection Reason (Required if rejecting)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Explain why you are rejecting this payment..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </Form.Group>
          </>
        ) : (
          <div className="text-center">
            <Alert variant="secondary">
              No online payment details found for this booking.
            </Alert>
            <p>If the customer is paying by cash, you can confirm the payment here.</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={processing}>
          Close
        </Button>
        {payment && payment.paymentStatus === 'Pending' && (
          <>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? 'Processing...' : 'Reject Payment'}
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Approve Payment'}
            </Button>
          </>
        )}

        {/* Paid by Cash Button - Show if no payment record OR if explicitly desired */}
        {!payment && booking && booking.status !== 'Confirmed' && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
          <Button
            variant="success"
            onClick={handlePaidByCash}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Paid by Cash'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentVerificationModal;
