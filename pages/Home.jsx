import React from 'react';
import Hero from '../components/Hero';
import BookCard from '../components/BookCard';
import { booksData } from '../data/books';

import backgroundImage from '../images/background_high_res.png';

const Home = ({ onNavigate }) => {
    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden'
        }}>
            {/* Background Image Layer */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: '800px', // Smaller size for tiling to make shelves realistic size
                backgroundRepeat: 'repeat',
                backgroundPosition: 'center',
                zIndex: -1
            }} />


            {/* Overlay Layer for Readability */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.7)', // Dark overlay
                backdropFilter: 'blur(1px)', // Reduced blur as requested
                zIndex: -1
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <Hero onNavigate={onNavigate} />

                <section className="books-section">
                    <div className="container">
                        <h2 className="section-title" style={{
                            color: '#fff',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>Livros em Destaque</h2>
                        <div className="books-grid">
                            {booksData.map(book => (
                                <BookCard key={book.id} book={book} />
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div >
    );
};

export default Home;
