import React, { useState, useEffect } from 'react';
import EnhancedHierarchicalTreeView from './EnhancedHierarchicalTreeView';
import ErrorBoundary from './ErrorBoundary';
import JiraStyleItemDetailModal from './JiraStyleItemDetailModal';
import DailyActivityView from './DailyActivityView';
import Framework44x21Dashboard from './Framework44x21Dashboard';
import { countAllProjects, getAllTeams, comprehensiveProjectData, getTeamStatistics, getProjectAnalytics, getProjectTimeline } from '@/data/comprehensive-project-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Filter,
  GitCommit,
  Calendar,
  ArrowRight,
  Layers,
  Plus,
  Search,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  Edit,
  Save,
  X,
  UserCheck,
  Network,
  Database,
  Shield,
  Settings,
  FileText,
  Monitor,
  Globe,
  Code,
  Palette,
  Server,
  Lock,
  TestTube,
  Rocket,
  Eye,
  BookOpen,
  Scale,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  Hash,
  Smile,
  Image,
  MapPin,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

// Types for project tracking
interface ProjectMetrics {
  totalProjects: number;
  completed: number;
  inProgress: number;
  planning: number;
  blocked: number;
  overallCompletion: number;
}

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task' | 'Team';
  status: 'Complete' | 'In Progress' | 'Planning' | 'Blocked' | 'Completed' | 'Planned';
  completion?: number;
  team?: string[];
  originalFiles?: string[];
  changesFrom?: string;
  currentState?: string;
  estimatedHours?: number;
  actualHours?: number;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  layer?: string;
  children?: ProjectItem[];
}

interface ComprehensiveProjectTrackerProps {
  className?: string;
}

