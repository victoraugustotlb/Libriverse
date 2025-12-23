import React, { useState, useEffect } from 'react';

const BookCarousel = ({ books, onSelectBook, onNavigate, onUpdateBook }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [pageInput, setPageInput] = useState('');

    // Update local input when active book changes
    useEffect(() => {
        if (books[activeIndex]) {
            setPageInput(books[activeIndex].currentPage || 0);
        }
    }, [activeIndex, books]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev < books.length - 1 ? prev + 1 : 0)); // Loop? Or stop? Let's loop for flow
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : books.length - 1));
    };

    const handlePageUpdate = (e, book) => {
        e.stopPropagation(); // prevent opening details
        const newPage = parseInt(pageInput, 10);
        if (!isNaN(newPage) && onUpdateBook) {
            onUpdateBook(book.id, {
                currentPage: newPage,
                isRead: newPage >= (book.pageCount || 1)
            });
        }
    };

    if (!books || books.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <div
                    onClick={() => onNavigate('library')}
                    style={{
                        width: '200px',
                        height: '300px',
                        borderRadius: '16px',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.02)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--color-accent)';
                        e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                    }}
                >
                    <div style={{ fontSize: '3rem', fontWeight: '200' }}>+</div>
                    <p>Adicionar Leitura</p>
                </div>
            </div>
        );
    }

    return (
        <div className="book-carousel-container" style={{
            position: 'relative',
            width: '100%',
            height: '500px', // Taller for cards + specific info
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            perspective: '1000px', // For 3D feel
        }}>

            {/* Prev Button */}
            <button onClick={handlePrev} style={{
                position: 'absolute',
                left: '20px',
                zIndex: 100,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)',
                transition: 'background 0.2s'
            }}
                onMouseEnter={e => e.target.style.background = 'var(--color-accent)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
                &#8249;
            </button>

            {/* Next Button */}
            <button onClick={handleNext} style={{
                position: 'absolute',
                right: '20px',
                zIndex: 100,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)',
                transition: 'background 0.2s'
            }}
                onMouseEnter={e => e.target.style.background = 'var(--color-accent)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
                &#8250;
            </button>

            {/* Cards */}
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d'
            }}>
                {books.map((book, index) => {
                    // Logic to determine distance from active index
                    // Handle circular wrapping for smooth flow appearance if length > 5?
                    // For simplicity, let's keep strict index distance first.

                    let offset = index - activeIndex;

                    // Simple wrapping logic specifically for "next" continuity if desired,
                    // but simple linear is safer for < 5 items.
                    // Let's stick to linear mapping but safe guard visibility.

                    const isActive = index === activeIndex;
                    const isVisible = Math.abs(offset) <= 2; // Show only 2 neighbors each side

                    if (!isVisible) return null; // Optimization

                    // Styles based on offset
                    const xTrans = offset * 220; // 220px apart
                    const scale = isActive ? 1.1 : 0.8;
                    const zIndex = 50 - Math.abs(offset);
                    const opacity = isActive ? 1 : 0.5;
                    const rotateY = offset === 0 ? 0 : offset > 0 ? -15 : 15; // subtle turn

                    return (
                        <div
                            key={book.id}
                            onClick={() => {
                                if (!isActive) setActiveIndex(index);
                            }}
                            style={{
                                position: 'absolute',
                                width: '260px',
                                height: isActive ? 'auto' : '380px', // Active grows
                                minHeight: '380px',
                                background: 'var(--color-bg-secondary)', // Solid needed for overlay
                                borderRadius: '16px',
                                boxShadow: isActive ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 20px rgba(0,0,0,0.3)',
                                transform: `translateX(${xTrans}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                                zIndex: zIndex,
                                opacity: opacity,
                                transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                cursor: isActive ? 'default' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'visible', // allow glow
                                border: isActive ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}
                        >
                            {/* Image Container */}
                            <div style={{
                                width: '100%',
                                height: '380px',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                {!isActive && <div style={{ // Darken inactive
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.4)'
                                }}></div>}
                            </div>

                            {/* Active Book Details Panel (Below or Overlay) */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-120px', // Float below
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '300px',
                                    background: 'rgba(20, 20, 20, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    animation: 'fadeInUp 0.5s ease 0.2s backwards'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        color: 'white',
                                        margin: '0 0 5px 0',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>{book.title}</h3>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: 'rgba(255,255,255,0.6)',
                                        margin: '0 0 15px 0'
                                    }}>{book.author}</p>

                                    {/* Update Progress Input */}
                                    <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                                        <input
                                            type="number"
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                            style={{
                                                width: '70px',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'white',
                                                textAlign: 'center'
                                            }}
                                        />
                                        <button
                                            onClick={(e) => handlePageUpdate(e, book)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'var(--color-accent)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Atualizar
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => onSelectBook(book)}
                                        style={{
                                            marginTop: '10px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--color-accent)',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        + Mais Detalhes
                                    </button>

                                    <style>{`
                                        @keyframes fadeInUp {
                                            from { opacity: 0; transform: translate(-50%, 20px); }
                                            to { opacity: 1; transform: translate(-50%, 0); }
                                        }
                                    `}</style>
                                </div>
                            )}

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookCarousel;
