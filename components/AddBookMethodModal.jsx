import React from 'react';

const AddBookMethodModal = ({ isOpen, onClose, onSelectManual, onSelectSearch }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '400px', textAlign: 'center' }}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <div className="auth-header">
                    <h1 className="auth-title">Adicionar Livro</h1>
                    <p className="auth-subtitle">Escolha como você quer adicionar o livro</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    <button
                        className="auth-button"
                        onClick={() => { onClose(); onSelectManual(); }}
                    >
                        Adicionar Manualmente
                    </button>
                    <button
                        className="auth-button"
                        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--primary-color)' }}
                        onClick={() => { onClose(); onSelectSearch(); }}
                    >
                        Pesquisar no Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBookMethodModal;
