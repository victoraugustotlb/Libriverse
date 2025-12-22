import React, { useState, useEffect } from 'react';

const AccountSettings = ({ user, onUpdateUser, onNavigate }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Pseudo-routing integration: Update browser URL
        const originalTitle = document.title;
        document.title = "Settings - Libriverse";
        window.history.pushState(null, "", "/account/settings");

        return () => {
            document.title = originalTitle;
            // Optionally revert URL or handle it globally in App.jsx
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        if (newPassword && newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    newPassword: newPassword || undefined,
                    confirmPassword: confirmPassword || undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Perfil atualizado com sucesso!');
                onUpdateUser(data.user); // Update global user state
                setNewPassword('');
                setConfirmPassword('');
                // Update local storage
                localStorage.setItem('libriverse_user', JSON.stringify(data.user));
            } else {
                setError(data.error || 'Erro ao atualizar perfil.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Erro de conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async (password) => {
        if (!confirm("Tem certeza absoluta? Essa ação não pode ser desfeita.")) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Conta excluída com sucesso.');
                onNavigate('logout');
            } else {
                alert(data.error || 'Erro ao excluir conta.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Erro de conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="login-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <h1 className="auth-title">Configurações da Conta</h1>
                    <p className="auth-subtitle">Gerencie suas informações pessoais</p>
                </div>

                {message && <div style={{ color: '#4caf50', marginBottom: '1rem', textAlign: 'center', background: 'rgba(76, 175, 80, 0.1)', padding: '10px', borderRadius: '8px' }}>{message}</div>}
                {error && <div style={{ color: '#ff5252', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255, 82, 82, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail (Não editável)</label>
                        <input
                            type="email"
                            id="email"
                            className="auth-input"
                            value={email}
                            disabled
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Nome de Exibição</label>
                        <input
                            type="text"
                            id="name"
                            className="auth-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ margin: '2rem 0 1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <p style={{ color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem' }}>Alterar Senha (Opcional)</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">Nova Senha</label>
                        <input
                            type="password"
                            id="newPassword"
                            className="auth-input"
                            placeholder="Deixe em branco para manter a atual"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="auth-input"
                            placeholder="Confirme a nova senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 82, 82, 0.3)' }}>
                        <h3 style={{ color: '#ff5252', fontSize: '1rem', marginBottom: '0.5rem' }}>Zona de Perigo</h3>
                        <p style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '1rem' }}>
                            A exclusão da conta é permanente e não pode ser desfeita. Todos os seus livros serão apagados.
                        </p>
                        <button
                            type="button"
                            className="auth-button"
                            style={{ background: 'rgba(255, 82, 82, 0.1)', border: '1px solid #ff5252', color: '#ff5252' }}
                            onClick={() => {
                                const pwd = prompt("Para confirmar a exclusão, digite sua senha atual:");
                                if (pwd) handleDeleteAccount(pwd);
                            }}
                        >
                            Excluir Minha Conta
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                        <button type="button" className="auth-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => onNavigate('user-home')}>
                            Voltar
                        </button>
                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
