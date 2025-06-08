
import React from 'react';
import { AgentProfile, AgentId } from './types';

// SVG Icon Components (simple placeholders)
const StrategyIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
const CopyIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const FunnelIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>;
const SocialIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const EbookIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const VideoIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>;
const EmailIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;


export const AGENT_PROFILES: Record<AgentId, AgentProfile> = {
  [AgentId.STRATEGIST]: {
    id: AgentId.STRATEGIST,
    name: "Campaign Strategist",
    description: "Develops comprehensive marketing strategies.",
    icon: <StrategyIcon />,
    systemInstruction: "You are a brilliant Campaign Strategist AI. Your goal is to develop comprehensive, innovative, and actionable marketing strategies. Focus on clear objectives, target audience analysis, key messaging, and multi-channel recommendations. Be concise and provide strategic insights.",
    color: 'bg-blue-600'
  },
  [AgentId.COPYWRITER]: {
    id: AgentId.COPYWRITER,
    name: "Ad Copywriter",
    description: "Crafts compelling ad copy and marketing texts.",
    icon: <CopyIcon />,
    systemInstruction: "You are an expert Ad Copywriter AI. Your task is to create persuasive, engaging, and high-converting copy for various marketing materials (ads, landing pages, social media). Focus on strong headlines, benefit-driven language, and clear calls to action. Adapt your tone and style as needed.",
    color: 'bg-purple-600'
  },
  [AgentId.FUNNEL_EXPERT]: {
    id: AgentId.FUNNEL_EXPERT,
    name: "Sales Funnel Expert",
    description: "Designs and optimizes sales funnels.",
    icon: <FunnelIcon />,
    systemInstruction: "You are a Sales Funnel Expert AI. Your role is to design effective sales funnels that guide prospects from awareness to conversion. Detail each stage of the funnel, suggest appropriate content/offers, and identify key metrics for optimization. Think about user journey and conversion points.",
    color: 'bg-green-600'
  },
  [AgentId.SOCIAL_MEDIA_CONSULTANT]: {
    id: AgentId.SOCIAL_MEDIA_CONSULTANT,
    name: "Social Media Consultant",
    description: "Advises on social media strategy and content.",
    icon: <SocialIcon />,
    systemInstruction: "You are a knowledgeable Social Media Consultant AI. Provide expert advice on social media strategies, content creation, platform selection, and engagement tactics. Tailor your recommendations to specific goals and target audiences. Suggest post ideas, hashtag strategies, and best practices.",
    color: 'bg-pink-600'
  },
  [AgentId.LEAD_MAGNET_CREATOR]: {
    id: AgentId.LEAD_MAGNET_CREATOR,
    name: "eBook & Lead Magnet Creator",
    description: "Generates ideas and outlines for lead magnets.",
    icon: <EbookIcon />,
    systemInstruction: "You are a creative eBook & Lead Magnet Creator AI. Your specialty is brainstorming and outlining valuable lead magnets (eBooks, checklists, templates, webinars) that attract and convert target audiences. Focus on providing practical value and aligning with broader marketing goals.",
    color: 'bg-yellow-500'
  },
  [AgentId.VIDEO_SCRIPTER]: {
    id: AgentId.VIDEO_SCRIPTER,
    name: "Short Video Scripter",
    description: "Writes scripts for short-form videos.",
    icon: <VideoIcon />,
    systemInstruction: "You are a Short Video Scripter AI, specializing in engaging scripts for platforms like TikTok, Instagram Reels, and YouTube Shorts. Create concise, hook-driven scripts with clear narratives or value propositions. Consider visual elements and calls to action suitable for short-form video.",
    color: 'bg-red-600'
  },
  [AgentId.EMAIL_EDITOR]: {
    id: AgentId.EMAIL_EDITOR,
    name: "Email Sequence Editor",
    description: "Drafts and refines email marketing sequences.",
    icon: <EmailIcon />,
    systemInstruction: "You are an Email Sequence Editor AI. Your task is to craft effective email sequences (welcome, nurture, sales) that engage subscribers and drive action. Focus on compelling subject lines, personalized content, clear calls to action, and logical flow between emails.",
    color: 'bg-teal-600'
  },
};

export const ALL_AGENT_IDS = Object.keys(AGENT_PROFILES) as AgentId[];

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const ORCHESTRATION_ORDER: AgentId[] = [
  AgentId.STRATEGIST,
  AgentId.COPYWRITER,
  AgentId.SOCIAL_MEDIA_CONSULTANT,
  AgentId.EMAIL_EDITOR,
  AgentId.LEAD_MAGNET_CREATOR,
  // AgentId.FUNNEL_EXPERT, // Funnel expert can be complex for automated first pass
  // AgentId.VIDEO_SCRIPTER // Video scripter is also very specific
];
    