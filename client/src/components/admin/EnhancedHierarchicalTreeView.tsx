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

// 11L Framework: Proper Organizational Hierarchy with Card Templates
const projectData: ProjectItem[] = [
  {
    id: 'mundo-tango-org',
    title: 'Mundo Tango Organization',
    description: 'Global tango community platform organization with comprehensive digital ecosystem',
    type: 'Platform',
    status: 'In Progress',
    completion: 85,
    priority: 'High',
    estimatedHours: 3500,
    actualHours: 2980,
    assignee: 'Scott Boddye',
    startDate: '2025-06-27',
    endDate: '2025-08-15',
    dependencies: [],
    tags: ['Organization', 'Tango Community', 'Digital Platform'],
    webDevPrerequisites: [
      'Complete organizational structure implementation',
      'Finalize all core platform components',
      'Establish enterprise-grade infrastructure',
      'Implement comprehensive testing frameworks'
    ],
    mobileNextSteps: [
      'Design mobile organizational management interface',
      'Create native platform administration tools',
      'Implement mobile-first organizational workflows',
      'Build cross-platform synchronization systems'
    ],
    children: [
      {
        id: 'mundo-tango-app',
        title: 'Mundo Tango App',
        description: 'Core social media application for tango community engagement and content sharing',
        type: 'Section',
        status: 'In Progress',
        completion: 90,
        priority: 'High',
        estimatedHours: 1800,
        actualHours: 1620,
        assignee: 'Frontend Development Team',
        startDate: '2025-06-27',
        endDate: '2025-07-30',
        dependencies: ['mundo-tango-admin'],
        tags: ['Social Media', 'User Interface', 'Community Features'],
        webDevPrerequisites: [
          'Complete all React component optimizations',
          'Finalize responsive design implementation', 
          'Implement comprehensive state management',
          'Add advanced real-time synchronization',
          'Complete API integration testing'
        ],
        mobileNextSteps: [
          'Design React Native component architecture',
          'Implement native navigation patterns',
          'Create offline-capable social features',
          'Build native device integrations',
          'Design mobile-specific user interactions'
        ],
        children: [
          {
            id: 'social-engagement-system',
            title: 'Social Engagement System',
            description: 'Comprehensive social media functionality including posts, comments, reactions, and user interactions',
            type: 'Feature',
            status: 'Completed',
            completion: 95,
            priority: 'High',
            estimatedHours: 450,
            actualHours: 427,
            assignee: 'Scott Boddye',
            startDate: '2025-06-28',
            endDate: '2025-07-15',
            dependencies: ['authentication-system'],
            tags: ['Social Media', 'User Engagement', 'Real-time'],
            webDevPrerequisites: [
              'Optimize React Query caching strategies',
              'Implement advanced error boundary patterns',
              'Add comprehensive loading state management',
              'Complete accessibility compliance testing'
            ],
            mobileNextSteps: [
              'Design mobile gesture-based interactions',
              'Implement native social sharing capabilities',
              'Create offline comment synchronization',
              'Build native notification systems'
            ],
            children: [
              {
                id: 'enhanced-post-creation',
                title: 'Enhanced Post Creation System',
                description: 'Advanced post composer with rich text editing, media uploads, mentions, and location integration',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 120,
                actualHours: 115,
                assignee: 'Scott Boddye',
                startDate: '2025-06-29',
                endDate: '2025-07-05',
                dependencies: ['media-upload-system', 'google-maps-integration'],
                tags: ['Rich Text', 'Media Upload', 'Mentions', 'Location'],
                webDevPrerequisites: [
                  'Complete React Quill performance optimization',
                  'Finalize media compression algorithms',
                  'Implement advanced mention autocomplete',
                  'Add real-time preview capabilities'
                ],
                mobileNextSteps: [
                  'Design native rich text editing interface',
                  'Implement mobile camera integration',
                  'Create voice-to-text post creation',
                  'Build gesture-based media manipulation'
                ],
                children: [
                  {
                    id: 'rich-text-editor-integration',
                    title: 'Rich Text Editor Integration',
                    description: 'React Quill integration with custom toolbar, formatting options, and content validation',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 35,
                    actualHours: 32,
                    assignee: 'Scott Boddye',
                    startDate: '2025-06-29',
                    endDate: '2025-07-01',
                    dependencies: [],
                    tags: ['React Quill', 'Rich Text', 'Content Validation'],
                    webDevPrerequisites: [
                      'Optimize editor loading performance',
                      'Add custom formatting toolbar',
                      'Implement content sanitization',
                      'Create responsive editor layout'
                    ],
                    mobileNextSteps: [
                      'Design mobile-optimized editor interface',
                      'Implement touch-friendly formatting controls',
                      'Create native text manipulation gestures',
                      'Build mobile keyboard optimization'
                    ],
                    children: [
                      {
                        id: 'quill-toolbar-customization',
                        title: 'Quill Toolbar Customization',
                        description: 'Custom toolbar with tango-specific formatting options and emoji integration',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'Medium',
                        estimatedHours: 15,
                        actualHours: 14,
                        assignee: 'Scott Boddye',
                        startDate: '2025-06-29',
                        endDate: '2025-06-30',
                        dependencies: [],
                        tags: ['Custom Toolbar', 'Emoji Integration', 'UI Components'],
                        webDevPrerequisites: [
                          'Finalize toolbar design system',
                          'Add accessibility compliance',
                          'Implement keyboard navigation',
                          'Create hover state animations'
                        ],
                        mobileNextSteps: [
                          'Design mobile toolbar interface',
                          'Implement touch-optimized controls',
                          'Create gesture-based formatting',
                          'Build native toolbar components'
                        ]
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
        id: 'mundo-tango-admin',
        title: 'Mundo Tango Admin',
        description: 'Comprehensive administrative dashboard with user management, content moderation, and platform analytics',
        type: 'Section',
        status: 'In Progress',
        completion: 85,
        priority: 'High',
        estimatedHours: 800,
        actualHours: 680,
        assignee: 'Backend Development Team',
        startDate: '2025-06-27',
        endDate: '2025-07-25',
        dependencies: [],
        tags: ['Administration', 'Analytics', 'User Management'],
        webDevPrerequisites: [
          'Complete all admin API endpoints',
          'Implement comprehensive role-based access control',
          'Add advanced analytics dashboard',
          'Create automated content moderation',
          'Finalize compliance monitoring systems'
        ],
        mobileNextSteps: [
          'Design mobile admin interface',
          'Implement native administrative controls',
          'Create mobile analytics dashboards',
          'Build native notification management',
          'Design mobile-first moderation tools'
        ],
        children: [
          {
            id: 'admin-center-dashboard',
            title: 'Admin Center Dashboard',
            description: 'Central administrative interface with user management, content moderation, and system monitoring',
            type: 'Feature',
            status: 'Completed',
            completion: 90,
            priority: 'High',
            estimatedHours: 200,
            actualHours: 180,
            assignee: 'Scott Boddye',
            startDate: '2025-07-01',
            endDate: '2025-07-10',
            dependencies: ['user-management-system'],
            tags: ['Admin Dashboard', 'User Management', 'System Monitoring'],
            webDevPrerequisites: [
              'Optimize dashboard loading performance',
              'Add real-time system health monitoring',
              'Implement advanced filtering capabilities',
              'Create comprehensive audit logging'
            ],
            mobileNextSteps: [
              'Design mobile admin dashboard layout',
              'Implement native admin controls',
              'Create mobile-optimized data visualization',
              'Build native admin notification system'
            ],
            children: [
              {
                id: 'user-management-interface',
                title: 'User Management Interface',
                description: 'Comprehensive user administration with role assignment, account management, and activity monitoring',
                type: 'Project',
                status: 'Completed',
                completion: 95,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 76,
                assignee: 'Scott Boddye',
                startDate: '2025-07-02',
                endDate: '2025-07-06',
                dependencies: ['role-based-access-control'],
                tags: ['User Management', 'Role Assignment', 'Activity Monitoring'],
                webDevPrerequisites: [
                  'Complete user search optimization',
                  'Add bulk user operations',
                  'Implement advanced user filtering',
                  'Create user activity timeline'
                ],
                mobileNextSteps: [
                  'Design mobile user management interface',
                  'Implement native user search',
                  'Create mobile role assignment flow',
                  'Build native user activity viewer'
                ],
                children: [
                  {
                    id: 'role-assignment-system',
                    title: 'Role Assignment System',
                    description: 'Dynamic role assignment with permission management and hierarchical role structures',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 25,
                    actualHours: 23,
                    assignee: 'Scott Boddye',
                    startDate: '2025-07-03',
                    endDate: '2025-07-04',
                    dependencies: [],
                    tags: ['Role Assignment', 'Permissions', 'RBAC'],
                    webDevPrerequisites: [
                      'Optimize role lookup performance',
                      'Add role inheritance mechanisms',
                      'Implement permission caching',
                      'Create role audit logging'
                    ],
                    mobileNextSteps: [
                      'Design mobile role selection interface',
                      'Implement native permission controls',
                      'Create mobile role visualization',
                      'Build native role assignment workflow'
                    ],
                    children: [
                      {
                        id: 'permission-matrix-implementation',
                        title: 'Permission Matrix Implementation',
                        description: 'Comprehensive permission system with granular access controls and role inheritance',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'High',
                        estimatedHours: 12,
                        actualHours: 11,
                        assignee: 'Scott Boddye',
                        startDate: '2025-07-03',
                        endDate: '2025-07-04',
                        dependencies: [],
                        tags: ['Permission Matrix', 'Access Control', 'Role Inheritance'],
                        webDevPrerequisites: [
                          'Complete permission caching system',
                          'Add real-time permission updates',
                          'Implement permission audit trail',
                          'Create permission testing framework'
                        ],
                        mobileNextSteps: [
                          'Design mobile permission interface',
                          'Implement native permission checks',
                          'Create mobile permission editor',
                          'Build native access control UI'
                        ]
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
        id: 'mundo-tango-project',
        title: 'Mundo Tango Project Tracker',
        description: 'Advanced 11L methodology project management system with hierarchical breakdown and comprehensive tracking',
        type: 'Section',
        status: 'In Progress',
        completion: 80,
        priority: 'High',
        estimatedHours: 900,
        actualHours: 720,
        assignee: 'Project Management Team',
        startDate: '2025-07-01',
        endDate: '2025-08-15',
        dependencies: ['mundo-tango-admin'],
        tags: ['Project Management', '11L Framework', 'Hierarchical Tracking'],
        webDevPrerequisites: [
          'Complete all hierarchical rendering components',
          'Implement comprehensive data visualization',
          'Add real-time project synchronization',
          'Create advanced project analytics',
          'Finalize timeline management system'
        ],
        mobileNextSteps: [
          'Design mobile project management interface',
          'Implement native project tracking',
          'Create mobile timeline visualization',
          'Build native project collaboration tools',
          'Design mobile-first project workflows'
        ],
        children: [
          {
            id: 'hierarchical-project-structure',
            title: 'Hierarchical Project Structure',
            description: 'Deep nested project breakdown using 11L methodology with unlimited depth support',
            type: 'Feature',
            status: 'In Progress',
            completion: 85,
            priority: 'High',
            estimatedHours: 300,
            actualHours: 255,
            assignee: 'Scott Boddye',
            startDate: '2025-07-01',
            endDate: '2025-07-20',
            dependencies: ['11l-framework-implementation'],
            tags: ['Hierarchical Structure', '11L Methodology', 'Project Breakdown'],
            webDevPrerequisites: [
              'Complete recursive rendering optimization',
              'Add dynamic depth visualization',
              'Implement advanced tree navigation',
              'Create comprehensive project metadata'
            ],
            mobileNextSteps: [
              'Design mobile hierarchical navigation',
              'Implement native tree visualization',
              'Create mobile project breakdown interface',
              'Build native hierarchy manipulation'
            ],
            children: [
              {
                id: 'enhanced-tree-view-component',
                title: 'Enhanced Tree View Component',
                description: 'Advanced React component with card-based rendering, expand/collapse, and detailed item views',
                type: 'Project',
                status: 'In Progress',
                completion: 90,
                priority: 'High',
                estimatedHours: 150,
                actualHours: 135,
                assignee: 'Scott Boddye',
                startDate: '2025-07-01',
                endDate: '2025-07-15',
                dependencies: ['card-template-system'],
                tags: ['React Component', 'Tree View', 'Card Rendering'],
                webDevPrerequisites: [
                  'Optimize component re-rendering performance',
                  'Add advanced keyboard navigation',
                  'Implement comprehensive accessibility',
                  'Create responsive card layouts'
                ],
                mobileNextSteps: [
                  'Design mobile tree navigation patterns',
                  'Implement native card interactions',
                  'Create mobile-optimized card layouts',
                  'Build native tree manipulation gestures'
                ],
                children: [
                  {
                    id: 'card-template-rendering',
                    title: 'Card Template Rendering System',
                    description: 'Comprehensive card template with all project metadata, progress tracking, and interactive elements',
                    type: 'Task',
                    status: 'In Progress',
                    completion: 75,
                    priority: 'High',
                    estimatedHours: 60,
                    actualHours: 45,
                    assignee: 'Scott Boddye',
                    startDate: '2025-07-02',
                    endDate: '2025-07-08',
                    dependencies: [],
                    tags: ['Card Template', 'Metadata Display', 'Progress Tracking'],
                    webDevPrerequisites: [
                      'Complete card layout optimization',
                      'Add interactive progress elements',
                      'Implement comprehensive metadata display',
                      'Create responsive card design'
                    ],
                    mobileNextSteps: [
                      'Design mobile card template',
                      'Implement native card interactions',
                      'Create mobile metadata visualization',
                      'Build native progress indicators'
                    ],
                    children: [
                      {
                        id: 'comprehensive-metadata-display',
                        title: 'Comprehensive Metadata Display',
                        description: 'Advanced metadata display with time tracking, dependencies, web dev prerequisites, and mobile next steps',
                        type: 'Sub-task',
                        status: 'In Progress',
                        completion: 80,
                        priority: 'High',
                        estimatedHours: 30,
                        actualHours: 24,
                        assignee: 'Scott Boddye',
                        startDate: '2025-07-02',
                        endDate: '2025-07-06',
                        dependencies: [],
                        tags: ['Metadata Display', 'Time Tracking', 'Dependencies', 'Handoff Criteria'],
                        webDevPrerequisites: [
                          'Finalize metadata grid layout',
                          'Add interactive metadata elements',
                          'Implement real-time data updates',
                          'Create comprehensive tooltip system'
                        ],
                        mobileNextSteps: [
                          'Design mobile metadata layout',
                          'Implement native metadata display',
                          'Create mobile data visualization',
                          'Build native metadata interaction'
                        ]
                      }
                    ]
                  }
                ]
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['mundo-tango-org']));

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
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${item.completion}%` }}
                    ></div>
                  </div>
                  
                  {/* Comprehensive Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium">{item.completion}% Complete</span>
                      </div>
                      {item.assignee && (
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-green-500" />
                          <span>{item.assignee}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {item.estimatedHours && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          <span>{item.actualHours || 0}h / {item.estimatedHours}h</span>
                        </div>
                      )}
                      {item.startDate && (
                        <div className="text-sm text-gray-600">
                          <strong>Start:</strong> {item.startDate}
                        </div>
                      )}
                      {item.endDate && (
                        <div className="text-sm text-gray-600">
                          <strong>End:</strong> {item.endDate}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {item.dependencies && item.dependencies.length > 0 && (
                        <div className="text-sm">
                          <strong className="text-purple-600">Dependencies:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.dependencies.map(dep => (
                              <Badge key={dep} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Web Dev Prerequisites */}
                  {item.webDevPrerequisites && item.webDevPrerequisites.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center mb-2">
                        <Code2 className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-300">Web Dev Prerequisites</span>
                      </div>
                      <ul className="space-y-1">
                        {item.webDevPrerequisites.map((prereq, index) => (
                          <li key={index} className="text-sm text-blue-700 dark:text-blue-400 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Mobile Next Steps */}
                  {item.mobileNextSteps && item.mobileNextSteps.length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center mb-2">
                        <Smartphone className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-300">Mobile Next Steps</span>
                      </div>
                      <ul className="space-y-1">
                        {item.mobileNextSteps.map((step, index) => (
                          <li key={index} className="text-sm text-green-700 dark:text-green-400 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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