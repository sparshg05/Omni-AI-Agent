// ai-agent-web/src/components/ConversationSidebar.jsx
import React, { useState, useEffect } from 'react';
import { conversationApi } from '../api/Conversation';
import './ConversationSidebar.css';

const ConversationSidebar = ({ 
    currentThreadId, 
    onConversationSelect, 
    onNewConversation,
    isOpen,
    onToggle 
}) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Load conversations on component mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Search with debounce
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [searchQuery]);

    const loadConversations = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await conversationApi.getConversations(pageNum, 20);
            
            if (append) {
                setConversations(prev => [...prev, ...response.data]);
            } else {
                setConversations(response.data);
            }
            
            setHasMore(response.pagination.current < response.pagination.total);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            loadConversations(page + 1, true);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            setIsSearching(true);
            const response = await conversationApi.searchConversations(searchQuery);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleNewConversation = async () => {
        try {
            const response = await conversationApi.createConversation();
            const newConversation = response.data;
            
            // Add to the top of the conversations list
            setConversations(prev => [newConversation, ...prev]);
            
            // Select the new conversation
            if (onNewConversation) {
                onNewConversation(newConversation.threadId);
            }
        } catch (error) {
            console.error('Failed to create new conversation:', error);
        }
    };

    const handleConversationClick = (conversation) => {
        if (onConversationSelect) {
            onConversationSelect(conversation.threadId, conversation);
        }
    };

    const handleEditTitle = (conversation) => {
        setEditingId(conversation.id);
        setEditingTitle(conversation.title);
    };

    const handleSaveTitle = async (threadId) => {
        if (!editingTitle.trim()) return;
        
        try {
            await conversationApi.updateConversationTitle(threadId, editingTitle);
            
            // Update local state
            setConversations(prev => 
                prev.map(conv => 
                    conv.threadId === threadId 
                        ? { ...conv, title: editingTitle }
                        : conv
                )
            );
            
            setEditingId(null);
            setEditingTitle('');
        } catch (error) {
            console.error('Failed to update title:', error);
        }
    };

    const handleDeleteConversation = async (threadId, event) => {
        event.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this conversation?')) {
            return;
        }
        
        try {
            await conversationApi.deleteConversation(threadId);
            
            // Remove from local state
            setConversations(prev => 
                prev.filter(conv => conv.threadId !== threadId)
            );
            setSearchResults(prev => 
                prev.filter(conv => conv.threadId !== threadId)
            );
            
            // If this was the current conversation, clear selection
            if (currentThreadId === threadId && onConversationSelect) {
                onConversationSelect(null);
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffInHours < 7 * 24) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const displayConversations = searchQuery.trim() ? searchResults : conversations;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
            
            <div className={`conversation-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={handleNewConversation}>
                        <span className="new-chat-icon">+</span>
                        New Chat
                    </button>
                    
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {isSearching && <div className="search-spinner">⏳</div>}
                    </div>
                </div>

                <div className="conversations-list">
                    {displayConversations.length === 0 ? (
                        <div className="empty-state">
                            {searchQuery.trim() ? (
                                <p>No conversations found for "{searchQuery}"</p>
                            ) : (
                                <p>No conversations yet. Start a new chat!</p>
                            )}
                        </div>
                    ) : (
                        displayConversations.map((conversation) => (
                            <div
                                key={conversation.threadId}
                                className={`conversation-item ${
                                    currentThreadId === conversation.threadId ? 'active' : ''
                                }`}
                                onClick={() => handleConversationClick(conversation)}
                            >
                                <div className="conversation-content">
                                    {editingId === conversation.id ? (
                                        <input
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            onBlur={() => handleSaveTitle(conversation.threadId)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveTitle(conversation.threadId);
                                                }
                                            }}
                                            className="title-edit-input"
                                            autoFocus
                                        />
                                    ) : (
                                        <h4 className="conversation-title">
                                            {conversation.title}
                                        </h4>
                                    )}
                                    
                                    {conversation.lastMessage && (
                                        <p className="last-message">
                                            {conversation.lastMessage.content}
                                        </p>
                                    )}
                                    
                                    <div className="conversation-meta">
                                        <span className="message-count">
                                            {conversation.messageCount} messages
                                        </span>
                                        <span className="conversation-date">
                                            {formatDate(conversation.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="conversation-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditTitle(conversation);
                                        }}
                                        title="Edit title"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDeleteConversation(conversation.threadId, e)}
                                        title="Delete conversation"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {!searchQuery.trim() && hasMore && (
                        <button 
                            className="load-more-btn"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default ConversationSidebar;