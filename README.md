# Omni AI Agent Documentation

## 🌟 Overview
Omni is not just another chatbot—it's an autonomous AI agent that can:  

🔍 Search the web in real-time using Tavily API  
🎬 Provide movie recommendations using TMDB API  
🧠 Make intelligent decisions about which tools to use  
🔗 Chain multiple tools together for complex queries  
💾 Maintain persistent conversation history  
🔄 Adapt its strategy based on results  

What Makes It Special?  
Unlike traditional chatbots that simply respond to questions, Omni uses LangGraph's ReAct pattern to:  

1. Reason about the user's query  
2. Decide which tools to use autonomously  
3. Act by calling appropriate APIs  
4. Observe the results  
5. Repeat if more information is needed  

This creates a truly autonomous agent that can handle complex, multi-step tasks without hardcoded logic.  

## ✨ Key Features
🤖 **Autonomous Tool Selection**  
• AI automatically decides which tool to use based on query intent  
• No hardcoded if-else logic—pure emergent behavior from LLM reasoning  
• Supports chaining multiple tools for complex queries  

🔍 **Web Search Integration (Tavily)**  
• Real-time web search capabilities  
• Retrieves up to 3 relevant results per query  
• Provides sourced, up-to-date information  

🎬 **Movie Intelligence (TMDB)**  
7 specialized movie tools:  
• Search movies by title  
• Get detailed movie information (cast, crew, budget, ratings)  
• Browse popular movies  
• Discover top-rated films  
• See trending movies (daily/weekly)  
• Get personalized recommendations  
• Explore movies by genre  

💬 **Conversation Management**  
• Persistent conversation threads using MongoDB  
• Auto-generated conversation titles using AI  
• Full conversation history with search functionality  
• Edit, delete, and organize conversations  
• Load previous conversations seamlessly  

🎨 **Modern UI/UX**  
• Responsive React frontend with dark/light themes  
• Smooth animations and loading states  
• Mobile-friendly design  
• Collapsible sidebar for conversation management  
• Real-time typing indicators  


## 🛠️ Tech Stack
**Frontend—**  
React 19.1.1 - UI framework  
Axios - HTTP client  
CSS3 - Styling with custom properties  
React Context - State management  

**Backend—**  
Node.js / Bun - JavaScript runtime  
Express 5.1.0 - Web framework  
MongoDB 8.1.0 - Database  
Mongoose - ODM for MongoDB  

**AI/ML Stack—**  
LangChain Core 0.3.75 - LLM orchestration  
LangGraph 0.4.9 - Agent workflow management  
ChatGroq - LLM provider (openai/gpt-oss-120b)  
Tavily 0.1.5 - Web search tool  
Zod - Schema validation  

**External APIs—**  
Tavily Search API - Real-time web search  
TMDB API - Movie database (1M+ movies)  
GROQ API - Language model inference  

## Agent Decision Flow
User Query: "What are trending sci-fi movies and why are they popular?"
     │  
     ▼  
┌─────────────────────────────────────────────┐  
│  LLM Reasoning (ChatGroq)                   │  
│  - Analyzes query intent                    │  
│  - Identifies needed tools                  │  
│  - Plans multi-step approach                │  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
┌─────────────────────────────────────────────┐  
│  Tool Call 1: get_trending_movies           │  
│  Params: { timeWindow: "week" }             │  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
┌─────────────────────────────────────────────┐  
│  TMDB API Response                          │  
│  Returns: [Movie1, Movie2, Movie3...]       │  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
┌─────────────────────────────────────────────┐  
│  LLM Reasoning (Evaluates Results)          │  
│  - Got trending movies ✓                    │  
│  - Need sci-fi filter ✓                     │  
│  - Need explanation ("why popular") ✓       │  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
┌─────────────────────────────────────────────┐  
│  Tool Call 2: web_search                    │  
│  Query: "why are sci-fi movies popular 2025"│  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
┌─────────────────────────────────────────────┐  
│  Tavily API Response                        │  
│  Returns: [Article1, Article2, Article3]    │  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
┌─────────────────────────────────────────────┐  
│  LLM Final Response                         │  
│  - Filters sci-fi from trending             │  
│  - Explains popularity from web search      │  
│  - Formats natural response                 │  
└─────────────────┬───────────────────────────┘  
                  │  
                  ▼  
            User Response  


## How to Test the Project
**1. Clone the Repository:-**  
git clone https://github.com/yourusername/omni-ai-agent.git  
cd omni-ai-agent  


**2. Backend Setup:-**  
// Navigate to backend directory  
cd custom-ai-agent  

// Install dependencies (choose one)  
npm install  
// OR  
bun install  

// Create environment file  
cp .env.example .env  

// Edit .env with your API keys  
nano .env  # or use any text editor  


**Required Environment Variables:**  
// MongoDB
MONGODB_URI=your_mongodburi_key

// API Keys  
GROQ_API_KEY=your_groq_api_key_here  
TAVILY_API_KEY=your_tavily_api_key_here  
TMDB_API_KEY=your_tmdb_api_key_here  


**3. Frontend Setup:-**  
// Navigate to frontend directory  
cd ../ai-agent-web  

// Install dependencies  
npm install  

// Start development server  
npm start  

**4. Start Backend Server:-**
// In backend directory (backend)  
npm start  
// OR
bun run index.js   


## Project Structure
custom-ai-agent/  
├── index.js        # Main application file  
├── package.json    # Project dependencies  
├── .env           # Environment variables (not in repo)  
└── README.md      # Project documentation


![langgraph_visualization](https://github.com/user-attachments/assets/7f81ba4e-afd9-438b-bd70-84b6c9357d02)
