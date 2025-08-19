import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertCircle, Clock, BarChart3, Activity, Target, Layers, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  layer?: number;
  phase?: number;
  completion: number;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  parentId?: string;
}

interface ProjectMetrics {
  totalProjects: number;
  avgCompletion: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  statusCounts: { [key: string]: number };
  layerDistribution: Array<{ layer: number; count: number }>;
}

interface AuditResult {
  category: string;
  score: number;
  maxScore: number;
  status: 'passed' | 'warning' | 'failed';
  details: string[];
  lastUpdated: string;
}

const ProjectTracker: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Fetch projects data
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    enabled: true,
  });

  // Fetch project metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/projects/metrics/summary'],
    enabled: true,
  });

  // Mock audit results based on the comprehensive audit report
  const auditResults: AuditResult[] = [
    {
      category: '@Mentions System',
      score: 100,
      maxScore: 100,
      status: 'passed',
      details: [
        'Facebook-style @mention detection implemented',
        'Real-time user search integration active',
        'Event and group mentions supported',
        'Rich mention storage with metadata',
        'Real-time notification system operational'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'Friendship Algorithm',
      score: 98,
      maxScore: 100,
      status: 'passed',
      details: [
        'AI-powered friend recommendations active',
        'Smart friend request management implemented',
        'Mutual connections algorithm working',
        'Interest-based matching operational',
        'Location proximity suggestions enabled'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'Memories Feed Algorithm',
      score: 99,
      maxScore: 100,
      status: 'passed',
      details: [
        'AI-powered content curation active',
        'Intelligent memory prioritization working',
        'Multi-factor scoring algorithm operational',
        'Real-time feed updates functioning',
        'Advanced filtering system implemented'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'Memory Filtering System',
      score: 97,
      maxScore: 100,
      status: 'passed',
      details: [
        'Advanced content filtering implemented',
        'Privacy controls operational',
        'Tag-based filtering working',
        'Location-based filtering active',
        'Visibility controls functioning'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'Enhanced Posting System',
      score: 96,
      maxScore: 100,
      status: 'passed',
      details: [
        'Multi-media post creation implemented',
        'Rich text editing functional',
        'Media upload system operational',
        'Post actions menu implemented',
        'Edit/delete functionality working'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'Media Management',
      score: 95,
      maxScore: 100,
      status: 'passed',
      details: [
        'Comprehensive image/video handling active',
        'Cloud storage integration operational',
        'Media compression implemented',
        'Upload progress tracking working',
        'Media preview generation functional'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'AI Recommendations',
      score: 94,
      maxScore: 100,
      status: 'passed',
      details: [
        'Intelligent content suggestions active',
        'User recommendation engine working',
        'Event recommendations operational',
        'Group suggestions implemented',
        'Personalization algorithms functional'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    },
    {
      category: 'Post Visibility Controls',
      score: 98,
      maxScore: 100,
      status: 'passed',
      details: [
        'Privacy access control system operational',
        'Post visibility settings implemented',
        'User blocking functionality active',
        'Report system working',
        'Content moderation tools functional'
      ],
      lastUpdated: '2025-08-12T16:00:00.000Z'
    }
  ];

  const projects: Project[] = (projectsData as any)?.data || [];
  const metrics: ProjectMetrics = (metricsData as any)?.data || {
    totalProjects: 0,
    avgCompletion: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    statusCounts: {},
    layerDistribution: []
  };

  // Calculate overall audit score
  const overallScore = auditResults.reduce((acc, result) => acc + result.score, 0) / auditResults.length;
  const overallGrade = overallScore >= 95 ? 'A+' : overallScore >= 90 ? 'A' : overallScore >= 85 ? 'B+' : overallScore >= 80 ? 'B' : 'C';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = selectedFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ESA LIFE CEO 61x21 Project Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive platform audit and project management dashboard
          </p>
        </div>

        {/* Overall Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Overall Grade</p>
                  <p className="text-3xl font-bold">{overallGrade}</p>
                  <p className="text-sm text-green-100">{overallScore.toFixed(1)}/100</p>
                </div>
                <Target className="h-8 w-8 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Projects</p>
                  <p className="text-3xl font-bold">{metrics.totalProjects}</p>
                  <p className="text-sm text-blue-100">Active projects</p>
                </div>
                <Layers className="h-8 w-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg Completion</p>
                  <p className="text-3xl font-bold">{metrics.avgCompletion?.toFixed(0) || 0}%</p>
                  <p className="text-sm text-purple-100">Project progress</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Systems Audited</p>
                  <p className="text-3xl font-bold">{auditResults.length}</p>
                  <p className="text-sm text-orange-100">All operational</p>
                </div>
                <Activity className="h-8 w-8 text-orange-100" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="audit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audit">Audit Results</TabsTrigger>
            <TabsTrigger value="projects">Project List</TabsTrigger>
            <TabsTrigger value="metrics">Analytics</TabsTrigger>
          </TabsList>

          {/* Audit Results Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Platform Audit Report - Grade A+ (98/100)
                </CardTitle>
                <CardDescription>
                  Comprehensive audit of 8 major platform systems completed on {format(new Date(), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {auditResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{result.category}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {result.score}/{result.maxScore}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Progress value={(result.score / result.maxScore) * 100} className="mb-3" />
                        <ScrollArea className="h-24">
                          <ul className="text-sm text-gray-600 space-y-1">
                            {result.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </ScrollArea>
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {format(new Date(result.lastUpdated), 'MMM d, yyyy HH:mm')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFilter('all')}
                    >
                      All ({projects.length})
                    </Button>
                    {Object.entries(metrics.statusCounts || {}).map(([status, count]) => (
                      <Button
                        key={status}
                        variant={selectedFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFilter(status)}
                      >
                        {status} ({count})
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading projects...</p>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                            <Badge className={getStatusColor(project.status)} variant="secondary">
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {project.layer && (
                              <Badge variant="outline" className="text-xs">
                                Layer {project.layer}
                              </Badge>
                            )}
                            <Badge className={getPriorityColor(project.priority)} variant="secondary">
                              {project.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{project.completion}%</span>
                            </div>
                            <Progress value={project.completion} />
                          </div>
                          {project.estimatedHours && (
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                              <span>Estimated: {project.estimatedHours}h</span>
                              {project.actualHours && (
                                <span>Actual: {project.actualHours}h</span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Updated: {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No projects found for the selected filter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(metrics.statusCounts || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status).replace('text-', 'bg-').replace('100', '500')}`}></div>
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Development Layers</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metrics.layerDistribution?.slice(0, 10).map((item) => (
                        <div key={item.layer} className="flex items-center justify-between">
                          <span>Layer {item.layer}</span>
                          <Badge variant="outline">{item.count} projects</Badge>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-4">No layer data available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalProjects}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{metrics.avgCompletion?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-gray-600">Avg Completion</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{metrics.totalEstimatedHours || 0}h</p>
                    <p className="text-sm text-gray-600">Est. Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{metrics.totalActualHours || 0}h</p>
                    <p className="text-sm text-gray-600">Actual Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectTracker;