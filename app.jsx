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


import { NotificationProvider, useNotification } from './context/NotificationContext';

const AppContent = () => {
    const { showNotification } = useNotification();
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
            // Priority: User Preference (if logged in) -> LocalStorage -> System
            // Note: User state might not be ready on initial render if just loaded from LS
            const savedUser = localStorage.getItem('libriverse_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                if (parsedUser.theme) return parsedUser.theme;
            }
            const savedTheme = localStorage.getItem('libriverse_theme');
            return savedTheme || 'system';
        } catch (error) {
            console.error("Error accessing localStorage for theme:", error);
            return 'system';
        }
    });

    const savePreferences = async (newPreferences) => {
        if (!user) return;

        try {
            const token = localStorage.getItem('libriverse_token');
            const response = await fetch('/api/auth/update-profile', { // Changed endpoint
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newPreferences)
            });

            if (response.ok) {
                const data = await response.json();
                // Update user state with new preferences
                // The endpoint now returns { user: ... }
                const updatedUser = { ...user, ...data.user };
                setUser(updatedUser);
                localStorage.setItem('libriverse_user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    };

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
                // Sync with backend if logged in and changed
                if (user && user.theme !== targetTheme) {
                    savePreferences({ theme: targetTheme });
                }
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
    }, [theme, user]); // Add user to dependency

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
                    if (response.status === 401) {
                        localStorage.removeItem('libriverse_token');
                        localStorage.removeItem('libriverse_user');
                        setUser(null);
                        setView('login');
                        showNotification("Sessão expirada ou inválida. Por favor, faça login novamente.", "error");
                        return;
                    }

                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data)) {
                            setUserBooks(data);
                        } else {
                            console.error('API returned non-array books data:', data);
                            setUserBooks([]);
                        }
                    } else {
                        // Attempt to read error message from JSON
                        let errorMsg = response.statusText;
                        try {
                            const errorData = await response.json();
                            if (errorData.error) errorMsg = errorData.error;
                        } catch (e) {
                            // If not JSON (e.g. HTML 404/500 page from Vercel), use text
                            const text = await response.text();
                            if (text.toLowerCase().includes('<!doctype html>')) {
                                errorMsg = "Erro de configuração: A API retornou HTML em vez de JSON. Verifique o vercel.json ou as variáveis de ambiente.";
                            }
                        }
                        console.error(`Fetch failed: ${response.status} ${errorMsg}`);
                        showNotification(`Erro ao carregar livros: ${errorMsg}`, "error");
                    }
                } catch (error) {
                    console.error('Failed to fetch books:', error);
                    showNotification(`Erro de conexão ao buscar livros: ${error.message}`, "error");
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
                showNotification('Livro adicionado com sucesso!', 'success');
            } else {
                showNotification('Erro ao adicionar livro.', 'error');
            }
        } catch (error) {
            console.error('Error adding book:', error);
            showNotification('Erro de conexão.', 'error');
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
                showNotification('Livro removido com sucesso!', 'success');
            } else {
                showNotification('Erro ao excluir livro.', 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            showNotification('Erro de conexão.', 'error');
        }
    };

    const handleUpdateBook = async (bookId, updates) => {
        if (!bookId) {
            console.error("handleUpdateBook called without bookId");
            showNotification("Erro interno: ID do livro não encontrado.", "error");
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
                showNotification('Livro atualizado com sucesso!', 'success');
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Erro ${response.status}: ${response.statusText}`;

                let debugInfo = '';
                if (errorData.debug) {
                    debugInfo = `\nDebug: Method=${errorData.debug.method}, URL=${errorData.debug.url}`;
                }

                showNotification(`Erro ao atualizar livro: ${errorMessage}`, "error");
            }
        } catch (error) {
            console.error('Error updating book:', error);
            showNotification('Erro de conexão ao atualizar.', 'error');
        }
    };

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        showNotification('Perfil atualizado com sucesso!', 'success');
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
                    user={user}
                    onUpdatePreference={savePreferences}
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

const App = () => {
    return (
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    );
};

export default App;
