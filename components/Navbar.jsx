import React from 'react';

const Navbar = ({ onNavigate }) => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <a
                    href="#"
                    className="navbar-logo"
                    onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
                >
                    Libriverse
                </a>

                <ul className="navbar-links">
                    <li>
                        <a
                            href="#"
                            className="navbar-link"
                            onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
                        >
                            Início
                        </a>
                    </li>
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
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
