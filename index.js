import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { ChatGroq } from "@langchain/groq";

// 1. Define the node function
// 2. Build the Graph
// 3. Compile and invoke the graph


// Initialize the LLM

const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 2,
});

async function callModel(state){
    console.log("Calling LLM...");
    const response = await llm.invoke(state.messages);

  // We return a list, because this will get added to the existing list
    return { messages: [response] };
    // return state;
}

// Build the graph
const workflow = new StateGraph(MessagesAnnotation)
.addNode("agent",callModel)
.addEdge("__start__","agent")
.addEdge("agent","__end__");

// Compile the graph
const app = workflow.compile();


async function main() {
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout });

    while(true){
        const userInput = await rl.question("User: ");
        // console.log(`Hello, ${name}!`);

        if(userInput === "exit"){
            break;
        }

        const finalState = await app.invoke({
            messages:[{role:"user",content:userInput}]
        });

        const lastMessage = finalState.messages[finalState.messages.length - 1];
        console.log("AI: ",lastMessage.content);

    }

    rl.close();
}

main();