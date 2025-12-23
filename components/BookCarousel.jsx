import React, { useRef } from 'react';

const BookCarousel = ({ books, onSelectBook, onNavigate }) => {
    const scrollContainerRef = useRef(null);

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="book-carousel-wrapper" style={{ position: 'relative', width: '100%', padding: '20px 0' }}>
            {/* Controls - visible on hover or always if preferred */}
            <button
                onClick={() => handleScroll('left')}
                style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                }}
            >
                &#8249;
            </button>

            <button
                onClick={() => handleScroll('right')}
                style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                }}
            >
                &#8250;
            </button>

            <div
                ref={scrollContainerRef}
                className="book-carousel"
                style={{
                    display: 'flex',
                    gap: '30px',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    padding: '20px 50px', // Extra padding for start/end
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE/Edge
                    alignItems: 'center'
                }}
            >
                {/* Hide scrollbar for Webkit */}
                <style>{`
                    .book-carousel::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {books.map((book) => (
                    <div
                        key={book.id}
                        onClick={() => onSelectBook(book)}
                        style={{
                            flex: '0 0 auto',
                            scrollSnapAlign: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                            e.currentTarget.style.zIndex = 100;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1) translateY(0)';
                            e.currentTarget.style.zIndex = 1;
                        }}
                    >
                        <div style={{
                            width: '180px',
                            height: '270px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                            position: 'relative',
                            background: '#2a2a2a' // Fallback
                        }}>
                            {book.coverUrl ? (
                                <img
                                    src={book.coverUrl}
                                    alt={book.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px',
                                    textAlign: 'center',
                                    background: 'linear-gradient(135deg, #444 0%, #222 100%)',
                                    color: 'rgba(255,255,255,0.7)'
                                }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{book.title}</span>
                                </div>
                            )}

                            {/* Optional: subtle glass effect on bottom for title/progress */}
                            {/* Keeping it clean for now as per "visual only" request */}
                        </div>
                    </div>
                ))}

                {/* Add Button as a "Book" */}
                <div
                    onClick={() => onNavigate('library')}
                    style={{
                        flex: '0 0 auto',
                        scrollSnapAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    }}
                >
                    <div style={{
                        width: '180px',
                        height: '270px',
                        borderRadius: '8px',
                        border: '2px dashed rgba(255,255,255,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        color: 'rgba(255,255,255,0.6)',
                        transition: 'all 0.2s'
                    }}>
                        <span style={{ fontSize: '3rem', fontWeight: '200', lineHeight: 1, marginBottom: '10px' }}>+</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookCarousel;
