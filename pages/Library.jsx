import React, { useState } from 'react';
import BookDetailsModal from '../components/BookDetailsModal';

const Library = ({ onNavigate, onOpenAddModal, books = [], onDeleteBook }) => {
    const [selectedBook, setSelectedBook] = useState(null);
    const spineColors = ["#ff3b30", "#ff9500", "#ffcc00", "#4cd964", "#007aff", "#5856d6", "#ff2d55"]; const sizes = ["small", "medium", "large", "xlarge"]; const shelves = []; for (let i = 0; i < books.length; i += 15) { shelves.push(books.slice(i, i + 15)); }

    return (
        <div className="library-page">
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Sua Biblioteca</h1>
                    {books.length === 0 ? (
                        <>
                            <p className="hero-subtitle">Não há nenhum livro em sua biblioteca</p>
                            <button
                                className="hero-cta"
                                onClick={() => onOpenAddModal()}
                            >
                                Adicionar agora
                            </button>
                        </>
                    ) : (
                        <p className="hero-subtitle">
                            Explore sua coleção pessoal de {books.length} {books.length === 1 ? 'livro' : 'livros'}
                        </p>
                    )}
                </div>
            </section>

            {books.length > 0 && (
                <section className="bookshelf-section">
                    <div className="container bookshelf-container">
                        <div className="bookshelf-grid">
                            {shelves.map((shelfBooks, shelfIndex) => (<div key={shelfIndex} className="bookshelf-grid">{shelfBooks.map((book) => {const deterministicIndex = book.id % 20; const size = sizes[deterministicIndex % sizes.length]; const bgColor = spineColors[deterministicIndex % spineColors.length]; return (<div key={book.id} className={`shelf-book ${size}`} style={{ "--spine-color": bgColor }} data-tooltip={`${book.title} - ${book.author}`} onClick={() => setSelectedBook(book)}><div className="book-spine">{book.coverUrl ? (<img src={book.coverUrl} alt={book.title} className="spine-cover" />) : (<div className="spine-placeholder"><span className="spine-title">{book.title}</span></div>)}</div></div>);})}</div>))}
                        </div>
                    </div>
                </section>
            )}

            <BookDetailsModal
                book={selectedBook}
                isOpen={!!selectedBook}
                onClose={() => setSelectedBook(null)}
                onDelete={onDeleteBook}
            />
        </div>
    );
};

export default Library;


