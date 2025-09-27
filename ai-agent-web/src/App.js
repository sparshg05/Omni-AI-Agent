// ai-agent-web/src/App.js - FIXED Sidebar Logic
import React, { useState, useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import Chat from './components/Chat';
import ConversationSidebar from './components/ConversationSideBar';
import './App.css';

function App() {
    // Theme management
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage first, then system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    
    // FIXED: Sidebar state management - start closed by default
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Current conversation state
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const [currentConversation, setCurrentConversation] = useState(null);
    
    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Theme effect
    useEffect(() => {
        // Apply theme class to document
        if (isDarkMode) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
        
        // Save theme preference to localStorage
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // FIXED: Responsive sidebar effect - only auto-open on desktop if user manually opened it
    useEffect(() => {
        const handleResize = () => {
            // On mobile, always close sidebar
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
            // On desktop, keep current state (don't force open)
        };

        // Set initial state based on screen size
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Keyboard shortcuts effect
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Toggle sidebar with Ctrl/Cmd + B
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
            
            // Toggle theme with Ctrl/Cmd + Shift + T
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                toggleTheme();
            }
            
            // New conversation with Ctrl/Cmd + N
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                handleNewConversation();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Theme toggle handler
    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    // FIXED: Sidebar toggle handler
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    // Conversation selection handler
    const handleConversationSelect = (threadId, conversation = null) => {
        setCurrentThreadId(threadId);
        setCurrentConversation(conversation);
        setError(null); // Clear any existing errors
        
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // New conversation handler
    const handleNewConversation = (threadId = null) => {
        setCurrentThreadId(threadId);
        setCurrentConversation(null);
        setError(null); // Clear any existing errors
        
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // Conversation update handler
    const handleConversationUpdate = (conversationData) => {
        try {
            // Update current conversation data when new messages are added
            if (conversationData.threadId && !currentThreadId) {
                setCurrentThreadId(conversationData.threadId);
            }
            
            if (conversationData.title || conversationData.createdAt) {
                setCurrentConversation(prev => ({
                    ...prev,
                    ...conversationData
                }));
            }
            
            // Clear any existing errors on successful update
            setError(null);
        } catch (err) {
            console.error('Error updating conversation:', err);
            setError('Failed to update conversation');
        }
    };

    // Error dismissal handler
    const dismissError = () => {
        setError(null);
    };

    // Loading state handler
    const handleLoadingChange = (loading) => {
        setIsLoading(loading);
    };

    // FIXED: Determine when to show with-sidebar class
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
                
                {/* Main Content Area - FIXED: Use correct condition */}
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
                                    <div className="conversation-meta-header">
                                        {currentConversation.messageCount > 0 && (
                                            <span className="message-count">
                                                {currentConversation.messageCount} messages
                                            </span>
                                        )}
                                    </div>
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
                        />
                    </main>
                </div>
            </div>
        </ChatProvider>
    );
}

export default App;