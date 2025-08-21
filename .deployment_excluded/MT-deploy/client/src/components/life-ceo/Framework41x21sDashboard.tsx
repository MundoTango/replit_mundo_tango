import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Layers,
  Zap,
  Smartphone,
  Brain,
  Shield,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Code,
  Database,
  Palette,
  Globe,
  GitBranch,
  Activity,
  Sparkles
} from 'lucide-react';

interface Layer {
  id: number;
  name: string;
  description: string;
  icon: any;
  progress: number;
  enhancements?: string[];
  newInV41?: boolean;
}

interface Phase {
  id: number;
  name: string;
  description: string;
  status: 'complete' | 'in-progress' | 'pending';
  newInV21?: boolean;
}

const layers: Layer[] = [
  // Original 40 layers
  { id: 1, name: 'Foundation', description: 'Database, core infrastructure', icon: Database, progress: 95 },
  { id: 2, name: 'Database & ORM', description: 'Drizzle ORM, PostgreSQL', icon: Database, progress: 90 },
  { id: 3, name: 'Authentication', description: 'Session-based auth, OAuth', icon: Shield, progress: 85 },
  { id: 4, name: 'User Management', description: 'Profiles, roles, permissions', icon: Shield, progress: 88 },
  { id: 5, name: 'Data Architecture', description: 'Schema design, relationships', icon: Database, progress: 92 },
  { id: 6, name: 'Business Logic', description: 'Core features, workflows', icon: Zap, progress: 85 },
  { id: 7, name: 'Frontend Development', description: 'React, TypeScript, UI components', icon: Code, progress: 90, 
    enhancements: ['Mandatory LSP diagnostic checks', 'Type safety enforcement'] },
  { id: 8, name: 'Design & UX', description: 'MT ocean theme, glassmorphic', icon: Palette, progress: 95,
    enhancements: ['Theme preservation rules', 'Visual regression testing'] },
  { id: 9, name: 'API Development', description: 'RESTful endpoints, validation', icon: Globe, progress: 88,
    enhancements: ['Field naming consistency', 'Dual format support'] },
  { id: 10, name: 'Deployment & Operations', description: 'CI/CD, monitoring', icon: Activity, progress: 80,
    enhancements: ['Real data integration protocol', 'Loading state requirements'] },
  { id: 11, name: 'Analytics', description: 'Metrics, tracking, insights', icon: TrendingUp, progress: 75 },
  { id: 12, name: 'Content Management', description: 'Posts, media, moderation', icon: Activity, progress: 85 },
  { id: 13, name: 'Search', description: 'Full-text search, filtering', icon: Activity, progress: 70 },
  { id: 14, name: 'Communication', description: 'Real-time chat, notifications', icon: Activity, progress: 80 },
  { id: 15, name: 'Environmental Infrastructure', description: 'Redis, caching, CDN', icon: Globe, progress: 85,
    enhancements: ['Mandatory cache fallbacks', 'DISABLE_REDIS support'] },
  { id: 16, name: 'Compliance', description: 'GDPR, privacy, security', icon: Shield, progress: 82 },
  { id: 17, name: 'Admin Tools', description: 'Dashboard, management UI', icon: Activity, progress: 88 },
  { id: 18, name: 'Tenant Management', description: 'Multi-tenant architecture', icon: Activity, progress: 85 },
  { id: 19, name: 'Integration', description: 'Third-party APIs, webhooks', icon: Globe, progress: 75 },
  { id: 20, name: 'Growth Features', description: 'Viral loops, referrals', icon: TrendingUp, progress: 65 },
  { id: 21, name: 'Production Resilience', description: 'Error handling, recovery', icon: Shield, progress: 88,
    enhancements: ['Memory management protocol', 'NODE_OPTIONS configuration'] },
  { id: 22, name: 'User Safety', description: 'Content moderation, reporting', icon: Shield, progress: 80 },
  { id: 23, name: 'Business Intelligence', description: 'Dashboards, reporting', icon: TrendingUp, progress: 70 },
  { id: 24, name: 'AI & ML', description: 'Recommendations, personalization', icon: Brain, progress: 75 },
  { id: 25, name: 'Localization', description: 'Multi-language support', icon: Globe, progress: 60 },
  { id: 26, name: 'Accessibility', description: 'WCAG compliance, a11y', icon: Activity, progress: 75 },
  { id: 27, name: 'Partnerships', description: 'API partners, integrations', icon: Activity, progress: 65 },
  { id: 28, name: 'Monetization', description: 'Payments, subscriptions', icon: TrendingUp, progress: 70 },
  { id: 29, name: 'Community', description: 'Forums, user engagement', icon: Activity, progress: 85 },
  { id: 30, name: 'Future Innovation', description: 'Emerging tech, experiments', icon: Sparkles, progress: 50 },
  { id: 31, name: 'Testing & Validation', description: 'Unit, integration, E2E', icon: Shield, progress: 70 },
  { id: 32, name: 'Developer Experience', description: 'CLI tools, documentation', icon: Code, progress: 75 },
  { id: 33, name: 'Data Migration', description: 'Schema evolution, backups', icon: Database, progress: 80 },
  { id: 34, name: 'Observability', description: 'Tracing, APM, dashboards', icon: Activity, progress: 65 },
  { id: 35, name: 'Feature Flags', description: 'A/B testing, experiments', icon: GitBranch, progress: 70 },
  { id: 36, name: 'Performance', description: 'Optimization, caching', icon: Zap, progress: 85 },
  { id: 37, name: 'Security', description: 'Pen testing, vulnerability scanning', icon: Shield, progress: 82 },
  { id: 38, name: 'Scalability', description: 'Load balancing, sharding', icon: Activity, progress: 75 },
  { id: 39, name: 'Disaster Recovery', description: 'Backups, failover', icon: Shield, progress: 70 },
  { id: 40, name: 'Business Metrics', description: 'KPIs, ROI tracking', icon: TrendingUp, progress: 72 },
  // New layers in 41x21s
  { id: 41, name: 'Deduplication & Sync', description: 'Prevent duplicates, external sync', icon: GitBranch, progress: 85, newInV41: true },
  { id: 42, name: 'Mobile Wrapper', description: 'Capacitor, native plugins', icon: Smartphone, progress: 92, newInV41: true },
  { id: 43, name: 'AI Self-Learning', description: 'Pattern recognition, auto-optimization', icon: Brain, progress: 75, newInV41: true },
  { id: 44, name: 'Continuous Validation', description: 'Real-time quality checks', icon: Activity, progress: 80, newInV41: true }
];

