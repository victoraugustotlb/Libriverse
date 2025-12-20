import React from 'react';

const AddBookMethodModal = ({ isOpen, onClose, onSelectManual, onSelectSearch }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card" onClick={(e) => e.stopPropagation()} style={{
                position: 'relative',
                width: '500px',
                textAlign: 'center',
                background: 'var(--color-bg-primary)',
                padding: '40px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)'
            }}>
                <button className="modal-close-btn" onClick={onClose} style={{ top: '15px', right: '15px' }}>&times;</button>

                <div className="auth-header" style={{ marginBottom: '30px' }}>
                    <h1 className="auth-title" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--color-text-primary)' }}>Adicionar Livro</h1>
                    <p className="auth-subtitle" style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Escolha como deseja adicionar o livro à sua biblioteca</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        className="auth-button"
                        onClick={() => { onClose(); onSelectManual(); }}
                        style={{
                            fontSize: '1.1rem',
                            padding: '16px',
                            background: 'var(--color-accent)',
                            color: 'white'
                        }}
                    >
                        📝 Adicionar Manualmente
                    </button>
                    <button
                        className="auth-button"
                        onClick={() => { onClose(); onSelectSearch(); }}
                        style={{
                            background: 'transparent',
                            color: 'var(--color-accent)',
                            border: '1px solid var(--color-accent)',
                            fontSize: '1.1rem',
                            padding: '16px',
                            marginTop: '0'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'rgba(0, 113, 227, 0.05)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'transparent';
                        }}
                    >
                        🔍 Pesquisar no Site
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBookMethodModal;
