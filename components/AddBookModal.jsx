import React, { useState } from 'react';

const AddBookModal = ({ isOpen, onClose, onAddBook }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [currentPage, setCurrentPage] = useState('');
    const [language, setLanguage] = useState('');
    const [isRead, setIsRead] = useState(false);

    // Logs
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [loanedTo, setLoanedTo] = useState('');
    const [loanDate, setLoanDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddBook({
            title, author, publisher, coverUrl,
            pageCount: pageCount ? parseInt(pageCount) : null,
            currentPage: currentPage ? parseInt(currentPage) : 0,
            language,
            isRead,
            purchaseDate: purchaseDate || null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            loanedTo: loanedTo || null,
            loanDate: loanDate || null
        });

        // Reset form
        setTitle('');
        setAuthor('');
        setPublisher('');
        setCoverUrl('');
        setPageCount('');
        setCurrentPage('');
        setLanguage('');
        setIsRead(false);
        setPurchaseDate('');
        setPurchasePrice('');
        setLoanedTo('');
        setLoanDate('');

        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card" onClick={(e) => e.stopPropagation()} style={{
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                width: '1000px', // Wider modal ("gordinha")
                maxWidth: '95vw',
                padding: '50px',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)'
            }}>
                <button className="modal-close-btn" onClick={onClose} style={{ top: '20px', right: '20px', fontSize: '2rem' }}>&times;</button>

                <div className="auth-header" style={{ marginBottom: '40px' }}>
                    <h1 className="auth-title" style={{ fontSize: '2.5rem' }}>Adicionar Livro</h1>
                    <p className="auth-subtitle" style={{ fontSize: '1.1rem' }}>Preencha os detalhes do novo livro</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

                    {/* Left Column: Basic Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-bg-secondary)', paddingBottom: '10px' }}>
                            Informações Principais
                        </h3>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="title">Nome do Livro</label>
                            <input
                                type="text"
                                id="title"
                                className="auth-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Ex: O Pequeno Príncipe"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="author">Autor</label>
                            <input
                                type="text"
                                id="author"
                                className="auth-input"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                                placeholder="Ex: Antoine de Saint-Exupéry"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="publisher">Editora</label>
                            <input
                                type="text"
                                id="publisher"
                                className="auth-input"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                required
                                placeholder="Ex: Agir"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="coverUrl">Foto da Capa (URL)</label>
                            <input
                                type="url"
                                id="coverUrl"
                                className="auth-input"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Details & Logs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-bg-secondary)', paddingBottom: '10px' }}>
                            Detalhes & Status
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="pageCount">Páginas</label>
                                <input
                                    type="number"
                                    id="pageCount"
                                    className="auth-input"
                                    value={pageCount}
                                    onChange={(e) => setPageCount(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="currentPage">Pág. Atual</label>
                                <input
                                    type="number"
                                    id="currentPage"
                                    className="auth-input"
                                    value={currentPage}
                                    onChange={(e) => setCurrentPage(e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="language">Idioma</label>
                            <input
                                type="text"
                                id="language"
                                className="auth-input"
                                placeholder="Ex: Português"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            />
                        </div>

                        {/* Read Status Toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--color-bg-tertiary)',
                            padding: '15px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)'
                        }}>
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: '500' }}>Já li este livro</span>
                            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                                <input
                                    type="checkbox"
                                    checked={isRead}
                                    onChange={(e) => setIsRead(e.target.checked)}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span className="slider round" style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: isRead ? 'var(--color-accent)' : '#d1d1d6', // Apple switch gray
                                    transition: '.4s',
                                    borderRadius: '34px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '20px', width: '20px',
                                        left: isRead ? '24px' : '2px',
                                        bottom: '2px',
                                        backgroundColor: 'white',
                                        transition: '.4s',
                                        borderRadius: '50%',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}></span>
                                </span>
                            </label>
                        </div>

                        {/* Collapsible/Section for Logs (Simplified visual) */}
                        <div style={{ marginTop: '10px' }}>
                            <details style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <summary style={{ padding: '15px', cursor: 'pointer', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Opções Avançadas (Logs)</span>
                                    <span style={{ fontSize: '0.8rem' }}>▼</span>
                                </summary>
                                <div style={{ padding: '15px', borderTop: '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Data Compra</label>
                                            <input type="date" className="auth-input" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Preço (R$)</label>
                                            <input type="number" step="0.01" className="auth-input" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Emprestado para</label>
                                            <input type="text" className="auth-input" value={loanedTo} onChange={(e) => setLoanedTo(e.target.value)} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Data Empréstimo</label>
                                            <input type="date" className="auth-input" value={loanDate} onChange={(e) => setLoanDate(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>

                    </div>

                </form>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button type="button" onClick={onClose} style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: 'var(--color-text-secondary)'
                    }}>
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="auth-button" style={{ width: 'auto', marginTop: 0, padding: '12px 32px' }}>
                        Adicionar Livro
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBookModal;
