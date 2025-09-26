import express, { json } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'dotenv';
import { MemorySaver } from '@langchain/langgraph';
import { ChatGroq } from '@langchain/groq';
import { MessagesAnnotation, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { TavilySearch } from '@langchain/tavily';
import { v4 as uuidv4 } from 'uuid';

// Import database and routes
import connectDB from './config/database.js';
import conversationRoutes from './routes/conversations.js';
import { conversationController } from './controllers/conversationController.js';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const checkpointer = new MemorySaver();

// Cross-Origin Isolation headers
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
}

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Conversation Routes
app.use('/api/conversations', conversationRoutes);

const webSearchTool = new TavilySearch({
    maxResults: 3,
    topic: "general",
});

const tools = [webSearchTool];
const toolNode = new ToolNode(tools);

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxRetries: 2,
}).bindTools(tools);


async function callModel(state) {
    try {
        console.log("Calling LLM...");
        const response = await llm.invoke(state.messages);
        // console.log("LLM response received");
        return { messages: [response] };
    } catch (error) {
        console.error("Error in callModel:", error);
        throw error;
    }
}

function shouldCall(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        console.log("Tool calls detected, routing to tools");
        return "tools";
    }
    console.log("No tool calls, ending conversation");
    return "__end__";
}


const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges('agent', shouldCall);

const appWorkflow = workflow.compile({ checkpointer });

// Enhanced message endpoint with MongoDB integration
app.post('/api/message', async (req, res) => {
    try {
        const { message, threadId: providedThreadId } = req.body;

        // Validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required and must be a non-empty string' 
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({ 
                error: 'Message too long. Maximum 10,000 characters allowed.' 
            });
        }

        // Generate or use provided threadId
        const threadId = providedThreadId || uuidv4();
        
        console.log("User input:", message);
        console.log("Thread ID:", threadId);

        // Save user message to database
        await conversationController.addMessage(threadId, message, 'user');

        // Process with AI workflow
        const finalState = await appWorkflow.invoke({
            messages: [{ role: "user", content: message }]
        }, { configurable: { thread_id: threadId } });

        const lastMessage = finalState.messages[finalState.messages.length - 1];

        if (!lastMessage || !lastMessage.content) {
            throw new Error('No response generated from AI');
        }

        console.log("AI response:", lastMessage.content);

        // Save AI response to database
        const updatedConversation = await conversationController.addMessage(
            threadId, 
            lastMessage.content, 
            'ai'
        );

        res.json({
            response: lastMessage.content,
            threadId: threadId,
            conversationId: updatedConversation._id,
            messageCount: updatedConversation.messages.length
        });
    }
    catch(error){
        console.error("Error processing message:", error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});


// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Custom AI Agent Backend',
        version: '2.0.0',
        features: ['MongoDB Integration', 'Conversation Management', 'Search', 'AI Chat'],
        endpoints: {
            chat: 'POST /api/message',
            conversations: 'GET /api/conversations',
            search: 'GET /api/conversations/search'
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



// import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
// import readline from "node:readline/promises";
// import { ChatGroq } from "@langchain/groq";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { TavilySearch } from "@langchain/tavily";
// import { MemorySaver } from "@langchain/langgraph";

// const checkpointer = new MemorySaver();     //Checkpointer stores the data in the key-value pair in memory with key as the "id" of the 
//                                             //current thread and value as the state at that point of execution       

// // 1. Define the node function
// // 2. Build the Graph
// // 3. Compile and invoke the graph


// const webSearchTool = new TavilySearch({
//     maxResults: 3,
//     topic:"general",
// });


// // Initialize tool node
// const tools = [webSearchTool]
// const toolNode = new ToolNode(tools);


// // Initialize the LLM

// const llm = new ChatGroq({
//   model: "openai/gpt-oss-120b",
//   temperature: 0,
//   maxRetries: 2,
// }).bindTools(tools);


// async function callModel(state){
//     console.log("Calling LLM...");
//     const response = await llm.invoke(state.messages);

//   // We return a list, because this will get added to the existing list
//     return { messages: [response] };
//     // return state;
// }


// function shouldCall(state){     //put your condition to call the tool or end
//     const lastMessage = state.messages[state.messages.length - 1];
//     if(lastMessage.tool_calls && lastMessage.tool_calls.length > 0){
//         return "tools";
//     }
//     return "__end__";
// }

// // Build the graph
// const workflow = new StateGraph(MessagesAnnotation)
// .addNode("agent",callModel)
// .addNode("tools",toolNode)
// .addEdge("__start__","agent")
// .addEdge("tools","agent")
// .addConditionalEdges('agent',shouldCall);   //Both the conditional edges i.e. agent-tool and agent-end are covered here

// // Compile the graph
// const app = workflow.compile({checkpointer});


// async function main() {
//     const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout });

//     while(true){
//         const userInput = await rl.question("User: ");
//         if(userInput === "exit"){
//             break;
//         }

//         const finalState = await app.invoke({
//             messages:[{role:"user",content:userInput}]
//         }, { configurable: { thread_id: "1"} });

//         // const finalState = await app.invoke(
//         //     { configurable: { thread_id: "1" } },   // picks up saved state
//         //     { messages: [{ role: "user", content: userInput }] }  // adds new message
//         // );

//         const lastMessage = finalState.messages[finalState.messages.length - 1];
//         // const lastMessage = finalState.values.messages.at(-1);
//         console.log("AI: ",lastMessage.content);

//     }

//     rl.close();
// }

// main();