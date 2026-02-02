
import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('tickets');
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [globalBooks, setGlobalBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');

    // Editing
    const [editingBook, setEditingBook] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]); // Fetch when tab changes

    // Debounced search for global books
    useEffect(() => {
        if (activeTab === 'global-books') {
            const timer = setTimeout(() => {
                fetchData();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, selectedAuthor]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('libriverse_token');
            let endpoint = '';

            if (activeTab === 'tickets') endpoint = '/api/admin?action=reports';
            else if (activeTab === 'users') endpoint = '/api/admin?action=users';
            else if (activeTab === 'global-books') {
                endpoint = `/api/admin?action=global-books&q=${encodeURIComponent(searchTerm)}&author=${encodeURIComponent(selectedAuthor)}`;
            }

            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 403) throw new Error('Acesso negado.');
                throw new Error('Falha ao carregar dados.');
            }

            const data = await res.json();
            if (activeTab === 'tickets') setReports(data);
            else if (activeTab === 'users') setUsers(data);
            else if (activeTab === 'global-books') setGlobalBooks(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveReport = async (reportId, newStatus) => {
        try {
            const token = localStorage.getItem('libriverse_token');
            await fetch('/api/admin?action=resolve-report', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reportId, status: newStatus })
            });
            fetchData();
        } catch (err) {
            alert('Erro ao atualizar ticket');
        }
    };

    const handleToggleAdmin = async (targetUserId, currentStatus) => {
        if (!confirm(`Tem certeza que deseja ${currentStatus ? 'remover' : 'adicionar'} privilégios de Admin?`)) return;

        try {
            const token = localStorage.getItem('libriverse_token');
            const res = await fetch('/api/admin?action=toggle-admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUserId, isAdmin: !currentStatus })
            });

            if (!res.ok) throw new Error('Falha ao atualizar role');
            fetchData();
        } catch (err) {
            alert('Erro ao atualizar usuário');
        }
    };

    const handleSaveGlobalBook = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('libriverse_token');
            const res = await fetch('/api/admin?action=edit-global-book', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingBook)
            });

            if (!res.ok) throw new Error('Falha ao atualizar livro');

            setEditingBook(null);
            fetchData(); // Refresh list
            alert('Livro atualizado com sucesso!');
        } catch (err) {
            alert('Erro ao salvar livro: ' + err.message);
        }
    };

    return (
        <div className="admin-dashboard fade-in">
            <h1>Painel Administrativo 🛡️</h1>

            <div className="admin-tabs">
                <button className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
                    Tickets
                </button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                    Usuários
                </button>
                <button className={activeTab === 'global-books' ? 'active' : ''} onClick={() => setActiveTab('global-books')}>
                    Livros Globais
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'tickets' && (
                    <div className="tickets-list">
                        {reports.length === 0 ? <p>Nenhum ticket encontrado.</p> : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuário</th>
                                        <th>Problema</th>
                                        <th>Descrição</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(repo => (
                                        <tr key={repo.id} className={`status-${repo.status}`}>
                                            <td>#{repo.id}</td>
                                            <td>{repo.user_name}</td>
                                            <td>{repo.issue_type}</td>
                                            <td>{repo.description}</td>
                                            <td><span className={`badge ${repo.status}`}>{repo.status}</span></td>
                                            <td>
                                                {repo.status === 'open' && (
                                                    <button onClick={() => handleResolveReport(repo.id, 'closed')} className="btn-resolve">Resolver</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-list">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Admin</th>
                                    <th>Master</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.is_admin ? '✅' : '❌'}</td>
                                        <td>{u.is_master ? '👑' : '-'}</td>
                                        <td>
                                            {!u.is_master && (
                                                <button className={`btn-role ${u.is_admin ? 'demote' : 'promote'}`} onClick={() => handleToggleAdmin(u.id, u.is_admin)}>
                                                    {u.is_admin ? 'Remover' : 'Promover'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'global-books' && (
                    <div className="global-books-view">
                        {/* Search Bar - Reusing styles */}
                        <div className="library-toolbar" style={{ marginBottom: '20px' }}>
                            <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '600px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar livro global..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input-field"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
                                />
                            </div>
                        </div>

                        {loading ? <p>Carregando livros...</p> : (
                            <div className="books-grid-layout">
                                {globalBooks.map(book => (
                                    <div key={book.id} className="book-card-list-mode" onClick={() => setEditingBook(book)}>
                                        <div className="book-cover-wrapper">
                                            {book.cover_url ? (
                                                <img src={book.cover_url} alt={book.title} />
                                            ) : (
                                                <div className="no-cover">Sem Capa</div>
                                            )}
                                        </div>
                                        <div className="book-info">
                                            <h3>{book.title}</h3>
                                            <p>{book.author}</p>
                                            <span className="edit-badge">✎ Editar</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingBook && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Editar Livro Global</h2>
                        <form onSubmit={handleSaveGlobalBook}>
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    value={editingBook.title || ''}
                                    onChange={e => setEditingBook({ ...editingBook, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Autor</label>
                                <input
                                    value={editingBook.author || ''}
                                    onChange={e => setEditingBook({ ...editingBook, author: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Capa URL</label>
                                <input
                                    value={editingBook.cover_url || ''}
                                    onChange={e => setEditingBook({ ...editingBook, cover_url: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Sinopse</label>
                                <textarea
                                    value={editingBook.synopsis || ''}
                                    onChange={e => setEditingBook({ ...editingBook, synopsis: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setEditingBook(null)} className="btn-cancel">Cancelar</button>
                                <button type="submit" className="btn-save">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-dashboard { padding: 40px; max-width: 1200px; margin: 0 auto; color: var(--text-color); }
                .admin-tabs { display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); }
                .admin-tabs button {
                    background: none; border: none; padding: 10px 20px; cursor: pointer;
                    font-size: 1.1rem; color: var(--text-muted); border-bottom: 3px solid transparent;
                }
                .admin-tabs button.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
                
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); }
                th { background: rgba(0,0,0,0.1); }
                
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
                .badge.open { background: #e74c3c; color: white; }
                .badge.closed { background: #2ecc71; color: white; }
                
                .btn-resolve, .btn-save { background: #2ecc71; border: none; padding: 5px 10px; color: white; border-radius: 4px; cursor: pointer; }
                .btn-role { border: none; padding: 5px 10px; color: white; border-radius: 4px; cursor: pointer; }
                .btn-role.promote { background: #3498db; }
                .btn-role.demote { background: #e67e22; }
                .btn-cancel { background: #95a5a6; border: none; padding: 5px 10px; color: white; border-radius: 4px; cursor: pointer; margin-right: 10px; }

                /* Grid Layout similar to Library List View */
                .books-grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
                .book-card-list-mode {
                    background: var(--color-card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .book-card-list-mode:hover { transform: translateY(-5px); border-color: var(--primary-color); }
                .book-cover-wrapper { width: 100%; aspect-ratio: 2/3; background: #eee; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
                .book-cover-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                .no-cover { display: flex; align-items: center; justifyContent: center; height: 100%; color: #888; }
                .book-info h3 { font-size: 1rem; margin: 0 0 5px 0; color: var(--text-color); }
                .book-info p { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
                .edit-badge { font-size: 0.8rem; color: var(--primary-color); margin-top: 10px; display: inline-block; }

                /* Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .modal-content { background: var(--bg-color); padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; color: var(--text-color); }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                .form-group input, .form-group textarea { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; background: var(--input-bg); color: var(--text-color); }
                .modal-actions { text-align: right; margin-top: 20px; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
