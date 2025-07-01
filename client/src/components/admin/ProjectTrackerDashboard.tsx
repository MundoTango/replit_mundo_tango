import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';

// 11L Project Tracker Layer Definitions
const LAYER_DEFINITIONS = [
  { id: 'Layer 1', name: 'User Interface & Experience', color: 'bg-blue-500', icon: '🎨' },
  { id: 'Layer 2', name: 'Backend API & Logic', color: 'bg-green-500', icon: '⚙️' },
  { id: 'Layer 3', name: 'Database & Storage', color: 'bg-purple-500', icon: '🗄️' },
  { id: 'Layer 4', name: 'Authentication & Security', color: 'bg-red-500', icon: '🔐' },
  { id: 'Layer 5', name: 'Integration & Services', color: 'bg-orange-500', icon: '🔗' },
  { id: 'Layer 6', name: 'Testing & Quality Assurance', color: 'bg-cyan-500', icon: '🧪' },
  { id: 'Layer 7', name: 'DevOps & Deployment', color: 'bg-indigo-500', icon: '🚀' },
  { id: 'Layer 8', name: 'Analytics & Monitoring', color: 'bg-pink-500', icon: '📊' },
  { id: 'Layer 9', name: 'Documentation & Training', color: 'bg-amber-500', icon: '📚' },
  { id: 'Layer 10', name: 'Legal & Compliance', color: 'bg-gray-500', icon: '⚖️' },
  { id: 'Layer 11', name: 'Strategic & Business', color: 'bg-emerald-500', icon: '🎯' }
];

// TypeScript types for Project Tracker data
export interface ProjectTrackerItem {
  id: string;
  title: string;
  type: string;
  layer: string;
  createdOn: Date;
  lastUpdated: Date;
  reviewStatus: string;
  reviewedBy?: string;
  version: string;
  mvpScope: boolean;
  mvpStatus: string;
  mvpSignedOffBy?: string;
  summary: string;
  metadata: Record<string, any>;
  estimatedHours: number;
  actualHours: number;
  completionPercentage: number;
  blockers: string[];
  notes: string;
  createdBy: number;
  updatedBy: number;
}

export interface ProjectTrackerSummary {
  totalItems: number;
  layerDistribution: Array<{ layer: string; count: number }>;
  typeDistribution: Array<{ type: string; count: number }>;
  mvpProgress: Array<{ status: string; count: number }>;
  reviewStatus: Array<{ status: string; count: number }>;
}

