import React, { useState } from 'react';
import Message from './Message';
import Input from './Input';
import { sendMessage } from '../api/Agent.jsx';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (content) => {
        // Add user message immediately
        const userMessage = {
            content,
            timestamp: new Date().toISOString(),
            sender: 'user'
        };
        
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            console.log("Sending message:", content);
            const response = await sendMessage(content);
            
            // Add AI response
            const aiMessage = {
                content: response.response,
                timestamp: new Date().toISOString(),
                sender: 'ai'
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            
            // Add error message
            const errorMessage = {
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
                sender: 'ai'
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <Message
                        key={index}
                        content={msg.content}
                        timestamp={msg.timestamp}
                        sender={msg.sender}
                    />
                ))}
                {loading && (
                    <div className="message ai">
                        <p>AI is thinking...</p>
                    </div>
                )}
            </div>
            <Input onSendMessage={handleSendMessage} disabled={loading} />
        </div>
    );
};

export default Chat;