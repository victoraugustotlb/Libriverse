import React, { useState } from 'react';

const ForgotPassword = ({ onNavigate }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: Code + New Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setStep(2);
                setMessage('Código enviado! Verifique seu e-mail.');
            } else {
                alert(data.error || 'Erro ao enviar código.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro de conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Senha redefinida com sucesso! Redirecionando para o login...');
                onNavigate('login');
            } else {
                alert(data.error || 'Erro ao redefinir senha.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro de conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="login-card">
                <div className="auth-header">
                    <h1 className="auth-title">Recuperar Senha</h1>
                    <p className="auth-subtitle">
                        {step === 1
                            ? 'Informe seu e-mail para receber o código'
                            : 'Digite o código recebido e sua nova senha'}
                    </p>
                </div>

                {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendCode}>
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

                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label htmlFor="code">Código de Verificação</label>
                            <input
                                type="text"
                                id="code"
                                className="auth-input"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nova Senha</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="auth-input"
                                placeholder="Nova senha segura"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="auth-input"
                                placeholder="Confirme a senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Lembrou sua senha? <a href="#" className="auth-link" onClick={() => onNavigate('login')}>Voltar</a>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ForgotPassword;
