import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
const apiClient = axios.create({
    baseURL: API_URL,
    // timeout: 30000, // 30 seconds timeout for AI responses
    headers: {
        'Content-Type': 'application/json',
    },
});

export const sendMessage = async (message) => {
    try {
        const response = await apiClient.post('/message', { message });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
