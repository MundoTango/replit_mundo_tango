import React, { useState } from 'react';
import { Rocket, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LaunchChecklistItem {
  category: string;
  task: string;
  status: 'complete' | 'in-progress' | 'pending';
  critical: boolean;
}

interface LaunchMetrics {
  overallReadiness: number;
  criticalTasksComplete: number;
  criticalTasksTotal: number;
  estimatedLaunchDate: Date;
  prelaunchTestsComplete: boolean;
  rollbackPlanReady: boolean;
}

export const ProfileLaunchReadiness: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics] = useState<LaunchMetrics>({
    overallReadiness: 92,
    criticalTasksComplete: 18,
    criticalTasksTotal: 20,
    estimatedLaunchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    prelaunchTestsComplete: true,
    rollbackPlanReady: true
  });

  const [checklist] = useState<LaunchChecklistItem[]>([
    { category: 'Security', task: 'Security audit complete', status: 'complete', critical: true },
    { category: 'Security', task: 'Penetration testing passed', status: 'complete', critical: true },
    { category: 'Performance', task: 'Load testing at 2x capacity', status: 'complete', critical: true },
    { category: 'Performance', task: 'CDN configuration optimized', status: 'complete', critical: false },
    { category: 'Documentation', task: 'User guide published', status: 'complete', critical: false },
    { category: 'Documentation', task: 'API documentation complete', status: 'complete', critical: false },
    { category: 'Legal', task: 'Terms of service reviewed', status: 'complete', critical: true },
    { category: 'Legal', task: 'Privacy policy updated', status: 'complete', critical: true },
    { category: 'Infrastructure', task: 'Backup systems tested', status: 'complete', critical: true },
    { category: 'Infrastructure', task: 'Monitoring alerts configured', status: 'in-progress', critical: true },
    { category: 'Marketing', task: 'Launch announcement prepared', status: 'complete', critical: false },
    { category: 'Marketing', task: 'Social media campaigns scheduled', status: 'in-progress', critical: false },
    { category: 'Support', task: 'Support team trained', status: 'complete', critical: true },
    { category: 'Support', task: 'Knowledge base populated', status: 'pending', critical: false }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const launchStatus = metrics.overallReadiness >= 95 ? 'ready' : 
                      metrics.overallReadiness >= 85 ? 'almost-ready' : 'not-ready';

  return (
    <div className="space-y-6">
      {/* Launch Readiness Overview */}
      <Card className={`border-2 ${
        launchStatus === 'ready' ? 'border-green-400 bg-gradient-to-br from-green-50/50 to-emerald-50/50' :
        launchStatus === 'almost-ready' ? 'border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-amber-50/50' :
        'border-red-400 bg-gradient-to-br from-red-50/50 to-pink-50/50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className={`w-5 h-5 ${
              launchStatus === 'ready' ? 'text-green-600' :
              launchStatus === 'almost-ready' ? 'text-yellow-600' : 'text-red-600'
            }`} />
            Profile Launch Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">
              {metrics.overallReadiness}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${
              launchStatus === 'ready' ? 'bg-green-600' :
              launchStatus === 'almost-ready' ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {launchStatus === 'ready' ? '🚀 Ready to Launch!' :
               launchStatus === 'almost-ready' ? '⏳ Almost Ready' : '🛠️ Preparation Needed'}
            </Badge>
          </div>
          <Progress value={metrics.overallReadiness} className="h-4 mb-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="font-medium">Critical Tasks</div>
              <div className="text-2xl font-bold mt-1">
                {metrics.criticalTasksComplete}/{metrics.criticalTasksTotal}
              </div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="font-medium">Est. Launch Date</div>
              <div className="text-lg font-bold mt-1">
                {metrics.estimatedLaunchDate.toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="font-medium">{item.task}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.critical && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                  <Badge variant={
                    item.status === 'complete' ? 'default' :
                    item.status === 'in-progress' ? 'secondary' : 'outline'
                  }>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pre-Launch Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Launch Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${
              metrics.prelaunchTestsComplete ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Integration Tests</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">All 245 tests passing</div>
            </div>
            <div className={`p-4 rounded-lg ${
              metrics.rollbackPlanReady ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Rollback Plan</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Tested and documented</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Performance Baseline</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">Sub-100ms response time</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Security Scan</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-600">No vulnerabilities found</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Launch Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Launch Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full" size="lg" disabled={launchStatus !== 'ready'}>
              <Rocket className="mr-2 h-5 w-5" />
              Initiate Launch Sequence
            </Button>
            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-5 w-5" />
              Run Final Performance Test
            </Button>
            <Button className="w-full" variant="outline">
              Download Launch Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Launch Warnings */}
      {launchStatus !== 'ready' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Launch Preparation Required</div>
            <div className="text-sm">
              Complete all critical tasks before launching. {metrics.criticalTasksTotal - metrics.criticalTasksComplete} critical tasks remaining.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};