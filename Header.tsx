
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { View } from '../types';

const Header: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return null; 
  }
  const { setCurrentView, apiAvailable } = context;

  return (
    <header className="bg-primary p-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
      <h1 
        className="text-3xl font-bold futuristic-title text-indigo-300 cursor-pointer"
        onClick={() => setCurrentView(View.DASHBOARD)}
      >
        MarketingMind
      </h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentView(View.DASHBOARD)}
          className="px-4 py-2 text-sm font-medium text-neutral-text bg-accent hover:bg-light-accent rounded-md transition-colors"
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView(View.PROJECT_LIST)}
          className="px-4 py-2 text-sm font-medium text-neutral-text bg-accent hover:bg-light-accent rounded-md transition-colors"
        >
          Projects
        </button>
        {!apiAvailable && (
          <span className="text-xs text-red-400 border border-red-400 px-2 py-1 rounded">API Key Missing</span>
        )}
      </div>
    </header>
  );
};

export default Header;
    