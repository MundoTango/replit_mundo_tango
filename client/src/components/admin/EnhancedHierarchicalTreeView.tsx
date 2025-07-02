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

// Comprehensive project data structure using 11L methodology with full hierarchical nesting
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
        children: [
          {
            id: 'replit-oauth-integration',
            title: 'Replit OAuth Integration',
            description: 'OAuth authentication flow with Replit identity provider',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 35,
            assignee: 'Scott Boddye',
            tags: ['OAuth', 'Replit', 'Identity'],
            children: [
              {
                id: 'oauth-strategy-setup',
                title: 'OAuth Strategy Configuration',
                description: 'Passport.js strategy setup for Replit OAuth',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 15,
                actualHours: 12,
                assignee: 'Scott Boddye',
                tags: ['Passport.js', 'Strategy'],
                children: [
                  {
                    id: 'passport-strategy-impl',
                    title: 'Passport Strategy Implementation',
                    description: 'Configure OpenID Connect strategy for Replit authentication',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 8,
                    actualHours: 6,
                    assignee: 'Scott Boddye',
                    tags: ['OpenID Connect', 'Implementation'],
                    children: [
                      {
                        id: 'strategy-registration',
                        title: 'Strategy Registration Logic',
                        description: 'Dynamic strategy registration based on domain',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'Medium',
                        estimatedHours: 3,
                        actualHours: 2,
                        assignee: 'Scott Boddye',
                        tags: ['Dynamic Registration']
                      },
                      {
                        id: 'callback-handling',
                        title: 'OAuth Callback Handler',
                        description: 'Process OAuth callback and extract user claims',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'High',
                        estimatedHours: 5,
                        actualHours: 4,
                        assignee: 'Scott Boddye',
                        tags: ['Callback', 'Claims Processing']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'project-tracker-system',
        title: '11L Project Tracker System',
        description: 'Comprehensive hierarchical project management with true nested design',
        type: 'Section',
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
        children: [
          {
            id: 'hierarchical-tree-view',
            title: 'Enhanced Hierarchical Tree View',
            description: 'Multi-level expandable tree component with Jira-style detail modals',
            type: 'Feature',
            status: 'In Progress',
            completion: 85,
            priority: 'High',
            estimatedHours: 60,
            actualHours: 54,
            assignee: 'Scott Boddye',
            tags: ['Tree View', 'Hierarchical', 'React Component'],
            children: [
              {
                id: 'tree-rendering-engine',
                title: 'Tree Rendering Engine',
                description: 'Recursive component rendering with dynamic depth support',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 25,
                actualHours: 22,
                assignee: 'Scott Boddye',
                tags: ['Recursive Rendering', 'Dynamic Depth'],
                children: [
                  {
                    id: 'recursive-tree-algorithm',
                    title: 'Recursive Tree Algorithm',
                    description: 'Core algorithm for rendering nested project items',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 12,
                    actualHours: 10,
                    assignee: 'Scott Boddye',
                    tags: ['Algorithm', 'Recursion'],
                    children: [
                      {
                        id: 'depth-calculation',
                        title: 'Depth Calculation Logic',
                        description: 'Calculate and apply appropriate indentation for each level',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'Medium',
                        estimatedHours: 4,
                        actualHours: 3,
                        assignee: 'Scott Boddye',
                        tags: ['Indentation', 'CSS Classes']
                      },
                      {
                        id: 'expand-collapse-state',
                        title: 'Expand/Collapse State Management',
                        description: 'React state management for tree expansion',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'High',
                        estimatedHours: 8,
                        actualHours: 7,
                        assignee: 'Scott Boddye',
                        tags: ['React State', 'Set Management']
                      }
                    ]
                  }
                ]
              },
              {
                id: 'detail-modal-system',
                title: 'Jira-Style Detail Modal',
                description: 'Comprehensive item detail view with all metadata',
                type: 'Project',
                status: 'In Progress',
                completion: 80,
                priority: 'High',
                estimatedHours: 35,
                actualHours: 32,
                assignee: 'Scott Boddye',
                tags: ['Modal', 'Detail View', 'Metadata'],
                children: [
                  {
                    id: 'modal-component-structure',
                    title: 'Modal Component Architecture',
                    description: 'Responsive modal with tabbed interface and comprehensive data display',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 20,
                    actualHours: 18,
                    assignee: 'Scott Boddye',
                    tags: ['Component Architecture', 'Responsive Design']
                  },
                  {
                    id: 'web-mobile-handoff-display',
                    title: 'Web-to-Mobile Handoff Display',
                    description: 'Show web development prerequisites and mobile next steps',
                    type: 'Task',
                    status: 'In Progress',
                    completion: 60,
                    priority: 'Medium',
                    estimatedHours: 15,
                    actualHours: 14,
                    assignee: 'Scott Boddye',
                    tags: ['Handoff Criteria', 'Mobile Development']
                  }
                ]
              }
            ]
          },
          {
            id: 'timeline-teams-management',
            title: 'Timeline & Teams Management',
            description: 'Comprehensive project timeline and team assignment tracking',
            type: 'Feature',
            status: 'In Progress',
            completion: 75,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 30,
            assignee: 'Scott Boddye',
            tags: ['Timeline', 'Team Management', 'Project Tracking'],
            children: [
              {
                id: 'development-timeline',
                title: 'Development Phase Timeline',
                description: 'Visual timeline showing 5 major development phases',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                estimatedHours: 20,
                actualHours: 15,
                assignee: 'Scott Boddye',
                tags: ['Visual Timeline', 'Phase Tracking']
              },
              {
                id: 'team-assignment-system',
                title: 'Team Assignment Cards',
                description: 'Interactive team cards with performance metrics and click-through details',
                type: 'Project',
                status: 'In Progress',
                completion: 50,
                priority: 'High',
                estimatedHours: 20,
                actualHours: 15,
                assignee: 'Scott Boddye',
                tags: ['Team Cards', 'Performance Metrics']
              }
            ]
          }
        ]
      },
      {
        id: 'posts-feed-system',
        title: 'Enhanced Posts Feed System',
        description: 'Modern social media feed with rich content creation and real-time engagement',
        type: 'Section',
        status: 'Completed',
        completion: 95,
        priority: 'High',
        estimatedHours: 300,
        actualHours: 285,
        assignee: 'Full Stack Team',
        tags: ['Social Media', 'Real-time', 'Content Creation'],
        children: [
          {
            id: 'modern-post-composer',
            title: 'Modern Post Composer',
            description: 'Rich text editor with mentions, media uploads, and location integration',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 80,
            actualHours: 75,
            assignee: 'Scott Boddye',
            tags: ['Rich Text', 'Mentions', 'Media Upload'],
            children: [
              {
                id: 'rich-text-editor',
                title: 'Rich Text Editor Integration',
                description: 'React Quill integration with custom toolbar and formatting',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 25,
                actualHours: 22,
                assignee: 'Scott Boddye',
                tags: ['React Quill', 'Rich Text']
              },
              {
                id: 'mention-system',
                title: 'User Mention System',
                description: 'Real-time @ autocomplete with user, event, and group mentions',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 30,
                actualHours: 28,
                assignee: 'Scott Boddye',
                tags: ['Mentions', 'Autocomplete', 'Real-time']
              },
              {
                id: 'media-upload-integration',
                title: 'Media Upload Integration',
                description: 'Drag-drop media upload with progress tracking and metadata',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                estimatedHours: 25,
                actualHours: 25,
                assignee: 'Scott Boddye',
                tags: ['Media Upload', 'Drag Drop', 'Progress Tracking']
              }
            ]
          }
        ]
      },
      {
        id: 'event-management-system',
        title: 'Event Management System',
        description: 'Comprehensive event creation, RSVP management, and role assignment',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'High',
        estimatedHours: 250,
        actualHours: 240,
        assignee: 'Full Stack Team',
        tags: ['Events', 'RSVP', 'Role Assignment'],
        children: [
          {
            id: 'event-creation-workflow',
            title: 'Event Creation Workflow',
            description: 'Complete event creation with Google Maps integration and role assignments',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 120,
            actualHours: 115,
            assignee: 'Scott Boddye',
            tags: ['Event Creation', 'Google Maps', 'Role Assignment'],
            children: [
              {
                id: 'google-maps-integration',
                title: 'Google Maps Location Picker',
                description: 'Advanced location selection with Places API and embedded map display',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                assignee: 'Scott Boddye',
                tags: ['Google Maps', 'Places API', 'Location']
              },
              {
                id: 'role-assignment-system',
                title: 'Event Role Assignment',
                description: 'Dynamic role assignment for DJs, Teachers, Performers, etc.',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 35,
                actualHours: 32,
                assignee: 'Scott Boddye',
                tags: ['Role Assignment', 'Event Participants']
              }
            ]
          }
        ]
      },
      {
        id: 'community-groups-system',
        title: 'Community & Groups System',
        description: 'Automated city group creation and comprehensive community management',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'High',
        estimatedHours: 180,
        actualHours: 175,
        assignee: 'Backend Team',
        tags: ['Community', 'Groups', 'Automation'],
        children: [
          {
            id: 'automated-city-groups',
            title: 'Automated City Group Creation',
            description: 'Intelligent city group creation during user registration with photo automation',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 90,
            actualHours: 88,
            assignee: 'Scott Boddye',
            tags: ['Automation', 'City Groups', 'Photo Integration'],
            children: [
              {
                id: 'city-photo-automation',
                title: 'City Photo Automation',
                description: 'Pexels API integration for authentic city photography',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                estimatedHours: 35,
                actualHours: 33,
                assignee: 'Scott Boddye',
                tags: ['Pexels API', 'Photo Automation']
              }
            ]
          }
        ]
      },
      {
        id: 'analytics-infrastructure',
        title: 'Analytics & Infrastructure',
        description: 'Comprehensive analytics system with performance monitoring and compliance',
        type: 'Section',
        status: 'In Progress',
        completion: 85,
        priority: 'Medium',
        estimatedHours: 200,
        actualHours: 170,
        assignee: 'Infrastructure Team',
        tags: ['Analytics', 'Performance', 'Compliance'],
        children: [
          {
            id: 'plausible-analytics',
            title: 'Plausible Analytics Integration',
            description: 'Privacy-first analytics with comprehensive event tracking',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Medium',
            estimatedHours: 40,
            actualHours: 35,
            assignee: 'Scott Boddye',
            tags: ['Plausible', 'Privacy', 'Event Tracking']
          },
          {
            id: 'compliance-monitoring',
            title: 'Automated Compliance Monitoring',
            description: 'GDPR, SOC2, and enterprise compliance automation',
            type: 'Feature',
            status: 'In Progress',
            completion: 80,
            priority: 'High',
            estimatedHours: 80,
            actualHours: 68,
            assignee: 'Scott Boddye',
            tags: ['GDPR', 'SOC2', 'Compliance']
          }
        ]
      },
      {
        id: 'mobile-development-pipeline',
        title: 'Mobile Development Pipeline',
        description: 'Web-to-mobile development roadmap with comprehensive handoff criteria',
        type: 'Section',
        status: 'Planned',
        completion: 15,
        priority: 'Medium',
        estimatedHours: 400,
        actualHours: 60,
        assignee: 'Mobile Team',
        tags: ['Mobile', 'iOS', 'Android', 'React Native'],
        webDevPrerequisites: [
          'Complete API stabilization and documentation',
          'Finalize all responsive design patterns',
          'Implement comprehensive error handling',
          'Complete authentication system testing',
          'Optimize performance for mobile data usage',
          'Standardize component library for reuse'
        ],
        mobileNextSteps: [
          'Create React Native project structure',
          'Implement native navigation patterns',
          'Build offline-first data synchronization',
          'Integrate native device capabilities',
          'Design mobile-specific user flows',
          'Implement push notification system'
        ],
        children: [
          {
            id: 'web-platform-stabilization',
            title: 'Web Platform Stabilization',
            description: '248 hours of web development work required before mobile handoff',
            type: 'Feature',
            status: 'In Progress',
            completion: 60,
            priority: 'High',
            estimatedHours: 248,
            actualHours: 149,
            assignee: 'Web Development Team',
            tags: ['Platform Stabilization', 'API Documentation', 'Performance'],
            children: [
              {
                id: 'api-documentation-completion',
                title: 'Complete API Documentation',
                description: 'Comprehensive API documentation for mobile team handoff',
                type: 'Project',
                status: 'In Progress',
                completion: 40,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 32,
                assignee: 'Backend Team',
                tags: ['API Documentation', 'Handoff']
              },
              {
                id: 'responsive-design-finalization',
                title: 'Responsive Design Finalization',
                description: 'Complete responsive design implementation across all components',
                type: 'Project',
                status: 'In Progress',
                completion: 70,
                priority: 'High',
                estimatedHours: 120,
                actualHours: 84,
                assignee: 'Frontend Team',
                tags: ['Responsive Design', 'Mobile-First']
              }
            ]
          }
        ]
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