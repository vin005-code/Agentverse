import React from 'react';
import { Agent } from '../types';
import { Clock, Pause, Play, Plus, Trash2 } from './icons';
import LogoIcon from './LogoIcon';

interface DashboardProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onNewAgent: () => void;
  onToggleStatus: (agentId: string) => void;
  onDeleteAgent: (agentId: string) => void;
}

const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' }> = ({ priority }) => {
  const styles = {
    low: 'bg-green-900 text-green-300',
    medium: 'bg-yellow-900 text-yellow-300',
    high: 'bg-red-900 text-red-300',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[priority]}`}>{priority}</span>;
}


// Fix: Added `agent` to the props type for AgentCard. It was missing from the Omit<> type.
const AgentCard: React.FC<Omit<DashboardProps, 'agents' | 'onNewAgent'> & { agent: Agent }> = ({ agent, onSelectAgent, onToggleStatus, onDeleteAgent }) => (
  <div 
    className="bg-slate-950/50 border border-green-500/20 backdrop-blur-sm rounded-xl p-6 group transition-all duration-300 hover:border-green-400/60 hover:bg-slate-900/60 flex flex-col cursor-pointer hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/25 h-full animated-grid-border"
    onClick={() => onSelectAgent(agent)}
  >
    <div className="flex-grow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 flex items-center justify-center transition-opacity ${agent.status === 'active' ? 'opacity-100' : 'opacity-50'}`}>
            <LogoIcon className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${agent.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}`}>{agent.status}</span>
              <PriorityBadge priority={agent.priority} />
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-5 line-clamp-2 h-10">{agent.description}</p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-slate-400 font-medium">Progress</span>
          <span className="font-semibold text-slate-100">{agent.progress}%</span>
        </div>
        <div className="w-full bg-green-400/20 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${agent.progress}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
        <span>{agent.tasks.filter(t => t.status === 'completed').length} / {agent.tasks.length} tasks</span>
        {agent.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(agent.deadline).toLocaleDateString()}</span>}
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={(e) => { e.stopPropagation(); onSelectAgent(agent); }} className="flex-1 px-4 py-2 bg-green-600/90 text-white rounded-lg font-semibold hover:bg-green-500/90 text-sm transition-colors">Open Workspace</button>
      <button onClick={(e) => { e.stopPropagation(); onToggleStatus(agent.id); }} className="p-2 border-2 border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">{agent.status === 'active' ? <Pause className="w-4 h-4 text-slate-300" /> : <Play className="w-4 h-4 text-slate-300" />}</button>
      <button onClick={(e) => { e.stopPropagation(); onDeleteAgent(agent.id); }} className="p-2 border-2 border-red-500/50 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ agents, onSelectAgent, onNewAgent, onToggleStatus, onDeleteAgent }) => (
  <div className="p-8">
    <div className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold text-slate-100 mb-1">Dashboard</h1>
            <p className="text-slate-400">Your fleet of autonomous AI agents.</p>
        </div>
        {agents.length > 0 && (
            <button onClick={onNewAgent} className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2 transition-all duration-300 ease-in-out shadow-sm hover:scale-110 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/50">
                <Plus className="w-5 h-5" /> New Agent
            </button>
        )}
    </div>

    {agents.length === 0 ? (
      <div className="text-center py-20 bg-slate-950/50 backdrop-blur-sm border border-green-500/20 rounded-2xl shadow-sm animated-grid-border">
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <LogoIcon className="w-20 h-20" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Your Agentverse is Empty</h2>
        <p className="text-slate-400 mb-6">Create your first autonomous agent to start achieving your goals.</p>
        <button onClick={onNewAgent} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 inline-flex items-center gap-2 transition-all duration-300 ease-in-out shadow-sm hover:scale-110 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/50">
          <Plus className="w-5 h-5" /> Create Personal Agent
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map((agent, index) => (
          <div 
            key={agent.id} 
            className={`animate-fly-in ${agent.isDeleting ? 'agent-deleting' : ''}`} 
            style={{ animationDelay: `${index * 120}ms`}}
          >
            <AgentCard agent={agent} onSelectAgent={onSelectAgent} onToggleStatus={onToggleStatus} onDeleteAgent={onDeleteAgent} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Dashboard;