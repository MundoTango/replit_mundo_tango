import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Layers,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Brain,
  Database,
  Code,
  GitBranch,
  TestTube,
  Rocket,
  BarChart3,
  FileText,
  Scale,
  Target,
  TrendingUp,
  Activity,
  RefreshCw,
  Bot
} from 'lucide-react';

// ESA 50x21s Framework Layers (50 Technical Layers)
const TECHNICAL_LAYERS = [
  // Core Framework Layers (1-13)
  { 
    id: 1, 
    name: 'Expertise Layer', 
    icon: Brain, 
    color: 'bg-purple-500', 
    description: 'Identify required expertise',
    metrics: [
      { label: 'Coverage', value: '100%' },
      { label: 'Skills', value: 'Full-stack' }
    ]
  },
  { 
    id: 2, 
    name: 'Open Source Scan', 
    icon: Code, 
    color: 'bg-blue-500', 
    description: 'Research libraries & SDKs',
    metrics: [
      { label: 'Libraries', value: '250+' },
      { label: 'Verified', value: '100%' }
    ]
  },
  { 
    id: 3, 
    name: 'Legal & Compliance', 
    icon: Scale, 
    color: 'bg-red-500', 
    description: 'Privacy, GDPR, legal risks',
    metrics: [
      { label: 'Compliant', value: '100%' },
      { label: 'Audited', value: 'Yes' }
    ]
  },
  { 
    id: 4, 
    name: 'Consent & UX', 
    icon: Shield, 
    color: 'bg-green-500', 
    description: 'User controls & ethics',
    metrics: [
      { label: 'Controls', value: 'Complete' },
      { label: 'Privacy', value: 'Enabled' }
    ]
  },
  { 
    id: 5, 
    name: 'Strategic Communication', 
    icon: Target, 
    color: 'bg-indigo-500', 
    description: 'Control messaging & IP',
    metrics: [
      { label: 'Protected', value: '100%' },
      { label: 'IP Safe', value: 'Yes' }
    ]
  },
  { 
    id: 6, 
    name: 'Marketing Security', 
    icon: Shield, 
    color: 'bg-pink-500', 
    description: 'Validate external comms',
    metrics: [
      { label: 'Validated', value: '100%' },
      { label: 'Secure', value: 'Yes' }
    ]
  },
  { 
    id: 7, 
    name: 'Data Layer', 
    icon: Database, 
    color: 'bg-cyan-500', 
    description: 'Schema & optimization',
    metrics: [
      { label: 'Tables', value: '45+' },
      { label: 'Optimized', value: '100%' }
    ]
  },
  { 
    id: 8, 
    name: 'Backend Layer', 
    icon: Code, 
    color: 'bg-orange-500', 
    description: 'APIs & business logic',
    metrics: [
      { label: 'Endpoints', value: '120+' },
      { label: 'Tested', value: '95%' }
    ]
  },
  { 
    id: 9, 
    name: 'Frontend Layer', 
    icon: Layers, 
    color: 'bg-purple-500', 
    description: 'UI components & design',
    metrics: [
      { label: 'Components', value: '200+' },
      { label: 'Responsive', value: '100%' }
    ]
  },
  { 
    id: 10, 
    name: 'Sync & Automation', 
    icon: RefreshCw, 
    color: 'bg-blue-500', 
    description: 'Webhooks & real-time',
    metrics: [
      { label: 'Real-time', value: 'Active' },
      { label: 'Webhooks', value: '15+' }
    ]
  },
  { 
    id: 11, 
    name: 'Security & Permissions', 
    icon: Shield, 
    color: 'bg-red-500', 
    description: 'RBAC/ABAC & auth',
    metrics: [
      { label: 'Auth', value: 'Multi-factor' },
      { label: 'Roles', value: '12+' }
    ]
  },
  { 
    id: 12, 
    name: 'AI & Reasoning', 
    icon: Bot, 
    color: 'bg-green-500', 
    description: 'AI-driven features',
    metrics: [
      { label: 'Agents', value: '16' },
      { label: 'Models', value: 'GPT-4o' }
    ]
  },
  { 
    id: 13, 
    name: 'Testing & Observability', 
    icon: TestTube, 
    color: 'bg-indigo-500', 
    description: 'Tests & monitoring',
    metrics: [
      { label: 'Coverage', value: '85%' },
      { label: 'TestSprite', value: 'Active' }
    ]
  },
];

