
import React, { useContext } from 'react';
import { AppProvider, AppContext } from './contexts/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectDetailView from './components/ProjectDetailView';
import AgentChatView from './components/AgentChatView';
import ProjectListView from './components/ProjectListView';
import { View } from './types';

const AppContent: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    // This should ideally not happen if AppProvider is correctly set up
    return <div className="flex justify-center items-center h-screen text-xl">Initializing MarketingMind...</div>;
  }

  const { currentView, isLoading, apiAvailable } = context;

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.PROJECT_VIEW:
        return <ProjectDetailView />;
      case View.AGENT_CHAT:
        return <AgentChatView />;
      case View.PROJECT_LIST:
        return <ProjectListView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Header />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
        {!apiAvailable && (
           <div className="bg-red-800 text-white text-center p-3 rounded-md mb-4 mx-4">
             Warning: Gemini API key is not configured or is invalid. AI functionalities will be disabled. Please set the <code>API_KEY</code> environment variable.
           </div>
        )}
        {renderView()}
      </main>
      <footer className="text-center p-4 text-sm text-gray-500 border-t border-slate-700">
        MarketingMind &copy; {new Date().getFullYear()} - Personal AI Marketing Assistant
      </footer>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center text-white">
            <svg className="animate-spin h-10 w-10 text-indigo-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg futuristic-title">AI Agents at Work...</p>
            <p className="text-sm">Processing your request, please wait.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
    