import { ChatGroq } from '@langchain/groq';

const titleGeneratorLLM = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.3,
    maxRetries: 2,
});

export const generateConversationTitle = async (firstMessage) => {
    try {
        // If message is too short, create a simple title
        if (firstMessage.length < 10) {
            return `Chat - ${new Date().toLocaleDateString()}`;
        }

        // Truncate message if too long
        const messagePreview = firstMessage.length > 200 
            ? firstMessage.substring(0, 200) + '...' 
            : firstMessage;

        const prompt = `Based on this user message, generate a concise title (maximum 6 words) for a conversation. The title should capture the main topic or intent. 

User message: "${messagePreview}"

Title:`;

        const response = await titleGeneratorLLM.invoke(prompt);
        
        let title = response.content.trim();
        
        // Clean up the title
        title = title.replace(/^["']|["']$/g, ''); // Remove quotes
        title = title.replace(/^Title:\s*/i, ''); // Remove "Title:" prefix
        
        // Ensure title is not too long
        if (title.length > 50) {
            title = title.substring(0, 47) + '...';
        }
        
        // If title generation failed or is empty, use fallback
        if (!title || title.length < 3) {
            title = `Chat - ${new Date().toLocaleDateString()}`;
        }
        
        return title;
        
    } catch (error) {
        console.error('Error generating conversation title:', error);
        // Fallback title
        return `Chat - ${new Date().toLocaleDateString()}`;
    }
};

export const generateTitleFromKeywords = (message) => {
    // Fallback method for title generation using keywords
    const words = message.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(' ')
        .filter(word => word.length > 3)
        .slice(0, 4);
    
    if (words.length === 0) {
        return `Chat - ${new Date().toLocaleDateString()}`;
    }
    
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};