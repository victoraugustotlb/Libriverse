import React from 'react';

const BookDetailsModal = ({ book, isOpen, onClose, onDelete, onUpdate }) => {
    const [currentPage, setCurrentPage] = React.useState(0);
    const [isRead, setIsRead] = React.useState(false);

    const [imgError, setImgError] = React.useState(false);

    React.useEffect(() => {
        if (book) {
            setCurrentPage(book.currentPage || 0);
            setIsRead(book.isRead || false);
            setImgError(false); // Reset error state for new book
        }
    }, [book]);

    if (!isOpen || !book) return null;

    const totalPages = book.pageCount || 100; // Avoid div by zero visual
    const progress = Math.min((currentPage / totalPages) * 100, 100);

    const handleUpdateProgress = () => {
        const newPage = parseInt(currentPage, 10);

        if (isNaN(newPage)) {
            alert("Por favor, digite um número de página válido.");
            return;
        }

        if (onUpdate) {
            onUpdate(book.id, {
                currentPage: newPage,
                isRead: newPage >= (book.pageCount || 1) // Auto-mark read if complete
            });
        }
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este livro da sua biblioteca?')) {
            onDelete(book.id);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card book-details-card" onClick={(e) => e.stopPropagation()} style={{
                width: '900px',
                maxWidth: '95vw',
                padding: '0',
                display: 'flex',
                overflow: 'hidden',
                background: 'var(--color-bg-primary)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)'
            }}>
                <button className="modal-close-btn" onClick={onClose} style={{ zIndex: 10, right: '15px', top: '15px' }}>&times;</button>

                {/* Left Side: Cover */}
                <div style={{
                    width: '35%',
                    background: 'var(--color-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '30px',
                    borderRight: '1px solid var(--color-border)'
                }}>
                    {book.coverUrl && !imgError ? (
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            onError={() => setImgError(true)}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                borderRadius: '8px'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '160px',
                            height: '240px',
                            background: 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: '#666',
                            padding: '20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                        }}>
                            <span>{book.title}</span>
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div style={{
                    width: '65%',
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    maxHeight: '85vh',
                    overflowY: 'auto'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '2.5rem',
                            marginBottom: '8px',
                            color: 'var(--color-text-primary)',
                            lineHeight: '1.1',
                            letterSpacing: '-0.02em'
                        }}>{book.title}</h2>
                        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)' }}>
                            por <span style={{ color: 'var(--color-accent)', fontWeight: '500' }}>{book.author}</span>
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px',
                        background: 'var(--color-bg-secondary)',
                        padding: '20px',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Editora</p>
                            <p style={{ fontWeight: '500' }}>{book.publisher || '-'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Idioma</p>
                            <p style={{ fontWeight: '500' }}>{book.language || '-'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>ISBN</p>
                            <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{book.isbn || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Páginas</p>
                            <p style={{ fontWeight: '500' }}>{book.pageCount || '-'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Status</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    background: isRead ? 'var(--color-accent)' : '#e0e0e0',
                                    color: isRead ? 'white' : '#555',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {isRead ? 'Lido' : 'Lendo'}
                                </span>
                                {!isRead && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const totalPages = book.pageCount || 1;
                                            setCurrentPage(totalPages);
                                            setIsRead(true);
                                            if (onUpdate) {
                                                onUpdate(book.id, {
                                                    currentPage: totalPages,
                                                    isRead: true
                                                });
                                            }
                                        }}
                                        title="Marcar como Lido"
                                        style={{
                                            background: 'none',
                                            border: '1px solid var(--color-accent)',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: 'var(--color-accent)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--color-accent)';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'none';
                                            e.currentTarget.style.color = 'var(--color-accent)';
                                        }}
                                    >
                                        <span style={{ fontSize: '14px', lineHeight: 1 }}>✓</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reading Progress */}
                    {book.pageCount > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>Progresso de Leitura</p>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{Math.round(progress)}%</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-tertiary)', padding: '5px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                    <input
                                        type="number"
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(e.target.value)}
                                        style={{
                                            width: '60px',
                                            padding: '5px',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '1rem',
                                            color: 'var(--color-text-primary)'
                                        }}
                                    />
                                    <span style={{ color: 'var(--color-text-secondary)', marginRight: '8px', fontSize: '0.9rem' }}>/ {book.pageCount}</span>
                                </div>
                                <button
                                    onClick={handleUpdateProgress}
                                    style={{
                                        padding: '8px 20px',
                                        background: 'var(--color-accent)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '0.9rem',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Atualizar
                                </button>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'var(--color-bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}% `, height: '100%', background: 'linear-gradient(to right, var(--color-accent), #5ac8fa)', transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', borderRadius: '5px' }}></div>
                            </div>
                        </div>
                    )}

                    {/* Logs Details */}
                    {(book.purchaseDate || book.loanedTo) && (
                        <div style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-text-secondary)',
                            background: 'var(--color-bg-tertiary)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)'
                        }}>
                            {book.purchaseDate && <p style={{ marginBottom: '4px' }}>🛒 Comprado em <strong>{new Date(book.purchaseDate).toLocaleDateString()}</strong> por <strong>R$ {book.purchasePrice}</strong></p>}
                            {book.loanedTo && <p>🤝 Emprestado para <strong>{book.loanedTo}</strong> em {new Date(book.loanDate).toLocaleDateString()}</p>}
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <button className="delete-button" onClick={handleDelete} style={{ width: '100%' }}>
                            Excluir da Biblioteca
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
