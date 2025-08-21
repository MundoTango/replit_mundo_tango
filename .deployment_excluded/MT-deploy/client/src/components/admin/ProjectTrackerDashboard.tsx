import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Filter,
  GitCommit,
  Layers,
  Plus,
  Search,
  Target,
  TrendingUp,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useProjects, useProjectMetrics, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { toast } from '@/hooks/use-toast';
import type { Project } from '@shared/schema';

// ESA 61x21 Framework Definitions - All 61 Layers
const LAYER_DEFINITIONS = [
  { id: 1, name: 'Database Architecture', color: 'bg-blue-500', icon: '🗄️' },
  { id: 2, name: 'API Structure', color: 'bg-green-500', icon: '⚙️' },
  { id: 3, name: 'Server Framework', color: 'bg-purple-500', icon: '🖥️' },
  { id: 4, name: 'Authentication', color: 'bg-red-500', icon: '🔐' },
  { id: 5, name: 'Authorization', color: 'bg-orange-500', icon: '🛡️' },
  { id: 6, name: 'Data Validation', color: 'bg-cyan-500', icon: '✅' },
  { id: 7, name: 'State Management', color: 'bg-indigo-500', icon: '📊' },
  { id: 8, name: 'Client Framework', color: 'bg-pink-500', icon: '⚛️' },
  { id: 9, name: 'UI Framework', color: 'bg-amber-500', icon: '🎨' },
  { id: 10, name: 'Component Library', color: 'bg-gray-500', icon: '📦' },
  { id: 11, name: 'Real-time Features', color: 'bg-emerald-500', icon: '⚡' },
  { id: 12, name: 'Data Management', color: 'bg-teal-500', icon: '💾' },
  { id: 13, name: 'Business Logic', color: 'bg-violet-500', icon: '🧮' },
  { id: 14, name: 'Integration', color: 'bg-rose-500', icon: '🔗' },
  { id: 15, name: 'Testing', color: 'bg-lime-500', icon: '🧪' },
  { id: 16, name: 'Deployment', color: 'bg-sky-500', icon: '🚀' },
  { id: 17, name: 'Monitoring', color: 'bg-fuchsia-500', icon: '📈' },
  { id: 18, name: 'Logging', color: 'bg-yellow-500', icon: '📝' },
  { id: 19, name: 'Security', color: 'bg-slate-500', icon: '🔒' },
  { id: 20, name: 'Performance', color: 'bg-zinc-500', icon: '⚡' },
  { id: 21, name: 'Caching', color: 'bg-stone-500', icon: '💨' },
  { id: 22, name: 'Search', color: 'bg-neutral-500', icon: '🔍' },
  { id: 23, name: 'Analytics', color: 'bg-red-600', icon: '📊' },
  { id: 24, name: 'Notifications', color: 'bg-blue-600', icon: '🔔' },
  { id: 25, name: 'Payments', color: 'bg-green-600', icon: '💳' },
  { id: 26, name: 'User Management', color: 'bg-purple-600', icon: '👥' },
  { id: 27, name: 'Content Management', color: 'bg-orange-600', icon: '📄' },
  { id: 28, name: 'Workflow Engine', color: 'bg-cyan-600', icon: '⚙️' },
  { id: 29, name: 'Reporting', color: 'bg-indigo-600', icon: '📑' },
  { id: 30, name: 'Import/Export', color: 'bg-pink-600', icon: '📤' },
  { id: 31, name: 'Backup/Recovery', color: 'bg-amber-600', icon: '💾' },
  { id: 32, name: 'Compliance', color: 'bg-gray-600', icon: '📋' },
  { id: 33, name: 'Internationalization', color: 'bg-emerald-600', icon: '🌍' },
  { id: 34, name: 'Accessibility', color: 'bg-teal-600', icon: '♿' },
  { id: 35, name: 'Mobile Support', color: 'bg-violet-600', icon: '📱' },
  { id: 36, name: 'PWA Features', color: 'bg-rose-600', icon: '📲' },
  { id: 37, name: 'SEO Optimization', color: 'bg-lime-600', icon: '🔎' },
  { id: 38, name: 'Social Integration', color: 'bg-sky-600', icon: '👥' },
  { id: 39, name: 'Email System', color: 'bg-fuchsia-600', icon: '✉️' },
  { id: 40, name: 'File Management', color: 'bg-yellow-600', icon: '📁' },
  { id: 41, name: 'Media Processing', color: 'bg-slate-600', icon: '🎬' },
  { id: 42, name: 'Queue System', color: 'bg-zinc-600', icon: '📋' },
  { id: 43, name: 'Scheduling', color: 'bg-stone-600', icon: '📅' },
  { id: 44, name: 'Rate Limiting', color: 'bg-neutral-600', icon: '🚦' },
  { id: 45, name: 'Error Handling', color: 'bg-red-700', icon: '⚠️' },
  { id: 46, name: 'Version Control', color: 'bg-blue-700', icon: '🔄' },
  { id: 47, name: 'Documentation', color: 'bg-green-700', icon: '📚' },
  { id: 48, name: 'API Gateway', color: 'bg-purple-700', icon: '🌐' },
  { id: 49, name: 'Load Balancing', color: 'bg-orange-700', icon: '⚖️' },
  { id: 50, name: 'DevOps', color: 'bg-cyan-700', icon: '🔧' },
  { id: 51, name: 'CI/CD', color: 'bg-indigo-700', icon: '♻️' },
  { id: 52, name: 'Documentation System', color: 'bg-pink-700', icon: '📖' },
  { id: 53, name: 'Admin Dashboard', color: 'bg-amber-700', icon: '🎛️' },
  { id: 54, name: 'User Dashboard', color: 'bg-gray-700', icon: '👤' },
  { id: 55, name: 'Community Features', color: 'bg-emerald-700', icon: '🌐' },
  { id: 56, name: 'AI Integration', color: 'bg-teal-700', icon: '🤖' },
  { id: 57, name: 'Automation Management', color: 'bg-violet-700', icon: '🔄' },
  { id: 58, name: 'Third-Party Integration', color: 'bg-rose-700', icon: '🔌' },
  { id: 59, name: 'Open Source Management', color: 'bg-lime-700', icon: '📦' },
  { id: 60, name: 'GitHub Expertise', color: 'bg-sky-700', icon: '🐙' },
  { id: 61, name: 'Supabase Expertise', color: 'bg-fuchsia-700', icon: '⚡' }
];

