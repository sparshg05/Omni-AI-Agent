import React, { useState, useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import Chat from './components/Chat';
import './App.css';

function App() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Apply theme class to document
        if (isDarkMode) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ChatProvider>
            <div className="App">
                <header className="App-header">
                    <h1>Your own custom AI agent</h1>
                    <button 
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </header>
                <main>
                    <Chat />
                </main>
            </div>
        </ChatProvider>
    );
}

export default App;