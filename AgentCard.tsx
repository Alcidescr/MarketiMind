
import React, { useContext } from 'react';
import { AgentProfile, View, AgentId } from '../types';
import { AppContext } from '../contexts/AppContext';

interface AgentCardProps {
  agent: AgentProfile;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const context = useContext(AppContext);
  
  const handleClick = () => {
    if (context) {
      context.setSelectedAgentId(agent.id);
      // If there's an active project, go to agent chat within that project context
      // Otherwise, this click might be for general info or starting a new interaction pattern
      // For now, let's assume it sets the agent and a project view might handle it
      if (context.activeProject) {
        context.setCurrentView(View.AGENT_CHAT);
      } else {
        // Handle case where no project is active - maybe show agent details or prompt to start project
        alert(`Selected ${agent.name}. Start a project or global command to interact.`);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-6 rounded-lg shadow-xl ${agent.color} transform hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center text-white h-full`}
    >
      <div className="mb-4 text-white">{agent.icon}</div>
      <h3 className="text-xl font-semibold mb-2 futuristic-title">{agent.name}</h3>
      <p className="text-sm opacity-90">{agent.description}</p>
    </div>
  );
};

export default AgentCard;
    