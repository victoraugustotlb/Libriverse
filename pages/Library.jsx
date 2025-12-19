const Library = ({ onNavigate, onOpenAddModal }) => {
    return (
        <div className="library-page">
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Sua Biblioteca</h1>
                    <p className="hero-subtitle">Não há nenhum livro em sua biblioteca</p>
                    <button
                        className="hero-cta"
                        onClick={() => onOpenAddModal()}
                    >
                        Adicionar agora
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Library;
