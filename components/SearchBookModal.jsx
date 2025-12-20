import React, { useState } from 'react';

const SearchBookModal = ({ isOpen, onClose, onSelectBook }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('libriverse_token');
            console.log('Sending search request for:', query);

            const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Search response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || await response.text();
                console.error('Search failed:', errorMessage);
                alert(`Erro na pesquisa: ${errorMessage}`);
                setResults([]);
                return;
            }

            const data = await response.json();
            console.log('Search results:', data);
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (book) => {
        // Pass the book to parent to fill the Add form
        onSelectBook({
            title: book.title,
            author: book.author,
            publisher: book.publisher || '',
            coverUrl: book.coverUrl || book.cover_url || ''
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
                            placeholder="Digite o título ou autor..."
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
