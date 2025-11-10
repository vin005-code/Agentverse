export interface UserProfile {
  name: string;
  timezone: string;
  preferences: {
    tone: string;
    work_hours: { start: string; end: string };
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: number;
  duration_mins: number;
  due: string | null;
  action_type: 'calendar_event' | 'task' | 'reminder' | 'email';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  action_result?: {
    success: boolean;
    message: string;
    [key: string]: any;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  goal: string;
  status: 'active' | 'paused';
  created_at: string;
  deadline: string | null;
  priority: 'low' | 'medium' | 'high';
  tasks: Task[];
  progress: number;
  memory_short: any[];
  memory_long: any[];
  chat: Message[];
  config: {
    auto_execute: boolean;
    max_daily_actions: number;
  };
  isDeleting?: boolean;
}

export interface WizardData {
  goal?: string;
  deadline?: string;
  dailyHours?: string;
  priority?: 'low' | 'medium' | 'high';
  autoExecute?: boolean;
}

export interface AgentPlan {
  agent_name: string;
  description: string;
  tasks: Omit<Task, 'id' | 'status' | 'created_at'>[];
  confidence: number;
  explanation: string;
  suggested_integrations: string[];
}

export interface AgentResponse {
  text: string | null;
  functionCall?: {
    name: string;
    args: { [key: string]: any };
  };
}
