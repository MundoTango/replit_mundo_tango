import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Eye, Clock, CheckCircle2, Users, Code2, Smartphone, Monitor } from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Blocked' | 'Under Review';
  completion: number;
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  tags?: string[];
  children?: ProjectItem[];
  webDevPrerequisites?: string[];
  mobileNextSteps?: string[];
}

// Minimal working project data structure
const projectData: ProjectItem[] = [
  {
    id: 'mundo-tango-platform',
    title: 'Mundo Tango Platform',
    description: 'Complete social media platform for the global tango community',
    type: 'Platform',
    status: 'In Progress',
    completion: 85,
    priority: 'High',
    estimatedHours: 2000,
    actualHours: 1700,
    assignee: 'Development Team',
    tags: ['Social Media', 'Tango Community', 'Full Stack'],
    children: [
      {
        id: 'authentication-system',
        title: 'Authentication System',
        description: 'Complete user authentication and authorization system',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'High',
        estimatedHours: 200,
        actualHours: 180,
        assignee: 'Backend Team',
        tags: ['Security', 'OAuth', 'JWT'],
        children: []
      },
      {
        id: 'project-tracker',
        title: '11L Project Tracker',
        description: 'Comprehensive hierarchical project management system',
        type: 'Feature',
        status: 'In Progress',
        completion: 90,
        priority: 'High',
        estimatedHours: 120,
        actualHours: 108,
        assignee: 'Frontend Team',
        tags: ['Project Management', '11L Framework', 'React'],
        webDevPrerequisites: [
          'Complete responsive design implementation',
          'Finish all React component state management',
          'Implement comprehensive error handling',
          'Add real-time synchronization capabilities'
        ],
        mobileNextSteps: [
          'Design mobile-first navigation patterns',
          'Implement native gesture controls',
          'Create offline-capable data synchronization',
          'Build native mobile performance optimizations'
        ],
        children: []
      }
    ]
  }
];

const EnhancedHierarchicalTreeView: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['mundo-tango-platform']));

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Planned': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const renderTreeItem = (item: ProjectItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const indentClass = `ml-${depth * 4}`;

    return (
      <div key={item.id} className="space-y-2">
        <Card className={`${indentClass} border-l-4 border-l-blue-500 hover:shadow-md transition-shadow`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(item.id)}
                    className="p-1"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {item.completion}% Complete
                    </span>
                    {item.assignee && (
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {item.assignee}
                      </span>
                    )}
                    {item.estimatedHours && (
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.actualHours || 0}/{item.estimatedHours}h
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="ml-auto"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isExpanded && hasChildren && (
          <div className="space-y-2">
            {item.children?.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const DetailedCard: React.FC<{ item: ProjectItem; onClose: () => void }> = ({ item, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Project Information</h3>
              <div className="space-y-2 text-sm">
                <div>Status: <Badge className={getStatusColor(item.status)}>{item.status}</Badge></div>
                <div>Priority: <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge></div>
                <div>Completion: {item.completion}%</div>
                <div>Assignee: {item.assignee || 'Unassigned'}</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Time Tracking</h3>
              <div className="space-y-2 text-sm">
                <div>Estimated Hours: {item.estimatedHours || 'Not set'}</div>
                <div>Actual Hours: {item.actualHours || 0}</div>
                <div>Start Date: {item.startDate || 'Not set'}</div>
                <div>End Date: {item.endDate || 'Not set'}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
          </div>

          {item.webDevPrerequisites && item.webDevPrerequisites.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                Web Development Prerequisites
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {item.webDevPrerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {item.mobileNextSteps && item.mobileNextSteps.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Development Next Steps
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {item.mobileNextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full space-y-2">
      {projectData.map(item => renderTreeItem(item))}
      
      {selectedItem && (
        <DetailedCard 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default EnhancedHierarchicalTreeView;