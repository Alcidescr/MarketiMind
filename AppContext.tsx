
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Project, View, AgentId, AgentOutput, ChatMessage } from '../types';
import { ORCHESTRATION_ORDER, AGENT_PROFILES } from '../constants';
import { generateContent, isApiAvailable } from '../services/geminiService';

interface AppContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  createProject: (goal: string) => Promise<Project | null>;
  updateProject: (updatedProject: Project) => void;
  selectedAgentId: AgentId | null;
  setSelectedAgentId: (agentId: AgentId | null) => void;
  initiateGlobalCommand: (command: string) => Promise<void>;
  isLoading: boolean;
  globalCommandLog: ChatMessage[];
  getAgentProfile: (agentId: AgentId) => typeof AGENT_PROFILES[AgentId] | undefined;
  addMessageToProjectChat: (projectId: string, message: ChatMessage) => void;
  apiAvailable: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('marketingMindProjects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalCommandLog, setGlobalCommandLog] = useState<ChatMessage[]>([]);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);

  useEffect(() => {
    setApiAvailable(isApiAvailable());
  }, []);

  useEffect(() => {
    localStorage.setItem('marketingMindProjects', JSON.stringify(projects));
  }, [projects]);

  const getAgentProfile = useCallback((agentId: AgentId) => {
    return AGENT_PROFILES[agentId];
  }, []);

  const addMessageToGlobalLog = (message: ChatMessage) => {
    setGlobalCommandLog(prev => [...prev, message]);
  };
  
  const addMessageToProjectChat = useCallback((projectId: string, message: ChatMessage) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId
          ? { ...p, chatHistory: [...(p.chatHistory || []), message] }
          : p
      )
    );
    if (activeProject && activeProject.id === projectId) {
      setActiveProject(prev => prev ? ({ ...prev, chatHistory: [...(prev.chatHistory || []), message] }) : null);
    }
  }, [activeProject]);


  const createProject = useCallback(async (goal: string): Promise<Project | null> => {
    if (!apiAvailable) {
      alert("Gemini API is not available. Please check your API key setup.");
      return null;
    }
    setIsLoading(true);
    addMessageToGlobalLog({ id: Date.now().toString(), sender: 'system', text: `New project initiated for goal: ${goal}`, timestamp: new Date() });
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: `Campaign for "${goal.substring(0, 30)}..."`,
      goal,
      status: 'in-progress',
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [],
      chatHistory: [{ id: `msg-${Date.now()}`, sender: 'user', text: `Global Command: ${goal}`, timestamp: new Date() }]
    };

    setActiveProject(newProject);
    setProjects(prev => [newProject, ...prev]); // Add to beginning
    setCurrentView(View.PROJECT_VIEW);
    
    // Orchestration will be handled by initiateGlobalCommand after project creation
    setIsLoading(false);
    return newProject;
  }, [apiAvailable]);

  const updateProject = useCallback((updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? { ...updatedProject, updatedAt: new Date() } : p))
    );
    if (activeProject && activeProject.id === updatedProject.id) {
      setActiveProject({ ...updatedProject, updatedAt: new Date() });
    }
  }, [activeProject]);


  const initiateGlobalCommand = useCallback(async (command: string) => {
    if (!apiAvailable) {
      alert("Gemini API key not configured. Cannot process command.");
      addMessageToGlobalLog({ id: Date.now().toString(), sender: 'system', text: "Error: API key not configured.", timestamp: new Date() });
      return;
    }

    setIsLoading(true);
    setGlobalCommandLog([{ id: `cmd-${Date.now()}`, sender: 'user', text: `Global Command: ${command}`, timestamp: new Date() }]);
    
    let currentProject = projects.find(p => p.goal === command && p.status === 'in-progress');
    if (!currentProject) {
        currentProject = await createProject(command);
    }

    if (!currentProject) {
        setIsLoading(false);
        addMessageToGlobalLog({ id: Date.now().toString(), sender: 'system', text: "Failed to create or find project for command.", timestamp: new Date() });
        return;
    }
    
    let accumulatedContext = `Original User Goal: ${command}\n\n`;

    for (const agentId of ORCHESTRATION_ORDER) {
      const agentProfile = AGENT_PROFILES[agentId];
      if (!agentProfile) continue;

      addMessageToGlobalLog({ id: `${currentProject.id}-${agentId}-thinking`, sender: 'system', text: `Asking ${agentProfile.name}...`, timestamp: new Date(), agentId });
      
      // Tailor prompt for each agent
      let agentSpecificPrompt = `Based on the overall goal "${command}"`;
      if (accumulatedContext.length > command.length + 20) { // check if there is substantial context
        agentSpecificPrompt += ` and the following context from previous agents:\n${accumulatedContext}`;
      }
      agentSpecificPrompt += `\n\nYour task as ${agentProfile.name}: ${agentProfile.systemInstruction}. Please provide your output for this stage.`;
      
      // If it's the strategist, use the main command more directly.
      if (agentId === AgentId.STRATEGIST) {
        agentSpecificPrompt = `Develop a marketing strategy for the following goal: "${command}". ${agentProfile.systemInstruction}`;
      }
      
      const result = await generateContent(agentProfile, agentSpecificPrompt, undefined, agentId === AgentId.STRATEGIST); // Use search grounding for strategist if desired.

      const newOutput: AgentOutput = {
        agentId,
        content: result.text,
        timestamp: new Date(),
      };

      currentProject = {
        ...currentProject,
        outputs: [...currentProject.outputs, newOutput],
        updatedAt: new Date(),
      };
      updateProject(currentProject);
      
      addMessageToGlobalLog({ id: `${currentProject.id}-${agentId}-done`, sender: 'agent', text: `${agentProfile.name} responded.`, timestamp: new Date(), agentId });
      
      accumulatedContext += `Output from ${agentProfile.name}:\n${result.text}\n\n---\n\n`;
       if (result.groundingChunks && result.groundingChunks.length > 0) {
        const sourcesText = result.groundingChunks
          .map(chunk => (chunk.web?.uri || chunk.retrievedContext?.uri) ? `[${chunk.web?.title || chunk.retrievedContext?.title || 'Source'}](${chunk.web?.uri || chunk.retrievedContext?.uri})` : null)
          .filter(Boolean)
          .join(', ');
        if (sourcesText) {
          accumulatedContext += `Sources considered by ${agentProfile.name}: ${sourcesText}\n\n---\n\n`;
        }
      }
    }
    
    currentProject = { ...currentProject, status: 'completed' };
    updateProject(currentProject);
    addMessageToGlobalLog({ id: `${currentProject.id}-complete`, sender: 'system', text: "All agents have contributed. Project updated.", timestamp: new Date() });
    setIsLoading(false);
    setActiveProject(currentProject);
    setCurrentView(View.PROJECT_VIEW);

  }, [apiAvailable, createProject, updateProject, projects]);


  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        projects,
        activeProject,
        setActiveProject,
        createProject,
        updateProject,
        selectedAgentId,
        setSelectedAgentId,
        initiateGlobalCommand,
        isLoading,
        globalCommandLog,
        getAgentProfile,
        addMessageToProjectChat,
        apiAvailable,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
    