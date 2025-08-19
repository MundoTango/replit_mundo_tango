import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Eye, Clock, CheckCircle2, Users, Code2, Smartphone, Monitor, Globe, Circle, Zap, Target, CheckSquare, FileText, Folder, FolderOpen } from 'lucide-react';
import JiraStyleItemDetailModal from './JiraStyleItemDetailModal';
import { comprehensiveProjectData, ProjectItem, getAllTeams } from '../../data/comprehensive-project-data';

// Move large data structure outside component to prevent initialization errors
const createProjectData = (): ProjectItem[] => comprehensiveProjectData;
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

interface EnhancedHierarchicalTreeViewProps {
  onItemClick?: (item: ProjectItem) => void;
  searchTerm?: string;
  filterStatus?: string;
  filterPriority?: string;
  filterType?: string;
  showCompleted?: boolean;
  filterTeam?: string;
  expandedItems?: Set<string>;
  setExpandedItems?: (items: Set<string>) => void;
}

const EnhancedHierarchicalTreeView: React.FC<EnhancedHierarchicalTreeViewProps> = ({ 
  onItemClick,
  searchTerm = '',
  filterStatus = 'all',
  filterPriority = 'all',
  filterType = 'all',
  showCompleted: showCompletedProp = true,
  filterTeam: filterTeamProp = 'all',
  expandedItems: expandedItemsProp,
  setExpandedItems: setExpandedItemsProp
}) => {
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [modalKey, setModalKey] = useState(0); // Force re-render key
  
  // Use parent's state if provided, otherwise use local state
  const [localExpandedItems, setLocalExpandedItems] = useState<Set<string>>(new Set([
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
  
  const expandedItems = expandedItemsProp || localExpandedItems;
  const setExpandedItems = setExpandedItemsProp || setLocalExpandedItems;
  
  const [viewMode, setViewMode] = useState<'tree' | 'cards' | 'dual'>('dual');
  
  // Use parent's filters
  const showCompleted = showCompletedProp;
  const filterTeam = filterTeamProp;

  // Initialize project data using factory function
  const projectData = useMemo(() => createProjectData(), []);

  // Filter project data based on search and filters
  const filteredProjectData = useMemo(() => {
    const filterItem = (item: ProjectItem): ProjectItem | null => {
      // Type filter
      if (filterType !== 'all' && item.type.toLowerCase() !== filterType.toLowerCase()) {
        // If this item doesn't match the type filter, check if any children do
        if (item.children) {
          const filteredChildren = item.children
            .map(child => filterItem(child))
            .filter(child => child !== null) as ProjectItem[];
          
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        return null;
      }

      // Status filter
      if (filterStatus !== 'all') {
        const statusMatch = filterStatus === 'complete' ? 'Completed' :
                           filterStatus === 'in-progress' ? 'In Progress' :
                           filterStatus === 'planning' ? 'Planned' :
                           filterStatus === 'blocked' ? 'Blocked' : '';
        
        if (item.status !== statusMatch) {
          if (item.children) {
            const filteredChildren = item.children
              .map(child => filterItem(child))
              .filter(child => child !== null) as ProjectItem[];
            
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          return null;
        }
      }

      // Priority filter
      if (filterPriority !== 'all') {
        const priorityMatch = filterPriority === 'high' ? 'High' :
                             filterPriority === 'medium' ? 'Medium' :
                             filterPriority === 'low' ? 'Low' : '';
        
        if (item.priority !== priorityMatch) {
          if (item.children) {
            const filteredChildren = item.children
              .map(child => filterItem(child))
              .filter(child => child !== null) as ProjectItem[];
            
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          return null;
        }
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = item.title.toLowerCase().includes(searchLower) ||
                             (item.description && item.description.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) {
          if (item.children) {
            const filteredChildren = item.children
              .map(child => filterItem(child))
              .filter(child => child !== null) as ProjectItem[];
            
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          return null;
        }
      }

      // If item passes all filters, include it with filtered children
      if (item.children) {
        const filteredChildren = item.children
          .map(child => filterItem(child))
          .filter(child => child !== null) as ProjectItem[];
        
        return { ...item, children: filteredChildren };
      }

      return item;
    };

    return projectData
      .map(item => filterItem(item))
      .filter(item => item !== null) as ProjectItem[];
  }, [projectData, searchTerm, filterStatus, filterPriority, filterType]);

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
    
    processItems(filteredProjectData);
    return rollupMap;
  }, [filteredProjectData]);

  // Extract all unique teams from the project data


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
            // If clicking on the expand/collapse area, toggle expansion
            const target = e.target as HTMLElement;
            if (target.closest('.expand-area')) {
              toggleExpanded(item.id);
            } else {
              // Otherwise show the modal with defensive state management
              console.log(`Opening modal for item: ${item.title}`);
              setSelectedItem({...item}); // Clone to prevent reference issues
            }
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div className="w-5 expand-area">
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

  // Apply team and completion filters to already filtered data
  const filteredData = useMemo(() => {
    const filterByTeamAndCompletion = (items: ProjectItem[]): ProjectItem[] => {
      return items.filter(item => {
        const teamMatch = filterTeam === 'all' || (item.team && item.team.includes(filterTeam));
        const statusMatch = showCompleted || item.status !== 'Completed';
        
        // If item doesn't match but has children, check if any children match
        if (!teamMatch || !statusMatch) {
          if (item.children) {
            const filteredChildren = filterByTeamAndCompletion(item.children);
            if (filteredChildren.length > 0) {
              return true; // Include parent if it has matching children
            }
          }
          return false;
        }
        return true;
      }).map(item => ({
        ...item,
        children: item.children ? filterByTeamAndCompletion(item.children) : undefined
      }));
    };
    
    return filterByTeamAndCompletion(filteredProjectData);
  }, [filterTeam, showCompleted, filteredProjectData]);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Tree View Only */}
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <FolderOpen className="h-4 w-4 text-gray-500" />
            <span>Tree View</span>
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
        <JiraStyleItemDetailModal
          selectedItem={selectedItem}
          onClose={() => {
            console.log('Closing project detail modal');
            setSelectedItem(null);
          }}
          onSignOff={(reviewArea) => {
            console.log(`Sign off requested for: ${reviewArea}`);
            // Handle sign-off logic here if needed
          }}
        />
      )}
    </div>
  );
};

export default EnhancedHierarchicalTreeView;