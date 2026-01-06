import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';

const AddBookModal = ({ isOpen, onClose, onAddBook, initialData, onSwitchToSearch }) => {
    const { showNotification, showConfirm } = useNotification();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [isbn, setIsbn] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [pageCount, setPageCount] = useState('');
    const [currentPage, setCurrentPage] = useState('');
    const [language, setLanguage] = useState('');
    const [editionDate, setEditionDate] = useState('');
    const [translator, setTranslator] = useState('');
    const [synopsis, setSynopsis] = useState(''); // [NEW]
    const [isRead, setIsRead] = useState(false);

    // New Mode: Old Book (No ISBN)
    const [isOldBook, setIsOldBook] = useState(false);

    // Logs
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [loanedTo, setLoanedTo] = useState('');

    const [loanDate, setLoanDate] = useState('');
    const [startDate, setStartDate] = useState('');
    const [finishDate, setFinishDate] = useState('');
    const [coverType, setCoverType] = useState('brochura');

    // Reporting
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportDescription, setReportDescription] = useState('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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
            setStartDate(initialData.startDate || '');
            setFinishDate(initialData.finishDate || '');
            setEditionDate(initialData.editionDate || '');
            setTranslator(initialData.translator || '');
            setSynopsis(initialData.synopsis || ''); // [NEW]
            setCoverType(initialData.coverType || 'brochura');
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
            setStartDate('');
            setFinishDate('');
            setEditionDate('');
            setTranslator('');
            setSynopsis(''); // [NEW]
            setCoverType('brochura');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validate ISBN presence for modern books
        if (!isOldBook && !isbn.trim()) {
            showNotification("Para livros modernos, o ISBN é obrigatório. Se for um livro antigo, ative o modo 'Livro Antigo'.", "info");
            return;
        }

        // 2. Check for duplicate ISBN if provided and not editing
        if (isbn && !initialData && !isOldBook) {
            try {
                const token = localStorage.getItem('libriverse_token');
                const response = await fetch(`/api/books/search?q=${encodeURIComponent(isbn)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const results = await response.json();
                    // Check if any result has this ISBN
                    const duplicate = results.find(b => b.isbn === isbn);

                    if (duplicate) {
                        const confirmSearch = await showConfirm(
                            `Encontramos um livro com o ISBN ${isbn} na base de dados: "${duplicate.title}".\n\nDeseja usar os dados existentes em vez de cadastrar manualmente?`,
                            "Livro Encontrado"
                        );

                        if (confirmSearch) {
                            onSwitchToSearch(isbn);
                            return;
                        }
                    }
                }
            } catch (err) {
                console.error("Error checking ISBN:", err);
                // Continue with save on error to not block user
            }
        }

        onAddBook({
            title, author, publisher, coverUrl, isbn,
            pageCount: pageCount ? parseInt(pageCount) : null,
            currentPage: currentPage ? parseInt(currentPage) : 0,
            language,
            isRead,
            purchaseDate: purchaseDate || null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            loanedTo: loanedTo || null,

            loanDate: loanDate || null,
            startDate: startDate || null,
            finishDate: finishDate || null,
            editionDate,
            translator,
            coverType,
            synopsis, // [NEW]
            isOldBook
        });

        // Close is handled by parent usually, but we can reset here or just rely on unmount/re-render
        onClose();
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportDescription.trim()) return;

        setIsSubmittingReport(true);
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: 'report',
                    isbn,
                    title,
                    description: reportDescription,
                    issueType: 'user_report'
                })
            });

            if (response.ok) {
                showNotification("Erro reportado com sucesso! Obrigado por ajudar a melhorar a biblioteca.", "success");
                setIsReportModalOpen(false);
                setReportDescription('');
            } else {
                showNotification("Falha ao enviar reporte. Tente novamente.", "error");
            }
        } catch (error) {
            console.error("Error reporting book:", error);
            showNotification("Erro de conexão.", "error");
        } finally {
            setIsSubmittingReport(false);
        }
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

                    {/* Report Button (Only if ISBN exists or it is potentially a global book) */}
                    {isbn && !isOldBook && (
                        <button
                            type="button"
                            onClick={() => setIsReportModalOpen(true)}
                            style={{
                                marginTop: '10px',
                                background: 'transparent',
                                border: '1px solid #ff5252',
                                color: '#ff5252',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            ⚠️ Reportar Erro neste Livro
                        </button>
                    )}
                </div>

                {isReportModalOpen && (
                    <div style={{
                        marginBottom: '30px',
                        padding: '20px',
                        background: 'rgba(255, 82, 82, 0.1)',
                        border: '1px solid #ff5252',
                        borderRadius: '8px'
                    }}>
                        <h4 style={{ color: '#ff5252', marginTop: 0 }}>Reportar Erro no Cadastro Global</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                            Encontrou algo errado (capa, título, autor)? Descreva abaixo para que possamos corrigir.
                        </p>
                        <textarea
                            className="auth-input"
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            placeholder="Ex: A capa está incorreta; O autor é tal..."
                            rows={3}
                            style={{ marginBottom: '10px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setIsReportModalOpen(false)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    padding: '5px 15px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleReportSubmit}
                                disabled={isSubmittingReport}
                                style={{
                                    background: '#ff5252',
                                    border: 'none',
                                    color: 'white',
                                    padding: '5px 15px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: isSubmittingReport ? 0.7 : 1
                                }}
                            >
                                {isSubmittingReport ? 'Enviando...' : 'Enviar Reporte'}
                            </button>
                        </div>
                    </div>
                )}



                {/* Old Book Toggle */}
                <div style={{
                    marginBottom: '30px',
                    padding: '15px',
                    background: isOldBook ? 'rgba(255, 193, 7, 0.1)' : 'var(--color-bg-tertiary)',
                    border: isOldBook ? '1px solid #ffc107' : '1px solid var(--color-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <span style={{ fontWeight: '600', color: isOldBook ? '#ffc107' : 'var(--color-text-primary)' }}>
                            📚 {isOldBook ? 'Modo Livro Antigo Ativado' : 'Livro Moderno (Padrão)'}
                        </span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            {isOldBook ? 'ISBN não é obrigatório. Este livro será salvo em uma coleção separada.' : 'ISBN é obrigatório para garantir a identificação correta.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsOldBook(!isOldBook)}
                        style={{
                            padding: '8px 16px',
                            background: isOldBook ? '#ffc107' : 'transparent',
                            color: isOldBook ? '#000' : 'var(--color-text-secondary)',
                            border: isOldBook ? 'none' : '1px solid var(--color-border)',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isOldBook ? 'Voltar ao Padrão' : 'Ativar Modo Livro Antigo'}
                    </button>
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

                                {coverUrl && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCoverUrl('');
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            fontSize: '1.2rem',
                                            transition: 'background 0.2s'
                                        }}
                                        title="Remover imagem"
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.8)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
                                    >
                                        &times;
                                    </button>
                                )}

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
                                <label htmlFor="translator">Tradutor</label>
                                <input
                                    type="text"
                                    id="translator"
                                    className="auth-input"
                                    value={translator}
                                    onChange={(e) => setTranslator(e.target.value)}
                                    placeholder="Ex: Ferreira Gullar"
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
                                <label htmlFor="editionDate">Data da Edição</label>
                                <input
                                    type="text"
                                    id="editionDate"
                                    className="auth-input"
                                    value={editionDate}
                                    onChange={(e) => setEditionDate(e.target.value)}
                                    placeholder="Ex: 2015 ou 1ª Edição"
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
                                    placeholder={isOldBook ? "Opcional para livros antigos" : "Obrigatório (Ex: 978-85...)"}
                                    disabled={isOldBook}
                                    style={{
                                        opacity: isOldBook ? 0.6 : 1,
                                        cursor: isOldBook ? 'not-allowed' : 'text',
                                        background: isOldBook ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)'
                                    }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="synopsis">Sinopse</label>
                                <textarea
                                    id="synopsis"
                                    className="auth-input"
                                    value={synopsis}
                                    onChange={(e) => setSynopsis(e.target.value)}
                                    placeholder="Resumo ou descrição do livro..."
                                    rows={4}
                                    style={{ resize: 'vertical', minHeight: '80px' }}
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

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="coverType">Tipo de Capa</label>
                                <select
                                    id="coverType"
                                    className="auth-input"
                                    value={coverType}
                                    onChange={(e) => setCoverType(e.target.value)}
                                    style={{
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right .7em top 50%',
                                        backgroundSize: '.65em auto',
                                        paddingRight: '1.5em'
                                    }}
                                >
                                    <option value="brochura" style={{ color: 'black' }}>Brochura</option>
                                    <option value="dura" style={{ color: 'black' }}>Capa Dura</option>
                                    <option value="aveludada" style={{ color: 'black' }}>Aveludada/Soft Touch</option>
                                </select>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Data Início Leitura</label>
                                    <input type="date" className="auth-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Data Término</label>
                                    <input type="date" className="auth-input" value={finishDate} onChange={(e) => setFinishDate(e.target.value)} />
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
