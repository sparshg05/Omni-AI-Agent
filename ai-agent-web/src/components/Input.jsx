import React, { useState } from 'react';

const Input = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="input-container">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your agent..."
                disabled={disabled}
                className={disabled ? 'disabled' : ''}
            />
            <button type="submit" disabled={disabled || !message.trim()}>
                {disabled ? 'Sending...' : 'Send'}
            </button>
        </form>
    );
};

export default Input;