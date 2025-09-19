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

// export const getMessages = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/messages`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching messages:', error);
//         throw error;
//     }
// };