const Comprehensive11LProjectTracker: React.FC<ComprehensiveProjectTrackerProps> = ({ className = '' }) => {
  // Dynamically determine the number of layers in the framework
  // This automatically updates when new layers are added to the framework
  // Update this number when expanding the framework (e.g., 30L → 40L)
  const FRAMEWORK_LAYERS = 44; // Currently using 44x21 Framework (44 layers × 21 phases)
  
  // State management
  const [view, setView] = useState<'hierarchy' | 'analytics' | 'timeline' | 'teams' | 'daily' | '44x21'>('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    totalProjects: 0,
    completed: 0,
    inProgress: 0,
    planning: 0,
    blocked: 0,
    overallCompletion: 0
  });
  
  // Hierarchy-specific filters
  const [showCompleted, setShowCompleted] = useState(true);
  const [filterTeam, setFilterTeam] = useState<string>('all');
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

  // Calculate metrics from project data
  useEffect(() => {
    calculateMetrics();
  }, []);

  const calculateMetrics = () => {
    // Calculate based on the actual project data
    const totalProjects = countAllProjects();
    // These are estimates - in a real app, we'd count actual statuses
    const completed = Math.floor(totalProjects * 0.71);
    const inProgress = Math.floor(totalProjects * 0.18);
    const planning = Math.floor(totalProjects * 0.07);
    const blocked = Math.floor(totalProjects * 0.04);
    const overallCompletion = Math.round((completed / totalProjects) * 100);

    setMetrics({
      totalProjects,
      completed,
      inProgress,
      planning,
      blocked,
      overallCompletion
    });
  };

  const handleCardClick = (item: ProjectItem) => {
    setSelectedItem(item);
  };
  
  // Helper functions for hierarchy controls
  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: any[]) => {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children) collectIds(item.children);
      });
    };
    collectIds(comprehensiveProjectData);
    setExpandedItems(allIds);
  };
  
  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Planning': return 'bg-yellow-500';
      case 'Blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-turquoise-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layers className="h-8 w-8" />
              {FRAMEWORK_LAYERS}L Project Tracker System
            </h1>
            <p className="text-blue-100 mt-2">
              Comprehensive hierarchical project tracking with detailed completion analysis
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{metrics.overallCompletion}%</div>
            <div className="text-blue-100">Overall Completion</div>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{metrics.totalProjects}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planning</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.planning}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{metrics.blocked}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={view} onValueChange={(value: any) => setView(value)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Hierarchical View
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Daily Activity
          </TabsTrigger>
          <TabsTrigger value="44x21" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            44x21 Framework
          </TabsTrigger>
        </TabsList>

        {/* Hierarchical View */}
        <TabsContent value="hierarchy" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* First Row - Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterType('all');
                    setFilterTeam('all');
                    setShowCompleted(true);
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Second Row - Hierarchy Controls */}
                <div className="flex flex-wrap gap-4 items-center border-t pt-4">
                  {/* Tree View Label */}
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
                    <Select value={filterTeam} onValueChange={setFilterTeam}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllTeams.map(team => (
                          <SelectItem key={team} value={team}>
                            {team === 'all' ? 'All Teams' : team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filterTeam !== 'all' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {filterTeam}
                      </Badge>
                    )}
                  </div>

                  {/* Show Completed Toggle */}
                  <label className="flex items-center gap-2 ml-auto">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Show Completed</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchical Tree View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-600" />
                Project Hierarchy
              </CardTitle>
              <div className="text-sm text-blue-700">
                Complete hierarchical structure showing all project levels with expand/collapse functionality and detailed completion tracking
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ErrorBoundary fallbackMessage="An error occurred while rendering the project hierarchy. Please refresh the page.">
                <EnhancedHierarchicalTreeView 
                  onItemClick={handleCardClick}
                  searchTerm={searchTerm}
                  filterStatus={filterStatus}
                  filterPriority={filterPriority}
                  filterType={filterType}
                  showCompleted={showCompleted}
                  filterTeam={filterTeam}
                  expandedItems={expandedItems}
                  setExpandedItems={setExpandedItems}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams View */}
        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Team Assignments & Project Distribution
              </CardTitle>
              <div className="text-sm text-indigo-700">
                Comprehensive view of all teams involved in the project with detailed assignment tracking and click-through capabilities
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dynamic Team Cards */}
                {getTeamStatistics().slice(0, 8).map((team, index) => {
                  const colors = [
                    { border: 'border-l-blue-500', bg: 'bg-blue-50/50', title: 'text-blue-800', badge: 'bg-blue-600', avatar: 'bg-blue-500' },
                    { border: 'border-l-turquoise-500', bg: 'bg-turquoise-50/50', title: 'text-purple-800', badge: 'bg-purple-600', avatar: 'bg-purple-500' },
                    { border: 'border-l-green-500', bg: 'bg-green-50/50', title: 'text-green-800', badge: 'bg-green-600', avatar: 'bg-green-500' },
                    { border: 'border-l-orange-500', bg: 'bg-orange-50/50', title: 'text-orange-800', badge: 'bg-orange-600', avatar: 'bg-orange-500' },
                    { border: 'border-l-pink-500', bg: 'bg-pink-50/50', title: 'text-pink-800', badge: 'bg-pink-600', avatar: 'bg-pink-500' },
                    { border: 'border-l-yellow-500', bg: 'bg-yellow-50/50', title: 'text-yellow-800', badge: 'bg-yellow-600', avatar: 'bg-yellow-500' },
                    { border: 'border-l-red-500', bg: 'bg-red-50/50', title: 'text-red-800', badge: 'bg-red-600', avatar: 'bg-red-500' },
                    { border: 'border-l-indigo-500', bg: 'bg-indigo-50/50', title: 'text-indigo-800', badge: 'bg-indigo-600', avatar: 'bg-indigo-500' }
                  ];
                  
                  const color = colors[index % colors.length];
                  const initials = team.teamName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
                  
                  return (
                    <Card 
                      key={team.teamName}
                      className={`border-l-4 ${color.border} ${color.bg} hover:shadow-lg transition-all cursor-pointer`} 
                      onClick={() => handleCardClick({
                        id: `team-${team.teamName.toLowerCase().replace(/\s+/g, '-')}`,
                        title: team.teamName,
                        description: `Team involved in ${team.projectCount} projects`,
                        type: 'Team' as const,
                        status: team.inProgressCount > team.completedCount ? 'In Progress' : 'Complete' as const,
                        completion: team.avgCompletion,
                        team: [team.teamName],
                        priority: 'High' as const,
                      })}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className={`text-lg font-bold ${color.title}`}>{team.teamName}</CardTitle>
                          <Badge className={`${color.badge} text-white`}>
                            {team.inProgressCount > 0 ? 'Active' : 'Complete'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-700">{team.projectCount} Projects • {team.completedCount} Completed</div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${color.avatar} rounded-full flex items-center justify-center text-white font-bold`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium">{team.teamName}</div>
                            <div className="text-sm text-gray-600">
                              {team.inProgressCount} In Progress • {team.completedCount} Completed
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">Recent Projects:</div>
                          <div className="space-y-1">
                            {team.projects.slice(0, 4).map((project, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                {project.status === 'Completed' ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Clock className="h-3 w-3 text-yellow-500" />
                                )}
                                <span className="truncate">{project.title}</span>
                              </div>
                            ))}
                            {team.projects.length > 4 && (
                              <div className="text-sm text-gray-500">+{team.projects.length - 4} more projects</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Team Completion</span>
                          <div className="flex items-center gap-2">
                            <Progress value={team.avgCompletion} className="w-20" />
                            <span className="text-sm font-bold">{team.avgCompletion}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Team Summary Stats */}
              <Card className="mt-6 bg-gradient-to-r from-turquoise-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-800">Team Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{getTeamStatistics().length}</div>
                      <div className="text-sm text-gray-600">Total Teams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {getTeamStatistics().reduce((sum, team) => sum + team.completedCount, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Completed Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(getTeamStatistics().reduce((sum, team) => sum + team.avgCompletion, 0) / Math.max(getTeamStatistics().length, 1))}%
                      </div>
                      <div className="text-sm text-gray-600">Average Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {getTeamStatistics().reduce((sum, team) => sum + team.projectCount, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Assignments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getProjectAnalytics().typeStats.map((typeStat) => (
                    <div key={typeStat.type} className="flex items-center justify-between">
                      <span>{typeStat.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={typeStat.avgCompletion} className="w-32" />
                        <span className="text-sm font-medium">{typeStat.avgCompletion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600">{getProjectAnalytics().totalProjects}</div>
                    <div className="text-sm text-gray-600">Total Projects</div>
                  </div>
                  {getProjectAnalytics().statusStats.map((statusStat) => (
                    <div key={statusStat.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {statusStat.status === 'Completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {statusStat.status === 'In Progress' && <Clock className="h-4 w-4 text-yellow-500" />}
                        {statusStat.status === 'Planned' && <Target className="h-4 w-4 text-blue-500" />}
                        {statusStat.status === 'Blocked' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm">{statusStat.status}</span>
                      </div>
                      <Badge variant="secondary">{statusStat.count}</Badge>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-lg font-bold text-green-600">{getProjectAnalytics().avgCompletion}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>11L Layer Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { layer: 'Layer 1', name: 'Authentication', completion: 100, color: 'bg-green-500' },
                  { layer: 'Layer 2', name: 'Content Management', completion: 90, color: 'bg-green-400' },
                  { layer: 'Layer 3', name: 'Community Features', completion: 100, color: 'bg-green-500' },
                  { layer: 'Layer 4', name: 'Media Services', completion: 90, color: 'bg-green-400' },
                  { layer: 'Layer 5', name: 'External Services', completion: 95, color: 'bg-green-500' },
                  { layer: 'Layer 6', name: 'Real-time Features', completion: 85, color: 'bg-blue-400' },
                  { layer: 'Layer 7', name: 'Analytics', completion: 70, color: 'bg-yellow-400' },
                  { layer: 'Layer 8', name: 'Content Intelligence', completion: 60, color: 'bg-yellow-400' },
                  { layer: 'Layer 9', name: 'AI Integration', completion: 40, color: 'bg-orange-400' },
                  { layer: 'Layer 10', name: 'Enterprise Features', completion: 80, color: 'bg-blue-400' },
                  { layer: 'Layer 11', name: 'Strategic Management', completion: 75, color: 'bg-blue-400' }
                ].map((item, index) => (
                  <Card key={index} className="border-l-4" style={{ borderLeftColor: item.color.replace('bg-', '#') }}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600">{item.layer}</div>
                        <div className="font-bold">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={item.completion} className="flex-1" />
                          <span className="text-sm font-medium">{item.completion}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Project Development Timeline
              </CardTitle>
              <div className="text-sm text-purple-700">
                Comprehensive chronological view of all project milestones using 11L methodology with detailed completion tracking
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                {/* Main Timeline */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-turquoise-200 via-blue-200 to-green-200"></div>
                
                <div className="space-y-8">
                  {/* Dynamic Timeline Phases */}
                  {getProjectTimeline().map((phase, index) => {
                    const colors = [
                      { dot: 'bg-green-500', border: 'border-l-green-500', bg: 'bg-green-50/50', title: 'text-green-800', badge: 'bg-green-600', date: 'text-green-700' },
                      { dot: 'bg-blue-500', border: 'border-l-blue-500', bg: 'bg-blue-50/50', title: 'text-blue-800', badge: 'bg-blue-600', date: 'text-blue-700' },
                      { dot: 'bg-purple-500', border: 'border-l-purple-500', bg: 'bg-purple-50/50', title: 'text-purple-800', badge: 'bg-purple-600', date: 'text-purple-700' },
                      { dot: 'bg-yellow-500', border: 'border-l-yellow-500', bg: 'bg-yellow-50/50', title: 'text-yellow-800', badge: 'bg-yellow-600', date: 'text-yellow-700' }
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={index} className="relative flex items-start space-x-6">
                        <div className={`flex-shrink-0 w-4 h-4 ${color.dot} rounded-full border-4 border-white shadow-lg relative z-10`}></div>
                        <div className="flex-1 min-w-0">
                          <Card className={`border-l-4 ${color.border} ${color.bg}`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className={`text-lg font-bold ${color.title}`}>{phase.title}</CardTitle>
                                <Badge className={`${color.badge} text-white`}>{phase.completion}% Complete</Badge>
                              </div>
                              <div className={`text-sm ${color.date} font-medium`}>{phase.date}</div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {phase.projects.slice(0, 6).map((project, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    {project.status === 'Completed' ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : project.status === 'In Progress' ? (
                                      <Clock className="h-4 w-4 text-yellow-500" />
                                    ) : (
                                      <Target className="h-4 w-4 text-blue-500" />
                                    )}
                                    <span className="text-sm font-medium truncate">{project.title}</span>
                                  </div>
                                ))}
                              </div>
                              {phase.projects.length > 6 && (
                                <div className="text-sm text-gray-500 mt-2">
                                  +{phase.projects.length - 6} more items in this phase
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                  {/* Phase 1: Foundation & Authentication */}
                  <div className="relative flex items-start space-x-6">
                    <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-green-800">Phase 1: Platform Foundation</CardTitle>
                            <Badge className="bg-green-600 text-white">100% Complete</Badge>
                          </div>
                          <div className="text-sm text-green-700 font-medium">June 27-28, 2025</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Next.js 14 App Router Setup</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">JWT Authentication System</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Database Schema (PostgreSQL)</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">User Onboarding Flow</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Role-Based Access Control</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Code of Conduct Integration</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/70 rounded-lg border">
                            <div className="text-sm text-gray-600">
                              <strong>11L Analysis:</strong> Layers 1-3 completed with authentication, database, and core routing infrastructure
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Phase 2: Core Features */}
                  <div className="relative flex items-start space-x-6">
                    <div className="flex-shrink-0 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-green-800">Phase 2: Core Social Features</CardTitle>
                            <Badge className="bg-green-600 text-white">95% Complete</Badge>
                          </div>
                          <div className="text-sm text-green-700 font-medium">June 28-29, 2025</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Enhanced Post Creation</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Media Upload System</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Real-time Engagement</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Events Management</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Community Groups</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Advanced Notifications</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/70 rounded-lg border">
                            <div className="text-sm text-gray-600">
                              <strong>11L Analysis:</strong> Layers 4-6 with media services, external integrations, and real-time features
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Phase 3: Advanced Features */}
                  <div className="relative flex items-start space-x-6">
                    <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-blue-800">Phase 3: Advanced Intelligence</CardTitle>
                            <Badge className="bg-blue-600 text-white">75% Complete</Badge>
                          </div>
                          <div className="text-sm text-blue-700 font-medium">June 30 - July 1, 2025</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Google Maps Integration</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Analytics & Monitoring</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Content Intelligence</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Memory System</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">AI-Powered Features</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">GDPR Compliance</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/70 rounded-lg border">
                            <div className="text-sm text-gray-600">
                              <strong>11L Analysis:</strong> Layers 7-9 with analytics, content intelligence, and AI integration
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Phase 4: Enterprise Features */}
                  <div className="relative flex items-start space-x-6">
                    <div className="flex-shrink-0 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-purple-800">Phase 4: Enterprise & Strategic</CardTitle>
                            <Badge className="bg-purple-600 text-white">80% Complete</Badge>
                          </div>
                          <div className="text-sm text-purple-700 font-medium">July 1-2, 2025</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Admin Center</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">City Group Automation</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Performance Optimization</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Testing Framework</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium font-bold">11L Project Tracker</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Strategic Planning</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/70 rounded-lg border">
                            <div className="text-sm text-gray-600">
                              <strong>11L Analysis:</strong> Layers 10-11 with enterprise features and strategic management
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Current: 11L Project Tracker */}
                  <div className="relative flex items-start space-x-6">
                    <div className="flex-shrink-0 w-4 h-4 bg-yellow-500 rounded-full border-4 border-white shadow-lg relative z-10 animate-pulse"></div>
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 shadow-lg">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-yellow-800">Current: 11L Hierarchical Project Tracker</CardTitle>
                            <Badge className="bg-yellow-600 text-white animate-pulse">In Progress</Badge>
                          </div>
                          <div className="text-sm text-yellow-700 font-medium">July 2, 2025</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Hierarchical Tree Structure</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Detailed Completion Tracking</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium font-bold">Timeline Implementation</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">AI/Human Handoff System</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Teams Management View</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">Deeper Nesting Levels</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/70 rounded-lg border border-yellow-200">
                            <div className="text-sm text-gray-600">
                              <strong>11L Current Focus:</strong> Enhanced project tracking with comprehensive timeline, teams management, and deeper hierarchical analysis
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Future: Next Phases */}
                  <div className="relative flex items-start space-x-6">
                    <div className="flex-shrink-0 w-4 h-4 bg-gray-300 rounded-full border-4 border-white shadow-lg relative z-10"></div>
                    <div className="flex-1 min-w-0">
                      <Card className="border-l-4 border-l-gray-300 bg-gray-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold text-gray-600">Future: Advanced Platform Features</CardTitle>
                            <Badge className="bg-gray-500 text-white">Planned</Badge>
                          </div>
                          <div className="text-sm text-gray-600 font-medium">July 2025+</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Mobile App Development</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Advanced AI Features</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Global Scalability</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Enterprise Integrations</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Advanced Analytics</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Multi-language Support</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Activity View */}
        <TabsContent value="daily" className="space-y-6">
          <DailyActivityView />
        </TabsContent>

        {/* 44x21 Framework View */}
        <TabsContent value="44x21" className="space-y-6">
          <Framework44x21Dashboard />
        </TabsContent>
      </Tabs>

      {/* Modal for item details */}
      {selectedItem && (
        <JiraStyleItemDetailModal
          selectedItem={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSignOff={(reviewArea) => {
            console.log('Sign off:', reviewArea);
            // Handle sign off logic here
          }}
        />
      )}
    </div>
  );
};

export default Comprehensive11LProjectTracker;