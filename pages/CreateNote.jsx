import React, { useState, useEffect } from 'react';

const CreateNote = ({ onNavigate, books = [], noteToEdit = null, onClearEdit }) => {
    const [selectedBookId, setSelectedBookId] = useState('');
    const [chapter, setChapter] = useState('');
    const [page, setPage] = useState('');
    const [isGeneralNote, setIsGeneralNote] = useState(false);
    const [content, setContent] = useState('');
    const [lineNumbers, setLineNumbers] = useState([1]);

    // Update line numbers when content changes
    useEffect(() => {
        const lines = content.split('\n').length;
        setLineNumbers(Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1));
    }, [content]);

    // Load note data for editing
    useEffect(() => {
        if (noteToEdit) {
            setContent(noteToEdit.content || '');
            setChapter(noteToEdit.chapter || '');
            setPage(noteToEdit.page || '');
            setIsGeneralNote(noteToEdit.isGeneral || false);

            // Resolve global bookId to user bookId for the dropdown
            if (noteToEdit.bookId && books.length > 0) {
                // noteToEdit.bookId is the GLOBAL ID (from API notes join)
                // books (userBooks) have .id (user_book_id) and .global_book_id (checking api pattern)
                // Wait, api user_books endpoint returns mapped object. 
                // Let's check `api/books/index.js` output again.
                // It returns: id (user_book), title, ... but DOES IT RETURN global_book_id? 
                // Previous view of api/books/index.js line 60 says NO. It returns `id` (user_book) and `isbn`.
                // This is a minimal conflict. We can match by Title?
                // Or I can update api/books to return global_book_id?
                // Matching by title is safer for now without changing more files.
                const matchedBook = books.find(b => b.title === noteToEdit.bookTitle);
                if (matchedBook) {
                    setSelectedBookId(matchedBook.id);
                }
            }
        }
    }, [noteToEdit, books]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('libriverse_token');
            if (!token) {
                alert('Você precisa estar logado para salvar uma nota.');
                return;
            }

            const url = noteToEdit ? `/api/notes?id=${noteToEdit.id}` : '/api/notes';
            const method = noteToEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookId: selectedBookId,
                    chapter: isGeneralNote ? '' : chapter,
                    page: isGeneralNote ? '' : page,
                    content,
                    isGeneral: isGeneralNote
                })
            });

            if (response.ok) {
                alert(noteToEdit ? 'Anotação atualizada!' : 'Anotação salva com sucesso!');
                if (onClearEdit) onClearEdit();
                onNavigate('notes');
            } else {
                const data = await response.json();
                alert(data.error || 'Erro ao salvar anotação');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Erro de conexão ao salvar nota');
        }
    };

    // Cleanup on unmount/back
    const handleBack = () => {
        if (onClearEdit) onClearEdit();
        onNavigate('notes');
    };

    // Helper to convert to Roman numerals
    const toRoman = (num) => {
        if (!num || isNaN(num)) return num;
        const n = parseInt(num);
        if (n <= 0) return num;
        const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = '';
        let i = n;
        for (let key in lookup) {
            while (i >= lookup[key]) {
                roman += key;
                i -= lookup[key];
            }
        }
        return roman;
    };

    return (
        <div className="create-note-page" style={{
            paddingTop: '40px',
            minHeight: '100vh',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)'
        }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <button
                        onClick={handleBack}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ← Voltar
                    </button>
                    <h1 className="hero-title" style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text-primary)' }}>
                        {noteToEdit ? 'Editar Anotação' : 'Nova Anotação'}
                    </h1>
                    <button
                        className="hero-cta"
                        style={{ marginTop: 0, padding: '10px 24px' }}
                        onClick={handleSave}
                    >
                        Salvar
                    </button>
                </div>

                {/* Controls Bar */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'rgba(20, 20, 20, 0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    marginBottom: '24px'
                }}>

                    {/* Book Select */}
                    <div style={{ flex: '2 1 300px' }}>
                        <select
                            value={selectedBookId}
                            onChange={(e) => setSelectedBookId(e.target.value)}
                            // disabled={isGeneralNote} // Allow book selection even for general notes
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ background: '#222' }}>Selecionar Livro...</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id} style={{ background: '#222' }}>{book.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Chapter Input */}
                    {/* Chapter Input - Hidden for General Note */}
                    {!isGeneralNote && (
                        <div style={{ flex: '1 1 150px' }}>
                            <input
                                type="text"
                                placeholder="Capítulo"
                                value={chapter}
                                onChange={(e) => setChapter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    {/* Page Input */}
                    {/* Page Input - Hidden for General Note */}
                    {!isGeneralNote && (
                        <div style={{ flex: '0 1 100px' }}>
                            <input
                                type="text"
                                placeholder="Pág."
                                value={page}
                                onChange={(e) => setPage(e.target.value.replace(/\D/g, ''))} // Only numbers
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    )}

                    {/* Divider */}
                    <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>

                    {/* General Note Toggle */}
                    <button
                        onClick={() => setIsGeneralNote(!isGeneralNote)}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: isGeneralNote ? '1px solid #0071e3' : '1px solid rgba(255,255,255,0.2)',
                            background: isGeneralNote ? '#0071e3' : 'transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        Nota Geral
                    </button>
                </div>

                {/* Editor Area */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    minHeight: '60vh',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    overflow: 'hidden'
                }}>
                    {/* Chapter Title */}
                    {chapter && (
                        <div style={{
                            padding: '24px 24px 0 24px',
                            textAlign: 'center',
                            fontFamily: 'serif',
                            fontSize: '2rem',
                            color: 'var(--color-text-primary)',
                            fontWeight: '700',
                            letterSpacing: '2px',
                            opacity: 0.9,
                            transition: 'all 0.3s ease'
                        }}>
                            {toRoman(chapter)}
                        </div>
                    )}

                    {/* Editor Content Wrapper */}
                    <div style={{ display: 'flex', flex: 1 }}>
                        {/* Line Numbers */}
                        <div style={{
                            width: '50px',
                            background: 'var(--color-bg-tertiary)',
                            borderRight: '1px solid var(--color-border)',
                            padding: '24px 0',
                            textAlign: 'center',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'monospace',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            userSelect: 'none',
                        }}>
                            {lineNumbers.map(num => (
                                <div key={num}>{num}</div>
                            ))}
                        </div>

                        {/* Content Area */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Comece a escrever sua anotação aqui..."
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                padding: '24px',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                color: 'var(--color-text-primary)',
                                outline: 'none',
                                resize: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNote;
