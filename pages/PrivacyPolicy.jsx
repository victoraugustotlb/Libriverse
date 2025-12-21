import React from 'react';

const PrivacyPolicy = ({ onNavigate }) => {
    return (
        <div className="auth-page">
            <div className="login-card" style={{ maxWidth: '800px', width: '95%' }}>
                <div className="auth-header">
                    <h1 className="auth-title">Política de Privacidade</h1>
                    <p className="auth-subtitle">Sua privacidade é nossa prioridade</p>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto', textAlign: 'left', padding: '0 20px 20px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                    <h3>1. Coleta de Informações</h3>
                    <p>Coletamos informações que você nos fornece diretamente, como nome, endereço de e-mail e dados sobre os livros que você adiciona à sua biblioteca.</p>

                    <h3>2. Uso das Informações</h3>
                    <p>Usamos suas informações para fornecer, manter e melhorar nossos serviços, além de personalizar sua experiência na plataforma.</p>

                    <h3>3. Proteção de Dados</h3>
                    <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais contra acesso não autorizado ou alteração.</p>

                    <h3>4. Compartilhamento</h3>
                    <p>Não vendemos suas informações pessoais para terceiros. Compartilhamos dados apenas conforme necessário para operar o serviço ou conforme exigido por lei.</p>

                    <h3>5. Seus Direitos</h3>
                    <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento através das configurações da sua conta.</p>
                </div>

                <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', marginTop: '20px', textAlign: 'right' }}>
                    <button className="auth-button" onClick={() => onNavigate('register')} style={{ width: 'auto', padding: '10px 30px' }}>
                        Voltar para Cadastro
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
