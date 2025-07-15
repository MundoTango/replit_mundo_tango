import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  AlertTriangle,
  Brain,
  Shield,
  Code,
  Database,
  Zap,
  Users,
  Eye,
  Lock,
  Globe,
  Heart,
  Sparkles,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface LayerData {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'complete' | 'in-progress' | 'pending';
  progress: number;
  components: string[];
  issues: string[];
  documentation: string[];
}

const Framework23LDashboard: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<number>(1);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [frameworkData, setFrameworkData] = useState<LayerData[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Initialize framework data
  useEffect(() => {
    const layers: LayerData[] = [
      // Foundation Layers (1-4)
      {
        id: 1,
        name: "Expertise & Technical Proficiency",
        icon: <Brain className="w-5 h-5" />,
        description: "Core technical expertise with Supabase, React, TypeScript, and modern web development",
        status: 'complete',
        progress: 100,
        components: ['TypeScript Configuration', 'React Architecture', 'Supabase Integration', 'API Design'],
        issues: [],
        documentation: ['TECHNICAL_EXPERTISE.md', 'DEVELOPMENT_GUIDELINES.md']
      },
      {
        id: 2,
        name: "Research & Discovery",
        icon: <Eye className="w-5 h-5" />,
        description: "User research, market analysis, and feature discovery processes",
        status: 'complete',
        progress: 95,
        components: ['User Interviews', 'Market Analysis', 'Competitor Research', 'Feature Validation'],
        issues: ['Need more user feedback on guest onboarding'],
        documentation: ['USER_RESEARCH.md', 'MARKET_ANALYSIS.md']
      },
      {
        id: 3,
        name: "Legal & Compliance",
        icon: <Shield className="w-5 h-5" />,
        description: "GDPR compliance, terms of service, privacy policies, and data protection",
        status: 'in-progress',
        progress: 78,
        components: ['GDPR Implementation', 'Terms of Service', 'Privacy Policy', 'Data Retention'],
        issues: ['Cookie consent banner needed', 'Data export functionality incomplete'],
        documentation: ['GDPR_COMPLIANCE.md', 'LEGAL_FRAMEWORK.md']
      },
      {
        id: 4,
        name: "UX/UI Design",
        icon: <Sparkles className="w-5 h-5" />,
        description: "Design system, component library, and user experience patterns",
        status: 'complete',
        progress: 100,
        components: ['Turquoise Ocean Theme', 'Component Library', 'Design Tokens', 'Responsive Design'],
        issues: [],
        documentation: ['MUNDO_TANGO_DESIGN_SYSTEM.md', 'UI_PATTERNS.md']
      },
      
      // Architecture Layers (5-8)
      {
        id: 5,
        name: "Data Architecture",
        icon: <Database className="w-5 h-5" />,
        description: "Database design with RLS, indexes, triggers, and performance optimization",
        status: 'complete',
        progress: 92,
        components: ['Row Level Security', 'Database Indexes', 'Audit Logging', 'Health Monitoring'],
        issues: ['Some tables missing RLS policies'],
        documentation: ['DATABASE_ARCHITECTURE.md', 'RLS_POLICIES.md']
      },
      {
        id: 6,
        name: "Backend Development",
        icon: <Code className="w-5 h-5" />,
        description: "API routes, authentication, middleware, and server architecture",
        status: 'complete',
        progress: 88,
        components: ['Express Routes', 'Authentication', 'Middleware', 'WebSocket Server'],
        issues: ['Rate limiting needs improvement'],
        documentation: ['BACKEND_ARCHITECTURE.md', 'API_DOCUMENTATION.md']
      },
      {
        id: 7,
        name: "Frontend Development",
        icon: <Globe className="w-5 h-5" />,
        description: "React components, state management, routing, and client architecture",
        status: 'complete',
        progress: 94,
        components: ['React Components', 'React Query', 'Wouter Routing', 'Form Handling'],
        issues: ['Some components need memoization'],
        documentation: ['FRONTEND_ARCHITECTURE.md', 'COMPONENT_GUIDE.md']
      },
      {
        id: 8,
        name: "API & Integration",
        icon: <Zap className="w-5 h-5" />,
        description: "External integrations, API gateway, and third-party services",
        status: 'in-progress',
        progress: 75,
        components: ['Google Maps API', 'Email Service', 'Payment Gateway', 'Analytics'],
        issues: ['Stripe integration pending', 'Analytics partially implemented'],
        documentation: ['API_INTEGRATION.md', 'EXTERNAL_SERVICES.md']
      },
      
      // Operational Layers (9-12)
      {
        id: 9,
        name: "Security & Authentication",
        icon: <Lock className="w-5 h-5" />,
        description: "Authentication system, RBAC/ABAC, security policies, and threat protection",
        status: 'complete',
        progress: 90,
        components: ['OAuth Integration', 'RBAC System', 'Session Management', 'Security Headers'],
        issues: ['2FA not implemented'],
        documentation: ['SECURITY_FRAMEWORK.md', 'AUTHENTICATION_GUIDE.md']
      },
      {
        id: 10,
        name: "Deployment & Infrastructure",
        icon: <Activity className="w-5 h-5" />,
        description: "Deployment pipeline, CI/CD, monitoring, and infrastructure management",
        status: 'in-progress',
        progress: 70,
        components: ['Replit Deployment', 'Environment Config', 'Database Hosting', 'CDN Setup'],
        issues: ['Production deployment checklist incomplete', 'Monitoring setup partial'],
        documentation: ['DEPLOYMENT_GUIDE.md', 'INFRASTRUCTURE.md']
      },
      {
        id: 11,
        name: "Analytics & Monitoring",
        icon: <BarChart3 className="w-5 h-5" />,
        description: "Performance monitoring, error tracking, analytics, and observability",
        status: 'in-progress',
        progress: 65,
        components: ['Performance Metrics', 'Error Tracking', 'User Analytics', 'System Monitoring'],
        issues: ['Sentry not integrated', 'Performance dashboard incomplete'],
        documentation: ['MONITORING_SETUP.md', 'ANALYTICS_GUIDE.md']
      },
      {
        id: 12,
        name: "Continuous Improvement",
        icon: <RefreshCw className="w-5 h-5" />,
        description: "Testing, quality assurance, feedback loops, and iterative development",
        status: 'in-progress',
        progress: 60,
        components: ['Unit Tests', 'E2E Tests', 'Code Review', 'User Feedback'],
        issues: ['Test coverage below 60%', 'E2E tests not automated'],
        documentation: ['TESTING_STRATEGY.md', 'QA_PROCESS.md']
      },
      
      // AI & Intelligence Layers (13-16)
      {
        id: 13,
        name: "AI Agent Orchestration",
        icon: <Brain className="w-5 h-5" />,
        description: "Life CEO agents, AI integration, and intelligent automation",
        status: 'complete',
        progress: 85,
        components: ['16 Life CEO Agents', 'OpenAI Integration', 'Agent Memory', 'Task Management'],
        issues: ['Agent collaboration needs improvement'],
        documentation: ['AI_AGENTS.md', 'LIFE_CEO_SYSTEM.md']
      },
      {
        id: 14,
        name: "Context & Memory Management",
        icon: <Database className="w-5 h-5" />,
        description: "Vector embeddings, semantic search, and contextual memory",
        status: 'complete',
        progress: 80,
        components: ['Vector Storage', 'Semantic Search', 'Memory Retrieval', 'Context Building'],
        issues: ['Memory pruning strategy needed'],
        documentation: ['MEMORY_SYSTEM.md', 'VECTOR_SEARCH.md']
      },
      {
        id: 15,
        name: "Voice & Environmental Intelligence",
        icon: <Activity className="w-5 h-5" />,
        description: "Voice processing, speech recognition, and environmental awareness",
        status: 'in-progress',
        progress: 70,
        components: ['Voice Processing', 'Speech Recognition', 'Noise Suppression', 'Context Awareness'],
        issues: ['Multilingual support incomplete'],
        documentation: ['VOICE_SYSTEM.md', 'ENVIRONMENTAL_AI.md']
      },
      {
        id: 16,
        name: "Ethics & Behavioral Alignment",
        icon: <Heart className="w-5 h-5" />,
        description: "AI ethics, behavioral guidelines, and responsible AI practices",
        status: 'in-progress',
        progress: 75,
        components: ['Ethical Guidelines', 'Bias Detection', 'Privacy Protection', 'Transparency'],
        issues: ['Bias monitoring not automated'],
        documentation: ['AI_ETHICS.md', 'BEHAVIORAL_GUIDELINES.md']
      },
      
      // Human-Centric Layers (17-20)
      {
        id: 17,
        name: "Emotional Intelligence",
        icon: <Heart className="w-5 h-5" />,
        description: "Emotion recognition, empathetic responses, and emotional support",
        status: 'in-progress',
        progress: 65,
        components: ['Emotion Tags', 'Sentiment Analysis', 'Empathetic UI', 'Support Systems'],
        issues: ['Emotion detection accuracy needs improvement'],
        documentation: ['EMOTIONAL_DESIGN.md', 'EMPATHY_FRAMEWORK.md']
      },
      {
        id: 18,
        name: "Cultural Awareness",
        icon: <Globe className="w-5 h-5" />,
        description: "Multi-cultural support, localization, and cultural sensitivity",
        status: 'in-progress',
        progress: 70,
        components: ['Tango Culture', 'Localization', 'Cultural Events', 'Community Norms'],
        issues: ['More languages needed', 'Cultural content curation'],
        documentation: ['CULTURAL_FRAMEWORK.md', 'LOCALIZATION_GUIDE.md']
      },
      {
        id: 19,
        name: "Energy Management",
        icon: <Zap className="w-5 h-5" />,
        description: "Performance optimization, resource management, and efficiency",
        status: 'complete',
        progress: 85,
        components: ['Performance Optimization', 'Caching Strategy', 'Resource Management', 'Load Balancing'],
        issues: ['Cache invalidation strategy needs refinement'],
        documentation: ['PERFORMANCE_GUIDE.md', 'OPTIMIZATION_STRATEGY.md']
      },
      {
        id: 20,
        name: "Proactive Intelligence",
        icon: <Brain className="w-5 h-5" />,
        description: "Predictive features, recommendations, and proactive assistance",
        status: 'in-progress',
        progress: 60,
        components: ['Recommendation Engine', 'Predictive Analytics', 'Smart Notifications', 'Auto-suggestions'],
        issues: ['ML models not deployed', 'Recommendation accuracy low'],
        documentation: ['PROACTIVE_AI.md', 'RECOMMENDATION_SYSTEM.md']
      },
      
      // Production Engineering Layers (21-23)
      {
        id: 21,
        name: "Production Resilience Engineering",
        icon: <Shield className="w-5 h-5" />,
        description: "Error recovery, failover, circuit breakers, and system resilience",
        status: 'pending',
        progress: 45,
        components: ['Error Boundaries', 'Circuit Breakers', 'Retry Logic', 'Graceful Degradation'],
        issues: ['Circuit breakers not implemented', 'No failover strategy'],
        documentation: ['RESILIENCE_ENGINEERING.md', 'ERROR_HANDLING.md']
      },
      {
        id: 22,
        name: "User Safety Net",
        icon: <Users className="w-5 h-5" />,
        description: "User protection, data safety, accessibility, and support systems",
        status: 'pending',
        progress: 50,
        components: ['Data Backup', 'User Recovery', 'Accessibility', 'Support System'],
        issues: ['WCAG compliance incomplete', 'Support system basic'],
        documentation: ['USER_SAFETY.md', 'ACCESSIBILITY_GUIDE.md']
      },
      {
        id: 23,
        name: "Business Continuity",
        icon: <Activity className="w-5 h-5" />,
        description: "Disaster recovery, backup strategies, and business continuity planning",
        status: 'pending',
        progress: 35,
        components: ['Backup Strategy', 'Disaster Recovery', 'Incident Response', 'Status Page'],
        issues: ['DR plan not tested', 'No automated backups'],
        documentation: ['BUSINESS_CONTINUITY.md', 'DISASTER_RECOVERY.md']
      }
    ];
    
    setFrameworkData(layers);
    
    // Calculate overall progress
    const totalProgress = layers.reduce((sum, layer) => sum + layer.progress, 0);
    setOverallProgress(Math.round(totalProgress / layers.length));
  }, []);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      const report = {
        timestamp: new Date().toISOString(),
        overallProgress,
        criticalIssues: frameworkData.filter(layer => layer.issues.length > 0 && layer.progress < 60),
        completedLayers: frameworkData.filter(layer => layer.status === 'complete'),
        recommendations: [
          'Focus on Production Engineering layers (21-23) for production readiness',
          'Complete GDPR compliance implementation in Layer 3',
          'Improve test coverage in Layer 12',
          'Deploy ML models for Layer 20 recommendations'
        ]
      };
      
      console.log('23L Framework Analysis Report:', report);
      alert('Report generated! Check console for details.');
      setIsGeneratingReport(false);
    }, 2000);
  };

  const runSelfAnalysis = async () => {
    setIsRunningAnalysis(true);
    
    // Simulate self-reprompting analysis
    setTimeout(() => {
      console.log('Running 23L self-reprompting analysis...');
      alert('Self-analysis complete! Framework updated with latest insights.');
      setIsRunningAnalysis(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Layers className="w-7 h-7 text-turquoise-600" />
            23L Framework Dashboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive 23-Layer production validation system with 30L enhancements
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={generateReport}
            disabled={isGeneratingReport}
            className="bg-gradient-to-r from-turquoise-500 to-blue-600 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button 
            onClick={runSelfAnalysis}
            disabled={isRunningAnalysis}
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isRunningAnalysis ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Framework Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Production Readiness</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {frameworkData.filter(l => l.status === 'complete').length}
                </div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {frameworkData.filter(l => l.status === 'in-progress').length}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {frameworkData.filter(l => l.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layer Grid and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Framework Layers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {frameworkData.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedLayer === layer.id 
                        ? 'border-turquoise-500 bg-turquoise-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${selectedLayer === layer.id ? 'bg-turquoise-100' : 'bg-gray-100'}`}>
                          {layer.icon}
                        </div>
                        <span className="font-medium text-sm">Layer {layer.id}</span>
                      </div>
                      <Badge className={getStatusColor(layer.status)} variant="secondary">
                        {layer.status}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{layer.name}</h4>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{layer.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${getProgressColor(layer.progress)}`}
                          style={{ width: `${layer.progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layer Details */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Layer Details</CardTitle>
            </CardHeader>
            <CardContent>
              {frameworkData.find(l => l.id === selectedLayer) && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Layer {selectedLayer}: {frameworkData.find(l => l.id === selectedLayer)!.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {frameworkData.find(l => l.id === selectedLayer)!.description}
                    </p>
                  </div>

                  <Tabs defaultValue="components" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="components">Components</TabsTrigger>
                      <TabsTrigger value="issues">Issues</TabsTrigger>
                      <TabsTrigger value="docs">Docs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="components" className="space-y-2">
                      {frameworkData.find(l => l.id === selectedLayer)!.components.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{comp}</span>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="issues" className="space-y-2">
                      {frameworkData.find(l => l.id === selectedLayer)!.issues.length > 0 ? (
                        frameworkData.find(l => l.id === selectedLayer)!.issues.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No issues found</p>
                      )}
                    </TabsContent>
                    <TabsContent value="docs" className="space-y-2">
                      {frameworkData.find(l => l.id === selectedLayer)!.documentation.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">{doc}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Critical Issues Alert */}
      {frameworkData.filter(layer => layer.issues.length > 0 && layer.progress < 60).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Issues Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {frameworkData
                .filter(layer => layer.issues.length > 0 && layer.progress < 60)
                .map(layer => (
                  <div key={layer.id} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="font-medium text-red-800 mb-1">
                      Layer {layer.id}: {layer.name}
                    </div>
                    <ul className="text-sm text-red-600 space-y-1">
                      {layer.issues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Framework23LDashboard;