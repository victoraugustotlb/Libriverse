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
                width: '800px',
                padding: '40px'
            }}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <div className="auth-header">
                    <h1 className="auth-title">Adicionar Livro</h1>
                    <p className="auth-subtitle">Preencha os detalhes do novo livro</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Nome do Livro</label>
                        <input
                            type="text"
                            id="title"
                            className="auth-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label htmlFor="author">Autor</label>
                            <input
                                type="text"
                                id="author"
                                className="auth-input"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="publisher">Editora</label>
                            <input
                                type="text"
                                id="publisher"
                                className="auth-input"
                                value={publisher}
                                onChange={(e) => setPublisher(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label htmlFor="pageCount">Páginas Totais</label>
                            <input
                                type="number"
                                id="pageCount"
                                className="auth-input"
                                value={pageCount}
                                onChange={(e) => setPageCount(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="currentPage">Página Atual</label>
                            <input
                                type="number"
                                id="currentPage"
                                className="auth-input"
                                value={currentPage}
                                onChange={(e) => setCurrentPage(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
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
                    </div>

                    <div className="form-group">
                        <label htmlFor="coverUrl">Foto da Capa (URL)</label>
                        <input
                            type="url"
                            id="coverUrl"
                            className="auth-input"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                        />
                    </div>

                    {/* Checkbox Slider for Read Status */}
                    <div className="form-group" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        marginTop: '10px'
                    }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Já li este livro</span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
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
                                backgroundColor: isRead ? 'var(--primary-color)' : '#ccc',
                                transition: '.4s',
                                borderRadius: '34px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px', width: '18px',
                                    left: isRead ? '26px' : '4px',
                                    bottom: '4px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>

                    {/* Logos Sections */}
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

                    <details style={{ marginBottom: '15px' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 'bold' }}>Log de Compra</summary>
                        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Data da Compra</label>
                                <input
                                    type="date"
                                    className="auth-input"
                                    value={purchaseDate}
                                    onChange={(e) => setPurchaseDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Preço (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="auth-input"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </details>

                    <details style={{ marginBottom: '15px' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 'bold' }}>Log de Empréstimo</summary>
                        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Emprestado para</label>
                                <input
                                    type="text"
                                    className="auth-input"
                                    value={loanedTo}
                                    onChange={(e) => setLoanedTo(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Data do Empréstimo</label>
                                <input
                                    type="date"
                                    className="auth-input"
                                    value={loanDate}
                                    onChange={(e) => setLoanDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </details>

                    <button type="submit" className="auth-button">
                        Adicionar Livro
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBookModal;
