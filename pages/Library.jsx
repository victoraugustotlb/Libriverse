import React, { useState } from 'react';
import BookDetailsModal from '../components/BookDetailsModal';
import lombadaImg from '../images/lombada-final.png';
import bookshelfImg from '../images/estante.png';

const Library = ({ onNavigate, onOpenAddModal, books = [], onDeleteBook, onUpdateBook }) => {
    const safeBooks = Array.isArray(books) ? books : [];
    const [selectedBook, setSelectedBook] = useState(null);
    const sizes = ["small", "medium", "large", "xlarge"];

    const [viewMode, setViewMode] = useState('shelves'); // 'shelves' or 'grid'

    // Group books into shelves of 15
    const shelves = [];
    for (let i = 0; i < safeBooks.length; i += 15) {
        shelves.push(safeBooks.slice(i, i + 15));
    }

    return (
        <div className="library-page">
            <section className="hero">
                <div className="container" style={{ position: 'relative' }}>
                    <h1 className="hero-title">Sua Biblioteca</h1>

                    {/* View Toggle */}
                    <div style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        background: 'rgba(0,0,0,0.6)', // Darker background for visibility
                        borderRadius: '8px',
                        padding: '4px',
                        zIndex: 100, // Ensure it's on top
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <button
                            onClick={() => setViewMode('shelves')}
                            style={{
                                background: viewMode === 'shelves' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: viewMode === 'shelves' ? 'bold' : 'normal'
                            }}
                        >
                            Estante
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                background: viewMode === 'grid' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: 'none',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: viewMode === 'grid' ? 'bold' : 'normal'
                            }}
                        >
                            Simplificado
                        </button>
                    </div>

                    {books.length === 0 ? (
                        <>
                            <p className="hero-subtitle">Não há nenhum livro em sua biblioteca</p>
                            <button
                                className="hero-cta"
                                onClick={() => onOpenAddModal()}
                            >
                                Adicionar agora
                            </button>
                        </>
                    ) : (
                        <p className="hero-subtitle">
                            Explore sua coleção pessoal de {books.length} {books.length === 1 ? 'livro' : 'livros'}
                        </p>
                    )}
                </div>
            </section>

            {books.length > 0 && (
                <section className="bookshelf-section">
                    {viewMode === 'shelves' ? (
                        <div className="container bookshelf-container">
                            {shelves.map((shelfBooks, shelfIndex) => (
                                <div
                                    key={shelfIndex}
                                    className="bookshelf-grid"
                                    style={{ "--shelf-bg": `url("${bookshelfImg}")` }}
                                >
                                    {shelfBooks.map((book) => {
                                        const deterministicIndex = book.id % 20;
                                        const size = sizes[deterministicIndex % sizes.length];

                                        return (
                                            <div
                                                key={book.id}
                                                className={`shelf-book ${size}`}
                                                style={{
                                                    "--spine-bg": `url("${lombadaImg}")`
                                                }}
                                                data-tooltip={`${book.title} - ${book.author}`}
                                                onClick={() => setSelectedBook(book)}
                                            >
                                                <div className="book-spine">
                                                    <div className="spine-placeholder">
                                                        <span className="spine-title">{book.title}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // SIMPLIFIED GRID VIEW
                        <div className="container" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '30px',
                            paddingBottom: '60px'
                        }}>
                            {safeBooks.map(book => {
                                const progress = book.pageCount ? Math.min(((book.currentPage || 0) / book.pageCount) * 100, 100) : 0;

                                return (
                                    <div
                                        key={book.id}
                                        onClick={() => setSelectedBook(book)}
                                        style={{
                                            background: '#fff',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            color: '#333' // Force dark text on white card
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {/* Cover */}
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '2/3',
                                            marginBottom: '15px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
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
                                                    background: '#eee',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#999',
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
                                            color: '#000'
                                        }}>{book.title}</h3>

                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#666',
                                            marginBottom: 'auto' // Push progress to bottom
                                        }}>{book.author}</p>

                                        {/* Progress */}
                                        <div style={{ marginTop: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px', color: '#666' }}>
                                                <span>Progresso</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                height: '6px',
                                                background: '#eee',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${progress}%`,
                                                    height: '100%',
                                                    background: '#0070f3',
                                                    borderRadius: '3px'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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

export default Library;


