import React, { useState } from 'react';

const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('libriverse_token', data.token);
                localStorage.setItem('libriverse_user', JSON.stringify(data.user));
                onNavigate('user-home');
            } else {
                alert(data.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Login fetch error:', error);
            alert('Erro de conexão com o servidor');
        }
    };

    return (
        <div className="auth-page">
            <div className="login-card">
                <div className="auth-header">
                    <h1 className="auth-title">Bem-vindo de volta</h1>
                    <p className="auth-subtitle">Entre na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit}>
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
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); onNavigate('forgot-password'); }}
                                className="auth-link"
                                style={{ fontSize: '0.9rem' }}
                            >
                                Esqueci minha senha
                            </a>
                        </div>
                    </div>

                    <button type="submit" className="auth-button">
                        Entrar
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Não tem uma conta? <a href="#" className="auth-link" onClick={() => onNavigate('register')}>Crie uma agora</a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;
