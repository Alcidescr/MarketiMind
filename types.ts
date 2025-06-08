
export enum AgentId {
  STRATEGIST = 'STRATEGIST',
  COPYWRITER = 'COPYWRITER',
  FUNNEL_EXPERT = 'FUNNEL_EXPERT',
  SOCIAL_MEDIA_CONSULTANT = 'SOCIAL_MEDIA_CONSULTANT',
  LEAD_MAGNET_CREATOR = 'LEAD_MAGNET_CREATOR',
  VIDEO_SCRIPTER = 'VIDEO_SCRIPTER',
  EMAIL_EDITOR = 'EMAIL_EDITOR',
}

export interface AgentProfile {
  id: AgentId;
  name: string;
  description: string;
  icon: React.ReactNode;
  systemInstruction: string; // Base instruction for Gemini
  color: string; // Tailwind color class e.g., 'bg-indigo-600'
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  agentId?: AgentId;
}

export interface AgentOutput {
  agentId: AgentId;
  content: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  status: 'draft' | 'in-progress' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  outputs: AgentOutput[];
  chatHistory?: ChatMessage[]; // For global command context or specific agent chats if needed
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  PROJECT_VIEW = 'PROJECT_VIEW',
  AGENT_CHAT = 'AGENT_CHAT',
  PROJECT_LIST = 'PROJECT_LIST',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
  // Add other possible grounding chunk types if needed
}
    