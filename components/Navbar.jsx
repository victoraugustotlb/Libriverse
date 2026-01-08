import React, { useState, useRef, useEffect } from 'react';

const Navbar = ({ onNavigate, user, view, onOpenAddModal, theme, onUpdateTheme }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    // Close mobile menu when navigating
    const handleNavigate = (page) => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
    };

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <a
                    href="#"
                    className="navbar-logo"
                    onClick={(e) => { e.preventDefault(); handleNavigate(user ? 'user-home' : 'home'); }}
                >
                    Libriverse
                </a>

                <button
                    className="navbar-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                    <li>
                        <a
                            href="#"
                            className="navbar-link"
                            onClick={(e) => { e.preventDefault(); handleNavigate(user ? 'user-home' : 'home'); }}
                        >
                            Início
                        </a>
                    </li>
                    {user && (
                        <li>
                            <a
                                href="#"
                                className="navbar-link"
                                onClick={(e) => { e.preventDefault(); handleNavigate('notes'); }}
                            >
                                Anotações
                            </a>
                        </li>
                    )}
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
                        <li className="user-dropdown-container" ref={dropdownRef}>
                            <div
                                className="user-dropdown-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="user-avatar">
                                    {getInitials(user.name)}
                                </div>
                            </div>

                            <div className={`dropdown-menu ${isDropdownOpen ? 'active' : ''}`}>
                                <div className="dropdown-header">
                                    <div className="user-name-display">{user.name}</div>
                                    <div className="user-email-display">{user.email || 'user@libriverse.com'}</div>
                                </div>

                                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavigate('user-home'); setIsDropdownOpen(false); }}>
                                    <div className="dropdown-item-content">Dashboard</div>
                                </a>

                                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavigate('account-settings'); setIsDropdownOpen(false); }}>
                                    <div className="dropdown-item-content">Account Settings</div>
                                </a>




                                <div className="dropdown-divider"></div>


                                <div className="dropdown-item theme-toggle-row">
                                    <div className="dropdown-item-content">Theme</div>
                                    <div className="theme-options">
                                        <div
                                            className={`theme-option-btn ${theme === 'system' ? 'active' : ''}`}
                                            title="System"
                                            onClick={(e) => { e.stopPropagation(); onUpdateTheme('system'); }}
                                        >🖥️</div>
                                        <div
                                            className={`theme-option-btn ${theme === 'light' ? 'active' : ''}`}
                                            title="Light"
                                            onClick={(e) => { e.stopPropagation(); onUpdateTheme('light'); }}
                                        >☀️</div>
                                        <div
                                            className={`theme-option-btn ${theme === 'dark' ? 'active' : ''}`}
                                            title="Dark"
                                            onClick={(e) => { e.stopPropagation(); onUpdateTheme('dark'); }}
                                        >🌙</div>
                                    </div>
                                </div>

                                <div className="dropdown-divider"></div>

                                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavigate('home'); setIsDropdownOpen(false); }}>
                                    <div className="dropdown-item-content">Home Page</div>
                                    <span className="kbd-shortcut">⌂</span>
                                </a>

                                <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavigate('logout'); }}>
                                    <div className="dropdown-item-content">Log Out</div>
                                    <span className="kbd-shortcut">→</span>
                                </a>

                                <div className="dropdown-divider"></div>

                                <button className="upgrade-btn">Upgrade to Pro</button>
                            </div>
                        </li>
                    ) : (
                        <>
                            <li>
                                <a
                                    href="#"
                                    className="navbar-link"
                                    onClick={(e) => { e.preventDefault(); handleNavigate('login'); }}
                                >
                                    Login
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="navbar-link"
                                    onClick={(e) => { e.preventDefault(); handleNavigate('register'); }}
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
