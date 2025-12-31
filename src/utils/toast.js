// Toast Notification Utility
// Replace all alert() calls with beautiful toast messages

class Toast {
    static show(message, type = 'info', duration = 3000) {
        // Remove any existing toasts
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `custom-toast custom-toast-${type}`;

        // Icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

        // Add to body
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static success(message, duration) {
        this.show(message, 'success', duration);
    }

    static error(message, duration) {
        this.show(message, 'error', duration);
    }

    static warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    static info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Export for use in other files
export default Toast;

// Also make it globally available
if (typeof window !== 'undefined') {
    window.Toast = Toast;
}
