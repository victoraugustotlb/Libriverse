import React from 'react';

const BookDetailsModal = ({ book, isOpen, onClose, onDelete, onUpdate }) => {
    const [currentPage, setCurrentPage] = React.useState(0);
    const [isRead, setIsRead] = React.useState(false);

    React.useEffect(() => {
        if (book) {
            setCurrentPage(book.currentPage || 0);
            setIsRead(book.isRead || false);
        }
    }, [book]);

    if (!isOpen || !book) return null;

    const totalPages = book.pageCount || 100; // Avoid div by zero visual
    const progress = Math.min((currentPage / totalPages) * 100, 100);

    const handleUpdateProgress = () => {
        if (onUpdate) {
            onUpdate(book.id, {
                currentPage: parseInt(currentPage),
                isRead: currentPage >= (book.pageCount || 1) // Auto-mark read if complete
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
            <div className="login-card book-details-card" onClick={(e) => e.stopPropagation()} style={{ width: '800px', maxWidth: '95vw', padding: '0', display: 'flex', overflow: 'hidden' }}>
                <button className="modal-close-btn" onClick={onClose} style={{ zIndex: 10 }}>&times;</button>

                {/* Left Side: Cover */}
                <div style={{ width: '35%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} style={{ maxWidth: '100%', maxHeight: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderRadius: '5px' }} />
                    ) : (
                        <div style={{ width: '150px', height: '220px', background: 'var(--spine-color, #2c3e50)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '10px', borderRadius: '5px' }}>
                            <span>{book.title}</span>
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div style={{ width: '65%', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{book.title}</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>por <span style={{ color: 'var(--primary-color)' }}>{book.author}</span></p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>Editora</p>
                            <p>{book.publisher || '-'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>Idioma</p>
                            <p>{book.language || '-'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>Páginas</p>
                            <p>{book.pageCount || '-'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#888' }}>Status</p>
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: isRead ? 'var(--primary-color)' : '#444',
                                fontSize: '0.8rem'
                            }}>
                                {isRead ? 'Lido' : 'Lendo'}
                            </span>
                        </div>
                    </div>

                    {/* Reading Progress */}
                    {book.pageCount > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
                            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Progresso de Leitura</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="number"
                                    value={currentPage}
                                    onChange={(e) => setCurrentPage(e.target.value)}
                                    style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                                />
                                <span>/ {book.pageCount} páginas</span>
                                <button
                                    onClick={handleUpdateProgress}
                                    style={{ marginLeft: 'auto', padding: '5px 15px', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                                >
                                    Salvar
                                </button>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#444', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, var(--primary-color), #a855f7)', transition: 'width 0.3s' }}></div>
                            </div>
                        </div>
                    )}

                    {/* Logs Details */}
                    {(book.purchaseDate || book.loanedTo) && (
                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                            {book.purchaseDate && <p>Comprado em {new Date(book.purchaseDate).toLocaleDateString()} por R$ {book.purchasePrice}</p>}
                            {book.loanedTo && <p>Emprestado para <strong>{book.loanedTo}</strong> em {new Date(book.loanDate).toLocaleDateString()}</p>}
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button className="delete-button" onClick={handleDelete} style={{ width: '100%', padding: '10px' }}>
                            <span className="icon">🗑️</span> Excluir da Biblioteca
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
