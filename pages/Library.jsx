import React, { useState, useMemo } from 'react';
import BookDetailsModal from '../components/BookDetailsModal';
import lombadaImg from '../images/lombada-final.png';
import bookshelfImg from '../images/estante.png';

const Library = ({ onNavigate, onOpenAddModal, books = [], onDeleteBook, onUpdateBook }) => {
    const safeBooks = Array.isArray(books) ? books : [];
    const [selectedBook, setSelectedBook] = useState(null);
    const sizes = ["small", "medium", "large", "xlarge"];

    const [viewMode, setViewMode] = useState('shelves'); // 'shelves' or 'grid'

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [sortOption, setSortOption] = useState('recent'); // recent, oldest, az, za

    // Derived Data
    const uniqueAuthors = useMemo(() => {
        return [...new Set(safeBooks.map(b => b.author))].sort();
    }, [safeBooks]);

    const filteredBooks = useMemo(() => {
        let result = safeBooks.filter(book => {
            const matchesSearch = (book.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesAuthor = selectedAuthor ? book.author === selectedAuthor : true;
            return matchesSearch && matchesAuthor;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortOption === 'recent') return (b.id || 0) - (a.id || 0); // Assuming higher ID = newer
            if (sortOption === 'oldest') return (a.id || 0) - (b.id || 0);
            if (sortOption === 'az') return (a.title || '').localeCompare(b.title || '');
            if (sortOption === 'za') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        return result;
    }, [safeBooks, searchTerm, selectedAuthor, sortOption]);

    // Group filtered books into shelves of 15
    const shelves = [];
    for (let i = 0; i < filteredBooks.length; i += 15) {
        shelves.push(filteredBooks.slice(i, i + 15));
    }

    return (
        <div className="library-page">
            <section className="hero">
                <div className="container" style={{ position: 'relative' }}>
                    <h1 className="hero-title">Sua Biblioteca</h1>

                    {/* View Toggle - Repositioned slightly to avoid overlap if needed, or kept absolute */}
                    <div style={{
                        position: 'absolute',
                        right: '0',
                        top: '0',
                        display: 'flex',
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: '8px',
                        padding: '4px',
                        zIndex: 100,
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
                            title="Visualizar Estante"
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
                            title="Visualizar Grade"
                        >
                            Lista
                        </button>
                    </div>

                    {/* Filters Toolbar */}
                    <div style={{
                        marginTop: '30px',
                        marginBottom: '20px',
                        display: 'flex',
                        gap: '15px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '15px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Buscar por título ou autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: '1 1 200px',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                outline: 'none'
                            }}
                        />

                        {/* Author Filter */}
                        <select
                            value={selectedAuthor}
                            onChange={(e) => setSelectedAuthor(e.target.value)}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="">Todos os Autores</option>
                            {uniqueAuthors.map(author => (
                                <option key={author} value={author}>{author}</option>
                            ))}
                        </select>

                        {/* Tags Filter (Placeholder) */}
                        <select
                            style={{
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                            disabled
                        >
                            <option value="">Tags (Em breve)</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="recent">Mais Recentes</option>
                            <option value="oldest">Mais Antigos</option>
                            <option value="az">A-Z</option>
                            <option value="za">Z-A</option>
                        </select>

                        {/* Reset Button (only shows if filters active) */}
                        {(searchTerm || selectedAuthor || sortOption !== 'recent') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedAuthor('');
                                    setSortOption('recent');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    color: 'white',
                                    padding: '10px 15px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Limpar
                            </button>
                        )}
                    </div>

                    {filteredBooks.length === 0 ? (
                        safeBooks.length === 0 ? (
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
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <p className="hero-subtitle" style={{ fontSize: '1.2rem' }}>
                                    Nenhum livro encontrado para sua busca.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedAuthor('');
                                    }}
                                    style={{
                                        marginTop: '15px',
                                        background: '#0070f3',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )
                    ) : (
                        <p className="hero-subtitle">
                            Exibindo {filteredBooks.length} de {safeBooks.length} livros
                        </p>
                    )}
                </div>
            </section>

            {filteredBooks.length > 0 && (
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
                            {filteredBooks.map(book => {
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


