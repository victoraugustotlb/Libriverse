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
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [sortOption, setSortOption] = useState('recent'); // recent, oldest, az, za

    // Derived Data
    const uniqueAuthors = useMemo(() => {
        return [...new Set(safeBooks.map(b => b.author))].sort();
    }, [safeBooks]);

    const uniqueYears = useMemo(() => {
        const years = new Set(safeBooks.map(b => {
            const date = new Date(b.createdAt);
            return isNaN(date.getTime()) ? null : date.getFullYear();
        }).filter(y => y !== null));
        return [...years].sort((a, b) => b - a); // Descending
    }, [safeBooks]);

    const months = [
        { value: '0', label: 'Janeiro' },
        { value: '1', label: 'Fevereiro' },
        { value: '2', label: 'Março' },
        { value: '3', label: 'Abril' },
        { value: '4', label: 'Maio' },
        { value: '5', label: 'Junho' },
        { value: '6', label: 'Julho' },
        { value: '7', label: 'Agosto' },
        { value: '8', label: 'Setembro' },
        { value: '9', label: 'Outubro' },
        { value: '10', label: 'Novembro' },
        { value: '11', label: 'Dezembro' },
    ];

    const filteredBooks = useMemo(() => {
        let result = safeBooks.filter(book => {
            const matchesSearch = (book.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesAuthor = selectedAuthor ? book.author === selectedAuthor : true;

            let matchesDate = true;
            if (book.createdAt) {
                const date = new Date(book.createdAt);
                if (!isNaN(date.getTime())) {
                    if (selectedYear && date.getFullYear().toString() !== selectedYear) matchesDate = false;
                    if (selectedMonth && date.getMonth().toString() !== selectedMonth) matchesDate = false;
                } else if (selectedYear || selectedMonth) {
                    matchesDate = false; // Filter is active but book has invalid date
                }
            } else if (selectedYear || selectedMonth) {
                matchesDate = false; // Filter active but book has no date
            }

            return matchesSearch && matchesAuthor && matchesDate;
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
    }, [safeBooks, searchTerm, selectedAuthor, selectedYear, selectedMonth, sortOption]);

    // Group filtered books into shelves of 15
    const shelves = [];
    for (let i = 0; i < filteredBooks.length; i += 15) {
        shelves.push(filteredBooks.slice(i, i + 15));
    }

    return (
        <div className="library-page">
            <section className="hero">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="hero-title" style={{ marginBottom: '40px' }}>Sua Biblioteca</h1>

                    {/* Unified Control Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: 'rgba(20, 20, 20, 0.8)', // Darker, more solid background for contrast
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px 24px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>

                        {/* Left Side: Search */}
                        <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por título ou autor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        paddingLeft: '40px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        background: 'rgba(255,255,255,0.08)',
                                        color: '#fff', // High contrast white
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.15)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                                        e.target.style.boxShadow = '0 0 15px rgba(255,255,255,0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.08)';
                                        e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18" height="18" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgba(255,255,255,0.8)', // Brighter icon
                                        pointerEvents: 'none'
                                    }}
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        </div>

                        {/* Middle: Filters & Sort */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {/* Author Filter */}
                            <select
                                value={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    minWidth: '150px'
                                }}
                            >
                                <option value="" style={{ background: '#222', color: '#fff' }}>Todos os Autores</option>
                                {uniqueAuthors.map(author => (
                                    <option key={author} value={author} style={{ background: '#222', color: '#fff' }}>{author}</option>
                                ))}
                            </select>

                            {/* Year Filter */}
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    minWidth: '100px'
                                }}
                            >
                                <option value="" style={{ background: '#222', color: '#fff' }}>Ano</option>
                                {uniqueYears.map(year => (
                                    <option key={year} value={year} style={{ background: '#222', color: '#fff' }}>{year}</option>
                                ))}
                            </select>

                            {/* Month Filter */}
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    minWidth: '120px'
                                }}
                            >
                                <option value="" style={{ background: '#222', color: '#fff' }}>Mês</option>
                                {months.map(m => (
                                    <option key={m.value} value={m.value} style={{ background: '#222', color: '#fff' }}>{m.label}</option>
                                ))}
                            </select>

                            {/* Tags Filter (Placeholder) */}
                            <select
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'not-allowed',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                                disabled
                            >
                                <option value="" style={{ background: '#222' }}>Tags</option>
                            </select>

                            {/* Sort */}
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            >
                                <option value="recent" style={{ background: '#222', color: '#fff' }}>Mais Recentes</option>
                                <option value="oldest" style={{ background: '#222', color: '#fff' }}>Mais Antigos</option>
                                <option value="az" style={{ background: '#222', color: '#fff' }}>A-Z</option>
                                <option value="za" style={{ background: '#222', color: '#fff' }}>Z-A</option>
                            </select>
                        </div>

                        {/* Right: View Toggle */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <button
                                onClick={() => setViewMode('shelves')}
                                style={{
                                    background: viewMode === 'shelves' ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    border: 'none',
                                    color: viewMode === 'shelves' ? '#fff' : 'rgba(255,255,255,0.6)',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: viewMode === 'shelves' ? '600' : '500',
                                    transition: 'all 0.2s',
                                    boxShadow: viewMode === 'shelves' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
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
                                    color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.6)',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: viewMode === 'grid' ? '600' : '500',
                                    transition: 'all 0.2s',
                                    boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                                }}
                                title="Visualizar Grade"
                            >
                                Lista
                            </button>
                        </div>
                    </div>

                    {/* Status/Info Text */}
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        {(searchTerm || selectedAuthor || selectedYear || selectedMonth || sortOption !== 'recent') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedAuthor('');
                                    setSelectedYear('');
                                    setSelectedMonth('');
                                    setSortOption('recent');
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff4444',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontWeight: '500'
                                }}
                            >
                                Limpar filtros
                            </button>
                        )}
                        <span style={{
                            color: '#666',
                            fontSize: '0.95rem',
                            letterSpacing: '0.5px',
                            fontWeight: '500'
                        }}>
                            Exibindo <span style={{ color: '#000', fontWeight: 'bold' }}>{filteredBooks.length}</span> de <span style={{ color: '#000' }}>{safeBooks.length}</span> livros
                        </span>
                    </div>

                    {/* Empty State within Filters */}
                    {filteredBooks.length === 0 && safeBooks.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '60px', paddingBottom: '40px' }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48" height="48" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                                style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '15px' }}
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
                                Nenhum livro encontrado.
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                                Tente ajustar seus filtros de busca ou autor.
                            </p>
                        </div>
                    )}

                    {/* Global Empty State (No books at all) */}
                    {safeBooks.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <p className="hero-subtitle" style={{ color: '#333' }}>Não há nenhum livro em sua biblioteca</p>
                            <button
                                className="hero-cta"
                                onClick={() => onOpenAddModal()}
                                style={{ marginTop: '20px' }}
                            >
                                Adicionar agora
                            </button>
                        </div>
                    )}
                </div>
            </section >

            {
                filteredBooks.length > 0 && (
                    <section className="bookshelf-section" style={{ paddingTop: '20px' }}>
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
                )
            }

            <BookDetailsModal
                book={selectedBook}
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
                onDelete={onDeleteBook}
                onUpdate={onUpdateBook}
            />
        </div >
    );
};

export default Library;


