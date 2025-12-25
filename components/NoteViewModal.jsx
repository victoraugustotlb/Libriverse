import React from 'react';

const NoteViewModal = ({ note, isOpen, onClose }) => {
    if (!isOpen || !note) return null;

    const toRoman = (num) => {
        if (!num || isNaN(num)) return num;
        const n = parseInt(num);
        if (n <= 0) return num;
        const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = '';
        let i = n;
        for (let key in lookup) {
            while (i >= lookup[key]) {
                roman += key;
                i -= lookup[key];
            }
        }
        return roman;
    };

    const title = note.isGeneral
        ? 'Nota Geral'
        : `Capítulo ${toRoman(note.chapter)}${note.page ? ` - Pág. ${note.page}` : ''}`;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div
                className="note-view-modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--color-bg-primary, #fff)',
                    width: '600px',
                    maxWidth: '90vw',
                    maxHeight: '85vh',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
                    animation: 'fadeIn 0.2s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--color-border, #eee)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            margin: 0,
                            color: 'var(--color-text-primary, #333)'
                        }}>
                            {title}
                        </h2>
                        {note.bookTitle && (
                            <p style={{
                                margin: '4px 0 0 0',
                                color: 'var(--color-text-secondary, #666)',
                                fontSize: '0.9rem'
                            }}>
                                {note.bookTitle}
                            </p>
                        )}
                        <span style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-tertiary, #999)',
                            background: 'var(--color-bg-tertiary, #f5f5f5)',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}>
                            {note.date}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary, #666)',
                            padding: '0 8px',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '30px',
                    overflowY: 'auto',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    color: 'var(--color-text-primary, #333)',
                    whiteSpace: 'pre-line'
                }}>
                    {note.content}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--color-border, #eee)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'var(--color-bg-secondary, #f9f9f9)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 24px',
                            background: 'var(--color-accent, #0070f3)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '0.95rem'
                        }}
                    >
                        Fechar
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default NoteViewModal;
