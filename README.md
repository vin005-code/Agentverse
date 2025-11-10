# 🤖 Agentverse

Agentverse is a sleek, futuristic web application for creating, managing, and interacting with autonomous AI agents. Powered by the Google Gemini API, it allows users to define a high-level goal, and an AI planner will generate a complete, actionable task list. Users can then track progress, execute tasks, and chat with their personalized AI agent in an immersive, cyber-security-themed interface.

## ✨ Key Features

-   **AI-Powered Plan Generation**: Describe your goal, and Agentverse uses the Gemini API to generate a structured plan with a name, description, and a detailed list of actionable tasks.
-   **Dynamic Agent Dashboard**: View all your agents at a glance. See their status, progress, and priority in a futuristic, animated grid.
-   **Interactive Workspace**: Dive into an agent's dedicated workspace to view its task plan and interact with it through a real-time chat interface.
-   **Persistent State**: Your agents are automatically saved to your browser's local storage, so your progress is always there when you return.
-   **Immersive Cyber-Security UI/UX**:
    -   A dark-themed, animated background with glowing scan lines and circuit patterns.
    -   Interactive elements that lift and glow on hover with a 3D effect.
    -   A custom-designed AI logo that reinforces the app's high-tech identity.
    -   Dynamic "shatter and collapse" animations for a satisfying user experience.

## 🛠️ Tech Stack

-   **Frontend**:
    -   [React](https://reactjs.org/) (with TypeScript)
    -   [Tailwind CSS](https://tailwindcss.com/) for styling
    -   [Lucide React](https://lucide.dev/) for icons
-   **AI & API**:
    -   [Google Gemini API](https://ai.google.dev/gemini-api)
        -   `gemini-2.5-pro` for complex plan generation with JSON schema.
        -   `gemini-2.5-flash` for fast and efficient conversational chat.

## 🚀 Getting Started

To run Agentverse locally, follow these steps:

### Prerequisites

-   An environment where you can access the web application.
-   A Google Gemini API key.

### Setup

1.  **Set up your Environment Variable:**
    This project requires a Google Gemini API key. You will need to configure your development environment so that the key is available as `process.env.API_KEY`.

    *Note: The code directly accesses `process.env.API_KEY`. Ensure this variable is properly configured in your build/runtime environment.*

2.  **Run the application:**
    Once the environment is set up, open the `index.html` file in your browser to start the application.

## 📂 Project Structure

The project is organized into several key directories:

```
/
├── src/
│   ├── components/      # Reusable React components (Dashboard, Workspace, Wizard, etc.)
│   ├── hooks/           # Custom React hooks (useLocalStorage)
│   ├── services/        # API interaction logic (geminiService.ts)
│   ├── types.ts         # All TypeScript type definitions
│   ├── App.tsx          # Main application component, state management, and logic
│   └── index.tsx        # React application entry point
├── index.html           # Main HTML file with global styles and animations
└── README.md            # You are here!
```

## ⚙️ How It Works

### Agent Creation
1.  The user opens the **Wizard View** and inputs their goal, deadline, and other constraints.
2.  On submission, the `generateAgentPlan` function in `geminiService.ts` is called.
3.  It constructs a detailed prompt and sends it to the `gemini-2.5-pro` model, specifying a strict JSON schema for the response.
4.  The AI returns a structured JSON object containing the agent's name, description, and a list of tasks.
5.  A new `Agent` object is created in `App.tsx` and added to the application's state, which is then persisted to `localStorage`.

### Agent Interaction
1.  In the **Workspace View**, the user can see the agent's task list and chat history.
2.  Tasks can be manually marked as "completed" by clicking the "Execute" button or the circular icon. This updates the agent's state, recalculates its progress, and adds a confirmation message to the chat.
3.  When a user sends a message, the `getAgentResponse` function is called. It sends the current chat history and a system instruction to the `gemini-2.5-flash` model to get a natural, conversational response.

## 🔮 Future Improvements

-   **Backend Integration**: Develop a full backend with a database (e.g., MongoDB, PostgreSQL) to enable user accounts and persistent agent storage across devices.
-   **True Function Calling**: Implement robust function calling to allow the AI to reliably perform actions like marking tasks complete, modifying the plan, or sending emails.
-   **Tool Integration**: Connect agents to real-world tools like Google Calendar, Gmail, or task management apps to execute their plans autonomously.
-   **Long-Term Memory**: Implement a more sophisticated memory system (e.g., using vector databases) to allow agents to learn and retain information over time.
