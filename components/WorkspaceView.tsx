import React, { useState, useEffect, useRef } from 'react';
import { Agent, Task } from '../types';
import { ArrowLeft, Calendar, CheckCircle, Circle, Clock, Loader2, Send, Target, Zap } from './icons';
import LogoIcon from './LogoIcon';

interface WorkspaceViewProps {
  agent: Agent;
  onBack: () => void;
  onExecuteAction: (agentId: string, taskId: string) => void;
  onSendMessage: (agentId: string, message: string) => void;
  isThinking: boolean;
}

const TaskPriorityIcon: React.FC<{ priority: number }> = ({ priority }) => {
  const color = priority >= 4 ? 'bg-red-500' : priority >= 2 ? 'bg-yellow-500' : 'bg-green-500';
  return <div className={`w-2 h-2 rounded-full ${color}`}></div>
};

const TaskItem: React.FC<{ task: Task; onExecute: () => void; }> = ({ task, onExecute }) => (
    <div className={`
      bg-slate-900 
      rounded-xl 
      p-4 
      border
      transition-all duration-300 
      ${
        task.status === 'completed' 
            ? 'border-green-500/20 bg-slate-900/50 opacity-60' 
            : 'border-slate-800 hover:border-green-500/50'
    }`}>
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {task.status === 'completed' 
                  ? <CheckCircle className="w-6 h-6 text-green-500" />
                  : (
                    <button 
                      onClick={onExecute} 
                      className="text-slate-500 hover:text-green-400 transition-colors"
                      aria-label={`Mark "${task.title}" as complete`}
                    >
                      <Circle className="w-6 h-6" />
                    </button>
                  )
              }
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.title}</h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{task.description}</p>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-4 text-sm text-slate-300">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /><span>{task.duration_mins} min</span></div>
                    {task.due && <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /><span>{new Date(task.due).toLocaleDateString()}</span></div>}
                    <div className="flex items-center gap-1.5"><TaskPriorityIcon priority={task.priority} /><span>P{task.priority}</span></div>
                </div>
                {task.status === 'pending' && (
                    <button onClick={onExecute} className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30">
                        <Zap className="w-4 h-4" /> Execute
                    </button>
                )}
            </div>
        </div>
    </div>
);


const WorkspaceView: React.FC<WorkspaceViewProps> = ({ agent, onBack, onExecuteAction, onSendMessage, isThinking }) => {
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent.chat, isThinking]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(agent.id, messageInput);
      setMessageInput('');
    }
  };

  if (!agent) return null;

  return (
    <div className="h-screen flex flex-col bg-transparent">
      <header className="bg-slate-950/50 backdrop-blur-sm border-b border-green-500/20 px-6 py-3 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors"><ArrowLeft className="w-5 h-5 text-slate-300" /></button>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{agent.name}</h2>
              <p className="text-sm text-slate-400">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-64">
                <div className="flex justify-between text-xs mb-1 font-semibold text-green-300">
                    <span>Progress</span><span>{agent.progress}%</span>
                </div>
                <div className="w-full bg-green-500/20 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${agent.progress}%`}}></div></div>
             </div>
             <span className={`px-3 py-1 rounded-full text-sm font-semibold ${agent.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}`}>{agent.status}</span>
             {agent.config.auto_execute && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-300">Auto-Execute ON</span>}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-96 border-r border-green-500/20 bg-slate-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-300"><Target className="w-5 h-5" /> Task Plan</h3>
            <div className="space-y-3">
              {agent.tasks.map(task => <TaskItem key={task.id} task={task} onExecute={() => onExecuteAction(agent.id, task.id)} />)}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-black/30">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {agent.chat.map((msg, idx) => (
              <div key={idx} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><LogoIcon className="w-8 h-8" /></div>}
                <div className={`max-w-xl rounded-2xl p-4 shadow-md ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  <span className="text-xs opacity-70 mt-2 block text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
             {isThinking && (
              <div className="flex items-end gap-3 justify-start">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><LogoIcon className="w-8 h-8" /></div>
                  <div className="max-w-xl rounded-2xl p-4 shadow-md bg-slate-800 text-slate-200 rounded-bl-none">
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-0"></span>
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></span>
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-300"></span>
                      </div>
                  </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-green-500/20 bg-slate-950/50 p-4">
            <div className="flex gap-3">
              <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={`Message ${agent.name}...`} className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none transition-colors" />
              <button onClick={handleSendMessage} disabled={!messageInput.trim() || isThinking} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                {isThinking ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceView;