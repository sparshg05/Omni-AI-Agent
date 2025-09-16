import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();     //Checkpointer stores the data in the key-value pair in memory with key as the "id" of the 
                                            //current thread and value as the state at that point of execution       

// 1. Define the node function
// 2. Build the Graph
// 3. Compile and invoke the graph


const webSearchTool = new TavilySearch({
    maxResults: 3,
    topic:"general",
});


// Initialize tool node
const tools = [webSearchTool]
const toolNode = new ToolNode(tools);


// Initialize the LLM

const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools);


async function callModel(state){
    console.log("Calling LLM...");
    const response = await llm.invoke(state.messages);

  // We return a list, because this will get added to the existing list
    return { messages: [response] };
    // return state;
}


function shouldCall(state){     //put your condition to call the tool or end
    const lastMessage = state.messages[state.messages.length - 1];
    if(lastMessage.tool_calls && lastMessage.tool_calls.length > 0){
        return "tools";
    }
    return "__end__";
}

// Build the graph
const workflow = new StateGraph(MessagesAnnotation)
.addNode("agent",callModel)
.addNode("tools",toolNode)
.addEdge("__start__","agent")
.addEdge("tools","agent")
.addConditionalEdges('agent',shouldCall);   //Both the conditional edges i.e. agent-tool and agent-end are covered here

// Compile the graph
const app = workflow.compile({checkpointer});


async function main() {
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout });

    while(true){
        const userInput = await rl.question("User: ");
        if(userInput === "exit"){
            break;
        }

        const finalState = await app.invoke({
            messages:[{role:"user",content:userInput}]
        }, { configurable: { thread_id: "1"} });

        // const finalState = await app.invoke(
        //     { configurable: { thread_id: "1" } },   // picks up saved state
        //     { messages: [{ role: "user", content: userInput }] }  // adds new message
        // );

        const lastMessage = finalState.messages[finalState.messages.length - 1];
        // const lastMessage = finalState.values.messages.at(-1);
        console.log("AI: ",lastMessage.content);

    }

    rl.close();
}

main();