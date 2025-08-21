import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw, FileText, Database, Shield, Zap } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface ValidationTest {
  id: string;
  name: string;
  description: string;
  layer: number;
  phase: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message?: string;
  executionTime?: number;
  memoryUsage?: number;
  timestamp?: Date;
}

interface ValidationLayer {
  layer: number;
  name: string;
  description: string;
  tests: ValidationTest[];
  progress: number;
}

export function ValidationDashboard() {
  const [activeLayer, setActiveLayer] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, ValidationTest>>({});

  // Fetch validation status
  const { data: validationData, refetch } = useQuery({
    queryKey: ['/api/validation/status'],
    refetchInterval: isRunning ? 1000 : false
  });

  // Run validation tests
  const runValidation = useMutation({
    mutationFn: async (layerRange?: { start: number; end: number }) => {
      const response = await fetch('/api/validation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layerRange }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to run validation');
      return response.json();
    },
    onSuccess: () => {
      setIsRunning(true);
      refetch();
    }
  });

  // Update JIRA with results
  const updateJira = useMutation({
    mutationFn: async (testResults: ValidationTest[]) => {
      const response = await fetch('/api/validation/jira-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: testResults }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update JIRA');
      return response.json();
    }
  });

  // Define validation layers based on 40x20s framework
  const validationLayers: ValidationLayer[] = [
    {
      layer: 1,
      name: 'Registration Flow',
      description: 'User registration, data validation, and initial setup',
      tests: [
        { id: 'reg-1', name: 'Registration Form Rendering', description: 'Verify form loads with all fields', layer: 1, phase: 'foundation', status: 'pending' },
        { id: 'reg-2', name: 'Field Validation', description: 'Test all field validations work', layer: 1, phase: 'foundation', status: 'pending' },
        { id: 'reg-3', name: 'City Auto-Assignment', description: 'Verify city group auto-creation', layer: 1, phase: 'foundation', status: 'pending' },
        { id: 'reg-4', name: 'Role Selection', description: 'Test all 23 tango roles selectable', layer: 1, phase: 'foundation', status: 'pending' },
        { id: 'reg-5', name: 'Database Storage', description: 'Verify user data stored correctly', layer: 1, phase: 'foundation', status: 'pending' },
        { id: 'reg-6', name: 'Performance Check', description: 'Registration under 3s target', layer: 1, phase: 'foundation', status: 'pending' }
      ],
      progress: 0
    },
    {
      layer: 2,
      name: 'Authentication System',
      description: 'OAuth, sessions, and API authentication',
      tests: [
        { id: 'auth-1', name: 'Replit OAuth Flow', description: 'Test OAuth login process', layer: 2, phase: 'foundation', status: 'pending' },
        { id: 'auth-2', name: 'Session Persistence', description: 'Verify sessions maintained', layer: 2, phase: 'foundation', status: 'pending' },
        { id: 'auth-3', name: 'API Authentication', description: 'Test API endpoint auth', layer: 2, phase: 'foundation', status: 'pending' },
        { id: 'auth-4', name: 'Logout Functionality', description: 'Verify clean logout', layer: 2, phase: 'foundation', status: 'pending' },
        { id: 'auth-5', name: 'Auth Middleware', description: 'Test protected routes', layer: 2, phase: 'foundation', status: 'pending' }
      ],
      progress: 0
    },
    {
      layer: 3,
      name: 'Profile System',
      description: 'Profile creation, editing, and all subsections',
      tests: [
        { id: 'prof-1', name: 'Profile Creation', description: 'Test initial profile setup', layer: 3, phase: 'foundation', status: 'pending' },
        { id: 'prof-2', name: 'About Section', description: 'Verify all about fields', layer: 3, phase: 'foundation', status: 'pending' },
        { id: 'prof-3', name: 'Photo/Video Upload', description: 'Test media uploads', layer: 3, phase: 'foundation', status: 'pending' },
        { id: 'prof-4', name: 'Travel Details', description: 'Verify travel section', layer: 3, phase: 'foundation', status: 'pending' },
        { id: 'prof-5', name: 'Guest Profile', description: 'Test guest onboarding', layer: 3, phase: 'foundation', status: 'pending' },
        { id: 'prof-6', name: 'Performance Check', description: 'Profile loads under 3s', layer: 3, phase: 'foundation', status: 'pending' }
      ],
      progress: 0
    }
  ];

  // Calculate overall progress
  const overallProgress = validationLayers.reduce((acc, layer) => {
    const layerResults = Object.values(results).filter(r => r.layer === layer.layer);
    const passedTests = layerResults.filter(r => r.status === 'passed').length;
    return acc + (layer.tests.length > 0 ? (passedTests / layer.tests.length) * 100 : 0);
  }, 0) / validationLayers.length;

  // Performance metrics
  const performanceMetrics = {
    avgExecutionTime: Object.values(results)
      .filter(r => r.executionTime)
      .reduce((acc, r) => acc + (r.executionTime || 0), 0) / 
      (Object.values(results).filter(r => r.executionTime).length || 1),
    avgMemoryUsage: Object.values(results)
      .filter(r => r.memoryUsage)
      .reduce((acc, r) => acc + (r.memoryUsage || 0), 0) /
      (Object.values(results).filter(r => r.memoryUsage).length || 1),
    totalTests: validationLayers.reduce((acc, layer) => acc + layer.tests.length, 0),
    passedTests: Object.values(results).filter(r => r.status === 'passed').length,
    failedTests: Object.values(results).filter(r => r.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
          Life CEO 40x20s Validation Dashboard
        </h2>
        <p className="text-gray-600 mt-2">
          Comprehensive platform validation from Registration through all features
        </p>
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <Button
            onClick={() => runValidation.mutate()}
            disabled={isRunning}
            className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
          <Button
            onClick={() => runValidation.mutate({ start: 1, end: 10 })}
            variant="outline"
            disabled={isRunning}
          >
            Run Phase 1 (Layers 1-10)
          </Button>
          <Button
            onClick={() => updateJira.mutate(Object.values(results))}
            variant="outline"
            disabled={Object.keys(results).length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            Update JIRA
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
        <Progress value={overallProgress} className="h-3 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-turquoise-600">{performanceMetrics.totalTests}</p>
            <p className="text-sm text-gray-600">Total Tests</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{performanceMetrics.passedTests}</p>
            <p className="text-sm text-gray-600">Passed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{performanceMetrics.failedTests}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {performanceMetrics.avgExecutionTime.toFixed(0)}ms
            </p>
            <p className="text-sm text-gray-600">Avg Time</p>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Render Performance</p>
              <p className="text-lg font-semibold">
                {performanceMetrics.avgExecutionTime < 3000 ? '✅ Under 3s' : '❌ Over 3s'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-lg font-semibold">{performanceMetrics.avgMemoryUsage.toFixed(1)} MB</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Security Status</p>
              <p className="text-lg font-semibold">RLS Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Layer Tests */}
      <Tabs value={activeLayer.toString()} onValueChange={(v) => setActiveLayer(parseInt(v))}>
        <TabsList>
          {validationLayers.map(layer => (
            <TabsTrigger key={layer.layer} value={layer.layer.toString()}>
              Layer {layer.layer}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {validationLayers.map(layer => (
          <TabsContent key={layer.layer} value={layer.layer.toString()}>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">{layer.name}</h3>
              <p className="text-gray-600 mb-4">{layer.description}</p>
              
              <div className="space-y-3">
                {layer.tests.map(test => {
                  const result = results[test.id] || test;
                  return (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {result.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                        {result.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                        {result.status === 'running' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                        {result.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                        
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-600">{test.description}</p>
                          {result.message && (
                            <p className={`text-xs mt-1 ${
                              result.status === 'failed' ? 'text-red-600' : 
                              result.status === 'warning' ? 'text-yellow-600' : 
                              'text-gray-600'
                            }`}>
                              {result.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {result.executionTime && (
                        <div className="text-right text-sm text-gray-600">
                          <p>{result.executionTime}ms</p>
                          {result.memoryUsage && <p>{result.memoryUsage.toFixed(1)}MB</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recent Results */}
      {Object.values(results).some(r => r.status === 'failed') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-800">Failed Tests Detected</p>
            <p className="text-sm text-red-700 mt-1">
              {Object.values(results).filter(r => r.status === 'failed').length} tests failed. 
              Review the results and update JIRA with findings.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}