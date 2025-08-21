import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  Globe, 
  Building2, 
  Layers, 
  FolderOpen, 
  CheckSquare,
  Circle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface HierarchicalItem {
  id: string;
  title: string;
  description: string;
  parentId: string | null;
  level: number; // 0=Platform, 1=Section, 2=Feature, 3=Project, 4=Task
  path: string;
  hierarchyType: 'platform' | 'section' | 'feature' | 'project' | 'task';
  completionPercentage: number;
  rollupCompletion: number;
  mvpStatus: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  actualHours: number;
  estimatedHours: number;
  reviewStatus: string;
  blockers: string[];
  dependencies: string[];
  tags: string[];
  children?: HierarchicalItem[];
  isExpanded?: boolean;
}

// Sample hierarchical data structure
const hierarchicalData: HierarchicalItem[] = [
  {
    id: 'mundo-tango-platform',
    title: 'Mundo Tango Platform',
    description: 'Global tango community platform with comprehensive social features',
    parentId: null,
    level: 0,
    path: '/mundo-tango-platform',
    hierarchyType: 'platform',
    completionPercentage: 82,
    rollupCompletion: 82,
    mvpStatus: 'In Progress',
    riskLevel: 'Low',
    actualHours: 2840,
    estimatedHours: 3500,
    reviewStatus: 'Active Development',
    blockers: [],
    dependencies: [],
    tags: ['Platform', 'Social Media', 'Global'],
    isExpanded: true,
    children: [
      {
        id: 'core-infrastructure',
        title: 'Core Infrastructure Section',
        description: 'Foundation systems including authentication, database, and security',
        parentId: 'mundo-tango-platform',
        level: 1,
        path: '/mundo-tango-platform/core-infrastructure',
        hierarchyType: 'section',
        completionPercentage: 95,
        rollupCompletion: 95,
        mvpStatus: 'Done',
        riskLevel: 'Low',
        actualHours: 890,
        estimatedHours: 920,
        reviewStatus: 'Approved',
        blockers: [],
        dependencies: [],
        tags: ['Infrastructure', 'Security', 'Backend'],
        isExpanded: true,
        children: [
          {
            id: 'authentication-feature',
            title: 'Authentication Feature',
            description: 'Complete user authentication and authorization system',
            parentId: 'core-infrastructure',
            level: 2,
            path: '/mundo-tango-platform/core-infrastructure/authentication-feature',
            hierarchyType: 'feature',
            completionPercentage: 100,
            rollupCompletion: 100,
            mvpStatus: 'Done',
            riskLevel: 'Low',
            actualHours: 340,
            estimatedHours: 350,
            reviewStatus: 'Approved',
            blockers: [],
            dependencies: [],
            tags: ['Auth', 'Security', 'JWT'],
            isExpanded: true,
            children: [
              {
                id: 'login-project',
                title: 'Login Project',
                description: 'User login functionality with OAuth integration',
                parentId: 'authentication-feature',
                level: 3,
                path: '/mundo-tango-platform/core-infrastructure/authentication-feature/login-project',
                hierarchyType: 'project',
                completionPercentage: 100,
                rollupCompletion: 100,
                mvpStatus: 'Done',
                riskLevel: 'Low',
                actualHours: 120,
                estimatedHours: 125,
                reviewStatus: 'Approved',
                blockers: [],
                dependencies: [],
                tags: ['Login', 'OAuth', 'Frontend'],
                isExpanded: true,
                children: [
                  {
                    id: 'login-form-task',
                    title: 'Login Form UI Task',
                    description: 'Design and implement login form interface',
                    parentId: 'login-project',
                    level: 4,
                    path: '/mundo-tango-platform/core-infrastructure/authentication-feature/login-project/login-form-task',
                    hierarchyType: 'task',
                    completionPercentage: 100,
                    rollupCompletion: 100,
                    mvpStatus: 'Done',
                    riskLevel: 'Low',
                    actualHours: 24,
                    estimatedHours: 25,
                    reviewStatus: 'Approved',
                    blockers: [],
                    dependencies: [],
                    tags: ['UI', 'Form', 'React']
                  },
                  {
                    id: 'oauth-integration-task',
                    title: 'OAuth Integration Task',
                    description: 'Implement Replit OAuth authentication',
                    parentId: 'login-project',
                    level: 4,
                    path: '/mundo-tango-platform/core-infrastructure/authentication-feature/login-project/oauth-integration-task',
                    hierarchyType: 'task',
                    completionPercentage: 100,
                    rollupCompletion: 100,
                    mvpStatus: 'Done',
                    riskLevel: 'Low',
                    actualHours: 48,
                    estimatedHours: 50,
                    reviewStatus: 'Approved',
                    blockers: [],
                    dependencies: [],
                    tags: ['OAuth', 'Backend', 'Security']
                  },
                  {
                    id: 'session-management-task',
                    title: 'Session Management Task',
                    description: 'Implement secure session handling',
                    parentId: 'login-project',
                    level: 4,
                    path: '/mundo-tango-platform/core-infrastructure/authentication-feature/login-project/session-management-task',
                    hierarchyType: 'task',
                    completionPercentage: 100,
                    rollupCompletion: 100,
                    mvpStatus: 'Done',
                    riskLevel: 'Low',
                    actualHours: 36,
                    estimatedHours: 40,
                    reviewStatus: 'Approved',
                    blockers: [],
                    dependencies: [],
                    tags: ['Session', 'Security', 'Backend']
                  }
                ]
              },
              {
                id: 'registration-project',
                title: 'Registration Project',
                description: 'User registration and onboarding flow',
                parentId: 'authentication-feature',
                level: 3,
                path: '/mundo-tango-platform/core-infrastructure/authentication-feature/registration-project',
                hierarchyType: 'project',
                completionPercentage: 100,
                rollupCompletion: 100,
                mvpStatus: 'Done',
                riskLevel: 'Low',
                actualHours: 180,
                estimatedHours: 185,
                reviewStatus: 'Approved',
                blockers: [],
                dependencies: ['login-project'],
                tags: ['Registration', 'Onboarding', 'Forms'],
                children: [
                  {
                    id: 'onboarding-flow-task',
                    title: 'Onboarding Flow Task',
                    description: 'Multi-step user onboarding process',
                    parentId: 'registration-project',
                    level: 4,
                    path: '/mundo-tango-platform/core-infrastructure/authentication-feature/registration-project/onboarding-flow-task',
                    hierarchyType: 'task',
                    completionPercentage: 100,
                    rollupCompletion: 100,
                    mvpStatus: 'Done',
                    riskLevel: 'Low',
                    actualHours: 120,
                    estimatedHours: 125,
                    reviewStatus: 'Approved',
                    blockers: [],
                    dependencies: [],
                    tags: ['Onboarding', 'UI', 'Flow']
                  },
                  {
                    id: 'code-of-conduct-task',
                    title: 'Code of Conduct Task',
                    description: 'Implement community code of conduct acceptance',
                    parentId: 'registration-project',
                    level: 4,
                    path: '/mundo-tango-platform/core-infrastructure/authentication-feature/registration-project/code-of-conduct-task',
                    hierarchyType: 'task',
                    completionPercentage: 100,
                    rollupCompletion: 100,
                    mvpStatus: 'Done',
                    riskLevel: 'Low',
                    actualHours: 60,
                    estimatedHours: 60,
                    reviewStatus: 'Approved',
                    blockers: [],
                    dependencies: [],
                    tags: ['Legal', 'Community', 'Forms']
                  }
                ]
              }
            ]
          },
          {
            id: 'database-feature',
            title: 'Database Feature',
            description: 'PostgreSQL database with comprehensive schema and RLS policies',
            parentId: 'core-infrastructure',
            level: 2,
            path: '/mundo-tango-platform/core-infrastructure/database-feature',
            hierarchyType: 'feature',
            completionPercentage: 90,
            rollupCompletion: 90,
            mvpStatus: 'In Progress',
            riskLevel: 'Low',
            actualHours: 550,
            estimatedHours: 570,
            reviewStatus: 'In Review',
            blockers: [],
            dependencies: [],
            tags: ['Database', 'PostgreSQL', 'Schema'],
            children: [
              {
                id: 'schema-design-project',
                title: 'Schema Design Project',
                description: 'Complete database schema with relationships',
                parentId: 'database-feature',
                level: 3,
                path: '/mundo-tango-platform/core-infrastructure/database-feature/schema-design-project',
                hierarchyType: 'project',
                completionPercentage: 95,
                rollupCompletion: 95,
                mvpStatus: 'Done',
                riskLevel: 'Low',
                actualHours: 280,
                estimatedHours: 290,
                reviewStatus: 'Approved',
                blockers: [],
                dependencies: [],
                tags: ['Schema', 'Design', 'Tables']
              },
              {
                id: 'rls-policies-project',
                title: 'RLS Policies Project',
                description: 'Row-Level Security implementation',
                parentId: 'database-feature',
                level: 3,
                path: '/mundo-tango-platform/core-infrastructure/database-feature/rls-policies-project',
                hierarchyType: 'project',
                completionPercentage: 85,
                rollupCompletion: 85,
                mvpStatus: 'In Progress',
                riskLevel: 'Medium',
                actualHours: 270,
                estimatedHours: 280,
                reviewStatus: 'In Review',
                blockers: ['Security Audit'],
                dependencies: ['schema-design-project'],
                tags: ['Security', 'RLS', 'Policies']
              }
            ]
          }
        ]
      },
      {
        id: 'user-interface-section',
        title: 'User Interface Section',
        description: 'Frontend user experience and interface components',
        parentId: 'mundo-tango-platform',
        level: 1,
        path: '/mundo-tango-platform/user-interface-section',
        hierarchyType: 'section',
        completionPercentage: 75,
        rollupCompletion: 75,
        mvpStatus: 'In Progress',
        riskLevel: 'Medium',
        actualHours: 1200,
        estimatedHours: 1600,
        reviewStatus: 'Active Development',
        blockers: [],
        dependencies: ['core-infrastructure'],
        tags: ['Frontend', 'UI/UX', 'React'],
        children: [
          {
            id: 'mobile-app-feature',
            title: 'Mobile App Feature',
            description: 'Responsive mobile interface and PWA functionality',
            parentId: 'user-interface-section',
            level: 2,
            path: '/mundo-tango-platform/user-interface-section/mobile-app-feature',
            hierarchyType: 'feature',
            completionPercentage: 80,
            rollupCompletion: 80,
            mvpStatus: 'In Progress',
            riskLevel: 'Medium',
            actualHours: 600,
            estimatedHours: 800,
            reviewStatus: 'In Review',
            blockers: [],
            dependencies: ['authentication-feature'],
            tags: ['Mobile', 'PWA', 'Responsive']
          },
          {
            id: 'desktop-interface-feature',
            title: 'Desktop Interface Feature',
            description: 'Full desktop experience with advanced functionality',
            parentId: 'user-interface-section',
            level: 2,
            path: '/mundo-tango-platform/user-interface-section/desktop-interface-feature',
            hierarchyType: 'feature',
            completionPercentage: 70,
            rollupCompletion: 70,
            mvpStatus: 'In Progress',
            riskLevel: 'Medium',
            actualHours: 600,
            estimatedHours: 800,
            reviewStatus: 'Active Development',
            blockers: ['Performance Optimization'],
            dependencies: ['mobile-app-feature'],
            tags: ['Desktop', 'Advanced', 'Performance']
          }
        ]
      },
      {
        id: 'advanced-features-section',
        title: 'Advanced Features Section',
        description: 'AI integration, analytics, and premium functionality',
        parentId: 'mundo-tango-platform',
        level: 1,
        path: '/mundo-tango-platform/advanced-features-section',
        hierarchyType: 'section',
        completionPercentage: 60,
        rollupCompletion: 60,
        mvpStatus: 'Planned',
        riskLevel: 'High',
        actualHours: 750,
        estimatedHours: 1980,
        reviewStatus: 'Planning',
        blockers: ['Budget Approval', 'Technical Research'],
        dependencies: ['user-interface-section'],
        tags: ['Advanced', 'AI', 'Analytics'],
        children: [
          {
            id: 'ai-integration-feature',
            title: 'AI Integration Feature',
            description: 'Machine learning and AI-powered recommendations',
            parentId: 'advanced-features-section',
            level: 2,
            path: '/mundo-tango-platform/advanced-features-section/ai-integration-feature',
            hierarchyType: 'feature',
            completionPercentage: 40,
            rollupCompletion: 40,
            mvpStatus: 'Planned',
            riskLevel: 'High',
            actualHours: 200,
            estimatedHours: 1200,
            reviewStatus: 'Research',
            blockers: ['AI Model Selection', 'Budget Approval'],
            dependencies: ['desktop-interface-feature'],
            tags: ['AI', 'ML', 'Recommendations']
          },
          {
            id: 'analytics-feature',
            title: 'Analytics Feature',
            description: 'Comprehensive analytics and reporting dashboard',
            parentId: 'advanced-features-section',
            level: 2,
            path: '/mundo-tango-platform/advanced-features-section/analytics-feature',
            hierarchyType: 'feature',
            completionPercentage: 80,
            rollupCompletion: 80,
            mvpStatus: 'In Progress',
            riskLevel: 'Low',
            actualHours: 550,
            estimatedHours: 780,
            reviewStatus: 'In Review',
            blockers: [],
            dependencies: ['database-feature'],
            tags: ['Analytics', 'Reporting', 'Dashboard']
          }
        ]
      }
    ]
  }
];

