import React, { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AgentId, ChatMessage, View } from '../types';
import { generateContent } from '../services/geminiService';
import { AGENT_PROFILES } from '../constants';

const AgentChatView: React.FC = () => {
  const context = useContext(AppContext);
  const [userInput, setUserInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [context?.activeProject?.chatHistory]);

  if (!context) return <p className="text-neutral-text">Loading chat...</p>;
  const { activeProject, selectedAgentId, getAgentProfile, addMessageToProjectChat, updateProject, setCurrentView, apiAvailable } = context;

  if (!activeProject || !selectedAgentId) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-neutral-text">No active project or agent selected for chat.</p>
        <button 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            className="bg-accent hover:bg-light-accent text-white py-2 px-4 rounded-md"
        >
            Go to Dashboard
        </button>
      </div>
    );
  }

  const agentProfile = getAgentProfile(selectedAgentId);
  if (!agentProfile) {
    return <p className="p-8 text-center text-neutral-text">Agent profile not found.</p>;
  }

  const projectChatHistory = activeProject.chatHistory?.filter(
    msg => msg.agentId === selectedAgentId || msg.sender === 'user' || (msg.sender === 'system' && !msg.agentId) // Show user, relevant agent, and general system messages
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !apiAvailable) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date(),
      agentId: selectedAgentId, 
    };
    addMessageToProjectChat(activeProject.id, userMessage);
    setUserInput('');
    setIsAgentTyping(true);

    const conversationHistoryForContext = projectChatHistory
        .filter(msg => msg.agentId === selectedAgentId || msg.sender === 'user') // Only user and this agent's messages for direct conversation context
        .slice(-5) 
        .map(msg => `${msg.sender === 'user' ? 'User' : agentProfile.name}: ${msg.text}`)
        .join('\n');
    
    const previousProjectOutputs = activeProject.outputs
      .filter(out => out.agentId !== selectedAgentId) // Exclude this agent's own previous master output
      .map(out => `Output from ${AGENT_PROFILES[out.agentId]?.name || 'Other Agent'} in this project:\n${out.content}`)
      .join('\n\n---\n\n');
    
    let fullContext = `Current Project Goal: ${activeProject.goal}\n\n`;
    if (previousProjectOutputs) {
        fullContext += `Relevant outputs from other agents in this project:\n${previousProjectOutputs}\n\n---\n\n`;
    }
    if(conversationHistoryForContext) {
        fullContext += `Recent conversation with you (${agentProfile.name}):\n${conversationHistoryForContext}\n\n---\n\nYour task is to respond to the latest user message:`;
    }


    const result = await generateContent(agentProfile, userInput, fullContext);
    
    const agentResponse: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'agent',
      text: result.text,
      timestamp: new Date(),
      agentId: selectedAgentId,
    };
    addMessageToProjectChat(activeProject.id, agentResponse);

    // Update the agent's main output in the project with this latest significant interaction
    const existingOutputIndex = activeProject.outputs.findIndex(o => o.agentId === selectedAgentId);
    let updatedOutputs = [...activeProject.outputs];
    if (existingOutputIndex > -1) {
      updatedOutputs[existingOutputIndex] = { ...updatedOutputs[existingOutputIndex], content: result.text, timestamp: new Date() };
    } else {
      updatedOutputs.push({ agentId: selectedAgentId, content: result.text, timestamp: new Date() });
    }
    updateProject({ ...activeProject, outputs: updatedOutputs });

    setIsAgentTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-150px)] max-w-3xl mx-auto bg-content-bg shadow-xl rounded-lg overflow-hidden my-4">
      <header className={`p-4 ${agentProfile.color} text-white flex justify-between items-center`}>
        <h2 className="text-xl font-semibold flex items-center">
          {React.cloneElement(agentProfile.icon as React.ReactElement<{ className?: string }>, {className: "w-6 h-6 mr-2"})}
          Chat with {agentProfile.name}
        </h2>
        <button 
            onClick={() => setCurrentView(View.PROJECT_VIEW)} 
            className="text-sm bg-black bg-opacity-20 hover:bg-opacity-40 py-1 px-3 rounded-md"
        >
            Back to Project
        </button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-800"> {/* Changed from slate-700 for darker chat bg */}
        {projectChatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow ${ // Increased py-3
                msg.sender === 'user'
                  ? 'bg-accent text-white'
                  : msg.sender === 'agent' 
                  ? `${agentProfile.color.replace('bg-','border-').replace('-600','-500')} border-2 bg-slate-700 text-neutral-text` // Darker agent bubble bg
                  : 'bg-slate-600 text-neutral-text' // System messages
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs opacity-60 mt-1 text-right"> 
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isAgentTyping && (
          <div className="flex justify-start">
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow ${agentProfile.color.replace('bg-','border-').replace('-600','-500')} border-2 bg-slate-700 text-neutral-text`}>
              <p className="text-sm italic">{agentProfile.name} is typing...</p> {/* Removed N from N{agentProfile.name} */}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-600 bg-content-bg"> {/* Use content-bg for consistency */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={apiAvailable ? `Message ${agentProfile.name}...` : "API Key not configured."}
            className="flex-grow p-3 rounded-lg bg-slate-800 text-neutral-text border border-slate-600 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            disabled={isAgentTyping || !apiAvailable}
          />
          <button
            type="submit"
            disabled={isAgentTyping || !userInput.trim() || !apiAvailable}
            className="bg-accent hover:bg-light-accent text-white font-semibold py-3 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentChatView;
