// ai-agent-web/src/components/Chat.jsx - FIXED
import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import Input from './Input';
import { sendMessage, startConversation } from '../api/Agent.jsx';
import { conversationApi } from '../api/Conversation';

const Chat = ({ 
    currentThreadId, 
    currentConversation, 
    onConversationUpdate,
    onLoadingChange,
    onError,
    onNewConversationCreated 
}) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Auto-scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
        });
    };

    // Scroll to bottom when messages change or loading state changes
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // FIXED: Load conversation when threadId changes
    useEffect(() => {
        if (currentThreadId) {
            loadConversation(currentThreadId);
        } else {
            // No conversation selected, show welcome screen
            setMessages([]);
        }
    }, [currentThreadId]);

    // Update loading state for parent component
    useEffect(() => {
        if (onLoadingChange) {
            onLoadingChange(loading || loadingConversation);
        }
    }, [loading, loadingConversation, onLoadingChange]);

    const loadConversation = async (threadId) => {
        try {
            setLoadingConversation(true);
            const response = await conversationApi.getConversation(threadId);
            const conversation = response.data;
            
            // Set messages from conversation
            setMessages(conversation.messages || []);
            
            // Update parent component with conversation details
            if (onConversationUpdate) {
                onConversationUpdate({
                    id: conversation.id,
                    title: conversation.title,
                    threadId: conversation.threadId,
                    messageCount: conversation.messageCount,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt
                });
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
            if (onError) {
                onError('Failed to load conversation');
            }
            setMessages([]);
        } finally {
            setLoadingConversation(false);
        }
    };

    const handleSendMessage = async (content) => {
        setLoading(true);

        try {
            if (!currentThreadId) {
                // FIXED: Start new conversation
                console.log("Starting new conversation with message:", content);
                
                // Add user message immediately for UI responsiveness
                const userMessage = {
                    content,
                    timestamp: new Date().toISOString(),
                    sender: 'user'
                };
                setMessages([userMessage]);

                const response = await startConversation(content);
                
                if (response.success) {
                    // Set all messages from response
                    setMessages(response.data.messages);
                    
                    // Notify parent about new conversation
                    if (onNewConversationCreated) {
                        onNewConversationCreated(response.data.threadId, response.data);
                    }
                    
                    // Update conversation details
                    if (onConversationUpdate) {
                        onConversationUpdate(response.data);
                    }
                } else {
                    throw new Error('Failed to start conversation');
                }
            } else {
                // FIXED: Continue existing conversation
                console.log("Sending message to existing conversation:", currentThreadId);
                
                // Add user message immediately
                const userMessage = {
                    content,
                    timestamp: new Date().toISOString(),
                    sender: 'user'
                };
                setMessages(prev => [...prev, userMessage]);

                const response = await sendMessage(content, currentThreadId);
                
                if (response.success) {
                    // Add AI response
                    const aiMessage = {
                        content: response.response,
                        timestamp: new Date().toISOString(),
                        sender: 'ai'
                    };
                    setMessages(prev => [...prev, aiMessage]);
                    
                    // Update conversation details
                    if (onConversationUpdate) {
                        onConversationUpdate({
                            messageCount: response.messageCount,
                            title: response.conversationTitle
                        });
                    }
                } else {
                    throw new Error(response.error || 'Failed to send message');
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Add error message
            const errorMessage = {
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
                sender: 'ai'
            };
            
            setMessages(prev => [...prev, errorMessage]);
            
            if (onError) {
                onError('Failed to send message. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Show loading state when loading conversation
    if (loadingConversation) {
        return (
            <div className="chat-container">
                <div className="messages-list">
                    <div className="loading-conversation">
                        <div className="loading-spinner"></div>
                        <p>Loading conversation...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <div className="messages-list" ref={messagesContainerRef}>
                {messages.length === 0 && !loading && (
                    <div className="welcome-message">
                        <h2>Welcome to your AI Agent!</h2>
                        <p>Start a conversation by typing a message below.</p>
                        {currentConversation && (
                            <div className="conversation-info">
                                <h3>{currentConversation.title}</h3>
                                <p>Conversation started on {new Date(currentConversation.createdAt).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <Message
                        key={`${msg.timestamp}-${index}`}
                        content={msg.content}
                        timestamp={msg.timestamp}
                        sender={msg.sender}
                    />
                ))}
                
                {loading && (
                    <div className="message ai loading-message">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p>AI is thinking...</p>
                    </div>
                )}
                
                {/* Invisible div to scroll to */}
                <div ref={messagesEndRef} />
            </div>
            
            <Input 
                onSendMessage={handleSendMessage} 
                disabled={loading || loadingConversation}
                placeholder={currentThreadId ? "Type your message..." : "Start a new conversation..."} 
            />
        </div>
    );
};

export default Chat;