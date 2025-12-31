import React, { useEffect, useState } from 'react';
import { FaInfoCircle, FaCheck, FaTimes, FaBell } from 'react-icons/fa';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, type }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Wait for fade out
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification && !visible) return null;

    const isUser = type === 'USER';
    // If we can't determine type from prop, maybe check notification content or default? 
    // But passed prop is safest.

    return (
        <div className={`notification-toast ${visible ? 'show' : ''} ${isUser ? 'user-theme' : ''}`}>
            <div className="toast-icon">
                <FaBell />
            </div>
            <div className="toast-content">
                <h4 className="toast-title">{notification.title}</h4>
                <p className="toast-message">{notification.message}</p>
                <div className="toast-time">Just now</div>
            </div>
            <button className="toast-close" onClick={() => setVisible(false)}>
                <FaTimes />
            </button>
        </div>
    );
};

export default NotificationToast;
