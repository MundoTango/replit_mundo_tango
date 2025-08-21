import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { 
  Crown, 
  ChevronDown, 
  Zap, 
  Globe,
  ArrowRight,
  Brain,
  Building
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
  color: string;
}

const ProjectSwitcher: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Available projects based on user access
  const projects: Project[] = [
    {
      id: 'mundo_tango',
      name: 'Mundo Tango',
      description: 'Global tango community platform',
      icon: <Globe className="w-5 h-5" />,
      route: '/moments',
      color: 'from-pink-500 to-blue-500',
    },
    {
      id: 'life_ceo',
      name: 'Life CEO',
      description: 'AI-powered life management system',
      icon: <Brain className="w-5 h-5" />,
      route: '/life-ceo',
      badge: 'AI',
      color: 'from-purple-500 to-indigo-600',
    }
  ];

  // Determine current project based on route
  const getCurrentProject = () => {
    if (location.startsWith('/life-ceo') || location.startsWith('/admin')) {
      return projects.find(p => p.id === 'life_ceo') || projects[0];
    }
    return projects[0]; // Default to Mundo Tango
  };

  const currentProject = getCurrentProject();

  const switchProject = (project: Project) => {
    if (project.id === 'life_ceo') {
      setLocation('/admin'); // Navigate to AdminCenter which has 11L Project Tracker
    } else {
      setLocation(project.route);
    }
    setIsOpen(false);
  };

  // Only show for admin users
  const hasAccess = user && (
    user.roles?.includes('super_admin') || 
    user.roles?.includes('admin') || 
    user.username === 'admin'
  );

  if (!hasAccess) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-gradient-to-r ${currentProject.color} text-white hover:shadow-lg transition-all duration-200`}
      >
        <div className="flex items-center space-x-1 sm:space-x-2">
          {currentProject.icon}
          <span className="font-medium text-xs sm:text-sm hidden sm:inline">{currentProject.name}</span>
          {currentProject.badge && (
            <span className="bg-white/20 text-xs px-1 sm:px-1.5 py-0.5 rounded-full">
              {currentProject.badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Switch Project</h3>
              <p className="text-sm text-gray-600">Choose your active workspace</p>
            </div>

            <div className="p-2">
              {projects.map((project) => {
                const isCurrent = project.id === currentProject.id;
                
                return (
                  <button
                    key={project.id}
                    onClick={() => switchProject(project)}
                    className={`w-full p-3 rounded-lg transition-all duration-200 group ${
                      isCurrent 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${project.color} text-white`}>
                          {project.icon}
                        </div>
                        
                        <div className="text-left">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{project.name}</span>
                            {project.badge && (
                              <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {project.badge}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{project.description}</p>
                        </div>
                      </div>

                      {!isCurrent && (
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Crown className="w-4 h-4" />
                <span>Life CEO System - AI Agent Management</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectSwitcher;