import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Eye, Clock, CheckCircle2, Users, Code2, Smartphone, Monitor, Globe, Circle, Zap, Target, CheckSquare, FileText, Folder, FolderOpen } from 'lucide-react';
import JiraStyleItemDetailModal from './JiraStyleItemDetailModal';

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Blocked' | 'Under Review';
  completion: number;
  mobileCompletion?: number;
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string;
  team?: string[];
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  tags?: string[];
  children?: ProjectItem[];
  webDevPrerequisites?: string[];
  mobileNextSteps?: string[];
  reviewers?: string[];
  lastReviewDate?: string;
  nextReviewDate?: string;
  budget?: number;
  actualCost?: number;
}

// Move large data structure outside component to prevent initialization errors
const createProjectData = (): ProjectItem[] => [
  {
    id: 'mundo-tango-org',
    title: 'Mundo Tango Organization',
    description: 'Global tango community platform organization with comprehensive digital ecosystem',
    type: 'Platform',
    status: 'In Progress',
    completion: 85,
    mobileCompletion: 60,
    priority: 'High',
    estimatedHours: 3500,
    actualHours: 2980,
    assignee: 'Scott Boddye',
    team: ['Executive Team', 'Platform Architecture'],
    reviewers: ['CTO', 'Lead Architect'],
    startDate: '2025-06-27',
    endDate: '2025-08-15',
    dependencies: [],
    tags: ['Organization', 'Tango Community', 'Digital Platform'],
    budget: 250000,
    actualCost: 198000,
    webDevPrerequisites: [
      '✅ Complete organizational structure implementation',
      '✅ Finalize all core platform components',
      '⏳ Establish enterprise-grade infrastructure - Missing: Production deployment, CDN setup',
      '⏳ Implement comprehensive testing frameworks - Missing: E2E tests, Load testing'
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
        mobileCompletion: 70,
        priority: 'High',
        estimatedHours: 1800,
        actualHours: 1620,
        assignee: 'Frontend Development Team',
        team: ['Frontend Team', 'UI/UX Design', 'Mobile Development'],
        reviewers: ['Lead Frontend Developer', 'UX Director'],
        startDate: '2025-06-27',
        endDate: '2025-07-30',
        dependencies: ['mundo-tango-admin'],
        tags: ['Social Media', 'User Interface', 'Community Features'],
        budget: 120000,
        actualCost: 108000,
        webDevPrerequisites: [
          '✅ Complete all React component optimizations',
          '✅ Finalize responsive design implementation', 
          '✅ Implement comprehensive state management',
          '✅ Add advanced real-time synchronization',
          '⏳ Complete API integration testing - Missing: Load tests, Error boundary tests'
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
            mobileCompletion: 80,
            priority: 'High',
            estimatedHours: 450,
            actualHours: 427,
            assignee: 'Scott Boddye',
            team: ['Frontend Team', 'Backend Team', 'QA Team'],
            reviewers: ['Tech Lead', 'Product Manager'],
            startDate: '2025-06-28',
            endDate: '2025-07-15',
            dependencies: ['authentication-system'],
            tags: ['Social Media', 'User Engagement', 'Real-time'],
            budget: 80000,
            actualCost: 76000,
            webDevPrerequisites: [
              '✅ Optimize React Query caching strategies',
              '✅ Implement advanced error boundary patterns',
              '✅ Add comprehensive loading state management',
              '⏳ Complete accessibility compliance testing - Missing: WCAG AA certification, Screen reader testing'
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
                mobileCompletion: 85,
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
                    mobileCompletion: 90,
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
                        mobileCompletion: 95,
                        priority: 'Medium',
                        estimatedHours: 15,
                        actualHours: 14,
                        assignee: 'Scott Boddye',
                        startDate: '2025-06-29',
                        endDate: '2025-06-30',
                        dependencies: [],
                        tags: ['Custom Toolbar', 'Emoji Integration', 'UI Components'],
                        webDevPrerequisites: [
                          '✅ Finalize toolbar design system',
                          '✅ Add accessibility compliance',
                          '✅ Implement keyboard navigation',
                          '✅ Create hover state animations'
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
        mobileCompletion: 55,
        priority: 'High',
        estimatedHours: 800,
        actualHours: 680,
        assignee: 'Backend Development Team',
        team: ['Backend Team', 'DevOps', 'Security Team'],
        reviewers: ['CTO', 'Security Officer'],
        startDate: '2025-06-27',
        endDate: '2025-07-25',
        dependencies: [],
        tags: ['Administration', 'Analytics', 'User Management'],
        budget: 95000,
        actualCost: 80750,
        webDevPrerequisites: [
          '✅ Complete all admin API endpoints',
          '✅ Implement comprehensive role-based access control',
          '✅ Add advanced analytics dashboard',
          '⏳ Create automated content moderation - Missing: AI integration, Flagging system',
          '⏳ Finalize compliance monitoring systems - Missing: GDPR reports, Audit trails'
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
            mobileCompletion: 65,
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
                mobileCompletion: 70,
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
                    mobileCompletion: 80,
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
                        mobileCompletion: 85,
                        priority: 'High',
                        estimatedHours: 12,
                        actualHours: 11,
                        assignee: 'Scott Boddye',
                        team: ['Backend Team', 'Security Team'],
                        reviewers: ['Security Officer', 'Backend Lead'],
                        startDate: '2025-07-03',
                        endDate: '2025-07-04',
                        dependencies: [],
                        tags: ['Permission Matrix', 'Access Control', 'Role Inheritance'],
                        budget: 15000,
                        actualCost: 13800,
                        webDevPrerequisites: [
                          '✅ Complete permission caching system',
                          '✅ Add real-time permission updates',
                          '✅ Implement permission audit trail',
                          '✅ Create permission testing framework'
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
        mobileCompletion: 45,
        priority: 'High',
        estimatedHours: 900,
        actualHours: 720,
        assignee: 'Project Management Team',
        team: ['Product Team', 'Platform Architecture', 'Community Management'],
        reviewers: ['Product Owner', 'Platform Lead'],
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
            mobileCompletion: 50,
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
                mobileCompletion: 60,
                priority: 'High',
                estimatedHours: 150,
                actualHours: 135,
                assignee: 'Scott Boddye',
                startDate: '2025-07-01',
                endDate: '2025-07-15',
                dependencies: ['card-template-system'],
                tags: ['React Component', 'Tree View', 'Card Rendering'],
                webDevPrerequisites: [
                  '✅ Optimize component re-rendering performance',
                  '⏳ Add advanced keyboard navigation - Missing: Arrow key navigation, Tab support',
                  '⏳ Implement comprehensive accessibility - Missing: ARIA labels, Screen reader support',
                  '✅ Create responsive card layouts'
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
                    mobileCompletion: 65,
                    priority: 'High',
                    estimatedHours: 60,
                    actualHours: 45,
                    assignee: 'Scott Boddye',
                    startDate: '2025-07-02',
                    endDate: '2025-07-08',
                    dependencies: [],
                    tags: ['Card Template', 'Metadata Display', 'Progress Tracking'],
                    webDevPrerequisites: [
                      '✅ Complete card layout optimization',
                      '✅ Add interactive progress elements',
                      '✅ Implement comprehensive metadata display',
                      '✅ Create responsive card design'
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
                        mobileCompletion: 70,
                        priority: 'High',
                        estimatedHours: 30,
                        actualHours: 24,
                        assignee: 'Scott Boddye',
                        startDate: '2025-07-02',
                        endDate: '2025-07-06',
                        dependencies: [],
                        tags: ['Metadata Display', 'Time Tracking', 'Dependencies', 'Handoff Criteria'],
                        webDevPrerequisites: [
                          '✅ Finalize metadata grid layout',
                          '✅ Add interactive metadata elements',
                          '⏳ Implement real-time data updates - Missing: WebSocket integration',
                          '✅ Create comprehensive tooltip system'
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

// Calculate status rollup from children to parent
const calculateRollupStatus = (item: ProjectItem): { 
  overallStatus: string; 
  webCompletion: number; 
  mobileCompletion: number;
  childStatusCount: { [key: string]: number };
} => {
  if (!item.children || item.children.length === 0) {
    return {
      overallStatus: item.status,
      webCompletion: item.completion || 0,
      mobileCompletion: item.mobileCompletion || 0,
      childStatusCount: { [item.status]: 1 }
    };
  }

  let totalWebCompletion = 0;
  let totalMobileCompletion = 0;
  const statusCounts: { [key: string]: number } = {};
  let totalChildren = 0;

  const processChildren = (children: ProjectItem[]) => {
    children.forEach(child => {
      if (child.children && child.children.length > 0) {
        processChildren(child.children);
      } else {
        totalChildren++;
        totalWebCompletion += child.completion || 0;
        totalMobileCompletion += child.mobileCompletion || 0;
        statusCounts[child.status] = (statusCounts[child.status] || 0) + 1;
      }
    });
  };

  processChildren(item.children);

  const avgWebCompletion = totalChildren > 0 ? Math.round(totalWebCompletion / totalChildren) : 0;
  const avgMobileCompletion = totalChildren > 0 ? Math.round(totalMobileCompletion / totalChildren) : 0;

  let overallStatus = 'Planned';
  if (statusCounts['Completed'] === totalChildren) {
    overallStatus = 'Completed';
  } else if (statusCounts['Blocked'] > 0) {
    overallStatus = 'Blocked';
  } else if (statusCounts['In Progress'] > 0 || (statusCounts['Completed'] > 0 && statusCounts['Completed'] < totalChildren)) {
    overallStatus = 'In Progress';
  } else if (statusCounts['Under Review'] > 0) {
    overallStatus = 'Under Review';
  }

  return {
    overallStatus,
    webCompletion: avgWebCompletion,
    mobileCompletion: avgMobileCompletion,
    childStatusCount: statusCounts
  };
};

const EnhancedHierarchicalTreeView: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([
    'mundo-tango-org',
    'mundo-tango-app',
    'social-engagement-system',
    'enhanced-post-creation',
    'rich-text-editor-integration',
    'mundo-tango-admin',
    'user-management-system',
    'life-ceo-system',
    'agent-architecture'
  ]));
  const [viewMode, setViewMode] = useState<'tree' | 'cards' | 'dual'>('dual');
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterTeam, setFilterTeam] = useState<string>('all');

  // Initialize project data using factory function
  const projectData = useMemo(() => createProjectData(), []);

  // Pre-calculate rollup data for all items to avoid hooks inside render
  const itemRollupData = useMemo(() => {
    const rollupMap = new Map<string, ReturnType<typeof calculateRollupStatus>>();
    
    const processItems = (items: ProjectItem[]) => {
      items.forEach(item => {
        rollupMap.set(item.id, calculateRollupStatus(item));
        if (item.children) {
          processItems(item.children);
        }
      });
    };
    
    processItems(projectData);
    return rollupMap;
  }, [projectData]);

  // Extract all unique teams from the project data
  const getAllTeams = useMemo(() => {
    const teams = new Set<string>();
    teams.add('all'); // Add 'all' option
    
    const extractTeams = (items: ProjectItem[]) => {
      items.forEach(item => {
        if (item.team) {
          item.team.forEach(team => teams.add(team));
        }
        if (item.children) {
          extractTeams(item.children);
        }
      });
    };
    
    extractTeams(projectData);
    return Array.from(teams);
  }, [projectData]);

  // Get icon based on item type
  const getItemIcon = (type: string, isExpanded?: boolean) => {
    switch (type) {
      case 'Platform': return <Globe className="h-5 w-5 text-blue-500" />;
      case 'Section': return isExpanded ? <FolderOpen className="h-5 w-5 text-green-500" /> : <Folder className="h-5 w-5 text-green-500" />;
      case 'Feature': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'Project': return <Target className="h-5 w-5 text-orange-500" />;
      case 'Task': return <CheckSquare className="h-5 w-5 text-indigo-500" />;
      case 'Sub-task': return <FileText className="h-5 w-5 text-gray-500" />;
      default: return <Circle className="h-5 w-5" />;
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
    console.log('Toggled item:', id, 'Expanded:', !expandedItems.has(id));
  };

  // Expand/Collapse all functionality
  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: ProjectItem[]) => {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children) collectIds(item.children);
      });
    };
    collectIds(projectData);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
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

  // Render card view for an item and its children
  const renderCardView = (item: ProjectItem, depth: number = 0): React.ReactNode => {
    const rollupData = itemRollupData.get(item.id) || calculateRollupStatus(item);
    
    return (
      <div key={item.id} className="space-y-2">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow ${
            depth > 0 ? 'ml-' + (depth * 4) : ''
          }`}
          onClick={() => setSelectedItem(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getItemIcon(item.type)}
                <h3 className="font-semibold text-lg">{item.title}</h3>
              </div>
              <Badge className={getStatusColor(rollupData.overallStatus)}>
                {rollupData.overallStatus}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            
            {/* Team Badges */}
            {item.team && item.team.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.team.map(team => (
                  <Badge key={team} variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {team}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Progress Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Web Progress</span>
                  <span>{rollupData.webCompletion}%</span>
                </div>
                <Progress value={rollupData.webCompletion} className="h-2" />
              </div>
              {item.mobileCompletion !== undefined && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Mobile Progress</span>
                    <span>{rollupData.mobileCompletion}%</span>
                  </div>
                  <Progress value={rollupData.mobileCompletion} className="h-2" />
                </div>
              )}
            </div>
            
            {/* Metadata */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span>{item.assignee}</span>
              {item.estimatedHours && (
                <span>
                  <Clock className="h-3 w-3 inline mr-1" />
                  {item.actualHours || 0}/{item.estimatedHours}h
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Render children recursively */}
        {item.children && item.children.map(child => renderCardView(child, depth + 1))}
      </div>
    );
  };

  // Render simplified tree item
  const renderSimpleTreeItem = (item: ProjectItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    // Get pre-calculated rollup data to avoid hooks in render
    const rollupData = itemRollupData.get(item.id) || calculateRollupStatus(item);
    const isCompleted = rollupData.overallStatus === 'Completed';
    
    return (
      <div key={item.id} className="space-y-2">
        {/* Simple Tree Item */}
        <div
          className={`flex items-center space-x-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer rounded-md border-l-2 ${
            depth === 0 ? 'border-blue-500' : 
            depth === 1 ? 'border-green-500' : 
            depth === 2 ? 'border-purple-500' : 
            depth === 3 ? 'border-orange-500' : 
            depth === 4 ? 'border-indigo-500' : 
            'border-gray-500'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(item.id);
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div className="w-5">
              {isExpanded ? 
                <ChevronDown className="h-4 w-4 text-gray-600" /> : 
                <ChevronRight className="h-4 w-4 text-gray-600" />
              }
            </div>
          )}
          {!hasChildren && <div className="w-5" />}
          
          {/* Item Icon */}
          {getItemIcon(item.type, isExpanded)}
          
          {/* Title */}
          <span className="flex-1 font-medium text-sm">{item.title}</span>
          
          {/* Depth Level Indicator */}
          <span className="text-xs text-gray-400 font-mono px-2">L{depth + 1}</span>
          
          {/* Child Count */}
          {hasChildren && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {item.children?.length} items
            </span>
          )}
          
          {/* Status Badge */}
          <Badge className={`${getStatusColor(rollupData.overallStatus)} text-xs`}>
            {rollupData.overallStatus}
          </Badge>
          
          {/* Priority Badge */}
          <Badge className={`${getPriorityColor(item.priority)} text-xs`}>
            {item.priority}
          </Badge>
          
          {/* Team Badges */}
          {item.team && item.team.length > 0 && (
            <>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {item.team[0]}
              </Badge>
              {item.team.length > 1 && (
                <span className="text-xs text-gray-500">+{item.team.length - 1}</span>
              )}
            </>
          )}
          
          {/* Web Completion */}
          <div className="flex items-center space-x-1 text-xs">
            <Monitor className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">{rollupData.webCompletion}%</span>
          </div>
          
          {/* Mobile Completion */}
          <div className="flex items-center space-x-1 text-xs">
            <Smartphone className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">{rollupData.mobileCompletion}%</span>
          </div>
          
          {/* Completion Checkmark */}
          {isCompleted && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
        
        {/* Render children */}
        {isExpanded && hasChildren && (
          <div>
            {item.children?.map(child => renderSimpleTreeItem(child, depth + 1))}
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
                {item.team && item.team.length > 0 && (
                  <div>Teams: 
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.team.map(team => (
                        <Badge key={team} variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {item.reviewers && item.reviewers.length > 0 && (
                  <div>Reviewers: 
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.reviewers.map(reviewer => (
                        <Badge key={reviewer} variant="outline" className="text-xs">
                          {reviewer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Time & Budget</h3>
              <div className="space-y-2 text-sm">
                <div>Estimated Hours: {item.estimatedHours || 'Not set'}</div>
                <div>Actual Hours: {item.actualHours || 0}</div>
                <div>Start Date: {item.startDate || 'Not set'}</div>
                <div>End Date: {item.endDate || 'Not set'}</div>
                {item.budget && (
                  <div>Budget: ${item.budget.toLocaleString()}</div>
                )}
                {item.actualCost && (
                  <div>Actual Cost: ${item.actualCost.toLocaleString()}</div>
                )}
                {item.lastReviewDate && (
                  <div>Last Review: {item.lastReviewDate}</div>
                )}
                {item.nextReviewDate && (
                  <div>Next Review: {item.nextReviewDate}</div>
                )}
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

  // Filter items based on team and completion status
  const filterItems = (items: ProjectItem[]): ProjectItem[] => {
    return items.map(item => ({
      ...item,
      children: item.children ? filterItems(item.children) : undefined
    })).filter(item => {
      const teamMatch = filterTeam === 'all' || item.team?.includes(filterTeam);
      const statusMatch = showCompleted || item.status !== 'Completed';
      return teamMatch && statusMatch;
    });
  };

  const filteredData = useMemo(() => filterItems(projectData), [filterTeam, showCompleted]);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Tree View
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <Code2 className="h-4 w-4 mr-1" />
              Cards View
            </Button>
            <Button
              variant={viewMode === 'dual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('dual')}
            >
              <Monitor className="h-4 w-4 mr-1" />
              Dual View
            </Button>
          </div>

          {/* Expand/Collapse Controls */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <ChevronRight className="h-4 w-4 mr-1" />
              Collapse All
            </Button>
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Team:</span>
            <select
              className="px-3 py-1 border rounded-md bg-white dark:bg-gray-800"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              {getAllTeams.map(team => (
                <option key={team} value={team}>
                  {team === 'all' ? 'All Teams' : team}
                </option>
              ))}
            </select>
            {filterTeam !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {filterTeam}
              </Badge>
            )}
          </div>

          {/* Show Completed Toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded"
            />
            Show Completed
          </label>

          {/* Summary Stats */}
          <div className="ml-auto flex gap-4 text-sm">
            <span className="text-gray-600">
              Total Items: <strong>{filteredData.length}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Hierarchy Legend */}
      <Card className="p-4 mb-4">
        <h3 className="text-sm font-semibold mb-2">6-Level Hierarchy Structure:</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-blue-500"></div>
            <span>Level 1: Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-green-500"></div>
            <span>Level 2: Section</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-purple-500"></div>
            <span>Level 3: Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-orange-500"></div>
            <span>Level 4: Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-indigo-500"></div>
            <span>Level 5: Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-gray-500"></div>
            <span>Level 6: Sub-task</span>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="space-y-2">
        {filteredData.map(item => renderSimpleTreeItem(item))}
      </div>
      
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