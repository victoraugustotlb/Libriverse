import React, { useState } from 'react';

const ForgotPassword = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here you would normally stick a fetch call to your backend
        // For now, we'll simulate a success
        setIsSubmitted(true);
    };

    return (
        <div className="auth-page">
            <div className="login-card">
                <div className="auth-header">
                    <h1 className="auth-title">Recuperar Senha</h1>
                    <p className="auth-subtitle">Informe seu e-mail para receber o link de recuperação</p>
                </div>

                {!isSubmitted ? (
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

                        <button type="submit" className="auth-button">
                            Enviar Link
                        </button>
                    </form>
                ) : (
                    <div className="auth-success-message">
                        <p>Se houver uma conta associada a <strong>{email}</strong>, você receberá um e-mail com instruções para redefinição de senha.</p>
                        <button className="auth-button" onClick={() => onNavigate('login')}>
                            Voltar para o Login
                        </button>
                    </div>
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
