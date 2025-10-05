# Omni AI Agent Documentation

## Project Description
An autonomous conversational AI agent powered by LangGraph that uses multiple tools (Tavily for web search, TMDB for movies) to intelligently assist users through multi-step reasoning and adaptive decision-making.

## Tech Stack
Runtime: Bun - A fast all-in-one JavaScript runtime  
Core Libraries:  
@langchain/core - Core LangChain functionality  
@langchain/groq - GROQ integration for LLM  
@langchain/langgraph - Graph-based workflow management  
@langchain/tavily - Web search integration

## Features Implemented
1. Interactive Chat Interface  
• Command-line based interactive chat system  
• Clean exit functionality with "exit" command  

2. Web Search Integration  
• Tavily search tool integration  
• Maximum 3 search results per query  
• General topic search configuration  

3. State Management  
• Memory-based state persistence using MemorySaver  
• Thread-based conversation tracking  

4. Graph-based Workflow  
• State graph implementation for message flow  
• Conditional routing between agent and tools  
• Node-based architecture for modularity  

## How to Test the Project
1. Prerequisites-  
//Install Bun if not already installed  
curl -fsSL https://bun.sh/install | bash  


2. Project Setup-  
//Clone the repository  
git clone <repository-url>  
cd custom-ai-agent

  //Install dependencies  
  bun install  


4. Environment Setup  
Create a .env file with necessary API keys:  
GROQ_API_KEY=your_groq_api_key  
TAVILY_API_KEY=your_tavily_api_key  


5. Running the Application  
bun run index.js  

6. Testing the Chat  
Start typing messages after the "User:" prompt  
Ask questions that might require web searches  
Type "exit" to end the session  


## Project Structure
custom-ai-agent/  
├── index.js        # Main application file  
├── package.json    # Project dependencies  
├── .env           # Environment variables (not in repo)  
└── README.md      # Project documentation
