
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
    }, [activeTab]);

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
                    Tickets de Erro
                </button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                    Gerenciar Usuários
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
                        <div className="library-toolbar" style={{ marginBottom: '20px' }}>
                            <div className="search-input-wrapper" style={{ flex: 1, maxWidth: '600px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar livro global (título, autor, ISBN)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input-field"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
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
                        <div className="modal-header">
                            <h2>Editar Livro Global</h2>
                            <button onClick={() => setEditingBook(null)} className="btn-close">×</button>
                        </div>
                        <form onSubmit={handleSaveGlobalBook} className="edit-form-grid">
                            <div className="form-group span-2">
                                <label>Título</label>
                                <input
                                    value={editingBook.title || ''}
                                    onChange={e => setEditingBook({ ...editingBook, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group span-2">
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
                                <label>Tags (separadas por vírgula)</label>
                                <input
                                    value={editingBook.tags || ''}
                                    onChange={e => setEditingBook({ ...editingBook, tags: e.target.value })}
                                />
                            </div>
                            <div className="form-group span-2">
                                <label>Sinopse</label>
                                <textarea
                                    value={editingBook.synopsis || ''}
                                    onChange={e => setEditingBook({ ...editingBook, synopsis: e.target.value })}
                                    rows={6}
                                />
                            </div>
                            <div className="modal-actions span-2">
                                <button type="button" onClick={() => setEditingBook(null)} className="btn-cancel">Cancelar</button>
                                <button type="submit" className="btn-save">Salvar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                /* Main Container - Wider */
                .admin-dashboard { padding: 40px; width: 100%; max-width: 1400px; margin: 0 auto; color: var(--text-color); }
                
                /* Tabs */
                .admin-tabs { display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); }
                .admin-tabs button {
                    background: none; border: none; padding: 10px 20px; cursor: pointer;
                    font-size: 1.1rem; color: var(--text-muted); border-bottom: 3px solid transparent;
                }
                .admin-tabs button.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
                
                /* Tables (Tickets/Users) */
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border-color); }
                th { background: rgba(0,0,0,0.1); }
                
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; text-transform: uppercase; }
                .badge.open { background: #e74c3c; color: white; }
                .badge.closed { background: #2ecc71; color: white; }
                
                .btn-resolve, .btn-save { background: #2ecc71; border: none; padding: 8px 16px; color: white; border-radius: 6px; cursor: pointer; font-weight: 500; }
                .btn-role { border: none; padding: 5px 10px; color: white; border-radius: 4px; cursor: pointer; }
                .btn-role.promote { background: #3498db; }
                .btn-role.demote { background: #e67e22; }
                .btn-cancel { background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 8px 16px; color: var(--text-color); border-radius: 6px; cursor: pointer; margin-right: 10px; }
                .btn-close { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }

                /* Grid Layout - Matching Library */
                .books-grid-layout { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                    gap: 20px; 
                    padding-bottom: 60px;
                }
                .book-card-list-mode {
                    background: var(--color-card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 20px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-sm);
                }
                .book-card-list-mode:hover { 
                    transform: translateY(-5px); 
                    border-color: var(--primary-color);
                    box-shadow: var(--shadow-lg); 
                }
                .book-cover-wrapper { 
                    width: 100%; 
                    aspect-ratio: 2/3; 
                    background: var(--bg-secondary); 
                    border-radius: 8px; 
                    overflow: hidden; 
                    margin-bottom: 15px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                .book-cover-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                .no-cover { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.8rem; }
                
                .book-info h3 { 
                    font-size: 1.1rem; 
                    margin: 0 0 5px 0; 
                    color: var(--text-primary); 
                    font-weight: 700; 
                    line-height: 1.2;
                }
                .book-info p { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }
                .edit-badge { 
                    margin-top: auto; 
                    padding-top: 15px; 
                    font-size: 0.85rem; 
                    color: var(--primary-color); 
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                /* Expanded Modal */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px); }
                .modal-content { 
                    background: var(--bg-color); 
                    padding: 30px; 
                    border-radius: 16px; 
                    width: 800px; 
                    max-width: 95%; 
                    color: var(--text-color);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    border: 1px solid var(--border-color);
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .modal-header h2 { margin: 0; font-size: 1.5rem; }
                
                .edit-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .span-2 { grid-column: span 2; }

                .form-group { margin-bottom: 0; }
                .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); }
                .form-group input, .form-group textarea { 
                    width: 100%; 
                    padding: 12px; 
                    border-radius: 8px; 
                    border: 1px solid var(--border-color); 
                    background: var(--input-bg); 
                    color: var(--text-color); 
                    font-size: 1rem;
                }
                .form-group input:focus, .form-group textarea:focus { border-color: var(--primary-color); outline: none; }
                .modal-actions { text-align: right; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 20px; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
