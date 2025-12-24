import React, { useState, useEffect } from 'react';

const Notes = ({ onNavigate }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem('libriverse_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/notes', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                }
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

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
        <div className="notes-page">
            <section className="hero">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="hero-title" style={{ marginBottom: '40px' }}>Suas Anotações</h1>

                    {/* Controls Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        background: 'rgba(20, 20, 20, 0.8)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '16px 24px',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        marginBottom: '40px'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
                            Você tem <span style={{ color: '#fff', fontWeight: 'bold' }}>{notes.length}</span> anotações
                        </div>

                        <button
                            className="hero-cta"
                            style={{
                                marginTop: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                fontSize: '0.9rem'
                            }}
                            onClick={() => onNavigate('create-note')}
                        >
                            <span style={{ fontSize: '1.2em' }}>+</span> Nova Anotação
                        </button>
                    </div>

                    {/* Notes Grid */}
                    <div className="notes-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {notes.map(note => (
                            <div key={note.id} style={{
                                background: 'rgba(20, 20, 20, 0.8)', // Dark background like toolbar
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer',
                                color: '#fff',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        margin: 0,
                                        color: '#fff'
                                    }}>
                                        {note.isGeneral ? 'Nota Geral' : `Capítulo ${toRoman(note.chapter)}${note.page ? ` - Pág. ${note.page}` : ''}`}
                                    </h3>
                                    {note.bookTitle && (
                                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '4px' }}>
                                            {note.bookTitle}
                                        </div>
                                    )}
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.6)'
                                    }}>{note.date}</span>
                                </div>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: 'rgba(255,255,255,0.8)',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-line',
                                    flex: 1
                                }}>
                                    {note.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {notes.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: '60px' }}>
                            <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                Você ainda não tem nenhuma anotação.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Notes;
