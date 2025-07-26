import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  MapPin,
  Settings,
  Image,
  Shield,
  Zap,
  Globe,
  Brain,
  Package,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuditSection {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'critical';
  icon: React.ReactNode;
  issues: string[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}

export const PlatformAuditDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAuditDate] = useState(new Date().toISOString());

  const auditSections: AuditSection[] = [
    {
      name: 'Memories Feed',
      score: 92,
      status: 'excellent',
      icon: <Image className="w-5 h-5" />,
      trend: 'improving',
      issues: [
        'No infinite scroll (pagination only)',
        'Missing real-time updates',
        'No post editing capability'
      ],
      recommendations: [
        'Implement infinite scroll with virtual scrolling',
        'Add WebSocket for real-time updates',
        'Enable post editing with version history',
        'Add draft saving capability'
      ]
    },
    {
      name: 'City Groups',
      score: 90,
      status: 'excellent',
      icon: <MapPin className="w-5 h-5" />,
      trend: 'improving',
      issues: [
        'Map slow with 100+ markers',
        'Limited mobile map experience'
      ],
      recommendations: [
        'Add map marker clustering',
        'Enhance mobile map UX with touch gestures',
        'Add offline map caching'
      ]
    },
    {
      name: 'User Profile',
      score: 85,
      status: 'excellent',
      icon: <Users className="w-5 h-5" />,
      trend: 'improving',
      issues: [
        'Large bundle size (31MB)',
        'No image compression pipeline',
        'Limited mobile editing UI'
      ],
      recommendations: [
        'Implement progressive image optimization',
        'Add code splitting for profile components',
        'Enhance mobile editing experience',
        'Profile completion gamification'
      ]
    },
    {
      name: 'User Settings',
      score: 62,
      status: 'needs-work',
      icon: <Settings className="w-5 h-5" />,
      trend: 'declining',
      issues: [
        'No dedicated settings page',
        'Settings scattered across profile',
        'No email preferences control',
        'No theme or language selection'
      ],
      recommendations: [
        'Create comprehensive settings page',
        'Implement notification controls',
        'Add theme selection',
        'Create settings API documentation'
      ]
    },
    {
      name: 'Performance',
      score: 82,
      status: 'good',
      icon: <Zap className="w-5 h-5" />,
      trend: 'improving',
      issues: [
        'Page load 3.2s (target <3s)',
        'Redis connection errors (using fallback)',
        'High memory usage (frequent GC)',
        'Cache hit rate 60-70%'
      ],
      recommendations: [
        'Fix Redis lazy initialization',
        'Implement memory profiling',
        'Optimize component rerenders',
        'Add service worker caching'
      ]
    },
    {
      name: 'Security',
      score: 82,
      status: 'good',
      icon: <Shield className="w-5 h-5" />,
      trend: 'improving',
      issues: [
        '24 tables without RLS',
        'No 2FA support',
        'SOC 2 compliance at 70%'
      ],
      recommendations: [
        'Enable RLS on remaining 24 tables',
        'Implement 2FA authentication',
        'Complete SOC 2 Type II compliance',
        'Add Sentry error monitoring'
      ]
    }
  ];

  const overallScore = Math.round(
    auditSections.reduce((sum, section) => sum + section.score, 0) / auditSections.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needs-work': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="bg-gradient-to-br from-turquoise-50 to-cyan-50 border-turquoise-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-turquoise-600" />
              Platform Health Score
            </span>
            <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="h-4 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {auditSections.map((section) => (
              <div
                key={section.name}
                className="flex items-center justify-between p-3 bg-white/70 rounded-lg cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedSection(section.name.toLowerCase().replace(' ', '-'))}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getStatusColor(section.status)}`}>
                    {section.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{section.name}</p>
                    <p className={`text-2xl font-bold ${getScoreColor(section.score)}`}>
                      {section.score}%
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getTrendIcon(section.trend)}
                  <Badge variant={section.status === 'excellent' ? 'default' : 'secondary'} className="text-xs">
                    {section.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Actions */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Critical Actions Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Create Comprehensive Settings Page</p>
                <p className="text-sm text-gray-600 mt-1">
                  Users cannot control notifications, themes, or privacy settings
                </p>
              </div>
              <Badge variant="destructive">Week 1</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Fix Security Vulnerabilities</p>
                <p className="text-sm text-gray-600 mt-1">
                  XSS and CSRF vulnerabilities need immediate attention
                </p>
              </div>
              <Badge variant="destructive">Week 1</Badge>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Implement Image Optimization</p>
                <p className="text-sm text-gray-600 mt-1">
                  Large images causing slow profile loads
                </p>
              </div>
              <Badge variant="outline" className="border-orange-500 text-orange-700">Week 2</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 40x20s Framework Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            40x20s Framework Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Layers 1-10: Foundation</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Layers 11-20: Core Features</span>
                <span className="font-medium">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Layers 21-30: Advanced</span>
                <span className="font-medium">38%</span>
              </div>
              <Progress value={38} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Layers 31-40: Innovation</span>
                <span className="font-medium">15%</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSectionDetail = (section: AuditSection) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${getStatusColor(section.status)}`}>
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{section.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Last audited: {new Date(lastAuditDate).toLocaleDateString()}
                </p>
              </div>
            </span>
            <div className="text-right">
              <p className={`text-4xl font-bold ${getScoreColor(section.score)}`}>
                {section.score}%
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon(section.trend)}
                <span className="text-sm text-gray-600">{section.trend}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Issues */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              Issues Found ({section.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {section.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{issue}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Recommendations ({section.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {section.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 40x20s Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            40x20s Layer Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Database & API (Layers 1-5)</span>
              <Progress value={85} className="w-32 h-2" />
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">UI/UX & Performance (Layers 6-15)</span>
              <Progress value={70} className="w-32 h-2" />
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Advanced Features (Layers 16-25)</span>
              <Progress value={45} className="w-32 h-2" />
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Innovation & Future (Layers 26-40)</span>
              <Progress value={20} className="w-32 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            Platform Audit Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive 40x20s framework analysis of platform components
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-turquoise-600 to-cyan-600 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Audit
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="memories-feed">Memories</TabsTrigger>
          <TabsTrigger value="city-groups">City Groups</TabsTrigger>
          <TabsTrigger value="user-profile">Profile</TabsTrigger>
          <TabsTrigger value="user-settings">Settings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        {auditSections.map((section) => (
          <TabsContent
            key={section.name}
            value={section.name.toLowerCase().replace(' ', '-')}
            className="mt-6"
          >
            {renderSectionDetail(section)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};