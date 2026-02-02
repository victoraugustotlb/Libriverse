
import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('tickets');
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Fetch current user details to know if master
        const storedUser = localStorage.getItem('libriverse_user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('libriverse_token');
            const endpoint = activeTab === 'tickets'
                ? '/api/admin?action=reports'
                : '/api/admin?action=users';

            const res = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 403) throw new Error('Acesso negado.');
                throw new Error('Falha ao carregar dados.');
            }

            const data = await res.json();
            if (activeTab === 'tickets') setReports(data);
            else setUsers(data);

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
            fetchData(); // Refresh
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

    if (loading && !reports.length && !users.length) return <div className="admin-container">Carregando...</div>;
    if (error) return <div className="admin-container error">{error}</div>;

    return (
        <div className="admin-dashboard fade-in">
            <h1>Painel Administrativo 🛡️</h1>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'tickets' ? 'active' : ''}
                    onClick={() => setActiveTab('tickets')}
                >
                    Tickets de Erro
                </button>
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Gerenciar Usuários
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
                                        <th>Data</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(repo => (
                                        <tr key={repo.id} className={`status-${repo.status}`}>
                                            <td>#{repo.id}</td>
                                            <td>{repo.user_name} <br /><small>{repo.user_email}</small></td>
                                            <td>{repo.issue_type}</td>
                                            <td>{repo.description}</td>
                                            <td>
                                                <span className={`badge ${repo.status}`}>{repo.status}</span>
                                            </td>
                                            <td>{new Date(repo.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {repo.status === 'open' && (
                                                    <button onClick={() => handleResolveReport(repo.id, 'closed')} className="btn-resolve">
                                                        Resolver
                                                    </button>
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
                                    <th>Admin?</th>
                                    <th>Master?</th>
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
                                            {/* Only Master can promote/demote (except themselves) */}
                                            {!u.is_master && (
                                                <button
                                                    className={`btn-role ${u.is_admin ? 'demote' : 'promote'}`}
                                                    onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                                                >
                                                    {u.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

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
                
                .btn-resolve { background: #2ecc71; border: none; padding: 5px 10px; color: white; border-radius: 4px; cursor: pointer; }
                .btn-role { border: none; padding: 5px 10px; color: white; border-radius: 4px; cursor: pointer; }
                .btn-role.promote { background: #3498db; }
                .btn-role.demote { background: #e67e22; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
