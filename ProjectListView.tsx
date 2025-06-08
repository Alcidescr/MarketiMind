
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import ProjectListItem from './ProjectListItem';
import { View } from '../types';

const ProjectListView: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return <p>Loading projects...</p>;

  const { projects, setCurrentView } = context;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold futuristic-title text-indigo-300">My Projects</h2>
        <button
          onClick={() => setCurrentView(View.DASHBOARD)}
          className="bg-accent hover:bg-light-accent text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
      {projects.length === 0 ? (
        <p className="text-center text-neutral-text text-lg">No projects yet. Start by creating one from the dashboard!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListView;
    