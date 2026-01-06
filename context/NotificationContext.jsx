import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from '../components/NotificationToast';
import ConfirmationModal from '../components/ConfirmationModal';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null); // { message, type: 'success' | 'error' | 'info' }
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        message: '',
        title: '',
        onConfirm: null,
        onCancel: null
    });

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    }, []);

    const showConfirm = useCallback((message, title = 'Confirmação') => {
        return new Promise((resolve) => {
            setConfirmModal({
                isOpen: true,
                message,
                title,
                onConfirm: () => {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    resolve(false);
                }
            });
        });
    }, []);

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirm }}>
            {children}
            {notification && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}
            {confirmModal.isOpen && (
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={confirmModal.onCancel}
                />
            )}
        </NotificationContext.Provider>
    );
};
