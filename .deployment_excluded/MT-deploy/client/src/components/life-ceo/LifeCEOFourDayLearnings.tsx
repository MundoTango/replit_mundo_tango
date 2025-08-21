import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Database, 
  Brain, 
  ShieldCheck, 
  Palette, 
  GitBranch,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Code,
  MemoryStick,
  Server
} from 'lucide-react';

const LifeCEOFourDayLearnings: React.FC = () => {
  const learnings = [
    {
      id: 'performance-cascade',
      title: 'Performance Cascade Optimization',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      impact: '72% improvement',
      description: 'Systematic optimization across all layers when render > 3s',
      pattern: '11.3s → 3.2s render time',
      dateDiscovered: 'July 23, 2025',
      applied: true,
      examples: [
        'Server compression enabled',
        'Client lazy loading activated',
        'API caching implemented',
        'Bundle splitting complete'
      ]
    },
    {
      id: 'field-mapping',
      title: 'Field Mapping Validation',
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      impact: '100% accuracy',
      description: 'Automatic validation of field names across all layers',
      pattern: 'featureId/activity → projectId/projectName',
      dateDiscovered: 'July 23, 2025',
      applied: true,
      examples: [
        'Client-server field matching',
        'Database constraint compliance',
        'Automatic field detection'
      ]
    },
    {
      id: 'memory-optimization',
      title: 'Build Memory Management',
      icon: MemoryStick,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      impact: '0 build failures',
      description: 'Auto-apply memory fixes for large bundles',
      pattern: 'NODE_OPTIONS=--max_old_space_size=8192',
      dateDiscovered: 'July 22, 2025',
      applied: true,
      examples: [
        '31MB bundle handled',
        'Heap errors eliminated',
        'Build script created'
      ]
    },
    {
      id: 'resilient-services',
      title: 'Resilient Architecture',
      icon: ShieldCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      impact: '5 services fixed',
      description: 'Graceful degradation with fallback strategies',
      pattern: 'Redis → In-memory cache',
      dateDiscovered: 'July 23, 2025',
      applied: true,
      examples: [
        'DISABLE_REDIS environment',
        'In-memory fallbacks',
        'Zero downtime'
      ]
    },
    {
      id: 'design-consistency',
      title: 'Design System Guardian',
      icon: Palette,
      color: 'text-turquoise-500',
      bgColor: 'bg-turquoise-50',
      impact: '100% MT theme',
      description: 'Maintain ocean theme during rapid development',
      pattern: 'Glassmorphic + Turquoise gradients',
      dateDiscovered: 'July 22, 2025',
      applied: true,
      examples: [
        'Ocean theme restored',
        'Glassmorphic cards',
        'Turquoise gradients'
      ]
    },
    {
      id: '40x20s-methodology',
      title: '40x20s Systematic Debugging',
      icon: GitBranch,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      impact: '4-hour → 30-min',
      description: 'Layer-by-layer analysis for complex issues',
      pattern: '40 layers × 20 phases',
      dateDiscovered: 'July 23, 2025',
      applied: true,
      examples: [
        'Systematic tracing',
        'Root cause analysis',
        'Multi-service debugging'
      ]
    }
  ];

  const stats = {
    totalLearnings: learnings.length,
    appliedLearnings: learnings.filter(l => l.applied).length,
    performanceGain: 72,
    issuesResolved: 15
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <Brain className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalLearnings}</p>
            <p className="text-sm text-gray-600">New Patterns</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.appliedLearnings}</p>
            <p className="text-sm text-gray-600">Applied</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <TrendingUp className="w-5 h-5 text-turquoise-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.performanceGain}%</p>
            <p className="text-sm text-gray-600">Performance Gain</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-card hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.issuesResolved}</p>
            <p className="text-sm text-gray-600">Issues Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {learnings.map((learning) => {
          const Icon = learning.icon;
          return (
            <Card key={learning.id} className="glassmorphic-card hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${learning.bgColor}`}>
                      <Icon className={`w-5 h-5 ${learning.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{learning.title}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">{learning.dateDiscovered}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {learning.impact}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{learning.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Pattern:</p>
                  <Code className="w-4 h-4 inline mr-1 text-gray-500" />
                  <code className="text-xs text-gray-600">{learning.pattern}</code>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Applied Solutions:</p>
                  <ul className="space-y-1">
                    {learning.examples.map((example, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                {learning.applied && (
                  <div className="mt-3">
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-green-600 mt-1">✓ Fully integrated</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Implementation Status */}
      <Card className="glassmorphic-card">
        <CardHeader>
          <CardTitle className="text-xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            40x20s Learning Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Automatic Pattern Detection</span>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Solution Templating</span>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Proactive Application</span>
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cross-Domain Intelligence</span>
              <Badge className="bg-yellow-100 text-yellow-700">Learning</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-turquoise-50/50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Next Evolution:</strong> Life CEO will automatically apply these patterns to prevent similar issues, reducing resolution time from hours to minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifeCEOFourDayLearnings;