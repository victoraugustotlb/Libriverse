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
            height: '550px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible', // Allow overlap logic to work visually
            margin: '20px 0'
        }}>
            {/* Prev Button */}
            <button onClick={handlePrev} style={{
                position: 'absolute',
                left: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 200, // Above everything
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}>&#8249;</button>

            {/* Next Button */}
            <button onClick={handleNext} style={{
                position: 'absolute',
                right: '0',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 200,
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}>&#8250;</button>

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

                    // Optimization: Hide items far away
                    if (Math.abs(offset) > 2) return null;

                    // --- STACKED LOGIC ---
                    const ACTIVE_WIDTH = 800; // Width of the main card
                    // Use a smaller translation step so they overlap
                    // If offsets are -1, 0, 1
                    // 0 is at center 0px.
                    // -1 should be left.
                    // 1 should be right.

                    let translateX = 0;
                    let rotateY = 0;

                    // We want neighbors to peek out from behind.
                    // Active card half width is 400.
                    // If we move neighbors by 300px, they will overlap by 100px (assuming neighbor width ~220).
                    // Actually neighbor is much smaller.

                    if (offset === 0) {
                        translateX = 0;
                        rotateY = 0;
                    } else if (offset > 0) {
                        translateX = 360 + (offset * 40); // 360px right, then stack closely
                        rotateY = -5; // Slight angle inward
                    } else {
                        translateX = -360 + (offset * 40);
                        rotateY = 5;
                    }

                    const scale = isActive ? 1 : 0.85;
                    const opacity = isActive ? 1 : 0.4;
                    const zIndex = 100 - Math.abs(offset);
                    const blur = isActive ? '0' : '2px';

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isActive && setActiveIndex(index)}
                            style={{
                                position: 'absolute',
                                width: isActive ? `${ACTIVE_WIDTH}px` : '240px',
                                height: '380px',
                                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                transform: `translateX(${translateX}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
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
                                // Placeholder (Active or Inactive)
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '16px',
                                    border: '2px dashed rgba(255,255,255,0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.02)',
                                    color: 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer'
                                }}
                                    onClick={() => isActive && onNavigate('library')}
                                >
                                    <div style={{ fontSize: '3rem', fontWeight: '200' }}>+</div>
                                    <p>Adicionar</p>
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
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    {/* Left: Cover */}
                                    <div style={{
                                        width: '35%',
                                        background: '#111',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRight: '1px solid rgba(255,255,255,0.05)'
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

                                    {/* Right: Info */}
                                    <div style={{
                                        width: '65%',
                                        padding: '30px 40px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        textAlign: 'left'
                                    }}>
                                        <h2 style={{
                                            fontSize: '2.2rem',
                                            margin: '0 0 10px 0',
                                            color: 'var(--color-text-primary)'
                                        }}>{item.title}</h2>

                                        <p style={{
                                            fontSize: '1.2rem',
                                            color: 'var(--color-accent)',
                                            marginBottom: '25px'
                                        }}>por <span style={{ fontWeight: 600 }}>{item.author}</span></p>

                                        {/* Metadata Mini-Grid */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(4, 1fr)',
                                            gap: '15px',
                                            marginBottom: '30px',
                                            borderTop: '1px solid rgba(255,255,255,0.1)',
                                            paddingTop: '20px'
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6 }}>Editora</p>
                                                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.publisher || '-'}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6 }}>Paginas</p>
                                                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.pageCount || '-'}</p>
                                            </div>
                                            {/* Add more interactive buttons or mini stats here? */}
                                        </div>

                                        {/* Progress Control */}
                                        <div style={{
                                            background: 'var(--color-bg-tertiary)',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Atualizar Progresso</p>
                                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Atualmente na pág. {item.currentPage}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input
                                                    type="number"
                                                    value={pageInput}
                                                    onChange={(e) => setPageInput(e.target.value)}
                                                    style={{
                                                        width: '70px',
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        background: 'var(--color-bg-primary)',
                                                        color: 'white',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => handlePageUpdate(e, item)}
                                                    style={{
                                                        background: 'var(--color-accent)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0 20px',
                                                        borderRadius: '6px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // INACTIVE NEIGHBOR (Cover Only)
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
                                    {/* Overlay */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
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
