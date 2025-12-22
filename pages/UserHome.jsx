import React, { useState } from 'react';
import BookDetailsModal from '../components/BookDetailsModal';

const UserHome = ({ user, books = [], onNavigate, onUpdateBook, onDeleteBook }) => {
    const [selectedBook, setSelectedBook] = useState(null);
    const readingBooks = books.filter(b => !b.isRead);

    return (
        <div className="user-home-page">
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Olá, {user.name}</h1>
                    <p className="hero-subtitle">
                        {readingBooks.length > 0
                            ? `Você está lendo ${readingBooks.length} ${readingBooks.length === 1 ? 'livro' : 'livros'} no momento.`
                            : 'Você não está lendo nenhum livro no momento.'}
                    </p>
                    <button
                        className="hero-cta"
                        onClick={() => onNavigate('library')}
                    >
                        Acessar Biblioteca
                    </button>
                </div>
            </section>

            {/* Carousel Section */}
            <section className="container" style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', margin: 0 }}>Destaques</h2>
                </div>

                <div className="carousel-container" style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    paddingBottom: '20px',
                    scrollSnapType: 'x mandatory'
                }}>
                    {readingBooks.slice(0, 5).map((book) => (
                        <div key={`carousel-${book.id}`} style={{ flex: '0 0 160px', scrollSnapAlign: 'start' }}>
                            <div
                                onClick={() => setSelectedBook(book)}
                                style={{
                                    width: '100%',
                                    aspectRatio: '2/3',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                                    transition: 'transform 0.2s',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                    padding: '10px',
                                    paddingTop: '30px'
                                }}>
                                    <div style={{
                                        height: '4px',
                                        background: 'rgba(255,255,255,0.3)',
                                        borderRadius: '2px',
                                        marginTop: '5px'
                                    }}>
                                        <div style={{
                                            width: `${book.pageCount ? Math.min(((book.currentPage || 0) / book.pageCount) * 100, 100) : 0}%`,
                                            height: '100%',
                                            background: 'var(--color-accent)',
                                            borderRadius: '2px'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</p>
                        </div>
                    ))}

                    {/* Modern Add Card */}
                    <div style={{ flex: '0 0 160px', scrollSnapAlign: 'start' }}>
                        <div
                            onClick={() => onNavigate('library')} // Or open add modal directly if prop passed
                            style={{
                                width: '100%',
                                aspectRatio: '2/3',
                                borderRadius: '12px',
                                border: '2px dashed rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: 'rgba(255, 255, 255, 0.02)',
                                color: 'rgba(255, 255, 255, 0.5)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                                e.currentTarget.style.color = 'var(--color-accent)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                            }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: '200' }}>+</div>
                        </div>
                        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#888', textAlign: 'center' }}>Adicionar Novo</p>
                    </div>
                </div>
            </section>

            {/* Existing Grid Section (Pushed Down) */}
            {readingBooks.length > 0 && (
                <section className="container" style={{ paddingBottom: '60px' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '30px',
                        color: 'var(--color-text-primary)'
                    }}>Todos os Livros ({readingBooks.length})</h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '30px'
                    }}>
                        {readingBooks.map((book) => {
                            const progress = book.pageCount ? Math.min(((book.currentPage || 0) / book.pageCount) * 100, 100) : 0;

                            return (
                                <div
                                    key={book.id}
                                    onClick={() => setSelectedBook(book)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '15px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        aspectRatio: '2/3',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                        position: 'relative'
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
                                                background: 'linear-gradient(135deg, #444 0%, #222 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#aaa',
                                                padding: '10px',
                                                textAlign: 'center'
                                            }}>
                                                {book.title}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            marginBottom: '4px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: 'var(--color-text-primary)'
                                        }} title={book.title}>{book.title}</h3>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text-secondary)',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>{book.author}</p>
                                    </div>

                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', color: 'var(--color-text-secondary)' }}>
                                            <span>Progresso</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                background: 'var(--color-accent)',
                                                borderRadius: '3px',
                                                transition: 'width 0.5s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

export default UserHome;
