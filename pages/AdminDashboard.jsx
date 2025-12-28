import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ onNavigate, onLogout }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingBook, setEditingBook] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/admin/books', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setBooks(data);
            } else {
                console.error('Failed to fetch admin books');
                alert('Falha ao carregar livros. Verifique suas permissões.');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (book) => {
        setEditingBook(book);
    };

    const handleCloseModal = () => {
        setEditingBook(null);
    };

    const handleSaveBook = async (updatedBook) => {
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/admin/books', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedBook)
            });

            if (response.ok) {
                alert('Livro atualizado com sucesso!');
                fetchBooks(); // Refresh list
                setEditingBook(null);
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao atualizar livro');
            }
        } catch (error) {
            console.error('Error updating book:', error);
            alert('Erro de conexão');
        }
    };

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '50px' }}>Carregando painel admin...</div>;

    return (
        <div style={{ padding: '80px 20px 40px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Painel Administrativo</h1>
                <button onClick={() => onNavigate('home')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                    Voltar para Home
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Pesquisar livros..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '1rem'
                    }}
                />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Capa</th>
                            <th style={{ padding: '15px' }}>Título</th>
                            <th style={{ padding: '15px' }}>Autor</th>
                            <th style={{ padding: '15px' }}>Tipo</th>
                            <th style={{ padding: '15px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map(book => (
                            <tr key={`${book.type}-${book.id}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '15px' }}>{book.id}</td>
                                <td style={{ padding: '15px' }}>
                                    <img src={book.cover_url} alt="capa" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{book.title}</td>
                                <td style={{ padding: '15px', color: '#ccc' }}>{book.author}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        background: book.type === 'global' ? '#0071e3' : '#ff9f0a',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}>
                                        {book.type === 'global' ? 'Global' : 'Antigo'}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <button
                                        onClick={() => handleEdit(book)}
                                        style={{ background: '#333', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingBook && (
                <AdminBookModal book={editingBook} onClose={handleCloseModal} onSave={handleSaveBook} />
            )}
        </div>
    );
};

const AdminBookModal = ({ book, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        ...book,
        page_count: book.page_count || '',
        edition_date: book.edition_date || '',
        translator: book.translator || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: '#1a1a1a', padding: '30px', borderRadius: '16px', width: '500px', maxWidth: '90%',
                maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem' }}>Editar Livro</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Título</label>
                        <input name="title" value={formData.title} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Autor</label>
                        <input name="author" value={formData.author} onChange={handleChange} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>URL da Capa</label>
                        <input name="cover_url" value={formData.cover_url} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Páginas</label>
                            <input name="page_count" type="number" value={formData.page_count} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Idioma</label>
                            <input name="language" value={formData.language} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>
                    {book.type === 'global' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>ISBN</label>
                            <input name="isbn" value={formData.isbn || ''} onChange={handleChange} style={inputStyle} />
                        </div>
                    )}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ ...buttonStyle, background: 'transparent', border: '1px solid #444' }}>Cancelar</button>
                        <button type="submit" style={{ ...buttonStyle, background: '#0071e3', border: 'none' }}>Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#222', color: '#fff', outline: 'none'
};

const buttonStyle = {
    padding: '10px 20px', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '500'
};

export default AdminDashboard;
