import React, { useState } from 'react';

const SearchBookModal = ({ isOpen, onClose, onSelectBook, initialQuery }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen && initialQuery) {
            setQuery(initialQuery);
            // Auto search after a brief timeout to ensure state update or immediate
            // We can reuse logic if we extract it, or just call fetch here.
            // For simplicity, let's just set it and let user click or we can extract `performSearch`.
            // Better UX: Auto search.
            performSearch(initialQuery);
        } else if (isOpen) {
            // Reset if opening empty
            if (!initialQuery) setQuery('');
            setResults([]);
        }
    }, [isOpen, initialQuery]);

    const performSearch = async (searchTerm) => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchTerm)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        performSearch(query);
    };

    const handleSelect = (book) => {
        // Pass the book to parent to fill the Add form
        onSelectBook({
            title: book.title,
            author: book.author,
            publisher: book.publisher || '',
            coverUrl: book.coverUrl || book.cover_url || '',
            isbn: book.isbn || ''
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card" onClick={(e) => e.stopPropagation()} style={{
                position: 'relative',
                width: '600px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)'
            }}>
                <button className="modal-close-btn" onClick={onClose} style={{ top: '15px', right: '15px' }}>&times;</button>

                <div className="auth-header">
                    <h1 className="auth-title">Pesquisar Livro</h1>
                    <p className="auth-subtitle">Encontre livros na base de dados do Libriverse</p>
                </div>

                <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Digite o título, autor ou ISBN..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Pesquisando...' : 'Pesquisar'}
                    </button>
                </form>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {results.length === 0 && !loading && query && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum livro encontrado.</p>
                    )}

                    {results.map((book, index) => (
                        <div key={index} className="pearl-card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '15px',
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{book.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{book.author}</p>
                            </div>
                            <button
                                className="auth-button"
                                style={{ width: 'auto', padding: '8px 20px', fontSize: '0.9rem', marginTop: 0 }}
                                onClick={() => handleSelect(book)}
                            >
                                Selecionar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchBookModal;
