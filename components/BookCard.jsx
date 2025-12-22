import React from 'react';

const BookCard = ({ book }) => {
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
        return stars;
    };

    return (
        <div className="book-card">
            <img
                src={book.cover}
                alt={book.title}
                className="book-cover"
            />
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <div className="book-rating">
                    <span className="stars">{renderStars(book.rating)}</span>
                    <span>{book.rating}</span>
                </div>
                {book.createdAt && (
                    <p className="book-date" style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                        Adicionado em: {new Date(book.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BookCard;
