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
            height: '500px', // Fixed height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            margin: '20px 0'
        }}>
            {/* Prev Button */}
            <button onClick={handlePrev} style={{
                position: 'absolute',
                left: '20px',
                zIndex: 200,
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'var(--color-text-primary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >&#8249;</button>

            {/* Next Button */}
            <button onClick={handleNext} style={{
                position: 'absolute',
                right: '20px',
                zIndex: 200,
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'var(--color-text-primary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >&#8250;</button>

            <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {items.map((item, index) => {
                    const offset = index - activeIndex;
                    const isActive = index === activeIndex;

                    // Logic: "Flower" Style scaling and spacing.
                    // Active: Center (0)
                    // Neighbors: Spaced out significantly

                    if (Math.abs(offset) > 2) return null; // Hide far items

                    // Card Dimensions
                    const CARD_WIDTH = 750; // Wide card for "Book Layout"
                    const GAP = 50;

                    let translateX = 0;
                    if (offset === 0) {
                        translateX = 0;
                    } else if (offset > 0) {
                        // Move right: (Half Active + Half Neighbor)? 
                        // Actually, neighbors should just shift right by slightly more than width to create gap.
                        translateX = (CARD_WIDTH * 0.95) + ((offset - 1) * 200);
                    } else {
                        translateX = -(CARD_WIDTH * 0.95) + ((offset + 1) * 200);
                    }

                    const scale = isActive ? 1 : 0.85;
                    const opacity = isActive ? 1 : 0.5;
                    const zIndex = 100 - Math.abs(offset);
                    const blur = isActive ? '0' : '2px';

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isActive && setActiveIndex(index)}
                            style={{
                                position: 'absolute',
                                width: `${CARD_WIDTH}px`,
                                height: '400px',
                                transition: 'all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                transform: `translateX(${translateX}px) scale(${scale})`,
                                zIndex: zIndex,
                                opacity: opacity,
                                filter: `blur(${blur})`,
                                cursor: isActive ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* --- CONTENT --- */}
                            {item.type === 'placeholder' ? (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '16px',
                                    border: '2px dashed #666',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#2a2a2a', // Solid dark gray
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                }}
                                    onClick={() => isActive && onNavigate('library')}
                                >
                                    <div style={{ fontSize: '4rem', fontWeight: '200' }}>+</div>
                                    <p style={{ fontSize: '1.2rem', fontWeight: '500', marginTop: '10px' }}>Adicionar Novo Livro</p>
                                </div>
                            ) : (
                                // DETAILED CARD (Matches User Image)
                                <div style={{
                                    display: 'flex',
                                    width: '100%',
                                    height: '100%',
                                    background: 'var(--color-bg-secondary)', // Should be solid
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    overflow: 'hidden',
                                    // Heavy shadow to stand out from any background
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
                                }}>
                                    {/* Left: Full Cover */}
                                    <div style={{
                                        width: '40%', // Slightly wider cover area
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
                                        background: 'var(--color-bg-secondary)' // Ensure solid fill
                                    }}>
                                        <h2 style={{
                                            fontSize: '2rem', // Large title like image
                                            fontWeight: '700',
                                            margin: '0 0 10px 0',
                                            color: 'var(--color-text-primary)',
                                            lineHeight: '1.2'
                                        }}>{item.title}</h2>

                                        <p style={{
                                            fontSize: '1.1rem',
                                            color: 'var(--color-accent)',
                                            marginBottom: '30px',
                                            fontWeight: '500'
                                        }}>por {item.author}</p>

                                        {/* Grid Stats */}
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

                                        {/* Progress Section */}
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
                                                        background: '#0070f3', // Bright Blue Button like reference
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

                                            {/* Progress Bar Line */}
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
