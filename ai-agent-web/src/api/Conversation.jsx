// ai-agent-web/src/api/conversationApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configure axios defaults
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const conversationApi = {
    // Get all conversations with pagination
    getConversations: async (page = 1, limit = 20) => {
        try {
            const response = await apiClient.get('/conversations', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    },

    // Get a specific conversation
    getConversation: async (threadId) => {
        try {
            const response = await apiClient.get(`/conversations/${threadId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw error;
        }
    },

    // Create a new conversation
    createConversation: async (title = null) => {
        try {
            const response = await apiClient.post('/conversations', {
                title: title || `New Chat - ${new Date().toLocaleDateString()}`
            });
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    },

    // Search conversations
    searchConversations: async (query, page = 1, limit = 10) => {
        try {
            const response = await apiClient.get('/conversations/search', {
                params: { q: query, page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching conversations:', error);
            throw error;
        }
    },

    // Update conversation title
    updateConversationTitle: async (threadId, title) => {
        try {
            const response = await apiClient.put(`/conversations/${threadId}/title`, {
                title
            });
            return response.data;
        } catch (error) {
            console.error('Error updating conversation title:', error);
            throw error;
        }
    },

    // Delete conversation
    deleteConversation: async (threadId) => {
        try {
            const response = await apiClient.delete(`/conversations/${threadId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    }
};