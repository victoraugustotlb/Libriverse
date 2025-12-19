import React from 'react';

const BookDetailsModal = ({ book, isOpen, onClose, onDelete }) => {
    if (!isOpen || !book) return null;

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este livro da sua biblioteca?')) {
            onDelete(book.id);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card book-details-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <div className="book-details-content">
                    <div className="book-details-visual">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="details-cover" />
                        ) : (
                            <div
                                className="details-placeholder"
                                style={{ background: `var(--spine-color, #2c3e50)` }}
                            >
                                <span>{book.title}</span>
                            </div>
                        )}
                    </div>

                    <div className="book-details-info">
                        <h2 className="details-title">{book.title}</h2>
                        <p className="details-author">por {book.author}</p>
                        <div className="details-meta">
                            <p><strong>Editora:</strong> {book.publisher || 'Não informada'}</p>
                            <p><strong>Adicionado em:</strong> {new Date(book.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>

                        <div className="details-actions">
                            <button className="delete-button" onClick={handleDelete}>
                                <span className="icon">🗑️</span> Excluir da Biblioteca
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
