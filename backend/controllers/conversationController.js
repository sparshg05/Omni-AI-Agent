import Conversation from '../models/conversation.js';
import { generateConversationTitle } from '../utils/titleGenerator.js';
import { v4 as uuidv4 } from 'uuid';

export const conversationController = {
    // Create a new conversation
    createConversation: async (req, res) => {
        try {
            const { title } = req.body;
            const threadId = uuidv4();

            const conversation = new Conversation({
                title: title || 'New Conversation',
                threadId,
                messages: []
            });

            await conversation.save();

            res.status(201).json({
                success: true,
                data: conversation.getSummary()
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create conversation'
            });
        }
    },

    // Get all conversations (with pagination)
    getConversations: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const conversations = await Conversation.getRecentConversations({
                limit,
                skip
            });

            const total = await Conversation.countDocuments({ isActive: true });

            res.json({
                success: true,
                data: conversations.map(conv => ({
                    id: conv._id,
                    title: conv.title,
                    threadId: conv.threadId,
                    messageCount: conv.messages.length,
                    lastMessage: conv.messages.length > 0 ? {
                        content: conv.messages[conv.messages.length - 1].content.substring(0, 100) + 
                                (conv.messages[conv.messages.length - 1].content.length > 100 ? '...' : ''),
                        sender: conv.messages[conv.messages.length - 1].sender,
                        timestamp: conv.messages[conv.messages.length - 1].timestamp
                    } : null,
                    createdAt: conv.createdAt,
                    updatedAt: conv.updatedAt
                })),
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    count: conversations.length,
                    totalRecords: total
                }
            });
        } catch (error) {
            console.error('Error fetching conversations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversations'
            });
        }
    },

    // Get a specific conversation by threadId
    getConversation: async (req, res) => {
        try {
            const { threadId } = req.params;

            const conversation = await Conversation.findOne({
                threadId,
                isActive: true
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }

            res.json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error('Error fetching conversation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversation'
            });
        }
    },

    // Add message to conversation
    addMessage: async (threadId, message, sender) => {
        try {
            let conversation = await Conversation.findOne({ threadId });

            if (!conversation) {
                // Create new conversation if it doesn't exist
                const title = await generateConversationTitle(message);
                conversation = new Conversation({
                    title,
                    threadId,
                    messages: []
                });
            }

            conversation.addMessage(message, sender);
            await conversation.save();

            return conversation;
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    },

    // Search conversations
    searchConversations: async (req, res) => {
        try {
            const { q: query } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            if (!query || query.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }

            const conversations = await Conversation.searchConversations(query, {
                limit,
                skip
            });

            const searchResults = conversations.map(conv => ({
                id: conv._id,
                title: conv.title,
                threadId: conv.threadId,
                messageCount: conv.messages.length,
                score: conv.score,
                lastMessage: conv.messages.length > 0 ? {
                    content: conv.messages[conv.messages.length - 1].content.substring(0, 150) + 
                            (conv.messages[conv.messages.length - 1].content.length > 150 ? '...' : ''),
                    sender: conv.messages[conv.messages.length - 1].sender,
                    timestamp: conv.messages[conv.messages.length - 1].timestamp
                } : null,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            }));

            res.json({
                success: true,
                data: searchResults,
                query,
                pagination: {
                    current: page,
                    count: searchResults.length
                }
            });
        } catch (error) {
            console.error('Error searching conversations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to search conversations'
            });
        }
    },

    // Update conversation title
    updateConversationTitle: async (req, res) => {
        try {
            const { threadId } = req.params;
            const { title } = req.body;

            if (!title || title.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Title is required'
                });
            }

            const conversation = await Conversation.findOneAndUpdate(
                { threadId, isActive: true },
                { title: title.trim() },
                { new: true }
            );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }

            res.json({
                success: true,
                data: conversation.getSummary()
            });
        } catch (error) {
            console.error('Error updating conversation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update conversation'
            });
        }
    },

    // Delete conversation (soft delete)
    deleteConversation: async (req, res) => {
        try {
            const { threadId } = req.params;

            const conversation = await Conversation.findOneAndUpdate(
                { threadId, isActive: true },
                { isActive: false },
                { new: true }
            );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found'
                });
            }

            res.json({
                success: true,
                message: 'Conversation deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete conversation'
            });
        }
    }
};