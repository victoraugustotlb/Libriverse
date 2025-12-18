import React from 'react';

const Hero = ({ onNavigate }) => {
    return (
        <section className="hero">
            <div className="container">
                <h1 className="hero-title">Sua Biblioteca Virtual</h1>
                <p className="hero-subtitle">
                    Explore milhares de livros e descubra sua próxima grande leitura
                </p>
                <button
                    className="hero-cta"
                    onClick={() => onNavigate('login')}
                >
                    Crie agora a sua conta
                </button>
            </div>
        </section>
    );
};

export default Hero;
