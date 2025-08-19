import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, CheckCircle, XCircle, AlertCircle, Loader2, 
  Zap, Database, Users, Globe, Activity, TrendingUp,
  BarChart3, Timer, Shield, Cpu
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Phase2Result {
  test: string;
  layer: number;
  phase: number;
  passed: boolean;
  timestamp: Date;
  duration: number;
}

interface Phase3Result {
  test: string;
  layer: number;
  phase: number;
  category: 'performance' | 'scalability' | 'reliability';
  metricType: 'response_time' | 'throughput' | 'error_rate' | 'memory_usage';
  value: number;
  unit: string;
  baseline: number;
  status: 'passed' | 'warning' | 'failed';
  timestamp: Date;
  details?: any;
}

export function Phase50x21ValidationDashboard() {
  const [activePhase, setActivePhase] = useState('phase2');
  const [isRunning, setIsRunning] = useState(false);
  const [phase2Results, setPhase2Results] = useState<any>(null);
  const [phase3Results, setPhase3Results] = useState<any>(null);

  const runPhase2Validation = async () => {
    setIsRunning(true);
    try {
      const response = await apiRequest('POST', '/api/validation/phase2', {});
      setPhase2Results(response);
    } catch (error) {
      console.error('Phase 2 validation error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runPhase3LoadTesting = async () => {
    setIsRunning(true);
    try {
      const response = await apiRequest('POST', '/api/validation/phase3', {});
      setPhase3Results(response);
    } catch (error) {
      console.error('Phase 3 load testing error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glassmorphic-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
              Life CEO 40x20s Framework Validation
            </h2>
            <p className="text-gray-600 mt-1">
              Phase 2: Registration Flow | Phase 3: Load Testing
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white">
              40x20s Methodology
            </Badge>
          </div>
        </div>
      </div>

      {/* Phase Tabs */}
      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phase2" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Phase 2: Registration & Automation
          </TabsTrigger>
          <TabsTrigger value="phase3" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Phase 3: Load Testing
          </TabsTrigger>
        </TabsList>

        {/* Phase 2 Content */}
        <TabsContent value="phase2" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phase 2: Registration → Authentication → Profile Flow</CardTitle>
                <Button
                  onClick={runPhase2Validation}
                  disabled={isRunning}
                  className="bg-gradient-to-r from-turquoise-500 to-cyan-500"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Run Phase 2 Validation
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {phase2Results ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Passed</p>
                          <p className="text-2xl font-bold text-green-700">{phase2Results.summary?.passed || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Failed</p>
                          <p className="text-2xl font-bold text-red-700">{phase2Results.summary?.failed || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="flex items-center gap-2">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {phase2Results.summary?.successRate?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                      <div className="flex items-center gap-2">
                        <Globe className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Tests</p>
                          <p className="text-2xl font-bold text-purple-700">{phase2Results.summary?.totalTests || 0}</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-semibold">{phase2Results.summary?.successRate?.toFixed(1) || 0}%</span>
                    </div>
                    <Progress value={phase2Results.summary?.successRate || 0} className="h-3" />
                  </div>

                  {/* Automation Status */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Automation Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {phase2Results.summary?.automationStatus && Object.entries(phase2Results.summary.automationStatus).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          {value ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Test Results */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Test Results</h3>
                    {phase2Results.results?.map((result: Phase2Result, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.passed ? 'passed' : 'failed')}
                          <div>
                            <p className="font-medium">{result.test}</p>
                            <p className="text-sm text-gray-600">Layer {result.layer} • Phase {result.phase}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusBadge(result.passed ? 'passed' : 'failed')}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{result.duration}ms</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {phase2Results.recommendations && (
                    <Alert className="bg-gradient-to-r from-turquoise-50 to-cyan-50 border-turquoise-200">
                      <AlertCircle className="h-4 w-4 text-turquoise-600" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Life CEO Recommendations:</p>
                        <ul className="space-y-1">
                          {phase2Results.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Run Phase 2 validation to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 3 Content */}
        <TabsContent value="phase3" className="space-y-4">
          <Card className="glassmorphic-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phase 3: Load Testing & Performance Analysis</CardTitle>
                <Button
                  onClick={runPhase3LoadTesting}
                  disabled={isRunning}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Load Tests...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Run Phase 3 Load Testing
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {phase3Results ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Passed</p>
                          <p className="text-2xl font-bold text-green-700">{phase3Results.summary?.passed || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="text-sm text-gray-600">Warnings</p>
                          <p className="text-2xl font-bold text-yellow-700">{phase3Results.summary?.warnings || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Failed</p>
                          <p className="text-2xl font-bold text-red-700">{phase3Results.summary?.failed || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {phase3Results.summary?.successRate?.toFixed(1) || 0}%
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Category Performance */}
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Performance by Category</h3>
                    <div className="space-y-3">
                      {phase3Results.summary?.categories && Object.entries(phase3Results.summary.categories).map(([category, score]) => (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span className="font-semibold">{(score as number).toFixed(1)}%</span>
                          </div>
                          <Progress value={score as number} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Timer className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                          <p className="text-lg font-semibold">
                            {phase3Results.summary?.metrics?.avgResponseTime?.toFixed(2) || 0}ms
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-600">Avg Throughput</p>
                          <p className="text-lg font-semibold">
                            {phase3Results.summary?.metrics?.avgThroughput?.toFixed(2) || 0} req/s
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-600">Test Duration</p>
                          <p className="text-lg font-semibold">
                            {phase3Results.summary?.metrics?.totalDuration?.toFixed(1) || 0}s
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Test Results */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Load Test Results</h3>
                    {phase3Results.results?.map((result: Phase3Result, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <p className="font-medium">{result.test}</p>
                            <p className="text-sm text-gray-600">
                              Layer {result.layer} • {result.category} • {result.metricType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {result.value.toFixed(2)} {result.unit}
                          </p>
                          <Badge className={getStatusBadge(result.status)}>
                            {result.status} (baseline: {result.baseline})
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  {phase3Results.recommendations && (
                    <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <AlertDescription>
                        <p className="font-semibold mb-2">Life CEO Performance Recommendations:</p>
                        <ul className="space-y-1">
                          {phase3Results.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Run Phase 3 load testing to see performance results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}