import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Library from './pages/Library.jsx';
import AddBookModal from './components/AddBookModal.jsx';
import AddBookMethodModal from './components/AddBookMethodModal.jsx';
import SearchBookModal from './components/SearchBookModal.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
    const [view, setView] = useState(() => {
        const savedUser = localStorage.getItem('libriverse_user');
        return savedUser ? 'library' : 'home';
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Fetch books when user is logged in
    React.useEffect(() => {
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
                }
            };
            fetchBooks();
        } else {
            setUserBooks([]);
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
            const response = await fetch(`/api/books/${bookId}`, {
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

    return (
        <div className="app">
            <Navbar
                onNavigate={handleNavigate}
                user={user}
                view={view}
                onOpenAddModal={() => setIsMethodModalOpen(true)}
            />
            {view === 'home' && <Home onNavigate={handleNavigate} />}
            {view === 'login' && <Login onNavigate={handleNavigate} />}
            {view === 'register' && <Register onNavigate={handleNavigate} />}
            {view === 'library' && (
                <Library
                    onNavigate={handleNavigate}
                    onOpenAddModal={() => setIsMethodModalOpen(true)}
                    books={userBooks}
                    onDeleteBook={handleDeleteBook}
                />
            )}
            <Footer />

            <AddBookMethodModal
                isOpen={isMethodModalOpen}
                onClose={() => setIsMethodModalOpen(false)}
                onSelectManual={() => setIsAddModalOpen(true)}
                onSelectSearch={() => setIsSearchModalOpen(true)}
            />

            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddBook={handleAddBook}
            />

            <SearchBookModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onAddBook={handleAddBook}
            />
        </div>
    );
};

export default App;
