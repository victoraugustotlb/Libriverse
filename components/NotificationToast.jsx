import React, { useEffect, useState } from 'react';

const NotificationToast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
    };

    // Colors based on type
    const getColors = () => {
        switch (type) {
            case 'success':
                return { bg: 'rgba(20, 100, 40, 0.9)', border: '#2ecc71', icon: 'check-circle' };
            case 'error':
                return { bg: 'rgba(120, 20, 20, 0.9)', border: '#ff4444', icon: 'alert-circle' };
            default:
                return { bg: 'rgba(30, 30, 40, 0.9)', border: '#3498db', icon: 'info' };
        }
    };

    const colors = getColors();

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: colors.bg,
            borderLeft: `4px solid ${colors.border}`,
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'auto'
        }}>
            <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.4' }}>
                {message}
            </div>
            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

export default NotificationToast;
