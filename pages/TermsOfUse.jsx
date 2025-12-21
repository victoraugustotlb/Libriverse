import React from 'react';

const TermsOfUse = ({ onNavigate }) => {
    return (
        <div className="auth-page">
            <div className="login-card" style={{ maxWidth: '800px', width: '95%' }}>
                <div className="auth-header">
                    <h1 className="auth-title">Termos de Uso</h1>
                    <p className="auth-subtitle">Última atualização: Dezembro 2025</p>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto', textAlign: 'left', padding: '0 20px 20px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
                    <h3>1. Aceitação dos Termos</h3>
                    <p>Ao acessar e usar a Libriverse, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.</p>

                    <h3>2. Uso da Plataforma</h3>
                    <p>A Libriverse é uma plataforma para catalogação e gerenciamento de bibliotecas pessoais. O uso indevido, tentativas de engenharia reversa ou atividades ilegais são estritamente proibidos.</p>

                    <h3>3. Contas de Usuário</h3>
                    <p>Você é responsável por manter a confidencialidade de suas credenciais de conta e por todas as atividades que ocorrem sob sua conta.</p>

                    <h3>4. Propriedade Intelectual</h3>
                    <p>Todo o conteúdo, design e código desta plataforma são propriedade da Libriverse ou de seus licenciadores.</p>

                    <h3>5. Alterações nos Termos</h3>
                    <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso continuado da plataforma após tais alterações constitui aceitação dos novos termos.</p>
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

export default TermsOfUse;
