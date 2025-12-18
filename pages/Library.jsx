import React, { useState } from 'react';
import AddBookModal from '../components/AddBookModal';

const Library = ({ onNavigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="library-page">
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Sua Biblioteca</h1>
                    <p className="hero-subtitle">Não há nenhum livro em sua biblioteca</p>
                    <button
                        className="hero-cta"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Adicionar agora
                    </button>
                </div>
            </section>

            <AddBookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Library;
