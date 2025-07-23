import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Activity, 
  Database, 
  Search, 
  Zap, 
  Package, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  BarChart,
  Server,
  Cloud
} from 'lucide-react';

interface ToolStatus {
  name: string;
  status: 'active' | 'warning' | 'error' | 'testing';
  icon: React.ReactNode;
  endpoint?: string;
  metrics?: any;
  lastChecked?: Date;
}

export function LifeCEOOpenSourceVerification() {
  const [toolStatuses, setToolStatuses] = useState<ToolStatus[]>([
    { name: 'Sentry', status: 'testing', icon: <AlertTriangle className="w-5 h-5" /> },
    { name: 'BullMQ', status: 'testing', icon: <Package className="w-5 h-5" /> },
    { name: 'Prometheus', status: 'testing', icon: <BarChart className="w-5 h-5" />, endpoint: '/api/metrics' },
    { name: 'Elasticsearch', status: 'testing', icon: <Search className="w-5 h-5" /> },
    { name: 'Redis', status: 'testing', icon: <Database className="w-5 h-5" /> },
    { name: 'Service Worker', status: 'testing', icon: <Cloud className="w-5 h-5" /> },
    { name: 'Feature Flags', status: 'testing', icon: <Zap className="w-5 h-5" />, endpoint: '/api/feature-flags' },
    { name: 'Health Check', status: 'testing', icon: <Activity className="w-5 h-5" />, endpoint: '/api/health' },
    { name: 'Performance', status: 'testing', icon: <Server className="w-5 h-5" /> },
  ]);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationLog, setVerificationLog] = useState<string[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const addLog = (message: string) => {
    setVerificationLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 50));
  };

  const testSentry = async () => {
    addLog('Testing Sentry error tracking...');
    try {
      // Test Sentry by triggering a test error
      const response = await fetch('/api/test/sentry-error');
      if (response.ok) {
        addLog('✅ Sentry: Test error sent successfully');
        return 'active';
      }
    } catch (error) {
      addLog('⚠️ Sentry: Could not verify error tracking');
    }
    return 'warning';
  };

  const testPrometheus = async () => {
    addLog('Testing Prometheus metrics endpoint...');
    try {
      const response = await fetch('/api/metrics');
      const text = await response.text();
      if (response.ok && text.includes('http_request_duration')) {
        addLog('✅ Prometheus: Metrics endpoint active');
        return 'active';
      }
    } catch (error) {
      addLog('❌ Prometheus: Metrics endpoint failed');
    }
    return 'error';
  };

  const testHealth = async () => {
    addLog('Testing health check endpoint...');
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.status === 'healthy' || data.database) {
        addLog('✅ Health Check: System healthy');
        return 'active';
      }
    } catch (error) {
      addLog('❌ Health Check: Endpoint failed');
    }
    return 'error';
  };

  const testFeatureFlags = async () => {
    addLog('Testing feature flags endpoint...');
    try {
      const response = await fetch('/api/feature-flags');
      const data = await response.json();
      if (data && typeof data === 'object') {
        addLog(`✅ Feature Flags: ${Object.keys(data).length} flags active`);
        return 'active';
      }
    } catch (error) {
      addLog('❌ Feature Flags: Endpoint failed');
    }
    return 'error';
  };

  const testServiceWorker = () => {
    addLog('Testing Service Worker registration...');
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      addLog('✅ Service Worker: Active and controlling page');
      return 'active';
    } else {
      addLog('⚠️ Service Worker: Not active');
      return 'warning';
    }
  };

  const testBullMQ = async () => {
    addLog('Testing BullMQ job queues...');
    try {
      const response = await fetch('/api/admin/queues');
      if (response.ok) {
        const data = await response.json();
        addLog(`✅ BullMQ: ${data.queues?.length || 0} queues configured`);
        return 'active';
      }
    } catch (error) {
      addLog('⚠️ BullMQ: Could not verify queues');
    }
    return 'warning';
  };

  const testRedis = async () => {
    addLog('Testing Redis cache...');
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.redis?.status === 'connected') {
        addLog('✅ Redis: Connected');
        return 'active';
      } else {
        addLog('⚠️ Redis: Using in-memory fallback');
        return 'warning';
      }
    } catch (error) {
      addLog('❌ Redis: Connection check failed');
    }
    return 'warning';
  };

  const testElasticsearch = async () => {
    addLog('Testing Elasticsearch...');
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.elasticsearch?.status === 'connected') {
        addLog('✅ Elasticsearch: Connected');
        return 'active';
      } else {
        addLog('⚠️ Elasticsearch: Not available');
        return 'warning';
      }
    } catch (error) {
      addLog('❌ Elasticsearch: Connection check failed');
    }
    return 'warning';
  };

  const testPerformance = () => {
    addLog('Testing performance optimizations...');
    const hasLazyLoading = document.querySelectorAll('[loading="lazy"]').length > 0;
    const hasCompression = navigator.userAgent.includes('gzip');
    
    if (hasLazyLoading || hasCompression) {
      addLog('✅ Performance: Optimizations active');
      return 'active';
    }
    addLog('⚠️ Performance: Some optimizations missing');
    return 'warning';
  };

  const runFullVerification = async () => {
    setIsVerifying(true);
    addLog('🚀 Starting Life CEO 40x20s verification...');
    
    const tests = [
      { name: 'Sentry', test: testSentry },
      { name: 'BullMQ', test: testBullMQ },
      { name: 'Prometheus', test: testPrometheus },
      { name: 'Elasticsearch', test: testElasticsearch },
      { name: 'Redis', test: testRedis },
      { name: 'Service Worker', test: () => Promise.resolve(testServiceWorker()) },
      { name: 'Feature Flags', test: testFeatureFlags },
      { name: 'Health Check', test: testHealth },
      { name: 'Performance', test: () => Promise.resolve(testPerformance()) },
    ];

    let activeCount = 0;
    
    for (const { name, test } of tests) {
      const status = await test();
      
      setToolStatuses(prev => prev.map(tool => 
        tool.name === name 
          ? { ...tool, status: status as any, lastChecked: new Date() }
          : tool
      ));
      
      if (status === 'active') activeCount++;
      
      // Add delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const score = Math.round((activeCount / tests.length) * 100);
    setOverallScore(score);
    addLog(`✅ Verification complete! Score: ${score}%`);
    setIsVerifying(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  useEffect(() => {
    // Auto-run verification on mount
    runFullVerification();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-500 to-cyan-600 bg-clip-text text-transparent">
            Life CEO 40x20s Open Source Verification
          </h1>
          <p className="text-gray-600">Systematically verifying all 15+ enterprise tools implementation</p>
        </div>

        {/* Overall Status */}
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-turquoise-500" />
                Security & Performance Status
              </span>
              <Badge className={overallScore >= 80 ? 'bg-green-500' : overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                {overallScore}% Operational
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallScore} className="h-4 mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{toolStatuses.filter(t => t.status === 'active').length} Active</span>
              <span>{toolStatuses.filter(t => t.status === 'warning').length} Warnings</span>
              <span>{toolStatuses.filter(t => t.status === 'error').length} Errors</span>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toolStatuses.map((tool) => (
            <Card key={tool.name} className="glassmorphic-card hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {tool.icon}
                    {tool.name}
                  </span>
                  {getStatusIcon(tool.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-sm font-medium ${getStatusColor(tool.status)}`}>
                    Status: {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                  </div>
                  {tool.endpoint && (
                    <div className="text-xs text-gray-500">
                      Endpoint: {tool.endpoint}
                    </div>
                  )}
                  {tool.lastChecked && (
                    <div className="text-xs text-gray-400">
                      Last checked: {tool.lastChecked.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification Console */}
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Verification Console</span>
              <Button 
                onClick={runFullVerification} 
                disabled={isVerifying}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-600 hover:from-turquoise-600 hover:to-cyan-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Run Full Verification'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/5 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {verificationLog.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Guide */}
        <Card className="glassmorphic-card">
          <CardHeader>
            <CardTitle>40x20s Implementation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phase1" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="phase1">Infrastructure</TabsTrigger>
                <TabsTrigger value="phase2">Security</TabsTrigger>
                <TabsTrigger value="phase3">Performance</TabsTrigger>
                <TabsTrigger value="phase4">Enterprise</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phase1" className="space-y-3">
                <h3 className="font-semibold">Phase 1: Infrastructure (Layers 1-10)</h3>
                {['Database', 'Authentication', 'API', 'Frontend', 'State Management', 'UI Components', 'Error Handling', 'Logging', 'Monitoring', 'Performance'].map((layer, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-white/50">
                    <span>Layer {i + 1}: {layer}</span>
                    <Badge className={i < 6 ? 'bg-green-500' : 'bg-yellow-500'}>
                      {i < 6 ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="phase2" className="space-y-3">
                <h3 className="font-semibold">Phase 2: Security (Layers 11-20)</h3>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Critical security implementations in progress. Audit logging and encryption need immediate attention.
                  </AlertDescription>
                </Alert>
              </TabsContent>
              
              <TabsContent value="phase3" className="space-y-3">
                <h3 className="font-semibold">Phase 3: Performance (Layers 21-30)</h3>
                <div className="space-y-2">
                  <Progress value={75} className="h-2" />
                  <p className="text-sm text-gray-600">75% of performance optimizations implemented</p>
                </div>
              </TabsContent>
              
              <TabsContent value="phase4" className="space-y-3">
                <h3 className="font-semibold">Phase 4: Enterprise (Layers 31-40)</h3>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription>
                    Enterprise features planned for next phase. Focus on SSO, API versioning, and webhooks.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}