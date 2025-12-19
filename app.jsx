import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Library from './pages/Library.jsx';
import AddBookModal from './components/AddBookModal.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
    const [view, setView] = useState(() => {
        const savedUser = localStorage.getItem('libriverse_user');
        return savedUser ? 'library' : 'home';
    });
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('libriverse_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [userBooks, setUserBooks] = useState(() => {
        const savedBooks = localStorage.getItem('libriverse_library');
        return savedBooks ? JSON.parse(savedBooks) : [];
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const handleAddBook = (bookData) => {
        const newBook = {
            id: Date.now(),
            ...bookData,
            createdAt: new Date().toISOString()
        };
        const updatedBooks = [...userBooks, newBook];
        setUserBooks(updatedBooks);
        localStorage.setItem('libriverse_library', JSON.stringify(updatedBooks));
    };

    const handleDeleteBook = (bookId) => {
        const updatedBooks = userBooks.filter(book => book.id !== bookId);
        setUserBooks(updatedBooks);
        localStorage.setItem('libriverse_library', JSON.stringify(updatedBooks));
    };

    return (
        <div className="app">
            <Navbar
                onNavigate={handleNavigate}
                user={user}
                view={view}
                onOpenAddModal={() => setIsAddModalOpen(true)}
            />
            {view === 'home' && <Home onNavigate={handleNavigate} />}
            {view === 'login' && <Login onNavigate={handleNavigate} />}
            {view === 'register' && <Register onNavigate={handleNavigate} />}
            {view === 'library' && (
                <Library
                    onNavigate={handleNavigate}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    books={userBooks}
                    onDeleteBook={handleDeleteBook}
                />
            )}
            <Footer />

            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddBook={handleAddBook}
            />
        </div>
    );
};

export default App;