const ProjectTrackerDashboard: React.FC = () => {
  // ESA Layer 7: State Management - Using real database only
  // Filter states
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // API hooks - Connected to real database
  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useProjects({
    layer: selectedLayer || undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });
  const { data: metricsResponse, isLoading: metricsLoading } = useProjectMetrics();
  
  // Extract metrics data from response
  const metrics = (metricsResponse as any)?.data || {};
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  
  // Transform database projects for display
  const trackerItems: Project[] = projects;

  const getLayerInfo = (layerId: number | null | undefined) => {
    if (!layerId) return null;
    return LAYER_DEFINITIONS.find(layer => layer.id === layerId) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Planned': return 'bg-blue-500';
      case 'Blocked': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredItems = trackerItems.filter((item: Project) => {
    const matchesLayer = !selectedLayer || item.layer === selectedLayer;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesLayer && matchesType && matchesStatus && matchesSearch;
  });

  if (projectsLoading || metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Layers className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading Project Tracker...</p>
        </div>
      </div>
    );
  }

  // Calculate overall completion percentage based on project statuses
  const completedCount = metrics?.statusCounts?.find((s: any) => s.status === 'Completed')?.count || 0;
  const totalCount = metrics?.totalProjects || projects.length || 0;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Main Framework Header Card - Matching screenshot style */}
      <div className="rounded-lg overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <GitCommit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">61x21 Project Tracker System</h1>
                <p className="text-cyan-100 text-sm mt-1">
                  Comprehensive hierarchical project tracking with detailed completion analysis
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completionPercentage}%</div>
              <div className="text-cyan-100 text-sm">Overall Completion</div>
            </div>
          </div>
        </div>
        
        {/* Statistics Bar */}
        <div className="bg-white border-t border-cyan-200/20 p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
              <div className="text-xs text-gray-600">Total Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics?.statusCounts?.find((s: any) => s.status === 'In Progress')?.count || 0}
              </div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics?.statusCounts?.find((s: any) => s.status === 'Planned')?.count || 0}
              </div>
              <div className="text-xs text-gray-600">Planned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {metrics?.statusCounts?.find((s: any) => s.status === 'Blocked')?.count || 0}
              </div>
              <div className="text-xs text-gray-600">Blocked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {metrics?.layerDistribution?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Active Layers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button 
          onClick={() => refetchProjects()}
          variant="outline"
          className="flex items-center gap-2 border-cyan-300 text-cyan-700"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white border-0">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Filters - MT Ocean Theme */}
      <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-700">
            <Filter className="h-5 w-5 text-cyan-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLayer?.toString() || 'all'} onValueChange={(value) => setSelectedLayer(value === 'all' ? null : parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Layers</SelectItem>
                {LAYER_DEFINITIONS.map(layer => (
                  <SelectItem key={layer.id} value={layer.id.toString()}>
                    {layer.icon} {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Framework">Framework</SelectItem>
                <SelectItem value="Automation">Automation</SelectItem>
                <SelectItem value="Enhancement">Enhancement</SelectItem>
                <SelectItem value="Fix">Fix</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              {filteredItems.length} of {trackerItems.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Analytics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">Total Projects</CardTitle>
              <Activity className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {metrics?.totalProjects || projects.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-teal-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">
                {metrics?.statusCounts?.find((s: any) => s.status === 'Completed')?.count || 
               projects.filter(p => p.status === 'Completed').length || 0}
              </div>
              <p className="text-xs text-gray-600">projects done</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics?.statusCounts?.find((s: any) => s.status === 'In Progress')?.count || 
               projects.filter(p => p.status === 'In Progress').length || 0}
              </div>
              <p className="text-xs text-gray-600">active items</p>
            </CardContent>
          </Card>

          <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-teal-50/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Active Layers</CardTitle>
              <Layers className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {metrics?.layerDistribution?.length || 
               [...new Set(projects.map(p => p.layer).filter(Boolean))].length || 0}
              </div>
              <p className="text-xs text-gray-600">of 61 layers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Items */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredItems.map(item => {
            const layerInfo = getLayerInfo(item.layer);
            return (
              <Card key={item.id} className="hover:shadow-lg transition-all border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/10 backdrop-blur-sm hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {layerInfo && (
                          <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
                            {layerInfo.icon} Layer {item.layer}
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-cyan-300 text-cyan-700">{item.type}</Badge>
                        <Badge 
                          className={`${getStatusColor(item.status)} text-white border-0`}
                        >
                          {item.status}
                        </Badge>
                        {item.priority && (
                          <Badge 
                            className={`${getPriorityColor(item.priority)} text-white border-0`}
                          >
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-gray-800">{item.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{item.description || 'No description'}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {item.phase && <div>Phase {item.phase}</div>}
                      <div>{new Date(item.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium mb-1">Progress</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.completion || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.completion || 0}% complete
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Hours</div>
                      <div className="text-gray-600">
                        {item.actualHours || 0} / {item.estimatedHours || 0} hours
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Team Size</div>
                      <div className="text-gray-600">
                        {item.team?.length || 0} members
                      </div>
                    </div>
                  </div>
                  {item.blockers && item.blockers.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-800 mb-1">Blockers:</div>
                      <ul className="text-red-700 text-sm">
                        {item.blockers.map((blocker, index) => (
                          <li key={index}>• {blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800 mb-1">Notes:</div>
                      <p className="text-blue-700 text-sm">{item.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['In Progress', 'Planned', 'Completed'].map(status => (
              <Card key={status} className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-cyan-700">
                    {status === 'In Progress' && <Clock className="h-5 w-5 text-yellow-500" />}
                    {status === 'Planned' && <GitCommit className="h-5 w-5 text-blue-500" />}
                    {status === 'Completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredItems
                    .filter(item => item.status === status)
                    .map(item => {
                      const layerInfo = getLayerInfo(item.layer);
                      return (
                        <div key={item.id} className="p-3 bg-gradient-to-br from-white/80 to-cyan-50/30 rounded-lg border border-cyan-200/20">
                          <div className="font-medium text-sm">{item.title}</div>
                          {layerInfo && (
                            <div className="text-xs text-gray-600 mt-1">
                              {layerInfo.icon} Layer {item.layer}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {item.completion || 0}% complete
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-cyan-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-700">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  Projects by Layer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {LAYER_DEFINITIONS.map(layer => {
                  const count = filteredItems.filter(item => item.layer === layer.id).length;
                  if (count === 0) return null;
                  return (
                    <div key={layer.id} className="flex items-center justify-between py-2">
                      <span className="text-sm flex items-center gap-2">
                        {layer.icon} Layer {layer.id}: {layer.name}
                      </span>
                      <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-cyan-200/20 bg-gradient-to-br from-white/90 to-teal-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  Projects by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {['Feature', 'Framework', 'Platform', 'Automation', 'Enhancement', 'Fix'].map(type => {
                  const count = filteredItems.filter(item => item.type === type).length;
                  if (count === 0) return null;
                  return (
                    <div key={type} className="flex items-center justify-between py-2">
                      <span className="text-sm">{type}</span>
                      <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTrackerDashboard;