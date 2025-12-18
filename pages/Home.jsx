import React from 'react';
import Hero from '../components/Hero';
import BookCard from '../components/BookCard';
import { booksData } from '../data/books';

const Home = ({ onNavigate }) => {
    return (
        <div>
            <Hero onNavigate={onNavigate} />

            <section className="books-section">
                <div className="container">
                    <h2 className="section-title">Livros em Destaque</h2>
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
