import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AccountSettings from './pages/AccountSettings.jsx';
import Library from './pages/Library.jsx';
import UserHome from './pages/UserHome.jsx';
import TermsOfUse from './pages/TermsOfUse.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import AddBookModal from './components/AddBookModal.jsx';
import AddBookMethodModal from './components/AddBookMethodModal.jsx';
import SearchBookModal from './components/SearchBookModal.jsx';
import Loading from './components/Loading.jsx';
import Footer from './components/Footer.jsx';
import Notes from './pages/Notes.jsx';
import CreateNote from './pages/CreateNote.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const App = () => {
    const [view, setView] = useState(() => {
        const savedUser = localStorage.getItem('libriverse_user');
        return savedUser ? 'user-home' : 'home';
    });
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('libriverse_user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('libriverse_user');
            return null;
        }
    });

    const [userBooks, setUserBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start true for initial check/fetch
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [bookToEdit, setBookToEdit] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Theme Management
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('libriverse_theme');
            return savedTheme || 'system';
        } catch (error) {
            console.error("Error accessing localStorage for theme:", error);
            return 'system';
        }
    });

    useEffect(() => {
        const applyTheme = (targetTheme) => {
            const root = document.documentElement;
            let systemDark = false;
            try {
                if (window.matchMedia) {
                    systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
            } catch (e) {
                console.error("Error matching media:", e);
            }

            let effectiveTheme = targetTheme;
            if (targetTheme === 'system') {
                effectiveTheme = systemDark ? 'dark' : 'light';
            }

            root.setAttribute('data-theme', effectiveTheme);
            try {
                localStorage.setItem('libriverse_theme', targetTheme);
            } catch (e) {
                // ignore storage errors
            }
        };

        applyTheme(theme);

        // Listen for system changes if system mode is active
        if (theme === 'system' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    // Fetch books when user is logged in
    React.useEffect(() => {
        setIsLoading(true);
        if (user) {
            const fetchBooks = async () => {
                try {
                    const token = localStorage.getItem('libriverse_token');
                    const response = await fetch('/api/books', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data)) {
                            setUserBooks(data);
                        } else {
                            console.error('API returned non-array books data:', data);
                            setUserBooks([]);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch books:', error);
                } finally {
                    // Small artificial delay for a smoother feeling if it's too fast
                    setTimeout(() => setIsLoading(false), 800);
                }
            };
            fetchBooks();
        } else {
            setUserBooks([]);
            setIsLoading(false);
        }
    }, [user]);

    const handleNavigate = (newView) => {
        if (newView === 'logout') {
            localStorage.removeItem('libriverse_token');
            localStorage.removeItem('libriverse_user');
            setUser(null);
            setView('home');
            return;
        }

        // If coming from login, refresh user state
        if (view === 'login' || view === 'register') {
            const savedUser = localStorage.getItem('libriverse_user');
            if (savedUser) setUser(JSON.parse(savedUser));
        }

        // Helper to close all modals prevents them from persisting across views
        setIsAddModalOpen(false);
        setIsMethodModalOpen(false);
        setIsSearchModalOpen(false);
        setBookToEdit(null);

        setView(newView);
        window.scrollTo(0, 0);
    };

    const handleAddBook = async (bookData) => {
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookData)
            });

            if (response.ok) {
                const newBook = await response.json();
                setUserBooks([newBook, ...userBooks]);
            } else {
                alert('Erro ao adicionar livro.');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Erro de conexão.');
        }
    };

    const handleDeleteBook = async (bookId) => {
        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch(`/api/books?id=${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUserBooks(userBooks.filter(book => book.id !== bookId));
            } else {
                alert('Erro ao excluir livro.');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Erro de conexão.');
        }
    };

    const handleUpdateBook = async (bookId, updates) => {
        if (!bookId) {
            console.error("handleUpdateBook called without bookId");
            alert("Erro interno: ID do livro não encontrado.");
            return;
        }

        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch(`/api/books?id=${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const updatedBook = await response.json();
                setUserBooks(userBooks.map(b => b.id === bookId ? { ...b, ...updatedBook } : b));
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Erro ${response.status}: ${response.statusText}`;

                let debugInfo = '';
                if (errorData.debug) {
                    debugInfo = `\nDebug: Method=${errorData.debug.method}, URL=${errorData.debug.url}`;
                }

                alert(`Erro ao atualizar livro: ${errorMessage}${debugInfo}`);
            }
        } catch (error) {
            console.error('Error updating book:', error);
        }
    };

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const handleSwitchToSearch = (query) => {
        setIsAddModalOpen(false);
        setSearchQuery(query);
        setIsSearchModalOpen(true);
    };

    const [noteToEdit, setNoteToEdit] = useState(null);

    const handleEditNote = (note) => {
        setNoteToEdit(note);
        handleNavigate('create-note');
    };

    return (
        <div className="app">
            {isLoading && <Loading />}
            <Navbar
                onNavigate={handleNavigate}
                user={user}
                view={view}
                onOpenAddModal={() => setIsMethodModalOpen(true)}
                theme={theme}
                onUpdateTheme={setTheme}
            />
            {view === 'home' && <Home onNavigate={handleNavigate} />}
            {view === 'login' && <Login onNavigate={handleNavigate} />}
            {view === 'register' && <Register onNavigate={handleNavigate} />}
            {view === 'forgot-password' && <ForgotPassword onNavigate={handleNavigate} />}
            {view === 'account-settings' && (
                <AccountSettings
                    user={user}
                    onUpdateUser={handleUpdateUser}
                    onNavigate={handleNavigate}
                />
            )}
            {view === 'terms' && <TermsOfUse onNavigate={handleNavigate} />}
            {view === 'privacy' && <PrivacyPolicy onNavigate={handleNavigate} />}
            {view === 'user-home' && (
                <UserHome
                    user={user}
                    books={userBooks}
                    onNavigate={handleNavigate}
                    onUpdateBook={handleUpdateBook}
                    onDeleteBook={handleDeleteBook}
                    onOpenAddModal={() => setIsMethodModalOpen(true)}
                />
            )}
            {view === 'library' && (
                <Library
                    onNavigate={handleNavigate}
                    onOpenAddModal={() => setIsMethodModalOpen(true)}
                    books={userBooks}
                    onDeleteBook={handleDeleteBook}
                    onUpdateBook={handleUpdateBook}
                />
            )}

            {view === 'admin' && (
                <AdminDashboard
                    onNavigate={handleNavigate}
                />
            )}

            {view === 'notes' && (
                <Notes onNavigate={handleNavigate} onEditNote={handleEditNote} />
            )}

            {view === 'create-note' && (
                <CreateNote
                    onNavigate={handleNavigate}
                    books={userBooks}
                    noteToEdit={noteToEdit}
                    onClearEdit={() => setNoteToEdit(null)}
                />
            )}

            <Footer />

            <AddBookMethodModal
                isOpen={isMethodModalOpen}
                onClose={() => setIsMethodModalOpen(false)}
                onSelectManual={() => {
                    setBookToEdit(null); // Ensure fresh form
                    setIsAddModalOpen(true);
                }}
                onSelectSearch={() => setIsSearchModalOpen(true)}
            />

            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setBookToEdit(null); // Clear edit data on close
                }}
                onAddBook={handleAddBook}
                initialData={bookToEdit}
                onSwitchToSearch={handleSwitchToSearch}
            />

            <SearchBookModal
                isOpen={isSearchModalOpen}
                onClose={() => {
                    setIsSearchModalOpen(false);
                    setSearchQuery(''); // Clear query on close
                }}
                initialQuery={searchQuery}
                onSelectBook={(book) => {
                    setBookToEdit(book);
                    setIsSearchModalOpen(false);
                    setIsAddModalOpen(true);
                }}
            />
        </div>
    );
};

export default App;
