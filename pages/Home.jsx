import React from 'react';
import Hero from '../components/Hero';
import BookCard from '../components/BookCard';
import { booksData } from '../data/books';

import backgroundImage from '../images/background.PNG';

const Home = ({ onNavigate }) => {
    return (
        <div style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100%'
        }}>
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
    );
};

export default Home;
