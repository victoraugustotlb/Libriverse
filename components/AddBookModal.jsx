import React, { useState, useEffect } from 'react';

const AddBookModal = ({ isOpen, onClose, onAddBook, initialData }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [isbn, setIsbn] = useState('');
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

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCoverUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '');
            setAuthor(initialData.author || '');
            setPublisher(initialData.publisher || '');
            setIsbn(initialData.isbn || '');
            setCoverUrl(initialData.coverUrl || '');
            setPageCount(initialData.pageCount || '');
            setCurrentPage(initialData.currentPage || '');
            setLanguage(initialData.language || '');
            setIsRead(initialData.isRead || false);
            setPurchaseDate(initialData.purchaseDate || '');
            setPurchasePrice(initialData.purchasePrice || '');
            setLoanedTo(initialData.loanedTo || '');
            setLoanDate(initialData.loanDate || '');
        } else if (isOpen && !initialData) {
            // Reset form if opening fresh
            setTitle('');
            setAuthor('');
            setPublisher('');
            setIsbn('');
            setCoverUrl('');
            setPageCount('');
            setCurrentPage('');
            setLanguage('');
            setIsRead(false);
            setPurchaseDate('');
            setPurchasePrice('');
            setLoanedTo('');
            setLoanDate('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddBook({
            title, author, publisher, coverUrl, isbn,
            pageCount: pageCount ? parseInt(pageCount) : null,
            currentPage: currentPage ? parseInt(currentPage) : 0,
            language,
            isRead,
            purchaseDate: purchaseDate || null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            loanedTo: loanedTo || null,
            loanDate: loanDate || null
        });

        // Close is handled by parent usually, but we can reset here or just rely on unmount/re-render
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
                    <h1 className="auth-title" style={{ fontSize: '2.5rem' }}>
                        {initialData ? 'Editar/Confirmar Livro' : 'Adicionar Livro'}
                    </h1>
                    <p className="auth-subtitle" style={{ fontSize: '1.1rem' }}>
                        {initialData ? 'Verifique as informações antes de salvar' : 'Preencha os detalhes do novo livro'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>

                    {/* Top Section: Cover & Basic Info */}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '40px' }}>

                        {/* Left: Drag & Drop Cover Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                width: '200px',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}
                        >
                            <div style={{
                                width: '100%',
                                height: '300px', // Standard book ratio approx
                                background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : (isDragging ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)'),
                                border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                overflow: 'hidden'
                            }} onClick={() => document.getElementById('coverInput').click()}>

                                {!coverUrl && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📷</span>
                                        <p style={{ fontSize: '0.9rem' }}>Arraste uma imagem ou clique para enviar</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    id="coverInput"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* URL Fallback */}
                            <input
                                type="url"
                                className="auth-input"
                                value={coverUrl}
                                onChange={(e) => setCoverUrl(e.target.value)}
                                placeholder="Ou cole a URL aqui..."
                                style={{ fontSize: '0.8rem', padding: '8px' }}
                            />
                        </div>

                        {/* Right: Basic Fields */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                <label htmlFor="isbn">ISBN</label>
                                <input
                                    type="text"
                                    id="isbn"
                                    className="auth-input"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                    placeholder="Ex: 978-85-220-3136-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Details & Logs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        {/* Details Column */}
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

                        </div>

                        {/* Logs Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-text-primary)', borderBottom: '2px solid var(--color-bg-secondary)', paddingBottom: '10px' }}>
                                Logs e Histórico
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                        {initialData ? 'Salvar Livro' : 'Adicionar Livro'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBookModal;
