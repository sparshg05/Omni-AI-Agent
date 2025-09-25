import express from 'express';
import { conversationController } from '../controllers/conversationController.js';

const router = express.Router();

// Get all conversations (with pagination)
router.get('/', conversationController.getConversations);

// Search conversations
router.get('/search', conversationController.searchConversations);

// Create new conversation
router.post('/', conversationController.createConversation);

// Get specific conversation by threadId
router.get('/:threadId', conversationController.getConversation);

// Update conversation title
router.put('/:threadId/title', conversationController.updateConversationTitle);

// Delete conversation (soft delete)
router.delete('/:threadId', conversationController.deleteConversation);

export default router;