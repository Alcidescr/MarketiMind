import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AGENT_PROFILES, ORCHESTRATION_ORDER } from '../constants'; // Import ORCHESTRATION_ORDER
import { AgentOutput, View } from '../types'; 
import { generateContent } from '../services/geminiService'; 

const ProjectDetailView: React.FC = () => {
  const context = useContext(AppContext);
  const [editingOutput, setEditingOutput] = useState<AgentOutput | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null); 


  if (!context) return <p className="text-center p-8">Loading project details...</p>;
  const { activeProject, updateProject, setCurrentView, isLoading: isGlobalLoading, getAgentProfile, initiateGlobalCommand } = context;

  if (!activeProject) {
    return (
      <div className="text-center p-8">
        <p className="mb-4 text-xl text-neutral-text">No active project selected.</p>
        <button
          onClick={() => setCurrentView(View.DASHBOARD)}
          className="bg-accent hover:bg-light-accent text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }
  
  const handleRegenerate = async (outputToRegenerate: AgentOutput) => {
    if (!activeProject) return;
    const agentProfile = getAgentProfile(outputToRegenerate.agentId);
    if (!agentProfile) return;

    setIsRegenerating(agentProfile.id);
    
    const projectOrchestrationOrder = ORCHESTRATION_ORDER; // Use imported constant

    const previousOutputsContext = activeProject.outputs
        .filter(out => projectOrchestrationOrder.indexOf(out.agentId) < projectOrchestrationOrder.indexOf(outputToRegenerate.agentId))
        .map(out => `Output from ${AGENT_PROFILES[out.agentId]?.name || 'Previous Agent'}:\n${out.content}`)
        .join('\n\n---\n\n');
    
    let prompt = `Regenerate content for ${agentProfile.name} regarding the project: "${activeProject.goal}". Original system instruction: ${agentProfile.systemInstruction}. Focus on improving or providing an alternative to the previous output.`;
    
    const result = await generateContent(agentProfile, prompt, previousOutputsContext);

    const updatedOutputs = activeProject.outputs.map(out =>
      out.agentId === outputToRegenerate.agentId ? { ...out, content: result.text, timestamp: new Date() } : out
    );
    updateProject({ ...activeProject, outputs: updatedOutputs, status: 'in-progress' });
    setIsRegenerating(null);
  };
  
  const handleEdit = (output: AgentOutput) => {
    setEditingOutput(output);
    setEditedContent(output.content);
  };

  const handleSaveEdit = () => {
    if (!activeProject || !editingOutput) return;
    const updatedOutputs = activeProject.outputs.map(out =>
      out.agentId === editingOutput.agentId ? { ...editingOutput, content: editedContent, timestamp: new Date() } : out
    );
    updateProject({ ...activeProject, outputs: updatedOutputs });
    setEditingOutput(null);
    setEditedContent("");
  };

  const handleExport = (format: 'txt') => {
    if (!activeProject) return;
    let fullContent = `Project: ${activeProject.name}\nGoal: ${activeProject.goal}\nStatus: ${activeProject.status}\nCreated: ${new Date(activeProject.createdAt).toLocaleString()}\nUpdated: ${new Date(activeProject.updatedAt).toLocaleString()}\n\n`;
    activeProject.outputs.forEach(output => {
      const agentName = AGENT_PROFILES[output.agentId]?.name || 'Unknown Agent';
      fullContent += `--- ${agentName} ---\n${output.content}\n\n`;
    });

    if (format === 'txt') {
      const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${activeProject.name.replace(/\s+/g, '_')}_export.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Sort outputs based on ORCHESTRATION_ORDER for consistent display
  const sortedOutputs = [...activeProject.outputs].sort((a, b) => {
    const orderA = ORCHESTRATION_ORDER.indexOf(a.agentId);
    const orderB = ORCHESTRATION_ORDER.indexOf(b.agentId);
    if (orderA === -1) return 1;
    if (orderB === -1) return -1;
    return orderA - orderB;
  });
  
  // Removed problematic line: const ORCHESTRATION_ORDER = context.apiAvailable ? (await import('../constants')).ORCHESTRATION_ORDER : [];
  // ORCHESTRATION_ORDER is now imported statically from ../constants

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold futuristic-title text-indigo-300 mb-1">{activeProject.name}</h2>
            <p className="text-neutral-text text-md mb-1">Goal: {activeProject.goal}</p>
            <p className={`text-sm font-medium ${activeProject.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
            Status: {activeProject.status} {isGlobalLoading && '(Orchestrating...)'}
            </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => handleExport('txt')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            Export TXT
          </button>
          <button
            onClick={() => setCurrentView(View.PROJECT_LIST)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
          >
            All Projects
          </button>
        </div>
      </div>

      {activeProject.outputs.length === 0 && !isGlobalLoading && (
        <div className="text-center bg-content-bg p-8 rounded-lg shadow-md">
            <p className="text-xl mb-4 text-neutral-text">This project is empty or still being generated.</p>
            <p className="text-neutral-text mb-4">If you started with a global command, the agents are working. Check the log below.</p>
            <p className="text-neutral-text mb-6">You can also manually trigger the global command if it wasn't started, or add content via individual agents (feature to be enhanced).</p>
            <button
                onClick={() => initiateGlobalCommand(activeProject.goal)}
                disabled={isGlobalLoading}
                className="bg-accent hover:bg-light-accent text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
                {isGlobalLoading ? 'Orchestrating...' : 'Start/Retry Global Orchestration'}
            </button>
        </div>
      )}

      <div className="space-y-6">
        {sortedOutputs.map((output) => {
          const agentProfile = AGENT_PROFILES[output.agentId];
          return (
            <div key={output.agentId} className="bg-content-bg p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-xl font-semibold ${agentProfile?.color.replace('bg-', 'text-') || 'text-indigo-400'}`}>
                  {agentProfile?.icon && <span className="inline-block mr-2 align-middle">{React.cloneElement(agentProfile.icon as React.ReactElement<{ className?: string }>, {className: "w-6 h-6"})}</span>}
                  {agentProfile?.name || 'Unknown Agent'}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(output)}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                  >
                    Edit
                  </button>
                   <button 
                    onClick={() => handleRegenerate(output)}
                    disabled={isRegenerating === agentProfile?.id || isGlobalLoading}
                    className="text-xs bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded disabled:opacity-50"
                  >
                    {isRegenerating === agentProfile?.id ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              </div>
              {editingOutput?.agentId === output.agentId ? (
                <div>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-40 p-2 rounded bg-slate-800 text-neutral-text border border-slate-600 focus:ring-accent focus:border-accent" // Changed bg-slate-700 to bg-slate-800 for darker textarea
                  />
                  <div className="mt-2 space-x-2">
                    <button onClick={handleSaveEdit} className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded">Save</button>
                    <button onClick={() => setEditingOutput(null)} className="text-xs bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-neutral-text leading-relaxed">{output.content}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetailView;
