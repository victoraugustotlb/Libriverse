import React, { useState, useEffect } from 'react';

const RatingPopup = ({ isOpen, onClose, onSave, bookTitle }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setRating(0);
            setReview('');
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    const handleSave = () => {
        onSave(rating, review);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease'
        }}>
            <div style={{
                background: 'var(--color-bg-primary)',
                padding: '40px',
                borderRadius: 'var(--radius-xl)',
                width: '500px',
                maxWidth: '90vw',
                textAlign: 'center',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
                transform: isOpen ? 'scale(1)' : 'scale(0.8)',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Bouncy scale
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-primary)', marginBottom: '10px' }}>Parabéns!</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>
                    Você finalizou <strong>{bookTitle}</strong>. O que achou?
                </p>

                {/* Stars */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '2.5rem',
                                color: star <= rating ? '#FFD700' : 'var(--color-border)', // Gold or Gray
                                transition: 'transform 0.2s',
                                padding: 0,
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    placeholder="Deixe uma anotação final ou resumo (opcional)..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        minHeight: '100px',
                        marginBottom: '30px',
                        resize: 'none',
                        fontFamily: 'inherit'
                    }}
                />

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                            fontWeight: '600'
                        }}
                    >
                        Pular
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={rating === 0}
                        style={{
                            padding: '12px 32px',
                            background: rating === 0 ? 'var(--color-bg-tertiary)' : 'var(--color-accent)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: rating === 0 ? 'not-allowed' : 'pointer',
                            color: rating === 0 ? 'var(--color-text-secondary)' : '#fff',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                        }}
                    >
                        Salvar Avaliação
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingPopup;
