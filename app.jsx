import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('libriverse_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

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

    return (
        <div className="app">
            <Navbar onNavigate={handleNavigate} user={user} />
            {view === 'home' && <Home onNavigate={handleNavigate} />}
            {view === 'login' && <Login onNavigate={handleNavigate} />}
            {view === 'register' && <Register onNavigate={handleNavigate} />}
            <Footer />
        </div>
    );
};

export default App;
