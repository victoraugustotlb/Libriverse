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
                    <p style={{ marginBottom: '20px' }}>
                        Seja bem-vindo ao Libriverse. Ao acessar ou utilizar nosso site, você concorda com os termos descritos abaixo. Este é um projeto de catalogação colaborativa e pessoal.
                    </p>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>1. Natureza do Serviço</h3>
                    <p>O Libriverse é uma ferramenta exclusivamente voltada para a organização e catalogação de metadados bibliográficos (títulos, autores, capas, gêneros e sinopses).</p>
                    <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#e63946' }}>
                        NÃO disponibilizamos arquivos: É terminantemente proibido o upload, download, venda ou compartilhamento de livros digitais (PDFs, EPUBs, etc.) ou links para pirataria.
                    </p>
                    <p style={{ marginTop: '10px' }}>
                        <strong>Finalidade:</strong> O site serve apenas para fins informativos e de gerenciamento de biblioteca pessoal.
                    </p>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>2. Conteúdo de Terceiros e Direitos Autorais</h3>
                    <p>O usuário declara estar ciente de que:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '5px' }}>Os direitos autorais das obras catalogadas (textos originais, capas e conteúdos editoriais) pertencem aos seus respectivos autores e editoras.</li>
                        <li style={{ marginBottom: '5px' }}>O uso de capas e sinopses no Libriverse tem finalidade de identificação e crítica, conforme os limites do Direito Autoral.</li>
                        <li>Se você for detentor de direitos autorais de alguma imagem e desejar sua remoção, entre em contato através de Victoraugustotlb@gmail.com.</li>
                    </ul>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>3. Responsabilidade do Usuário</h3>
                    <p>Ao editar informações no Libriverse, você se compromete a:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '5px' }}>Não inserir conteúdos ofensivos, ilegais ou que violem a privacidade de terceiros.</li>
                        <li style={{ marginBottom: '5px' }}>Não utilizar o site para promover atividades comerciais ou spam.</li>
                        <li>Assumir total responsabilidade por qualquer dado inserido sob seu login.</li>
                    </ul>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>4. Isenção de Garantias e Responsabilidade</h3>
                    <p>O Libriverse é fornecido "como está". Por ser um projeto em desenvolvimento:</p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '5px' }}>Não garantimos que o serviço será ininterrupto ou livre de erros.</li>
                        <li style={{ marginBottom: '5px' }}>Não nos responsabilizamos pela perda de dados ou informações cadastradas pelo usuário. Recomendamos que você mantenha seus próprios backups.</li>
                        <li>Não nos responsabilizamos pela veracidade das informações inseridas por outros usuários.</li>
                    </ul>

                    <h3 style={{ color: 'var(--color-text-primary)', marginTop: '20px', marginBottom: '10px' }}>5. Alterações e Encerramento</h3>
                    <p>Podemos modificar estes termos ou descontinuar o projeto a qualquer momento, sem aviso prévio. O uso continuado do site após alterações nos termos implica aceitação das novas regras.</p>
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
