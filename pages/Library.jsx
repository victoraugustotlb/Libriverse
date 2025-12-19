import React, { useState } from 'react';
import BookDetailsModal from '../components/BookDetailsModal';
import lombadaImg from '../images/lombada-final.png';
import bookshelfImg from '../images/estante.png';

const Library = ({ onNavigate, onOpenAddModal, books = [], onDeleteBook }) => {
    const safeBooks = Array.isArray(books) ? books : [];
    const [selectedBook, setSelectedBook] = useState(null);
    const sizes = ["small", "medium", "large", "xlarge"];

    // Group books into shelves of 15
    const shelves = [];
    for (let i = 0; i < safeBooks.length; i += 15) {
        shelves.push(safeBooks.slice(i, i + 15));
    }

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
                        {shelves.map((shelfBooks, shelfIndex) => (
                            <div
                                key={shelfIndex}
                                className="bookshelf-grid"
                                style={{ "--shelf-bg": `url("${bookshelfImg}")` }}
                            >
                                {shelfBooks.map((book) => {
                                    const deterministicIndex = book.id % 20;
                                    const size = sizes[deterministicIndex % sizes.length];

                                    return (
                                        <div
                                            key={book.id}
                                            className={`shelf-book ${size}`}
                                            style={{
                                                "--spine-bg": `url("${lombadaImg}")`
                                            }}
                                            data-tooltip={`${book.title} - ${book.author}`}
                                            onClick={() => setSelectedBook(book)}
                                        >
                                            <div className="book-spine">
                                                <div className="spine-placeholder">
                                                    <span className="spine-title">{book.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
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


