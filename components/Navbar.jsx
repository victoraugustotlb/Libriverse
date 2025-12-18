import React from 'react';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <a href="#" className="navbar-logo">Libriverse</a>

                <ul className="navbar-links">
                    <li><a href="#" className="navbar-link">Início</a></li>
                    <li><a href="#" className="navbar-link">Login</a></li>
                    <li><a href="#" className="navbar-link">Sign Up</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
