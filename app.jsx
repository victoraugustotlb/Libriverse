import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/register.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
    const [view, setView] = useState('home');

    const handleNavigate = (newView) => {
        setView(newView);
        window.scrollTo(0, 0);
    };

    return (
        <div className="app">
            <Navbar onNavigate={handleNavigate} />
            {view === 'home' && <Home onNavigate={handleNavigate} />}
            {view === 'login' && <Login onNavigate={handleNavigate} />}
            {view === 'register' && <Register onNavigate={handleNavigate} />}
            <Footer />
        </div>
    );
};

export default App;
