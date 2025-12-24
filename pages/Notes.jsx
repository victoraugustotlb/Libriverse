import React, { useState } from 'react';

const Notes = ({ onNavigate }) => {
    // Placeholder data for notes
    const [notes, setNotes] = useState([
        { id: 1, title: 'Ideias para o próximo capítulo', content: 'Pensar em como desenvolver o personagem principal...', date: '23/12/2025' },
        { id: 2, title: 'Livros para comprar', content: '1. O Hobbit\n2. Duna\n3. Neuromancer', date: '22/12/2025' },
        { id: 3, title: 'Citações favoritas', content: '"Não entre em pânico."', date: '20/12/2025' }
    ]);

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
                            onClick={() => alert('Funcionalidade de criar nota em breve!')}
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
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'pointer',
                                color: '#fff'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
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
                                    }}>{note.title}</h3>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.4)'
                                    }}>{note.date}</span>
                                </div>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: 'rgba(255,255,255,0.7)',
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
