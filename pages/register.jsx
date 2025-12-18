import React from "react";

function register() {
    return (
        <div style={styles.container}>
            <h1>Minha Página em React</h1>
            <p>Essa é uma página simples criada com React.</p>
            <button onClick={() => alert("Você clicou no botão!")}>
                Clique aqui
            </button>
        </div>
    );
}

const styles = {
    container: {
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        marginTop: "50px"
    }
};

export default register;