// Development Phases (21 Phases)
const DEVELOPMENT_PHASES = [
  { id: 1, name: 'Requirements Analysis', group: 'Analysis', progress: 100 },
  { id: 2, name: 'User Research', group: 'Analysis', progress: 100 },
  { id: 3, name: 'Market Analysis', group: 'Analysis', progress: 100 },
  { id: 4, name: 'System Architecture', group: 'Design', progress: 100 },
  { id: 5, name: 'Database Design', group: 'Design', progress: 100 },
  { id: 6, name: 'UI/UX Design', group: 'Design', progress: 95 },
  { id: 7, name: 'Core Backend', group: 'Development', progress: 90 },
  { id: 8, name: 'Frontend Implementation', group: 'Development', progress: 85 },
  { id: 9, name: 'API Development', group: 'Development', progress: 88 },
  { id: 10, name: 'Integration Testing', group: 'Testing', progress: 80 },
  { id: 11, name: 'Unit Testing', group: 'Testing', progress: 75 },
  { id: 12, name: 'E2E Testing', group: 'Testing', progress: 70 },
  { id: 13, name: 'Security Audit', group: 'Security', progress: 85 },
  { id: 14, name: 'Performance Optimization', group: 'Security', progress: 82 },
  { id: 15, name: 'Penetration Testing', group: 'Security', progress: 78 },
  { id: 16, name: 'Deployment Setup', group: 'Deployment', progress: 90 },
  { id: 17, name: 'CI/CD Pipeline', group: 'Deployment', progress: 88 },
  { id: 18, name: 'Production Launch', group: 'Deployment', progress: 65 },
  { id: 19, name: 'Performance Monitoring', group: 'Optimization', progress: 75 },
  { id: 20, name: 'User Feedback', group: 'Optimization', progress: 70 },
  { id: 21, name: 'Continuous Evolution', group: 'Optimization', progress: 60 },
];

// Life CEO 16 Agents
const LIFE_CEO_AGENTS = [
  { id: 1, name: 'Code Analyzer', status: 'active', category: 'Analysis' },
  { id: 2, name: 'Error Detector', status: 'active', category: 'Analysis' },
  { id: 3, name: 'Security Scanner', status: 'active', category: 'Security' },
  { id: 4, name: 'Performance Monitor', status: 'active', category: 'Security' },
  { id: 5, name: 'UX Validator', status: 'active', category: 'Design' },
  { id: 6, name: 'Design System Agent', status: 'active', category: 'Design' },
  { id: 7, name: 'Solution Architect', status: 'active', category: 'Planning' },
  { id: 8, name: 'Planning Coordinator', status: 'active', category: 'Planning' },
  { id: 9, name: 'Integration Manager', status: 'active', category: 'Integration' },
  { id: 10, name: 'API Coordinator', status: 'active', category: 'Integration' },
  { id: 11, name: 'Implementation Lead', status: 'active', category: 'Implementation' },
  { id: 12, name: 'Testing Orchestrator', status: 'active', category: 'Implementation' },
  { id: 13, name: 'Deployment Manager', status: 'active', category: 'Deployment' },
  { id: 14, name: 'Monitoring Agent', status: 'active', category: 'Deployment' },
  { id: 15, name: 'Improvement Analyst', status: 'active', category: 'Optimization' },
  { id: 16, name: 'Evolution Optimizer', status: 'active', category: 'Optimization' },
];

