import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Login realizado com sucesso para: ${email}`);
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
                    </div>

                    <button type="submit" className="auth-button">
                        Entrar
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Não tem uma conta? <a href="#" className="auth-link">Crie uma agora</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
