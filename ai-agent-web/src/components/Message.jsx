import React from 'react';

const Message = ({ content, timestamp, sender }) => {
    return (
        <div className={`message ${sender}`}>
            <p>{content}</p>
            <span>{new Date(timestamp).toLocaleString()}</span>
        </div>
    );
};

export default Message;