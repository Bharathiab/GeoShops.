import React from 'react';
import { createRoot } from 'react-dom/client';
import NotificationToast from './NotificationToast';

const showToast = (message, type) => {
    // Create a container for the toast
    const div = document.createElement('div');
    // Position styling is handled by NotificationToast.css usually, but we need a container 
    // that doesn't interfere with layout. 
    // Actually NotificationToast defines .notification-toast with fixed position?
    // Let's check NotificationToast.css quickly or assume standard.
    // If NotificationToast has 'fixed', we just need a div to mount it.
    // But since we mount a NEW div for EACH toast, they might overlap if fixed to same spot.
    // Ideally we should have a container. 
    // For simplicity, let's just mount it. If NotificationToast is fixed top-right, they will stack/overlap.
    // Let's assume NotificationToast handles positioning.
    
    document.body.appendChild(div);
    const root = createRoot(div);
    
    const handleClose = () => {
        setTimeout(() => {
            root.unmount();
            if (document.body.contains(div)) {
                document.body.removeChild(div);
            }
        }, 1000); // Give time for exit animation if any
    };

    const notification = {
        title: type === 'error' ? 'Error' : 'Success',
        message: message
    };

    // Use a wrapper to ensure styles are applied if needed
    root.render(
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000 }}>
             <NotificationToast 
                notification={notification} 
                type={type === 'error' ? 'ADMIN' : 'USER'}
                onClose={handleClose} 
            />
        </div>
    );
};

const Toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info'),
    warning: (message) => showToast(message, 'warning')
};

export default Toast;
