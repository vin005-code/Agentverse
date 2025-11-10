import React, { useState } from 'react';
import { WizardData } from '../types';
import { Sparkles, Zap, Check, AlertCircle } from './icons';

interface WizardViewProps {
  show: boolean;
  onClose: () => void;
  onCreateAgent: (data: WizardData) => void;
  isGenerating: boolean;
  error: string | null;
}

const WizardView: React.FC<WizardViewProps> = ({ show, onClose, onCreateAgent, isGenerating, error }) => {
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [dateError, setDateError] = useState<string | null>(null);

  if (!show) return null;
  
  const handleCreate = () => {
    onCreateAgent(wizardData);
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setWizardData({ ...wizardData, deadline: selectedDate });

    if (!selectedDate) {
        setDateError(null);
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayLocalString = `${year}-${month}-${day}`;

    if (selectedDate < todayLocalString) {
        setDateError('Invalid date. Please select today or a future date.');
    } else {
        setDateError(null);
    }
  };

  const StepIndicator: React.FC<{ step: number, label: string }> = ({ step, label }) => (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 group-hover:scale-110 ${
        wizardStep >= step ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
      }`}>
        {wizardStep > step ? <Check className="w-6 h-6" /> : step}
      </div>
      <p className={`mt-2 text-xs font-semibold transition-colors ${wizardStep >= step ? 'text-green-400' : 'text-slate-400'}`}>{label}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-8 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3"><Sparkles className="w-8 h-8 text-green-400"/>Create New Agent</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">&times;</button>
        </div>
        
        <div className="flex items-center justify-center mb-8">
          <StepIndicator step={1} label="Define Goal" />
          <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${wizardStep > 1 ? 'bg-green-500' : 'bg-slate-700'}`} />
          <StepIndicator step={2} label="Add Details" />
          <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${wizardStep > 2 ? 'bg-green-500' : 'bg-slate-700'}`} />
          <StepIndicator step={3} label="Review" />
        </div>

        {wizardStep === 1 && (
          <div>
            <label className="block text-md font-semibold text-slate-300 mb-2">What is your primary goal?</label>
            <textarea
              className="w-full bg-slate-800 border-2 border-slate-600 text-slate-100 rounded-lg p-4 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none text-lg transition-colors"
              rows={4}
              placeholder="E.g., Plan and book a 1-week trip to Japan for two in December."
              value={wizardData.goal || ''}
              onChange={(e) => setWizardData({ ...wizardData, goal: e.target.value })}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-6 py-2 border-2 border-slate-600 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:-translate-y-1">Cancel</button>
              <button onClick={() => setWizardStep(2)} disabled={!wizardData.goal} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30">Next &rarr;</button>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Deadline (optional)</label>
                <input type="date" className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg p-3 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none transition-colors text-slate-100" value={wizardData.deadline || ''} onChange={handleDateChange} />
                {dateError && <p className="text-sm text-red-500 mt-2">{dateError}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Approx. daily hours you can commit</label>
                <input type="number" className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg p-3 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none transition-colors text-slate-100" placeholder="2" min="0.5" step="0.5" value={wizardData.dailyHours || ''} onChange={(e) => setWizardData({ ...wizardData, dailyHours: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Priority</label>
                <select className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg p-3 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none transition-colors text-slate-100" value={wizardData.priority || 'medium'} onChange={(e) => setWizardData({ ...wizardData, priority: e.target.value as any })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setWizardStep(1)} className="px-6 py-2 border-2 border-slate-600 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:-translate-y-1">&larr; Back</button>
              <button onClick={() => setWizardStep(3)} disabled={!!dateError} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30">Next &rarr;</button>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="animate-fade-in">
            <div className="bg-green-950/50 rounded-lg p-6 mb-6 border border-green-500/20">
              <h3 className="font-semibold text-lg mb-3 text-slate-100">Review Your Agent's Mission</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><strong className="font-semibold text-slate-100">Goal:</strong> {wizardData.goal}</p>
                {wizardData.deadline && <p><strong className="font-semibold text-slate-100">Deadline:</strong> {new Date(wizardData.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                {wizardData.dailyHours && <p><strong className="font-semibold text-slate-100">Daily Hours:</strong> {wizardData.dailyHours}</p>}
                <p><strong className="font-semibold text-slate-100">Priority:</strong> <span className="capitalize">{wizardData.priority || 'medium'}</span></p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
                <input type="checkbox" id="autoExecute" checked={wizardData.autoExecute || false} onChange={(e) => setWizardData({ ...wizardData, autoExecute: e.target.checked })} className="w-5 h-5 mt-1 text-green-600 bg-slate-700 border-slate-500 rounded focus:ring-green-500" />
                <label htmlFor="autoExecute" className="text-sm">
                    <span className="font-semibold text-slate-100">Enable Auto-Execution</span>
                    <span className="text-slate-400 block">Allow the agent to perform low-risk actions automatically, like adding events to your calendar.</span>
                </label>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 text-red-300 text-sm rounded-lg p-3 my-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setWizardStep(2)} className="px-6 py-2 border-2 border-slate-600 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:-translate-y-1" disabled={isGenerating}>&larr; Back</button>
              <button onClick={handleCreate} disabled={isGenerating} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/40">
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WizardView;