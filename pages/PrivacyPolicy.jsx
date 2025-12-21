import React from 'react';

const PrivacyPolicy = ({ onNavigate }) => {
    return (
        <div className="auth-page">
            <div className="login-card" style={{ maxWidth: '800px', width: '95%' }}>
                <div className="auth-header">
                    <h1 className="auth-title">Política de Privacidade</h1>
                    <p className="auth-subtitle">Conformidade LGPD e Termos de Uso</p>
                </div>

                <div style={{ maxHeight: '60vh', overflowY: 'auto', textAlign: 'left', padding: '0 20px 20px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '10px', marginBottom: '10px' }}>1. Natureza do Serviço</h3>
                    <p>O Libriverse é uma plataforma de catalogação de metadados bibliográficos. O site não fornece leitura, download ou venda de livros. É uma ferramenta de organização pessoal e colaborativa.</p>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>2. Propriedade Intelectual e Direitos Autorais</h3>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '5px' }}>O usuário reconhece que capas e sinopses pertencem aos autores/editoras e são usadas apenas para fins de identificação (uso justo).</li>
                        <li><strong>É proibido o upload de arquivos de livros ou links para pirataria.</strong></li>
                    </ul>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>3. Proteção de Dados (LGPD)</h3>
                    <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '5px' }}><strong>Coleta:</strong> Coletamos apenas e-mail e nome de usuário para fins de autenticação.</li>
                        <li style={{ marginBottom: '5px' }}><strong>Direitos:</strong> Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento.</li>
                        <li><strong>Responsabilidade:</strong> O usuário é responsável por manter a segurança de sua senha. O Libriverse compromete-se a não partilhar dados pessoais com terceiros para fins comerciais.</li>
                    </ul>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>4. Responsabilidade do Usuário</h3>
                    <p>Você é o único responsável pelas edições e metadados que inserir. Conteúdos ofensivos ou que violem direitos de terceiros serão removidos e a conta poderá ser banida.</p>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>5. Isenção de Responsabilidade</h3>
                    <p>Por ser um projeto pessoal e em desenvolvimento, o serviço é fornecido "como está". Não garantimos disponibilidade total do sistema ou a integridade permanente dos dados inseridos.</p>

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