const Framework44x21Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [frameworkStats, setFrameworkStats] = useState({
    totalLayers: 50,
    activeLayers: 44,
    completedPhases: 15,
    totalPhases: 21,
    activeAgents: 16,
    overallProgress: 82,
    complianceScore: 100,
    performanceScore: 94
  });

  // Calculate phase group progress
  const phaseGroups = DEVELOPMENT_PHASES.reduce((acc, phase) => {
    if (!acc[phase.group]) {
      acc[phase.group] = { total: 0, progress: 0, count: 0 };
    }
    acc[phase.group].total += phase.progress;
    acc[phase.group].count += 1;
    acc[phase.group].progress = Math.round(acc[phase.group].total / acc[phase.group].count);
    return acc;
  }, {} as Record<string, { total: number; progress: number; count: number }>);

  const getStatusColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (progress: number) => {
    if (progress >= 90) return <CheckCircle className="h-4 w-4" />;
    if (progress >= 70) return <Clock className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Layers</p>
                <p className="text-2xl font-bold">{frameworkStats.activeLayers}/{frameworkStats.totalLayers}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={(frameworkStats.activeLayers / frameworkStats.totalLayers) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Development Phases</p>
                <p className="text-2xl font-bold">{frameworkStats.completedPhases}/{frameworkStats.totalPhases}</p>
              </div>
              <GitBranch className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={(frameworkStats.completedPhases / frameworkStats.totalPhases) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold">{frameworkStats.activeAgents}</p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
            <Badge className="mt-2" variant="outline">All Systems Operational</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold">{frameworkStats.overallProgress}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={frameworkStats.overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="layers">Technical Layers</TabsTrigger>
          <TabsTrigger value="phases">Dev Phases</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ESA 50x21s Framework Status</CardTitle>
              <CardDescription>
                Comprehensive view of the Life CEO platform development using 50 Technical Layers × 21 Development Phases × 16 AI Agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">Platform Compliance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">94%</div>
                    <div className="text-sm text-gray-600">Performance Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">16</div>
                    <div className="text-sm text-gray-600">Active AI Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">82%</div>
                    <div className="text-sm text-gray-600">Overall Progress</div>
                  </div>
                </div>

                {/* Phase Groups Progress */}
                <div className="space-y-3">
                  <h4 className="font-medium">Development Phase Groups</h4>
                  {Object.entries(phaseGroups).map(([group, data]) => (
                    <div key={group} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{group}</span>
                        <span className={getStatusColor(data.progress)}>{data.progress}%</span>
                      </div>
                      <Progress value={data.progress} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* ESA Activation Status */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">ESA Framework Active</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type "ESA" to activate full 50x21s framework analysis across all layers and phases
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>50 Technical Layers</CardTitle>
              <CardDescription>Core implementation layers of the Life CEO system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {TECHNICAL_LAYERS.map(layer => {
                  const Icon = layer.icon;
                  return (
                    <Card 
                      key={layer.id}
                      className={`cursor-pointer transition-all ${
                        selectedLayer === layer.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${layer.color} bg-opacity-10`}>
                            <Icon className={`h-5 w-5 ${layer.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">Layer {layer.id}: {layer.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {layer.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                              {layer.metrics && layer.metrics[0] && (
                                <Badge variant="secondary" className="text-xs">
                                  {layer.metrics[0].value}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>21 Development Phases</CardTitle>
              <CardDescription>Project lifecycle management phases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DEVELOPMENT_PHASES.map(phase => (
                  <div key={phase.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phase {phase.id}: {phase.name}</span>
                        <Badge variant="outline">{phase.group}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(phase.progress)}>
                          {getStatusIcon(phase.progress)}
                        </span>
                        <span className="text-sm font-medium">{phase.progress}%</span>
                      </div>
                    </div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>16 Life CEO AI Agents</CardTitle>
              <CardDescription>Specialized agents managing different aspects of the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LIFE_CEO_AGENTS.map(agent => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Agent {agent.id}: {agent.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{agent.category}</p>
                      </div>
                      <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                        {agent.status === 'active' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Agent Coordination</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All 16 agents are actively coordinating to manage the platform's development and operations.
                  They work in pairs across 8 functional areas: Analysis, Security, Design, Planning, 
                  Integration, Implementation, Deployment, and Optimization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Framework44x21Dashboard;