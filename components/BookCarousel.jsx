import React, { useState, useEffect } from 'react';

const BookCarousel = ({ books, onSelectBook, onNavigate, onUpdateBook, onOpenAddModal }) => {
    // Merge books with a placeholder for "Add Book", ensuring no nulls
    const items = [...(books || []).filter(Boolean), { id: 'add-placeholder', type: 'placeholder' }];
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
            height: '600px', // Taller to accommodate scaling
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            margin: '20px 0',
            perspective: '1000px' // Restore perspective for depth feel
        }}>
            {/* Prev Button */}
            <button onClick={handlePrev} style={{
                position: 'absolute',
                left: '20px',
                zIndex: 200,
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: '#333',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>&#8249;</button>

            {/* Next Button */}
            <button onClick={handleNext} style={{
                position: 'absolute',
                right: '20px',
                zIndex: 200,
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: '#333',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>&#8250;</button>

            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transformStyle: 'preserve-3d'
            }}>
                {items.map((item, index) => {
                    const offset = index - activeIndex;
                    const isActive = index === activeIndex;

                    // Logic: "Bloom" / "Flower" Style - Continuous Flow
                    // We allow more items to be visible to prevent "abrupt ending"
                    if (Math.abs(offset) > 5) return null;

                    const CARD_WIDTH = 600; // Reduced from 700 to fit better
                    const GAP = 30; // Reduced gap
                    const NEIGHBOR_OFFSET = 120; // Reduced offset for tighter stacking

                    let translateX = 0;

                    if (offset === 0) {
                        translateX = 0;
                    } else if (offset > 0) {
                        // Distribute neighbor cards to the right
                        translateX = ((CARD_WIDTH * 0.5) + GAP) + ((offset - 1) * NEIGHBOR_OFFSET);
                    } else {
                        // Distribute to left
                        translateX = -((CARD_WIDTH * 0.5) + GAP) + ((offset + 1) * NEIGHBOR_OFFSET);
                    }

                    const scale = isActive ? 1 : 0.7;
                    const opacity = isActive ? 1 : 0.95; // Almost fully opaque
                    const zIndex = 100 - Math.abs(offset);
                    const blur = isActive ? '0' : '1px';

                    // Consistent Card Style for ALL items (Book or Placeholder)
                    const cardStyle = {
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.3)',
                        border: '1px solid var(--color-border)',
                        transition: 'box-shadow 0.3s'
                    };

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isActive && setActiveIndex(index)}
                            style={{
                                position: 'absolute',
                                width: `${CARD_WIDTH}px`,
                                height: '420px',
                                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                transform: `translateX(${translateX}px) scale(${scale}) translateZ(${isActive ? 0 : -50 * Math.abs(offset)}px)`, // Use translateZ for depth
                                zIndex: zIndex,
                                opacity: opacity,
                                filter: `blur(${blur})`,
                                cursor: isActive ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {item.type === 'placeholder' ? (
                                <div style={{
                                    ...cardStyle,
                                    background: '#2a2a2a', // Distinct gray for add
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#eee',
                                    border: '2px dashed #555'
                                }}
                                    onClick={() => isActive && onOpenAddModal && onOpenAddModal()}
                                >
                                    <div style={{ fontSize: '4rem', fontWeight: '200' }}>+</div>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '500', marginTop: '10px' }}>Adicionar Novo Livro</p>
                                </div>
                            ) : (
                                <div style={cardStyle}>
                                    {/* Left: Full Cover */}
                                    <div style={{
                                        width: '40%',
                                        background: '#000',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRight: '1px solid var(--color-border)'
                                    }}>
                                        <img
                                            src={item.coverUrl}
                                            alt={item.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>

                                    {/* Right: Info Column */}
                                    <div style={{
                                        width: '60%',
                                        padding: '40px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        textAlign: 'left',
                                        background: 'var(--color-bg-secondary)'
                                    }}>
                                        <h2 style={{
                                            fontSize: '1.5rem', // Reduced from 2rem
                                            fontWeight: '700',
                                            margin: '0 0 5px 0',
                                            color: 'var(--color-text-primary)',
                                            lineHeight: '1.2',
                                            // Handle long text with clamp
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            height: '3.6rem' // Fixed height for 2 lines
                                        }} title={item.title}>{item.title}</h2>

                                        <p style={{
                                            fontSize: '1rem',
                                            color: 'var(--color-accent)',
                                            marginBottom: '20px',
                                            fontWeight: '500',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>por {item.author}</p>

                                        {/* Stats */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '20px',
                                            marginBottom: 'auto'
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Editora</p>
                                                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.publisher || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Idioma</p>
                                                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.language || 'Português'}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>ISBN</p>
                                                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.isbn || '---'}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Páginas</p>
                                                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.pageCount || '---'}</p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Progresso de Leitura</p>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: '6px',
                                                    padding: '0 10px',
                                                    background: 'var(--color-bg-tertiary)',
                                                    flex: 1
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
                                                            fontSize: '1rem',
                                                            padding: '10px 0'
                                                        }}
                                                    />
                                                    <span style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>/ {item.pageCount}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => handlePageUpdate(e, item)}
                                                    style={{
                                                        background: '#0070f3',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0 25px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    Atualizar
                                                </button>
                                            </div>

                                            <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-tertiary)', marginTop: '12px', borderRadius: '2px' }}>
                                                <div style={{
                                                    width: `${Math.min(((item.currentPage || 0) / (item.pageCount || 1)) * 100, 100)}%`,
                                                    height: '100%',
                                                    background: '#0070f3',
                                                    borderRadius: '2px'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
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
