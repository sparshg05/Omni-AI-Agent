import React, { useState, useRef } from 'react';

const Input = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
            // Keep focus on input for better UX
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
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
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
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