import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Play, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  testId: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'running';
  results: {
    passed: number;
    failed: number;
    skipped: number;
  };
  duration: string;
  testSuite: string;
  details?: {
    endpoints?: string[];
    features?: string[];
    categories?: string[];
    errorMessages?: string[];
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export function TestSpriteIntegration() {
  const { toast } = useToast();
  const [selectedSuite, setSelectedSuite] = useState('full-platform');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch test results
  const { data: testResults, isLoading: loadingResults, refetch, error: resultsError } = useQuery<ApiResponse<TestResult[]>>({
    queryKey: ['/api/testsprite/results'],
    refetchInterval: isTestRunning ? 2000 : 10000, // Poll every 2s when test running, 10s otherwise
  });
  
  // Manual refresh handler
  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    setIsRefreshing(true);
    
    try {
      const result = await refetch();
      console.log('Refresh result:', result);
      console.log('Test results data:', result.data);
      
      toast({
        title: "✓ Test Results Updated",
        description: `Loaded ${result.data?.data?.length || 0} test results`,
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not refresh test results",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Debug logging
  useEffect(() => {
    console.log('TestSprite - Current test results:', testResults);
    console.log('TestSprite - Results data array:', testResults?.data);
    console.log('TestSprite - Loading state:', loadingResults);
    console.log('TestSprite - First result:', testResults?.data?.[0]);
  }, [testResults, loadingResults]);

  // Auto-refresh after triggering tests
  useEffect(() => {
    if (isTestRunning) {
      const interval = setInterval(() => {
        refetch();
      }, 2000);
      
      // Stop polling after 30 seconds
      const timeout = setTimeout(() => {
        setIsTestRunning(false);
      }, 30000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isTestRunning, refetch]);

  // Trigger tests mutation
  const triggerTests = useMutation({
    mutationFn: async (testSuite: string) => {
      return apiRequest('/api/testsprite/trigger', {
        method: 'POST',
        body: {
          test_suite: testSuite,
          priority: 'high'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Tests Triggered",
        description: "Test results will appear in approximately 10 seconds.",
      });
      setIsTestRunning(true);
      // Immediate refetch
      setTimeout(() => refetch(), 1000);
      setTimeout(() => refetch(), 5000);
      setTimeout(() => refetch(), 11000);
    },
    onError: (error: any) => {
      toast({
        title: "Test Trigger Failed",
        description: error.message || "Failed to trigger TestSprite tests",
        variant: "destructive",
      });
    },
  });

  // Health check
  const { data: healthStatus } = useQuery<ApiResponse>({
    queryKey: ['/api/testsprite/health'],
    refetchInterval: 60000, // Check health every minute
  });

  const testSuites = [
    { id: 'full-platform', name: 'Full Platform', description: 'Test all systems including Memory, Admin, Social features' },
    { id: 'memory-system', name: 'Memory System', description: 'Focus on memory creation, recommendations, and feed' },
    { id: 'admin-dashboard', name: 'Admin Dashboard', description: 'Test admin functions, user management, analytics' },
    { id: 'social-features', name: 'Social Features', description: 'Test likes, comments, follows, notifications' },
    { id: 'payment-system', name: 'Payment System', description: 'Test Stripe integration and subscriptions' },
    { id: 'security-audit', name: 'Security Audit', description: 'Comprehensive security and compliance testing' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getTestDetails = (testSuite: string) => {
    const details: Record<string, any> = {
      'full-platform': {
        name: 'Full Platform Test',
        description: 'Comprehensive testing of all platform features and endpoints',
        endpoints: ['/api/memories', '/api/auth/user', '/api/admin/stats', '/api/social', '/api/payments', '/api/notifications'],
        features: ['Authentication', 'Memory System', 'Social Features', 'Admin Dashboard', 'Payment Processing'],
        categories: ['Core', 'Security', 'Performance', 'UI/UX']
      },
      'memory-system': {
        name: 'Memory System Test',
        description: 'Testing memory creation, storage, retrieval, and recommendations',
        endpoints: ['/api/posts', '/api/posts/feed', '/api/posts/recommendations'],
        features: ['Memory Creation', 'Feed Algorithm', 'Recommendations', 'Media Handling'],
        categories: ['Core', 'Performance']
      },
      'admin-dashboard': {
        name: 'Admin Dashboard Test',
        description: 'Testing administrative functions and analytics',
        endpoints: ['/api/admin/stats', '/api/admin/users', '/api/admin/compliance'],
        features: ['User Management', 'Analytics', 'Compliance Monitoring', 'System Health'],
        categories: ['Admin', 'Security']
      },
      'social-features': {
        name: 'Social Features Test',
        description: 'Testing social interactions and notifications',
        endpoints: ['/api/social/likes', '/api/social/comments', '/api/notifications'],
        features: ['Likes', 'Comments', 'Follows', 'Notifications', 'Real-time Updates'],
        categories: ['Social', 'Real-time']
      },
      'payment-system': {
        name: 'Payment System Test',
        description: 'Testing Stripe integration and subscription management',
        endpoints: ['/api/payments', '/api/subscriptions', '/api/stripe/webhook'],
        features: ['Payment Processing', 'Subscriptions', 'Webhooks', 'Billing'],
        categories: ['Payments', 'Security']
      },
      'security-audit': {
        name: 'Security Audit',
        description: 'Comprehensive security and compliance testing',
        endpoints: ['/api/auth', '/api/csrf', '/api/security/audit'],
        features: ['Authentication', 'Authorization', 'CSRF Protection', 'Data Encryption'],
        categories: ['Security', 'Compliance']
      }
    };
    
    return details[testSuite] || {
      name: testSuite.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Custom test suite',
      endpoints: ['/api/test'],
      features: ['Custom Tests'],
      categories: ['Custom']
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">TestSprite AI Testing</h2>
          <p className="text-gray-600 dark:text-gray-400">Autonomous AI-powered testing for your platform</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            <CheckCircle className="inline h-3 w-3 mr-1" />
            TestSprite API Key Configured
          </p>
        </div>
        {healthStatus?.data && (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Healthy
          </Badge>
        )}
      </div>

      {/* Test Suite Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Trigger Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testSuites.map((suite) => (
              <Card 
                key={suite.id}
                className={`cursor-pointer transition-all ${
                  selectedSuite === suite.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedSuite(suite.id)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{suite.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {suite.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button 
            onClick={() => triggerTests.mutate(selectedSuite)}
            disabled={triggerTests.isPending}
            className="w-full"
          >
            {triggerTests.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Triggering Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run {testSuites.find(s => s.id === selectedSuite)?.name} Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Test Results</CardTitle>
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            size="sm"
            disabled={loadingResults || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loadingResults || isRefreshing) ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingResults || isRefreshing ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              {isRefreshing ? 'Refreshing test results...' : 'Loading test results...'}
            </div>
          ) : testResults?.data && testResults.data.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Showing {testResults.data.length} test results
              </div>
              {testResults.data.map((result: TestResult) => {
                const testDetails = getTestDetails(result.testSuite);
                const successRate = result.results.passed + result.results.failed > 0 
                  ? Math.round((result.results.passed / (result.results.passed + result.results.failed)) * 100)
                  : 0;
                
                return (
                  <div key={result.testId} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={getStatusColor(result.status)}>
                          {getStatusIcon(result.status)}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{testDetails.name}</span>
                            <Badge 
                              variant={result.status === 'passed' ? 'default' : result.status === 'failed' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {result.status}
                            </Badge>
                            {successRate > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {successRate}% Success Rate
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {testDetails.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Duration: {result.duration || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Test Coverage Details */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Test Coverage</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {testDetails.endpoints.map((endpoint: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-gray-600 dark:text-gray-400">{endpoint}</span>
                          </div>
                        ))}
                      </div>
                      {testDetails.features && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500">Features Tested: </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {testDetails.features.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Results Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <div className="text-2xl font-bold text-green-600">{result.results.passed}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tests Passed</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="text-2xl font-bold text-red-600">{result.results.failed}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tests Failed</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/20 rounded">
                        <div className="text-2xl font-bold text-gray-600">{result.results.skipped}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tests Skipped</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar with Label */}
                    {result.results.passed + result.results.failed > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Test Completion</span>
                          <span>{successRate}% Passed</span>
                        </div>
                        <Progress 
                          value={successRate}
                          className="h-3"
                        />
                      </div>
                    )}

                    {/* Test ID for reference */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500">Test ID: {result.testId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div>No test results yet. Run your first test to see results here.</div>
              <div className="text-xs mt-2">
                Debug: testResults = {JSON.stringify(testResults?.data ? `${testResults.data.length} results` : 'null')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Status */}
      {healthStatus?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-semibold">Platform</div>
                <div className="text-sm text-gray-600">{healthStatus.data.platform}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Framework</div>
                <div className="text-sm text-gray-600">{healthStatus.data.framework}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Webhook</div>
                <div className="text-sm text-green-600">Active</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">API</div>
                <div className="text-sm text-green-600">Connected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}