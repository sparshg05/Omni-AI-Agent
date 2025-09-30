// ai-agent-web/src/App.js - FIXED Complete Implementation
import React, { useState, useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import Chat from './components/Chat';
import ConversationSidebar from './components/ConversationSideBar';
import './App.css';

function App() {
    // Theme management
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    
    // Sidebar state management
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // FIXED: Current conversation state
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const [currentConversation, setCurrentConversation] = useState(null);
    
    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Theme effect
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Responsive sidebar effect
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        };

        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Keyboard shortcuts effect
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                toggleTheme();
            }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                handleNewConversation();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // FIXED: Conversation selection handler
    const handleConversationSelect = (threadId, conversation = null) => {
        console.log('Selecting conversation:', threadId, conversation);
        setCurrentThreadId(threadId);
        setCurrentConversation(conversation);
        setError(null);
        
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // FIXED: New conversation handler - just clear current selection
    const handleNewConversation = () => {
        console.log('Starting new conversation');
        setCurrentThreadId(null);
        setCurrentConversation(null);
        setError(null);
        
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // FIXED: Handle when a new conversation is actually created
    const handleNewConversationCreated = (threadId, conversationData) => {
        console.log('New conversation created:', threadId, conversationData);
        setCurrentThreadId(threadId);
        setCurrentConversation(conversationData);
        
        // Refresh sidebar to show new conversation
        // The sidebar will automatically refresh when it detects the new conversation
    };

    // Conversation update handler
    const handleConversationUpdate = (conversationData) => {
        try {
            setCurrentConversation(prev => ({
                ...prev,
                ...conversationData
            }));
            setError(null);
        } catch (err) {
            console.error('Error updating conversation:', err);
            setError('Failed to update conversation');
        }
    };

    const dismissError = () => {
        setError(null);
    };

    const handleLoadingChange = (loading) => {
        setIsLoading(loading);
    };

    const shouldShowWithSidebar = isSidebarOpen && window.innerWidth >= 1024;

    return (
        <ChatProvider>
            <div className="App">
                {/* Error notification */}
                {error && (
                    <div className="error-notification">
                        <span>{error}</span>
                        <button onClick={dismissError} aria-label="Dismiss error">×</button>
                    </div>
                )}

                {/* Conversation Sidebar */}
                <ConversationSidebar
                    currentThreadId={currentThreadId}
                    onConversationSelect={handleConversationSelect}
                    onNewConversation={handleNewConversation}
                    isOpen={isSidebarOpen}
                    onToggle={toggleSidebar}
                    onError={setError}
                />
                
                {/* Main Content Area */}
                <div className={`main-content ${shouldShowWithSidebar ? 'with-sidebar' : ''}`}>
                    {/* Header */}
                    <header className="App-header">
                        <div className="header-left">
                            <button 
                                className="sidebar-toggle"
                                onClick={toggleSidebar}
                                aria-label={`${isSidebarOpen ? 'Close' : 'Open'} sidebar`}
                                title={`Toggle sidebar (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+B)`}
                            >
                                <span className={`hamburger ${isSidebarOpen ? 'active' : ''}`}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                            
                            <h1>Your own custom AI agent</h1>
                        </div>
                        
                        <div className="header-right">
                            {/* Current conversation info */}
                            {currentConversation && (
                                <div className="current-conversation-info">
                                    <div className="conversation-title-header">
                                        {currentConversation.title}
                                    </div>
                                    {/* <div className="conversation-meta-header">
                                        {currentConversation.messageCount > 0 && (
                                            <span className="message-count">
                                                {currentConversation.messageCount} messages
                                            </span>
                                        )}
                                    </div> */}
                                </div>
                            )}
                            
                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="header-loading">
                                    <div className="loading-spinner-small"></div>
                                </div>
                            )}
                            
                            {/* Theme toggle */}
                            <button 
                                className="theme-toggle"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                                title={`Toggle theme (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Shift+T)`}
                            >
                                <span className="theme-icon">
                                    {isDarkMode ? '☀️' : '🌙'}
                                </span>
                            </button>
                        </div>
                    </header>
                    
                    {/* Main Chat Area */}
                    <main className="main-chat-area">
                        <Chat 
                            currentThreadId={currentThreadId}
                            currentConversation={currentConversation}
                            onConversationUpdate={handleConversationUpdate}
                            onLoadingChange={handleLoadingChange}
                            onError={setError}
                            onNewConversationCreated={handleNewConversationCreated}
                        />
                    </main>
                </div>
            </div>
        </ChatProvider>
    );
}

export default App;