interface TreeNodeProps {
  item: HierarchicalItem;
  onItemClick: (item: HierarchicalItem) => void;
  onToggleExpand: (itemId: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, onItemClick, onToggleExpand }) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'platform': return Globe;
      case 'section': return Building2;
      case 'feature': return Layers;
      case 'project': return FolderOpen;
      case 'task': return CheckSquare;
      default: return Circle;
    }
  };

  const getIndentLevel = (level: number) => {
    return level * 24; // 24px per level
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return 'bg-green-600 text-white';
      case 'In Progress': return 'bg-blue-600 text-white';
      case 'Planned': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const Icon = getIconByType(item.hierarchyType);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="w-full">
      <Card 
        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] mb-2"
        style={{ marginLeft: `${getIndentLevel(item.level)}px` }}
        onClick={() => onItemClick(item)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(item.id);
                  }}
                >
                  {item.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}

              {/* Icon */}
              <div className={`p-2 rounded-lg ${
                item.hierarchyType === 'platform' ? 'bg-blue-600' :
                item.hierarchyType === 'section' ? 'bg-purple-600' :
                item.hierarchyType === 'feature' ? 'bg-green-600' :
                item.hierarchyType === 'project' ? 'bg-orange-600' :
                'bg-gray-600'
              }`}>
                <Icon className="h-4 w-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <Badge className={`text-xs ${getStatusColor(item.mvpStatus)}`}>
                    {item.mvpStatus}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Completion</span>
                    <span className="font-medium">{item.completionPercentage}%</span>
                  </div>
                  <Progress value={item.completionPercentage} className="h-2" />
                </div>
              </div>
            </div>

            {/* Right Side Metadata */}
            <div className="flex flex-col items-end gap-2 ml-4">
              <Badge variant="outline" className={`text-xs ${getRiskColor(item.riskLevel)}`}>
                {item.riskLevel} Risk
              </Badge>
              
              <div className="text-xs text-gray-500">
                {item.actualHours}h / {item.estimatedHours}h
              </div>

              {/* Blockers indicator */}
              {item.blockers.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{item.blockers.length} blocker{item.blockers.length > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Dependencies indicator */}
              {item.dependencies.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span>{item.dependencies.length} dep{item.dependencies.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render Children */}
      {hasChildren && item.isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              onItemClick={onItemClick}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface HierarchicalTreeViewProps {
  onItemClick: (item: HierarchicalItem) => void;
}

export const HierarchicalTreeView: React.FC<HierarchicalTreeViewProps> = ({ onItemClick }) => {
  const [treeData, setTreeData] = useState<HierarchicalItem[]>(hierarchicalData);

  const handleToggleExpand = (itemId: string) => {
    const updateItemExpansion = (items: HierarchicalItem[]): HierarchicalItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: updateItemExpansion(item.children) };
        }
        return item;
      });
    };

    setTreeData(updateItemExpansion(treeData));
  };

  const handleCollapseAll = () => {
    const collapseAllItems = (items: HierarchicalItem[]): HierarchicalItem[] => {
      return items.map(item => ({
        ...item,
        isExpanded: false,
        children: item.children ? collapseAllItems(item.children) : undefined
      }));
    };

    setTreeData(collapseAllItems(treeData));
  };

  const handleExpandAll = () => {
    const expandAllItems = (items: HierarchicalItem[]): HierarchicalItem[] => {
      return items.map(item => ({
        ...item,
        isExpanded: true,
        children: item.children ? expandAllItems(item.children) : undefined
      }));
    };

    setTreeData(expandAllItems(treeData));
  };

  return (
    <div className="space-y-4">
      {/* Tree Controls */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpandAll}
          className="text-xs"
        >
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCollapseAll}
          className="text-xs"
        >
          Collapse All
        </Button>
        <div className="text-sm text-gray-500 ml-4">
          Platform → Section → Feature → Project → Task Hierarchy
        </div>
      </div>

      {/* Tree Structure */}
      <div className="space-y-2">
        {treeData.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            onToggleExpand={handleToggleExpand}
          />
        ))}
      </div>
    </div>
  );
};

export default HierarchicalTreeView;