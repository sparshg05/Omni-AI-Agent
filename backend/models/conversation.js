import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: String,
        required: true,
        enum: ['user', 'ai']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const conversationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    threadId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Index for text search functionality
conversationSchema.index({ '$**': 'text' }, { name: 'TextSearchIndex', weights: {
    title: 10,
    'messages.content': 5
}, default_language: 'none', language_override: 'none' });

// Pre-save middleware to update the updatedAt field
conversationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Method to add a new message to the conversation
conversationSchema.methods.addMessage = function(content, sender) {
    this.messages.push({
        content,
        sender,
        timestamp: new Date()
    });
    return this;
};

// Method to get conversation summary
conversationSchema.methods.getSummary = function() {
    const messageCount = this.messages.length;
    const lastMessage = this.messages[messageCount - 1];
    
    return {
        id: this._id,
        title: this.title,
        threadId: this.threadId,
        messageCount,
        lastMessage: lastMessage ? {
            content: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
            sender: lastMessage.sender,
            timestamp: lastMessage.timestamp
        } : null,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Static method to search conversations
conversationSchema.statics.searchConversations = async function(query, options = {}) {
    const {
        limit = 10,
        skip = 0,
        sortBy = 'updatedAt',
        sortOrder = -1
    } = options;

    const searchQuery = {
        isActive: true,
        $text: { $search: query }
    };

    return this.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, [sortBy]: sortOrder })
        .limit(limit)
        .skip(skip)
        .lean();
};

// Static method to get recent conversations
conversationSchema.statics.getRecentConversations = async function(options = {}) {
    const {
        limit = 20,
        skip = 0
    } = options;

    return this.find({ isActive: true })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;