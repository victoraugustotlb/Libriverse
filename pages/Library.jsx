const Library = ({ onNavigate, onOpenAddModal, books = [] }) => {
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
                            Você tem {books.length} {books.length === 1 ? 'livro' : 'livros'} na sua coleção
                        </p>
                    )}
                </div>
            </section>

            {books.length > 0 && (
                <section className="bookshelf-section">
                    <div className="container">
                        <div className="bookshelf-grid">
                            {books.map((book, index) => {
                                // Deterministic "random" size based on index
                                const sizes = ['small', 'medium', 'large'];
                                const size = sizes[index % 3];
                                return (
                                    <div key={book.id} className={`shelf-book ${size}`}>
                                        <div className="book-spine">
                                            {book.coverUrl ? (
                                                <img src={book.coverUrl} alt={book.title} className="spine-cover" />
                                            ) : (
                                                <div className="spine-placeholder">
                                                    <span>{book.title}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="shelf-book-info">
                                            <h3>{book.title}</h3>
                                            <p>{book.author}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Library;