export const ProjectTrackerDashboard: React.FC = () => {
  const [trackerItems, setTrackerItems] = useState<ProjectTrackerItem[]>([]);
  const [summary, setSummary] = useState<ProjectTrackerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMvpStatus, setSelectedMvpStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadProjectTrackerData();
  }, [selectedLayer, selectedType, selectedMvpStatus, searchQuery]);

  const loadProjectTrackerData = async () => {
    setLoading(true);
    try {
      // For now, use demo data since API integration is still in progress
      const mockItems: ProjectTrackerItem[] = [
        {
          id: '1',
          title: 'Enhanced Post Engagement System',
          type: 'Feature',
          layer: 'Layer 1',
          createdOn: new Date('2025-06-30'),
          lastUpdated: new Date('2025-07-01'),
          reviewStatus: 'Approved',
          reviewedBy: 'Scott Boddye',
          version: 'v1.2.0',
          mvpScope: true,
          mvpStatus: 'Signed Off',
          mvpSignedOffBy: 'Scott Boddye',
          summary: 'Complete tango-specific reaction system with WYSIWYG comments',
          metadata: { originalLayers: ['UI', 'Backend', 'Database'] },
          estimatedHours: 40,
          actualHours: 45,
          completionPercentage: 100,
          blockers: [],
          notes: 'Successfully implemented with comprehensive testing and user validation',
          createdBy: 3,
          updatedBy: 3
        },
        {
          id: '2',
          title: '11L Expert Bootstrap System v2',
          type: 'Framework',
          layer: 'Layer 8',
          createdOn: new Date('2025-06-29'),
          lastUpdated: new Date('2025-07-01'),
          reviewStatus: 'Pending',
          version: 'v2.0.0',
          mvpScope: true,
          mvpStatus: 'In Progress',
          summary: 'Advanced multi-layer development framework for systematic feature implementation',
          metadata: { scope: 'Platform Architecture', complexity: 'High' },
          estimatedHours: 60,
          actualHours: 35,
          completionPercentage: 85,
          blockers: ['Frontend-backend connection configuration'],
          notes: 'Phase 1 System Reconstruction nearly complete. Need to resolve port mismatch.',
          createdBy: 3,
          updatedBy: 3
        },
        {
          id: '3',
          title: 'Automated City Group Assignment',
          type: 'Automation',
          layer: 'Layer 11',
          createdOn: new Date('2025-06-28'),
          lastUpdated: new Date('2025-07-01'),
          reviewStatus: 'Approved',
          reviewedBy: 'Scott Boddye',
          version: 'v1.1.0',
          mvpScope: true,
          mvpStatus: 'Signed Off',
          mvpSignedOffBy: 'Scott Boddye',
          summary: 'Intelligent location-based group creation with dynamic photo fetching',
          metadata: { integration: 'Pexels API', locations: 'Global' },
          estimatedHours: 15,
          actualHours: 18,
          completionPercentage: 100,
          blockers: [],
          notes: 'Complete with dynamic photo fetching and seamless user experience',
          createdBy: 3,
          updatedBy: 3
        }
      ];

      const mockSummary: ProjectTrackerSummary = {
        totalItems: mockItems.length,
        layerDistribution: [
          { layer: 'Layer 1', count: 1 },
          { layer: 'Layer 8', count: 1 },
          { layer: 'Layer 11', count: 1 }
        ],
        typeDistribution: [
          { type: 'Feature', count: 1 },
          { type: 'Framework', count: 1 },
          { type: 'Automation', count: 1 }
        ],
        mvpProgress: [
          { status: 'In Progress', count: 1 },
          { status: 'Signed Off', count: 2 }
        ],
        reviewStatus: [
          { status: 'Pending', count: 1 },
          { status: 'Approved', count: 2 }
        ]
      };

      setTrackerItems(mockItems);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Error loading project tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLayerInfo = (layerId: string) => {
    return LAYER_DEFINITIONS.find(layer => layer.id === layerId) || LAYER_DEFINITIONS[0];
  };

  const getStatusColor = (status: string, type: 'mvp' | 'review') => {
    if (type === 'mvp') {
      switch (status) {
        case 'Signed Off': return 'bg-green-500';
        case 'Ready': return 'bg-blue-500';
        case 'In Progress': return 'bg-yellow-500';
        case 'Deferred': return 'bg-gray-500';
        default: return 'bg-gray-400';
      }
    } else {
      switch (status) {
        case 'Approved': return 'bg-green-500';
        case 'Pending': return 'bg-yellow-500';
        case 'Rejected': return 'bg-red-500';
        default: return 'bg-gray-400';
      }
    }
  };

  const filteredItems = trackerItems.filter(item => {
    return (selectedLayer === 'all' || item.layer === selectedLayer) &&
           (selectedType === 'all' || item.type === selectedType) &&
           (selectedMvpStatus === 'all' || item.mvpStatus === selectedMvpStatus) &&
           (!searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.metadata.originalLayers?.some((tag: any) => 
              String(tag).toLowerCase().includes(searchQuery.toLowerCase())
            )
           );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Layers className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading Project Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            11L Project Tracker
          </h2>
          <p className="text-gray-600">Comprehensive feature tracking across all 11 layers</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
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
            
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select Layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Layers</SelectItem>
                {LAYER_DEFINITIONS.map(layer => (
                  <SelectItem key={layer.id} value={layer.id}>
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

            <Select value={selectedMvpStatus} onValueChange={setSelectedMvpStatus}>
              <SelectTrigger>
                <SelectValue placeholder="MVP Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Signed Off">Signed Off</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              {filteredItems.length} of {trackerItems.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Analytics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MVP Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.mvpProgress.find(p => p.status === 'Signed Off')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">signed off</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary.mvpProgress.find(p => p.status === 'In Progress')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">active items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Layers Active</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.layerDistribution.length}</div>
              <p className="text-xs text-muted-foreground">of 11 layers</p>
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
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${layerInfo.color} text-white`}>
                          {layerInfo.icon} {item.layer}
                        </Badge>
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge 
                          className={`${getStatusColor(item.mvpStatus, 'mvp')} text-white`}
                        >
                          {item.mvpStatus}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{item.summary}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>v{item.version}</div>
                      <div>{item.lastUpdated.toLocaleDateString()}</div>
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
                          style={{ width: `${item.completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.completionPercentage}% complete
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Hours</div>
                      <div className="text-gray-600">
                        {item.actualHours} / {item.estimatedHours} hours
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Review Status</div>
                      <Badge 
                        className={`${getStatusColor(item.reviewStatus, 'review')} text-white`}
                      >
                        {item.reviewStatus}
                      </Badge>
                    </div>
                  </div>
                  {item.blockers.length > 0 && (
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
            {['In Progress', 'Ready', 'Signed Off'].map(status => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {status === 'In Progress' && <Clock className="h-5 w-5" />}
                    {status === 'Ready' && <GitCommit className="h-5 w-5" />}
                    {status === 'Signed Off' && <CheckCircle className="h-5 w-5" />}
                    {status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredItems
                    .filter(item => item.mvpStatus === status)
                    .map(item => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {getLayerInfo(item.layer).icon} {item.layer}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.completionPercentage}% complete
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Layer Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.layerDistribution.map(item => (
                  <div key={item.layer} className="flex items-center justify-between py-2">
                    <span className="text-sm">{item.layer}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.typeDistribution.map(item => (
                  <div key={item.type} className="flex items-center justify-between py-2">
                    <span className="text-sm">{item.type}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectTrackerDashboard;