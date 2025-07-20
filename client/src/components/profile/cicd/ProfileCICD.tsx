import React, { useState } from 'react';
import { GitBranch, CheckCircle, XCircle, Clock, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PipelineStage {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration?: number;
  logs?: string[];
}

interface DeploymentMetrics {
  buildTime: number;
  testsPassed: number;
  testsTotal: number;
  coverage: number;
  lastDeployment: Date;
  deploymentFrequency: number;
}

export const ProfileCICD: React.FC<{ userId: number }> = ({ userId }) => {
  const [pipelineStages] = useState<PipelineStage[]>([
    { name: 'Checkout', status: 'success', duration: 2 },
    { name: 'Install Dependencies', status: 'success', duration: 15 },
    { name: 'Lint & Format', status: 'success', duration: 8 },
    { name: 'Unit Tests', status: 'success', duration: 25 },
    { name: 'Integration Tests', status: 'running', duration: 12 },
    { name: 'Build', status: 'pending' },
    { name: 'Deploy to Staging', status: 'pending' },
    { name: 'E2E Tests', status: 'pending' },
    { name: 'Deploy to Production', status: 'pending' }
  ]);

  const [metrics] = useState<DeploymentMetrics>({
    buildTime: 4.5,
    testsPassed: 142,
    testsTotal: 145,
    coverage: 87,
    lastDeployment: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deploymentFrequency: 12
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Status */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-green-600" />
              CI/CD Pipeline Status
            </div>
            <Button size="sm" variant="outline">
              <Play className="w-3 h-3 mr-1" />
              Run Pipeline
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelineStages.map((stage, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(stage.status)}
                  <span className="font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {stage.duration && (
                    <span className="text-sm text-gray-600">{stage.duration}s</span>
                  )}
                  <Badge className={getStatusColor(stage.status)}>
                    {stage.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{metrics.buildTime}min</div>
              <div className="text-sm text-gray-600">Avg Build Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{metrics.deploymentFrequency}/week</div>
              <div className="text-sm text-gray-600">Deploy Frequency</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{metrics.coverage}%</div>
              <div className="text-sm text-gray-600">Code Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Tests Passed</span>
                <span className="text-sm text-gray-600">
                  {metrics.testsPassed}/{metrics.testsTotal}
                </span>
              </div>
              <Progress 
                value={(metrics.testsPassed / metrics.testsTotal) * 100} 
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-700">{metrics.testsPassed}</div>
                <div className="text-green-600">Passed</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-bold text-red-700">{metrics.testsTotal - metrics.testsPassed}</div>
                <div className="text-red-600">Failed</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-gray-700">0</div>
                <div className="text-gray-600">Skipped</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Production - v2.1.0</div>
                <div className="text-sm text-gray-600">2 hours ago</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Success</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Staging - v2.1.0-beta.1</div>
                <div className="text-sm text-gray-600">4 hours ago</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Success</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Development - feature/profile-v2</div>
                <div className="text-sm text-gray-600">6 hours ago</div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Building</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};