import React, { useState, useEffect } from 'react';

const CreateNote = ({ onNavigate, books = [] }) => {
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

    const handleSave = () => {
        // Placeholder save logic
        alert('Anotação salva com sucesso (Simulação)!');
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
            background: '#fff'
        }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <button
                        onClick={() => onNavigate('notes')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ← Voltar
                    </button>
                    <h1 className="hero-title" style={{ fontSize: '2rem', margin: 0, color: '#333' }}>Nova Anotação</h1>
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
                            disabled={isGeneralNote}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: isGeneralNote ? 'rgba(255,255,255,0.3)' : '#fff',
                                outline: 'none',
                                cursor: isGeneralNote ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <option value="" style={{ background: '#222' }}>Selecionar Livro...</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id} style={{ background: '#222' }}>{book.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Chapter Input */}
                    <div style={{ flex: '1 1 150px' }}>
                        <input
                            type="text"
                            placeholder="Capítulo"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            disabled={isGeneralNote}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                outline: 'none',
                                opacity: isGeneralNote ? 0.5 : 1
                            }}
                        />
                    </div>

                    {/* Page Input */}
                    <div style={{ flex: '0 1 100px' }}>
                        <input
                            type="text"
                            placeholder="Pág."
                            value={page}
                            onChange={(e) => setPage(e.target.value.replace(/\D/g, ''))} // Only numbers
                            disabled={isGeneralNote}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                outline: 'none',
                                opacity: isGeneralNote ? 0.5 : 1
                            }}
                        />
                    </div>

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
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e1e4e8',
                    minHeight: '60vh',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                    overflow: 'hidden'
                }}>
                    {/* Line Numbers */}
                    <div style={{
                        width: '50px',
                        background: '#f0f2f5',
                        borderRight: '1px solid #e1e4e8',
                        padding: chapter ? '60px 0 24px 0' : '24px 0', // Adjust padding if title exists
                        textAlign: 'center',
                        color: '#999',
                        fontFamily: 'monospace',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        userSelect: 'none',
                        transition: 'padding 0.3s ease'
                    }}>
                        {lineNumbers.map(num => (
                            <div key={num}>{num}</div>
                        ))}
                    </div>

                    {/* Content Column */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {chapter && (
                            <div style={{
                                padding: '24px 24px 0 24px',
                                textAlign: 'center',
                                fontFamily: 'serif',
                                fontSize: '2rem',
                                color: '#1d1d1f',
                                fontWeight: '700',
                                letterSpacing: '2px',
                                opacity: 0.9,
                                transition: 'all 0.3s ease'
                            }}>
                                {toRoman(chapter)}
                            </div>
                        )}

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
                                color: '#333',
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
