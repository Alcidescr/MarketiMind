
import React, { useContext } from 'react';
import { Project, View } from '../types';
import { AppContext } from '../contexts/AppContext';

interface ProjectListItemProps {
  project: Project;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project }) => {
  const context = useContext(AppContext);

  const handleViewProject = () => {
    if (context) {
      context.setActiveProject(project);
      context.setCurrentView(View.PROJECT_VIEW);
    }
  };
  
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in-progress': return 'text-yellow-400';
      case 'draft': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-content-bg p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-indigo-300 mb-1">{project.name}</h3>
      <p className="text-sm text-neutral-text mb-1 truncate">Goal: {project.goal}</p>
      <p className={`text-xs font-medium ${getStatusColor(project.status)} mb-2`}>Status: {project.status}</p>
      <div className="text-xs text-gray-400 mb-3">
        Created: {new Date(project.createdAt).toLocaleDateString()} | Updated: {new Date(project.updatedAt).toLocaleDateString()}
      </div>
      <button
        onClick={handleViewProject}
        className="w-full bg-accent hover:bg-light-accent text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
      >
        View Details
      </button>
    </div>
  );
};

export default ProjectListItem;
    