const phases: Phase[] = [
  { id: 0, name: 'Pre-Development', description: 'System checks before starting', status: 'complete', newInV21: true },
  { id: 1, name: 'Planning', description: 'Architecture, requirements', status: 'complete' },
  { id: 2, name: 'Foundation', description: 'Core infrastructure', status: 'complete' },
  { id: 3, name: 'Core Features', description: 'Essential functionality', status: 'complete' },
  { id: 4, name: 'Advanced Features', description: 'Enhanced capabilities', status: 'complete' },
  { id: 5, name: 'Testing', description: 'Quality assurance', status: 'in-progress' },
  { id: 6, name: 'Performance', description: 'Optimization, caching', status: 'in-progress' },
  { id: 7, name: 'Security', description: 'Hardening, compliance', status: 'in-progress' },
  { id: 8, name: 'Documentation', description: 'API docs, guides', status: 'in-progress' },
  { id: 9, name: 'Deployment', description: 'CI/CD pipeline', status: 'pending' },
  { id: 10, name: 'Launch Prep', description: 'Marketing, content', status: 'pending' },
  { id: 11, name: 'Go Live', description: 'Production launch', status: 'pending' },
  { id: 12, name: 'Post-Launch', description: 'Monitoring, support', status: 'pending' },
  { id: 13, name: 'Growth', description: 'User acquisition', status: 'pending' },
  { id: 14, name: 'Optimization', description: 'Data-driven improvements', status: 'pending' },
  { id: 15, name: 'Scale', description: 'Infrastructure scaling', status: 'pending' },
  { id: 16, name: 'International', description: 'Global expansion', status: 'pending' },
  { id: 17, name: 'Enterprise', description: 'B2B features', status: 'pending' },
  { id: 18, name: 'Innovation', description: 'New technologies', status: 'pending' },
  { id: 19, name: 'Maturity', description: 'Stable operations', status: 'pending' },
  { id: 20, name: 'Evolution', description: 'Continuous improvement', status: 'pending' },
  { id: 21, name: 'Mobile Readiness', description: 'App store deployment', status: 'in-progress', newInV21: true }
];

