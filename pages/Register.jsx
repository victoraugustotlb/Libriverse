import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const Register = ({ onNavigate }) => {
    const { showNotification } = useNotification();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showNotification('As senhas não coincidem!', 'error');
            return;
        }

        if (!acceptTerms || !acceptPrivacy) {
            showNotification('Você deve aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login after registration
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    localStorage.setItem('libriverse_token', loginData.token);
                    localStorage.setItem('libriverse_user', JSON.stringify(loginData.user));
                    onNavigate('user-home');
                    showNotification('Conta criada com sucesso!', 'success');
                } else {
                    showNotification('Conta criada! Por favor, faça login.', 'info');
                    onNavigate('login');
                }
            } else {
                showNotification(data.error || 'Erro ao criar conta', 'error');
            }
        } catch (error) {
            console.error('Registration fetch error:', error);
            showNotification('Erro de conexão com o servidor', 'error');
        }
    };

    return (
        <div className="auth-page">
            <div className="login-card">
                <div className="auth-header">
                    <h1 className="auth-title">Crie sua conta</h1>
                    <p className="auth-subtitle">Junte-se à Libriverse hoje mesmo</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nome Completo</label>
                        <input
                            type="text"
                            id="name"
                            className="auth-input"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            className="auth-input"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            className="auth-input"
                            placeholder="Sua senha segura"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="auth-input"
                            placeholder="Repita sua senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                        <input
                            type="checkbox"
                            id="acceptTerms"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            required
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                        />
                        <label htmlFor="acceptTerms" style={{ fontSize: '14px', lineHeight: '1.4', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                            Li e aceito os <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} style={{ fontWeight: '600', color: '#0071e3', textDecoration: 'none' }}>Termos de Uso</a> da Libriverse.
                        </label>
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="checkbox"
                            id="acceptPrivacy"
                            checked={acceptPrivacy}
                            onChange={(e) => setAcceptPrivacy(e.target.checked)}
                            required
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                        />
                        <label htmlFor="acceptPrivacy" style={{ fontSize: '14px', lineHeight: '1.4', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                            Concordo com a <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} style={{ fontWeight: '600', color: '#0071e3', textDecoration: 'none' }}>Política de Privacidade</a> e o processamento dos meus dados.
                        </label>
                    </div>

                    <button type="submit" className="auth-button">
                        Criar Conta
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Já tem uma conta? <a href="#" className="auth-link" onClick={() => onNavigate('login')}>Faça login</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
