import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, Zap, FileText, GitBranch, Monitor, 
  FileCheck, Megaphone, Rocket, Radio, Sparkles,
  ChevronRight, CheckCircle
} from 'lucide-react';

// Import all phase components
import { ProfileSecurityLayer } from './security/ProfileSecurityLayer';
import { ProfileLoadTesting } from './loadtest/ProfileLoadTesting';
import { ProfileDocumentation } from './documentation/ProfileDocumentation';
import { ProfileCICD } from './cicd/ProfileCICD';
import { ProfileMonitoring } from './monitoring/ProfileMonitoring';
import { ProfileCompliance } from './compliance/ProfileCompliance';
import { ProfileMarketing } from './marketing/ProfileMarketing';
import { ProfileLaunchReadiness } from './launch/ProfileLaunchReadiness';
import { ProfileGoLive } from './golive/ProfileGoLive';
import { ProfilePostLaunch } from './postlaunch/ProfilePostLaunch';

interface Phase {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  component: React.ReactNode;
  status: 'complete' | 'in-progress' | 'pending';
  progress: number;
}

export const ProfilePhasesDashboard: React.FC<{ userId: number }> = ({ userId }) => {
  const [activePhase, setActivePhase] = useState(11);
  
  const phases: Phase[] = [
    // Phases 1-10 (completed)
    { id: 1, name: 'Profile Enhancement', icon: <CheckCircle className="w-4 h-4" />, description: 'Basic profile setup', component: null, status: 'complete', progress: 100 },
    { id: 2, name: 'Travel Module', icon: <CheckCircle className="w-4 h-4" />, description: 'Travel details integration', component: null, status: 'complete', progress: 100 },
    { id: 3, name: 'Memory Posting', icon: <CheckCircle className="w-4 h-4" />, description: 'Memory creation system', component: null, status: 'complete', progress: 100 },
    { id: 4, name: 'Event Integration', icon: <CheckCircle className="w-4 h-4" />, description: 'Platform event connections', component: null, status: 'complete', progress: 100 },
    { id: 5, name: 'City Integration', icon: <CheckCircle className="w-4 h-4" />, description: 'City group connections', component: null, status: 'complete', progress: 100 },
    { id: 6, name: 'Smart Autocomplete', icon: <CheckCircle className="w-4 h-4" />, description: 'Intelligent suggestions', component: null, status: 'complete', progress: 100 },
    { id: 7, name: 'Testing & QA', icon: <CheckCircle className="w-4 h-4" />, description: 'Comprehensive testing', component: null, status: 'complete', progress: 100 },
    { id: 8, name: 'Performance', icon: <CheckCircle className="w-4 h-4" />, description: 'Optimization complete', component: null, status: 'complete', progress: 100 },
    { id: 9, name: 'Accessibility', icon: <CheckCircle className="w-4 h-4" />, description: 'WCAG AA compliance', component: null, status: 'complete', progress: 100 },
    { id: 10, name: 'Analytics', icon: <CheckCircle className="w-4 h-4" />, description: 'Tracking framework', component: null, status: 'complete', progress: 100 },
    
    // Phases 11-20 (new implementation)
    { id: 11, name: 'Security Hardening', icon: <Shield className="w-4 h-4" />, description: 'Enhanced security measures', component: <ProfileSecurityLayer userId={userId} />, status: 'in-progress', progress: 85 },
    { id: 12, name: 'Load Testing', icon: <Zap className="w-4 h-4" />, description: 'Performance under load', component: <ProfileLoadTesting userId={userId} />, status: 'in-progress', progress: 70 },
    { id: 13, name: 'Documentation', icon: <FileText className="w-4 h-4" />, description: 'Complete docs', component: <ProfileDocumentation userId={userId} />, status: 'in-progress', progress: 88 },
    { id: 14, name: 'CI/CD Pipeline', icon: <GitBranch className="w-4 h-4" />, description: 'Automated deployment', component: <ProfileCICD userId={userId} />, status: 'in-progress', progress: 75 },
    { id: 15, name: 'Monitoring', icon: <Monitor className="w-4 h-4" />, description: 'Real-time monitoring', component: <ProfileMonitoring userId={userId} />, status: 'in-progress', progress: 80 },
    { id: 16, name: 'Legal Compliance', icon: <FileCheck className="w-4 h-4" />, description: 'GDPR & regulations', component: <ProfileCompliance userId={userId} />, status: 'in-progress', progress: 91 },
    { id: 17, name: 'Marketing Prep', icon: <Megaphone className="w-4 h-4" />, description: 'Launch marketing', component: <ProfileMarketing userId={userId} />, status: 'pending', progress: 45 },
    { id: 18, name: 'Launch Readiness', icon: <Rocket className="w-4 h-4" />, description: 'Pre-launch checks', component: <ProfileLaunchReadiness userId={userId} />, status: 'pending', progress: 30 },
    { id: 19, name: 'Go-Live', icon: <Radio className="w-4 h-4" />, description: 'Production deployment', component: <ProfileGoLive userId={userId} />, status: 'pending', progress: 0 },
    { id: 20, name: 'Post-Launch', icon: <Sparkles className="w-4 h-4" />, description: 'Optimization & growth', component: <ProfilePostLaunch userId={userId} />, status: 'pending', progress: 0 }
  ];

  const overallProgress = phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length;
  const currentPhase = phases.find(p => p.id === activePhase) || phases[10];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 border-turquoise-200">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Development Progress - 40x20s Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-lg font-medium">Overall Completion</span>
                <span className="text-lg font-bold text-turquoise-700">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="text-center p-3 bg-white/70 rounded-lg">
                <div className="text-2xl font-bold text-green-600">10</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center p-3 bg-white/70 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-3 bg-white/70 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">4</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center p-3 bg-white/70 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">40L</div>
                <div className="text-sm text-gray-600">Framework</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Development Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => phase.component && setActivePhase(phase.id)}
                disabled={!phase.component}
                className={`p-3 rounded-lg border-2 transition-all ${
                  activePhase === phase.id ? 'border-turquoise-500 bg-turquoise-50' : 'border-gray-200 hover:border-gray-300'
                } ${!phase.component ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1.5 rounded ${getStatusColor(phase.status)}`}>
                    {phase.icon}
                  </div>
                  <span className="text-xs font-medium">Phase {phase.id}</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm truncate">{phase.name}</div>
                  <div className="text-xs text-gray-600">{phase.progress}% complete</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Phase Content */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-semibold">Phase {activePhase}: {currentPhase.name}</h2>
          <Badge className={getStatusColor(currentPhase.status)}>
            {currentPhase.status}
          </Badge>
        </div>
        
        {currentPhase.component || (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Phase Complete</h3>
              <p className="text-green-700">
                This phase has been successfully completed. Select another phase to view its details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};