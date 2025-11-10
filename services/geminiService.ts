import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Agent, AgentPlan, UserProfile, WizardData, Message } from '../types';

// Fix: Initialize the GoogleGenAI client.
// Per guidelines, the API key must be obtained from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Define the JSON schema for the agent plan to ensure structured output from the model.
const agentPlanSchema = {
  type: Type.OBJECT,
  properties: {
    agent_name: { type: Type.STRING, description: "A creative and short name for the agent." },
    description: { type: Type.STRING, description: "A one-sentence summary of the agent's purpose." },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A short, actionable title for the task." },
          description: { type: Type.STRING, description: "A detailed description of what needs to be done." },
          priority: { type: Type.INTEGER, description: "Priority from 1 (lowest) to 5 (highest)." },
          duration_mins: { type: Type.INTEGER, description: "Estimated time in minutes to complete the task." },
          due: { type: Type.STRING, description: "The due date in YYYY-MM-DD format, or null if there is no specific due date." },
          action_type: { type: Type.STRING, enum: ['calendar_event', 'task', 'reminder', 'email'], description: "The type of action this task represents." },
        },
        required: ['title', 'description', 'priority', 'duration_mins', 'due', 'action_type'],
      },
    },
    confidence: { type: Type.NUMBER, description: "A confidence score (0.0-1.0) for the plan's success." },
    explanation: { type: Type.STRING, description: "A brief explanation of the plan's strategy." },
    suggested_integrations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of suggested tool integrations like 'Google Calendar' or 'Gmail'."
    },
  },
  required: ['agent_name', 'description', 'tasks', 'confidence', 'explanation', 'suggested_integrations'],
};


// Fix: Implement the function to generate an agent plan using the Gemini API.
export const generateAgentPlan = async (wizardData: WizardData, userProfile: UserProfile): Promise<AgentPlan> => {
  const { goal, deadline, dailyHours, priority } = wizardData;

  const prompt = `
    You are an expert AI agent planner. Your task is to create a detailed, actionable plan for an AI agent based on a user's goal.

    **User Profile:**
    - Name: ${userProfile.name}
    - Timezone: ${userProfile.timezone}
    - Preferences: 
        - Communication Tone: ${userProfile.preferences.tone}
        - Work Hours: ${userProfile.preferences.work_hours.start} - ${userProfile.preferences.work_hours.end}

    **Agent Mission:**
    - **Primary Goal:** ${goal}
    ${deadline ? `- **Deadline:** ${deadline}` : ''}
    ${dailyHours ? `- **Approx. Daily Commitment:** ${dailyHours} hours` : ''}
    ${priority ? `- **Priority Level:** ${priority}` : ''}

    **Instructions:**
    1.  **Agent Name & Description:** Create a concise, inspiring name and a one-sentence description for the agent that reflects its goal.
    2.  **Task Breakdown:** Decompose the primary goal into a series of smaller, concrete tasks. Each task must be actionable.
        -   Provide a clear 'title' and a detailed 'description'.
        -   Assign a 'priority' from 1 (lowest) to 5 (highest).
        -   Estimate the 'duration_mins' required to complete the task.
        -   Set a 'due' date (YYYY-MM-DD format). If a specific date isn't applicable, return null. The overall deadline is ${deadline}. All due dates must be on or before the deadline.
        -   Specify the 'action_type': 'calendar_event', 'task', 'reminder', or 'email'.
    3.  **Confidence Score:** Provide a confidence score (0.0 to 1.0) on how likely the plan is to succeed given the constraints.
    4.  **Explanation:** Briefly explain the reasoning behind your proposed plan and task structure.
    5.  **Suggested Integrations:** List any external services (e.g., 'Google Calendar', 'Gmail', 'Todoist') that might be useful for this agent. An empty array is acceptable.

    Respond with a JSON object that strictly adheres to the provided schema. Do not include any markdown formatting or introductory text.
    `;

  try {
    // Per guidelines, use gemini-2.5-pro for complex text tasks.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: agentPlanSchema,
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as AgentPlan;
    return plan;
  } catch (error) {
    console.error("Error generating agent plan:", error);
    throw new Error("Failed to generate a plan from the AI. Please try refining your goal.");
  }
};

// Fix: Implement the function to get a chat response from an agent using the Gemini API.
export const getAgentResponse = async (agent: Agent, userInput: string): Promise<string> => {
    // Construct a concise history, prioritizing recent messages.
    const history = agent.chat.slice(-10).map((m: Message) => {
        return {
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        };
    });

    const systemInstruction = `You are the AI agent "${agent.name}". Your goal is: "${agent.goal}".
Your personality should be helpful and proactive.
Keep your responses concise and focused on the user's request.
Refer to the task plan to understand your current objectives.

Current Task Plan:
${agent.tasks.map(t => `- ${t.title} (Status: ${t.status})`).join('\n')}`;

    try {
        const chat: Chat = ai.chats.create({
            // Per guidelines, use gemini-2.5-flash for basic text tasks like chat.
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemInstruction,
            },
            // The history property is not available on `ai.chats.create`
            // Instead, we pass history through messages sent.
        });
        
        // Pass history as part of the conversation turns
        for (const message of history) {
            await chat.sendMessage({ message: message.parts[0].text });
        }

        const response = await chat.sendMessage({ message: userInput });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting agent response:", error);
        throw new Error("The AI is currently unavailable. Please try again later.");
    }
};
