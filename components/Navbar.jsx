import React from 'react';

const Navbar = ({ onNavigate, user, view, onOpenAddModal }) => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <a
                    href="#"
                    className="navbar-logo"
                    onClick={(e) => { e.preventDefault(); onNavigate(user ? 'user-home' : 'home'); }}
                >
                    Libriverse
                </a>

                <ul className="navbar-links">
                    <li>
                        <a
                            href="#"
                            className="navbar-link"
                            onClick={(e) => { e.preventDefault(); onNavigate(user ? 'user-home' : 'home'); }}
                        >
                            Início
                        </a>
                    </li>
                    {view === 'library' && (
                        <li>
                            <a
                                href="#"
                                className="navbar-link highlight"
                                onClick={(e) => { e.preventDefault(); onOpenAddModal(); }}
                            >
                                Adicionar
                            </a>
                        </li>
                    )}
                    {user ? (
                        <>
                            <li><span className="navbar-user">Olá, {user.name}</span></li>
                            <li>
                                <a
                                    href="#"
                                    className="navbar-link"
                                    onClick={(e) => { e.preventDefault(); onNavigate('logout'); }}
                                >
                                    Sair
                                </a>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <a
                                    href="#"
                                    className="navbar-link"
                                    onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
                                >
                                    Login
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="navbar-link"
                                    onClick={(e) => { e.preventDefault(); onNavigate('register'); }}
                                >
                                    Sign Up
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
