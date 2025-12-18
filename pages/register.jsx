import React, { useState } from 'react';

const Register = ({ onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }
        alert(`Conta criada com sucesso para: ${email}`);
        onNavigate('login');
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
