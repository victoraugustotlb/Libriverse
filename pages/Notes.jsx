import React, { useState, useEffect } from 'react';

const Notes = ({ onNavigate, onEditNote }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (noteId, e) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;

        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch(`/api/notes?id=${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotes(notes.filter(n => n.id !== noteId));
            } else {
                alert('Erro ao excluir anotação');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

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

    const [searchTerm, setSearchTerm] = useState('');

    const filteredNotes = notes.filter(note => {
        const searchLower = searchTerm.toLowerCase();
        const title = note.isGeneral ? 'Nota Geral' : `Capítulo ${toRoman(note.chapter)}${note.page ? ` - Pág. ${note.page}` : ''}`;

        return (
            title.toLowerCase().includes(searchLower) ||
            (note.content && note.content.toLowerCase().includes(searchLower)) ||
            (note.bookTitle && note.bookTitle.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="notes-page">
            <section className="hero">
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="hero-title" style={{ marginBottom: '40px' }}>Suas Anotações</h1>

                    {/* Controls Bar */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
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
                        <div style={{ flex: '1 1 300px' }}>
                            <input
                                type="text"
                                placeholder="Buscar nas anotações..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{filteredNotes.length}</span> anotações
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
                    </div>

                    {/* Notes Grid */}
                    <div className="notes-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredNotes.map(note => (
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

                                {/* Actions Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    paddingTop: '16px',
                                    marginTop: 'auto'
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditNote(note);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'rgba(255,255,255,0.6)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            transition: 'color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = '#fff'}
                                        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                                    >
                                        ✎ Editar
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(note.id, e)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4d4f', // Red for delete
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            opacity: 0.8,
                                            transition: 'opacity 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                                        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                                    >
                                        🗑 Excluir
                                    </button>
                                </div>
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
