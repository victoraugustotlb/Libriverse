import React, { useState, useEffect } from 'react';

const BookCarousel = ({ books, onSelectBook, onNavigate, onUpdateBook }) => {
    // Merge books with a placeholder for "Add Book"
    const items = [...books, { id: 'add-placeholder', type: 'placeholder' }];
    const [activeIndex, setActiveIndex] = useState(0);
    const [pageInput, setPageInput] = useState('');

    // Update local input when active book changes
    useEffect(() => {
        const activeItem = items[activeIndex];
        if (activeItem && activeItem.type !== 'placeholder') {
            setPageInput(activeItem.currentPage || 0);
        }
    }, [activeIndex, books]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    };

    const handlePageUpdate = (e, book) => {
        e.stopPropagation();
        const newPage = parseInt(pageInput, 10);
        if (!isNaN(newPage) && onUpdateBook) {
            onUpdateBook(book.id, {
                currentPage: newPage,
                isRead: newPage >= (book.pageCount || 1)
            });
        }
    };

    return (
        <div className="book-carousel-container" style={{
            position: 'relative',
            width: '100%',
            height: '600px', // Tall enough for detail view
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
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
            }}>&#8249;</button>

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
            }}>&#8250;</button>

            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                perspective: '1000px',
            }}>
                {items.map((item, index) => {
                    const offset = index - activeIndex;
                    const isActive = index === activeIndex;

                    // Layout constants
                    const ACTIVE_WIDTH = 800;
                    const INACTIVE_WIDTH = 220;
                    const GAP = 20;

                    // Calculate translation
                    let translateX = 0;
                    if (isActive) {
                        translateX = 0;
                    } else if (offset < 0) {
                        // Left side
                        // Distance = Half Active + Half Inactive + (Count-1 * Full Inactive + Gaps)
                        // Simplified: Active takes center.
                        // Immediate neighbor center is at: - (ACTIVE_WIDTH/2 + GAP + INACTIVE_WIDTH/2)
                        // Further neighbors add (INACTIVE_WIDTH + GAP)
                        translateX = -((ACTIVE_WIDTH / 2) + GAP + (INACTIVE_WIDTH / 2)) - ((Math.abs(offset) - 1) * (INACTIVE_WIDTH / 2));
                        // Overlap logic closer to true Cover Flow:
                        translateX = -((ACTIVE_WIDTH / 2) + GAP) + ((offset + 1) * 80); // Compact 
                    } else {
                        // Right side
                        translateX = ((ACTIVE_WIDTH / 2) + GAP) + ((offset - 1) * 80);
                    }

                    const scale = isActive ? 1 : 0.8;
                    const opacity = isActive ? 1 : 0.5;
                    const zIndex = 100 - Math.abs(offset);
                    const rotateY = isActive ? 0 : offset < 0 ? 25 : -25;

                    // Optimization: Hide far items
                    if (Math.abs(offset) > 3) return null;

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isActive && setActiveIndex(index)}
                            style={{
                                position: 'absolute',
                                width: isActive ? `${ACTIVE_WIDTH}px` : `${INACTIVE_WIDTH}px`,
                                height: '400px', // Fixed height container
                                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                                zIndex: zIndex,
                                opacity: opacity,
                                cursor: isActive ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* --- CONTENT --- */}
                            {item.type === 'placeholder' ? (
                                // Add Book Placeholder
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '16px',
                                    border: '2px dashed rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer'
                                }}
                                    onClick={() => isActive && onNavigate('library')}
                                >
                                    <div style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.5)' }}>+</div>
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Adicionar Novo Livro</p>
                                </div>
                            ) : isActive ? (
                                // ACTIVE DETAILED CARD
                                <div style={{
                                    display: 'flex',
                                    width: '100%',
                                    height: '100%',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    {/* Left: Cover */}
                                    <div style={{
                                        width: '35%',
                                        background: '#000',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            src={item.coverUrl}
                                            alt={item.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                opacity: 0.9
                                            }}
                                        />
                                    </div>

                                    {/* Right: Info */}
                                    <div style={{
                                        width: '65%',
                                        padding: '40px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        textAlign: 'left'
                                    }}>
                                        <h2 style={{
                                            fontSize: '2rem',
                                            margin: '0 0 5px 0',
                                            color: 'var(--color-text-primary)'
                                        }}>{item.title}</h2>

                                        <p style={{
                                            fontSize: '1.1rem',
                                            color: 'var(--color-accent)',
                                            marginBottom: '20px'
                                        }}>por <span style={{ fontWeight: 600 }}>{item.author}</span></p>

                                        {/* Metadata Grid */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '15px',
                                            marginBottom: '30px',
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text-secondary)',
                                            background: 'var(--color-bg-tertiary)',
                                            padding: '15px',
                                            borderRadius: '8px'
                                        }}>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Editora</span>
                                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.publisher || '-'}</span>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Idioma</span>
                                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.language || '-'}</span>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>ISBN</span>
                                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.isbn || '-'}</span>
                                            </div>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Páginas</span>
                                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.pageCount || '-'}</span>
                                            </div>
                                        </div>

                                        {/* Progress Control */}
                                        <div style={{
                                            marginBottom: '10px'
                                        }}>
                                            <p style={{ fontWeight: 600, marginBottom: '8px' }}>Progresso de Leitura</p>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    background: 'var(--color-bg-primary)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '6px',
                                                    padding: '0 10px',
                                                    width: '120px'
                                                }}>
                                                    <input
                                                        type="number"
                                                        value={pageInput}
                                                        onChange={(e) => setPageInput(e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: 'var(--color-text-primary)',
                                                            fontWeight: '600',
                                                            textAlign: 'center',
                                                            padding: '8px 0'
                                                        }}
                                                    />
                                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>/ {item.pageCount}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => handlePageUpdate(e, item)}
                                                    style={{
                                                        background: 'var(--color-accent)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0 20px',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Atualizar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Purchase Info Footer */}
                                        {(item.purchaseDate || item.purchasePrice) && (
                                            <div style={{
                                                marginTop: 'auto',
                                                paddingTop: '15px',
                                                borderTop: '1px solid var(--color-border)',
                                                fontSize: '0.85rem',
                                                color: 'var(--color-text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span>🛒</span>
                                                <span>Comprado em <strong>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '-'}</strong> por <strong>R$ {item.purchasePrice || '0.00'}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // INACTIVE COVER ONLY
                                <div style={{
                                    width: '100%',
                                    height: '85%', // Slightly shorter
                                    borderRadius: '12px', // Matches cover radius
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                    background: '#222'
                                }}>
                                    <img
                                        src={item.coverUrl}
                                        alt={item.title}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    {/* Dark overlay */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}></div>
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
