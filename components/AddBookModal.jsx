import React, { useState } from 'react';

const AddBookModal = ({ isOpen, onClose, onAddBook }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddBook({ title, author, publisher, coverUrl });
        // Reset form and close
        setTitle('');
        setAuthor('');
        setPublisher('');
        setCoverUrl('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="login-card" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <div className="auth-header">
                    <h1 className="auth-title">Adicionar Livro</h1>
                    <p className="auth-subtitle">Preencha os detalhes do novo livro</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Nome do Livro</label>
                        <input
                            type="text"
                            id="title"
                            className="auth-input"
                            placeholder="Título do livro"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="author">Autor</label>
                        <input
                            type="text"
                            id="author"
                            className="auth-input"
                            placeholder="Nome do autor"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="publisher">Editora</label>
                        <input
                            type="text"
                            id="publisher"
                            className="auth-input"
                            placeholder="Nome da editora"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="coverUrl">Foto da Capa (URL opcional)</label>
                        <input
                            type="url"
                            id="coverUrl"
                            className="auth-input"
                            placeholder="https://exemplo.com/capa.jpg"
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        Adicionar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBookModal;
