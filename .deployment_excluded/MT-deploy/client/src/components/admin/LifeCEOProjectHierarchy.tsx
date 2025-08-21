import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Circle, Globe, Zap, Target, CheckCircle, AlertCircle, Clock, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Project status types
type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
type ProjectPriority = 'critical' | 'high' | 'medium' | 'low';
type ProjectType = 'platform' | 'section' | 'feature' | 'project' | 'task';

interface LifeCEOProject {
  id: number;
  parentId?: number;
  name: string;
  type: ProjectType;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  webCompletion: number;
  mobileCompletion: number;
  assignedTo?: string;
  metadata?: any;
  startDate?: string;
  endDate?: string;
  children?: LifeCEOProject[];
}

const LifeCEOProjectHierarchy: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([1]));
  const [selectedItem, setSelectedItem] = useState<LifeCEOProject | null>(null);

  // Sample Life CEO project hierarchy data
  const projectData: LifeCEOProject = {
    id: 1,
    name: "Life CEO System",
    type: "platform",
    description: "AI-driven life management system with 12 specialized agents",
    status: "in_progress",
    priority: "critical",
    webCompletion: 45,
    mobileCompletion: 40,
    children: [
      {
        id: 2,
        parentId: 1,
        name: "Core Infrastructure",
        type: "section",
        description: "Foundation systems and architecture",
        status: "in_progress",
        priority: "critical",
        webCompletion: 75,
        mobileCompletion: 70,
        children: [
          {
            id: 3,
            parentId: 2,
            name: "Authentication & RBAC",
            type: "feature",
            description: "Role-based access control system",
            status: "completed",
            priority: "critical",
            webCompletion: 100,
            mobileCompletion: 100,
            children: [
              {
                id: 4,
                parentId: 3,
                name: "Role Hierarchy Implementation",
                type: "task",
                description: "6-tier role system with permissions",
                status: "completed",
                priority: "high",
                webCompletion: 100,
                mobileCompletion: 100
              }
            ]
          },
          {
            id: 5,
            parentId: 2,
            name: "Agent System Architecture",
            type: "feature",
            description: "12-agent system design and communication",
            status: "in_progress",
            priority: "critical",
            webCompletion: 60,
            mobileCompletion: 50,
            children: [
              {
                id: 6,
                parentId: 5,
                name: "Agent Communication Protocol",
                type: "task",
                description: "Inter-agent messaging system",
                status: "in_progress",
                priority: "high",
                webCompletion: 70,
                mobileCompletion: 60
              }
            ]
          }
        ]
      },
      {
        id: 7,
        parentId: 1,
        name: "Agent Development",
        type: "section",
        description: "Individual agent implementation",
        status: "in_progress",
        priority: "high",
        webCompletion: 35,
        mobileCompletion: 30,
        children: [
          {
            id: 8,
            parentId: 7,
            name: "Health & Wellness Agent",
            type: "feature",
            description: "Physical and mental health tracking",
            status: "in_progress",
            priority: "high",
            webCompletion: 50,
            mobileCompletion: 45
          },
          {
            id: 9,
            parentId: 7,
            name: "Finance Agent",
            type: "feature",
            description: "Financial planning and tracking",
            status: "not_started",
            priority: "high",
            webCompletion: 0,
            mobileCompletion: 0
          },
          {
            id: 10,
            parentId: 7,
            name: "Social Agent",
            type: "feature",
            description: "Relationship and social activity management",
            status: "not_started",
            priority: "medium",
            webCompletion: 0,
            mobileCompletion: 0
          }
        ]
      },
      {
        id: 11,
        parentId: 1,
        name: "Mundo Tango Integration",
        type: "section",
        description: "Integration with existing Mundo Tango platform",
        status: "in_progress",
        priority: "high",
        webCompletion: 80,
        mobileCompletion: 75,
        children: [
          {
            id: 12,
            parentId: 11,
            name: "Unified Authentication",
            type: "feature",
            description: "Single sign-on between systems",
            status: "completed",
            priority: "high",
            webCompletion: 100,
            mobileCompletion: 100
          },
          {
            id: 13,
            parentId: 11,
            name: "Project Status Sync",
            type: "feature",
            description: "Real-time status synchronization",
            status: "in_progress",
            priority: "medium",
            webCompletion: 60,
            mobileCompletion: 55
          }
        ]
      }
    ]
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case 'platform':
        return <Globe className="w-4 h-4" />;
      case 'section':
        return <Circle className="w-4 h-4" />;
      case 'feature':
        return <Zap className="w-4 h-4" />;
      case 'project':
        return <Settings className="w-4 h-4" />;
      case 'task':
        return <Target className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const calculateRollupStatus = (project: LifeCEOProject): { webCompletion: number; mobileCompletion: number } => {
    if (!project.children || project.children.length === 0) {
      return { webCompletion: project.webCompletion, mobileCompletion: project.mobileCompletion };
    }

    const childStats = project.children.map(child => calculateRollupStatus(child));
    const avgWeb = Math.round(childStats.reduce((sum, stat) => sum + stat.webCompletion, 0) / childStats.length);
    const avgMobile = Math.round(childStats.reduce((sum, stat) => sum + stat.mobileCompletion, 0) / childStats.length);

    return { webCompletion: avgWeb, mobileCompletion: avgMobile };
  };

  const renderProjectNode = (project: LifeCEOProject, level: number = 0) => {
    const hasChildren = project.children && project.children.length > 0;
    const isExpanded = expandedItems.has(project.id);
    const rollupStats = calculateRollupStatus(project);
    
    return (
      <div key={project.id} className="mb-1">
        <div
          className={`flex items-center px-2 py-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors ${
            selectedItem?.id === project.id ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 8}px` }}
          onClick={() => setSelectedItem(project)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(project.id);
              }}
              className="mr-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <div className="flex items-center space-x-2 flex-1">
            {getTypeIcon(project.type)}
            <span className="font-medium text-sm">{project.name}</span>
            {getStatusIcon(project.status)}
            
            <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </Badge>
            
            <div className="flex items-center space-x-2 ml-auto">
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{rollupStats.webCompletion}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Settings className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{rollupStats.mobileCompletion}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {project.children?.map((child) => renderProjectNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project Tree */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Life CEO Project Hierarchy</span>
              <Badge variant="outline">45% Complete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {renderProjectNode(projectData)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Item Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge variant="outline" className="capitalize">{selectedItem.type}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedItem.status)}
                      <span className="text-sm capitalize">{selectedItem.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Priority</span>
                    <Badge className={`text-xs ${getPriorityColor(selectedItem.priority)}`}>
                      {selectedItem.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Web Progress</span>
                      <span className="text-sm font-medium">{selectedItem.webCompletion}%</span>
                    </div>
                    <Progress value={selectedItem.webCompletion} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Mobile Progress</span>
                      <span className="text-sm font-medium">{selectedItem.mobileCompletion}%</span>
                    </div>
                    <Progress value={selectedItem.mobileCompletion} className="h-2" />
                  </div>
                </div>

                {selectedItem.startDate && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Timeline</span>
                      <span className="text-sm">{selectedItem.startDate} - {selectedItem.endDate || 'Ongoing'}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a project to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifeCEOProjectHierarchy;