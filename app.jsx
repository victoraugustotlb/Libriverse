import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Footer from './components/Footer';

const App = () => {
    const [view, setView] = useState('home');

    const handleNavigate = (newView) => {
        setView(newView);
        window.scrollTo(0, 0);
    };

    return (
        <div className="app">
            <Navbar onNavigate={handleNavigate} />
            {view === 'home' ? <Home onNavigate={handleNavigate} /> : <Login onNavigate={handleNavigate} />}
            <Footer />
        </div>
    );
};

export default App;
