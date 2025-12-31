import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { Spinner } from 'react-bootstrap';

const StatusModal = ({ show, onHide, type, message, onConfirm }) => {
  const isSuccess = type === 'success';
  let isConfirm = type === 'confirm' || type === 'upgrade_limit';
  const isLoading = type === 'loading';

  let icon;
  let title;
  let confirmBtnText;
  let cancelBtnText;
  let confirmBtnVariant;

  if (isLoading) {
    icon = <Spinner animation="border" variant="success" style={{ width: '60px', height: '60px' }} />;
    title = 'Please Wait...';
    // No buttons for loading state
  } else if (isSuccess) {
    icon = <FaCheckCircle className="animate-pop-in" size={60} color="#28a745" />;
    title = 'Success!';
    confirmBtnText = 'Continue';
    confirmBtnVariant = 'success';
  } else if (isConfirm) {
    icon = <FaCheckCircle size={60} color="#ffc107" />; // Or a generic question mark
    title = 'Confirm Action';
    confirmBtnText = 'Yes, Proceed';
    cancelBtnText = 'No, Cancel';
    confirmBtnVariant = 'warning';
  } else if (type === 'upgrade_limit') {
    icon = <FaCheckCircle size={60} color="#ffc107" />; // Or maybe an upgrade icon if available, but check implies 'check permissions'? No, stick to warning/info. 
    // Actually, locking or up arrow is better but no new icons imported. 
    // Let's reuse FaCheckCircle or FaTimesCircle? 
    // Maybe just FaCheckCircle with gold color as "Premium"? 
    // Or better, let's use FaCheckCircle for now but maybe change icon later. 
    // Wait, I can't easily add new icons without checking imports. 
    // The previous edit to HostCreateProperty relies on this type.
    // Let's use FaCheckCircle with warning color (gold) for now.
    title = 'Upgrade Required';
    confirmBtnText = 'Upgrade Now';
    cancelBtnText = 'Maybe Later';
    confirmBtnVariant = 'primary'; // Or warning
    isConfirm = true; // Use confirm layout
  } else {
    icon = <FaTimesCircle className="animate-pop-in" size={60} color="#dc3545" />;
    title = 'Error!';
    confirmBtnText = 'Try Again Later';
    confirmBtnVariant = 'danger';
  }

  return (
    <Modal show={show} onHide={isLoading ? null : onHide} centered className="status-modal" backdrop={isLoading ? 'static' : true} keyboard={!isLoading}>
      <Modal.Body className="text-center p-5">
        <style>
          {`
            @keyframes PopIn {
              0% { transform: scale(0); opacity: 0; }
              80% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop-in {
              animation: PopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}
        </style>
        <div className="mb-4">
          {icon}
        </div>
        <h4 className="mb-3" style={{ color: isSuccess ? '#28a745' : isConfirm ? '#ffc107' : isLoading ? '#28a745' : '#dc3545' }}>
          {title}
        </h4>
        <p className="mb-4" style={{ fontSize: '1.1rem', color: '#555' }}>
          {message}
        </p>
        {!isLoading && (
          <div className="d-flex justify-content-center gap-3">
            {isConfirm && (
              <Button 
                variant="secondary" 
                onClick={onHide}
                style={{ minWidth: '120px' }}
              >
                {cancelBtnText}
              </Button>
            )}
            <Button 
              variant={confirmBtnVariant} 
              onClick={onConfirm || onHide}
              style={{ minWidth: '120px' }}
            >
              {confirmBtnText}
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default StatusModal;
