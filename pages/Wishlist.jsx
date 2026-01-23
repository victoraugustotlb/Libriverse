import React, { useState, useMemo } from 'react';
import BookDetailsModal from '../components/BookDetailsModal';

const Wishlist = ({ books = [], onNavigate, onOpenAddModal, onDeleteBook, onUpdateBook }) => {
    const [selectedBook, setSelectedBook] = useState(null);

    // Filter only wishlist books
    const wishlistBooks = useMemo(() => {
        return books.filter(book => book.isWishlist);
    }, [books]);

    return (
        <div className="library-page">
            <section className="hero">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="hero-title" style={{ marginBottom: '20px' }}>Lista de Desejos</h1>
                    <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
                        Livros que você pretende ler ou adquirir no futuro.
                    </p>

                    {/* Empty State */}
                    {wishlistBooks.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '60px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✨</div>
                            <p className="hero-subtitle" style={{ color: '#fff', marginBottom: '30px' }}>
                                Sua lista de desejos está vazia.
                            </p>
                            <button
                                className="hero-cta"
                                onClick={onOpenAddModal}
                                style={{
                                    background: 'var(--color-accent)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px 30px',
                                    fontSize: '1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                }}
                            >
                                Adicionar à Lista de Desejos
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {wishlistBooks.length > 0 && (
                <section className="bookshelf-section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
                    <div className="container books-grid-layout">
                        {wishlistBooks.map(book => (
                            <div
                                key={book.id}
                                onClick={() => setSelectedBook(book)}
                                style={{
                                    background: 'var(--color-card-bg)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    boxShadow: 'var(--shadow-sm)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s',
                                    color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border)',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                }}
                            >
                                {/* Cover */}
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '2/3',
                                    marginBottom: '15px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                                    background: 'var(--color-bg-secondary)'
                                }}>
                                    {book.coverUrl ? (
                                        <img
                                            src={book.coverUrl}
                                            alt={book.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'var(--color-bg-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '0.8rem'
                                        }}>
                                            Sem Capa
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    marginBottom: '5px',
                                    lineHeight: '1.2',
                                    color: 'var(--color-text-primary)'
                                }}>{book.title}</h3>

                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: '10px'
                                }}>{book.author}</p>

                                <div style={{ marginTop: 'auto' }}>
                                    {/* Status Badge */}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                    }}>
                                        Na Lista de Desejos
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <BookDetailsModal
                book={selectedBook}
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
                onDelete={onDeleteBook}
                onUpdate={onUpdateBook}
            />
        </div>
    );
};

export default Wishlist;
