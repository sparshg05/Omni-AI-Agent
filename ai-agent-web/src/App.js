import React from 'react';
import { ChatProvider } from './context/ChatContext';
import Chat from './components/Chat';
import './App.css';

function App() {
    return (
        <ChatProvider>
            <div className="App">
                <header className="App-header">
                    <h1>Your own custom AI agent</h1>
                </header>
                <main>
                    <Chat />
                </main>
            </div>
        </ChatProvider>
    );
}

export default App;