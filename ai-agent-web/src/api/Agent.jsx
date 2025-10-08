// ai-agent-web/src/api/Agent.jsx - FIXED
import axios from 'axios';

const API_URL = 'https://omni-ai-agent-backend.onrender.com/api';

// Configure axios defaults
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// FIXED: Send message to existing conversation
export const sendMessage = async (message, threadId) => {
    try {
        if (!threadId) {
            throw new Error('ThreadId is required to send a message');
        }

        const response = await apiClient.post('/message', {
            message,
            threadId
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// FIXED: Start a new conversation with first message
export const startConversation = async (message) => {
    try {
        const response = await apiClient.post('/conversations/start', {
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error starting conversation:', error);
        throw error;
    }
};