export default function Framework41x21sDashboard() {
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  const calculateOverallProgress = () => {
    const totalProgress = layers.reduce((sum, layer) => sum + layer.progress, 0);
    return Math.round(totalProgress / layers.length);
  };

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <Card className="mb-6 glassmorphic-card">
        <CardHeader>
          <CardTitle className="text-3xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            41x21s Framework Dashboard
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Enhanced framework with 44 layers × 22 phases = 968 quality checkpoints
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-2xl font-bold text-turquoise-600">{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-4" />
          </div>

          <Alert className="mb-6 border-turquoise-200 bg-turquoise-50">
            <Sparkles className="h-4 w-4 text-turquoise-600" />
            <AlertDescription>
              <strong className="text-turquoise-800">Framework Evolution:</strong> Added Layers 42-44 and Phases 0 & 21 based on 4 days of intensive development learnings.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="layers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="layers">Layers (44)</TabsTrigger>
              <TabsTrigger value="phases">Phases (22)</TabsTrigger>
            </TabsList>

            <TabsContent value="layers" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {layers.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <Card
                      key={layer.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        layer.newInV41 ? 'border-2 border-turquoise-400' : ''
                      }`}
                      onClick={() => setSelectedLayer(layer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-r from-turquoise-100 to-cyan-100 rounded-lg">
                              <Icon className="w-5 h-5 text-turquoise-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">Layer {layer.id}</h3>
                              {layer.newInV41 && (
                                <Badge variant="secondary" className="text-xs mt-1">NEW</Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-turquoise-600">{layer.progress}%</span>
                        </div>
                        <h4 className="font-medium mb-1">{layer.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{layer.description}</p>
                        <Progress value={layer.progress} className="h-2" />
                        {layer.enhancements && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">Enhanced</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="phases" className="mt-6">
              <div className="space-y-3">
                {phases.map((phase) => (
                  <Card
                    key={phase.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      phase.newInV21 ? 'border-2 border-cyan-400' : ''
                    }`}
                    onClick={() => setSelectedPhase(phase)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(phase.status)}`}>
                            Phase {phase.id}
                          </div>
                          <div>
                            <h4 className="font-semibold">{phase.name}</h4>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                          {phase.newInV21 && (
                            <Badge variant="secondary">NEW</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {phase.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {phase.status === 'in-progress' && <AlertCircle className="w-5 h-5 text-blue-600 animate-pulse" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Layer Details */}
      {selectedLayer && (
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle>Layer {selectedLayer.id}: {selectedLayer.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{selectedLayer.description}</p>
            <div className="flex items-center gap-2 mb-4">
              <Progress value={selectedLayer.progress} className="flex-1" />
              <span className="font-bold text-turquoise-600">{selectedLayer.progress}%</span>
            </div>
            {selectedLayer.enhancements && (
              <div>
                <h4 className="font-semibold mb-2">Recent Enhancements:</h4>
                <ul className="space-y-1">
                  {selectedLayer.enhancements.map((enhancement, idx) => (
                    <li key={idx} className="text-sm text-gray-700">• {enhancement}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}