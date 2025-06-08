
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AGENT_PROFILES, ALL_AGENT_IDS } from '../constants';
import AgentCard from './AgentCard';
import { View, ChatMessage } from '../types';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const [globalCommand, setGlobalCommand] = useState('');

  if (!context) {
    return <p className="p-8 text-center">Loading dashboard...</p>;
  }

  const { initiateGlobalCommand, isLoading, globalCommandLog, apiAvailable } = context;

  const handleSubmitGlobalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalCommand.trim() || !apiAvailable) {
      if(!apiAvailable) alert("Gemini API key not configured. Cannot process command.");
      return;
    }
    initiateGlobalCommand(globalCommand);
    setGlobalCommand(''); 
  };

  return (
    <div className="p-4 md:p-8">
      <section className="mb-12 bg-content-bg p-6 md:p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo-300 futuristic-title">Global Command Center</h2>
        <p className="mb-6 text-neutral-text text-opacity-80">
          Describe your marketing goal, and MarketingMind will orchestrate the AI agents to build a complete plan.
          Example: "Create a launch campaign for a new productivity eBook called 'Zenith Focus'."
        </p>
        <form onSubmit={handleSubmitGlobalCommand} className="space-y-4">
          <textarea
            value={globalCommand}
            onChange={(e) => setGlobalCommand(e.target.value)}
            placeholder={apiAvailable ? "Enter your marketing goal here..." : "API Key not configured. AI features disabled."}
            className="w-full p-4 rounded-lg bg-slate-700 text-neutral-text border border-slate-600 focus:ring-2 focus:ring-accent focus:border-transparent outline-none min-h-[100px] text-lg"
            rows={3}
            disabled={isLoading || !apiAvailable}
          />
          <button
            type="submit"
            disabled={isLoading || !globalCommand.trim() || !apiAvailable}
            className="w-full bg-gradient-to-r from-accent to-light-accent hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out text-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Orchestrating Wisdom...' : 'Unleash AI Agents'}
          </button>
        </form>
      </section>

      {globalCommandLog.length > 0 && (
        <section className="mb-12 bg-content-bg p-6 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-3 text-indigo-400 futuristic-title">Orchestration Log</h3>
          <div className="space-y-2 text-sm">
            {globalCommandLog.map((msg) => (
              <div key={msg.id} className={`p-2 rounded ${msg.sender === 'user' ? 'bg-slate-700' : msg.sender === 'system' ? 'bg-slate-600' : AGENT_PROFILES[msg.agentId!]?.color ? `${AGENT_PROFILES[msg.agentId!]?.color} bg-opacity-30` : 'bg-slate-500'}`}>
                <span className="font-medium text-neutral-text opacity-70">[{new Date(msg.timestamp).toLocaleTimeString()}] {msg.sender === 'agent' ? AGENT_PROFILES[msg.agentId!]?.name : msg.sender}: </span>
                <span className="text-neutral-text">{msg.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-3xl font-bold mb-6 text-indigo-300 futuristic-title">Meet Your AI Team</h2>
        <p className="mb-8 text-neutral-text text-opacity-80">
          Interact with individual agents or let the Global Command Center coordinate them for you. Click an agent to learn more or (if a project is active) chat directly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ALL_AGENT_IDS.map(agentId => (
            <AgentCard key={agentId} agent={AGENT_PROFILES[agentId]} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
    