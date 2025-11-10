import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Agent, Task, UserProfile, WizardData, Message } from './types';
import Dashboard from './components/Dashboard';
import WorkspaceView from './components/WorkspaceView';
import WizardView from './components/WizardView';
import * as geminiService from './services/geminiService';

// Fix: Implement the main App component to manage state and render the UI.
const MOCK_USER_PROFILE: UserProfile = {
  name: 'Alex',
  timezone: 'America/Los_Angeles',
  preferences: {
    tone: 'friendly and professional',
    work_hours: { start: '09:00', end: '17:00' },
  },
};

function App() {
  const [agents, setAgents] = useLocalStorage<Agent[]>('agents', []);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  useEffect(() => {
    if (agents.length === 0) {
      setShowWizard(true);
    }
  }, [agents.length]);

  const handleCreateAgent = async (wizardData: WizardData) => {
    setIsGeneratingPlan(true);
    setWizardError(null);
    try {
      const plan = await geminiService.generateAgentPlan(wizardData, MOCK_USER_PROFILE);
      const newAgent: Agent = {
        id: crypto.randomUUID(),
        name: plan.agent_name,
        description: plan.description,
        goal: wizardData.goal!,
        status: 'active',
        created_at: new Date().toISOString(),
        deadline: wizardData.deadline || null,
        priority: wizardData.priority || 'medium',
        tasks: plan.tasks.map((task) => ({
          ...task,
          id: crypto.randomUUID(),
          status: 'pending',
          created_at: new Date().toISOString(),
        })),
        progress: 0,
        memory_short: [],
        memory_long: [],
        chat: [{
          role: 'assistant',
          content: `Hello! I'm ${plan.agent_name}. My goal is to help you with: "${wizardData.goal}". I've created a plan to get us started. Let me know if you have any questions!`,
          timestamp: new Date().toISOString(),
        }],
        config: {
          auto_execute: wizardData.autoExecute || false,
          max_daily_actions: 100,
        },
      };
      setAgents(prev => [...prev, newAgent]);
      setShowWizard(false);
      setSelectedAgentId(newAgent.id);
    } catch (error) {
      console.error(error);
      setWizardError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  
  const updateAgent = (agentId: string, updates: Partial<Agent> | ((agent: Agent) => Agent)) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        if (typeof updates === 'function') {
          return updates(agent);
        }
        return { ...agent, ...updates };
      }
      return agent;
    }));
  };

  const handleToggleStatus = (agentId: string) => {
    updateAgent(agentId, (agent) => ({
        ...agent,
        status: agent.status === 'active' ? 'paused' : 'active'
    }));
  };

  const handleDeleteAgent = (agentId: string) => {
    updateAgent(agentId, { isDeleting: true });
    setTimeout(() => {
        setAgents(prev => prev.filter(a => a.id !== agentId));
        if (selectedAgentId === agentId) {
            setSelectedAgentId(null);
        }
    }, 500); // match animation duration
  };

  const handleSendMessage = async (agentId: string, message: string) => {
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    let agentToUpdate: Agent | undefined;
    setAgents(prev => prev.map(agent => {
        if (agent.id === agentId) {
            agentToUpdate = { ...agent, chat: [...agent.chat, userMessage]};
            return agentToUpdate;
        }
        return agent;
    }));
    
    setIsThinking(true);
    
    try {
      if (!agentToUpdate) throw new Error("Agent not found");
      const responseText = await geminiService.getAgentResponse(agentToUpdate, message);
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      updateAgent(agentId, (agent) => ({ ...agent, chat: [...agent.chat, assistantMessage] }));
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error.',
        timestamp: new Date().toISOString(),
      };
      updateAgent(agentId, (agent) => ({ ...agent, chat: [...agent.chat, errorMessage] }));
    } finally {
      setIsThinking(false);
    }
  };

  const calculateProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  };

  const handleExecuteAction = (agentId: string, taskId: string) => {
     updateAgent(agentId, agent => {
        let executedTaskTitle = '';
        const updatedTasks = agent.tasks.map(task => {
            if (task.id === taskId) {
                executedTaskTitle = task.title;
                return { ...task, status: 'completed' as const, completed_at: new Date().toISOString() };
            }
            return task;
        });

        const newProgress = calculateProgress(updatedTasks);

        const confirmationMessage: Message = {
            role: 'assistant',
            content: `✅ Task completed: "${executedTaskTitle}"`,
            timestamp: new Date().toISOString(),
        };

        return {
            ...agent,
            tasks: updatedTasks,
            progress: newProgress,
            chat: [...agent.chat, confirmationMessage],
        };
     });
  };

  return (
    <div className="bg-slate-900 text-slate-100 font-sans min-h-screen bg-grid">
      <WizardView 
        show={showWizard}
        onClose={() => setShowWizard(false)}
        onCreateAgent={handleCreateAgent}
        isGenerating={isGeneratingPlan}
        error={wizardError}
      />
      {selectedAgent ? (
        <WorkspaceView 
          agent={selectedAgent} 
          onBack={() => setSelectedAgentId(null)}
          onExecuteAction={handleExecuteAction}
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
        />
      ) : (
        <Dashboard
          agents={agents}
          onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
          onNewAgent={() => { setShowWizard(true); setWizardError(null); }}
          onToggleStatus={handleToggleStatus}
          onDeleteAgent={handleDeleteAgent}
        />
      )}
    </div>
  );
}

export default App;
