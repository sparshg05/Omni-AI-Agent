import React from 'react';

const Message = ({ content, timestamp, sender }) => {
    // Simple markdown parser for common elements
    const parseMarkdown = (text) => {
        if (!text) return '';

        let parsed = text;

        // Headers (##, ###)
        parsed = parsed.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        parsed = parsed.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        parsed = parsed.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold (**text**)
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic (*text*)
        parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code blocks (```code```)
        parsed = parsed.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        // Inline code (`code`)
        parsed = parsed.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

        // Links [text](url)
        parsed = parsed.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Line breaks (convert \n to <br> but preserve paragraph structure)
        parsed = parsed.replace(/\n\n/g, '</p><p>');
        parsed = parsed.replace(/\n/g, '<br>');

        // Wrap in paragraph tags
        if (!parsed.includes('<h1>') && !parsed.includes('<h2>') && !parsed.includes('<h3>')) {
            parsed = '<p>' + parsed + '</p>';
        }

        // Lists (- item or * item)
        parsed = parsed.replace(/^[\-\*] (.*$)/gim, '<li>$1</li>');
        parsed = parsed.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Numbered lists (1. item)
        parsed = parsed.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        return parsed;
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`message ${sender}`}>
            <div className="message-content">
                {sender === 'ai' ? (
                    <div 
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                    />
                ) : (
                    <p>{content}</p>
                )}
            </div>
            <span className="message-timestamp">
                {formatTimestamp(timestamp)}
            </span>
        </div>
    );
};

export default Message;