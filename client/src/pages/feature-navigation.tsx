import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowRight,
  Heart,
  Calendar,
  Users,
  Map,
  Home,
  Brain,
  Shield,
  BarChart,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'missing';
  route?: string;
  icon: React.ReactNode;
  issues?: string[];
  requirements?: string[];
}

export default function FeatureNavigation() {
  const [, setLocation] = useLocation();

  const features: Feature[] = [
    {
      name: 'Enhanced Timeline',
      description: 'Facebook-style social features with reactions, comments, and sharing',
      status: 'implemented',
      route: '/enhanced-timeline',
      icon: <Heart className="w-5 h-5" />,
      issues: ['Was not linked in navigation - FIXED']
    },
    {
      name: 'Events System',
      description: 'Create and manage tango events',
      status: 'partial',
      route: '/events',
      icon: <Calendar className="w-5 h-5" />,
      requirements: [
        'Google Maps integration for locations',
        'Cover photo uploads',
        'Event participant roles (DJ, Teacher, etc)',
        'Advanced filtering by type/vibe',
        'Map view in City Groups'
      ]
    },
    {
      name: 'Project Tracker ("The Plan")',
      description: 'Hierarchical project management system',
      status: 'implemented',
      route: '/admin',
      icon: <FileText className="w-5 h-5" />,
      issues: ['Only accessible through Admin Center']
    },
    {
      name: 'Life CEO System',
      description: '16 AI agents for life management',
      status: 'implemented',
      route: '/life-ceo',
      icon: <Brain className="w-5 h-5" />,
      issues: ['Not in main navigation']
    },
    {
      name: 'Community Features',
      description: 'Connect with tango communities worldwide',
      status: 'partial',
      route: '/community',
      icon: <Users className="w-5 h-5" />,
      requirements: [
        'World map with city pins',
        'Community statistics',
        'City group navigation'
      ]
    },
    {
      name: 'Friends System',
      description: 'Enhanced friendship connections',
      status: 'partial',
      route: '/friends',
      icon: <Users className="w-5 h-5" />,
      requirements: [
        'Dance history tracking',
        'Photo/video uploads with requests',
        'Degrees of separation',
        'Friendship page with timeline'
      ]
    },
    {
      name: 'Housing Marketplace',
      description: 'Airbnb-style hosting for tango travelers',
      status: 'missing',
      icon: <Home className="w-5 h-5" />,
      requirements: [
        'Host onboarding flow',
        'Property listings with photos',
        'Review system',
        'Map integration',
        'Friend-level access control'
      ]
    },
    {
      name: 'Global Statistics',
      description: 'Live platform statistics',
      status: 'partial',
      route: '/global-statistics',
      icon: <BarChart className="w-5 h-5" />,
      issues: ['Currently showing hardcoded data'],
      requirements: ['Connect to live database']
    },
    {
      name: 'TTfiles Features',
      description: 'Original TrangoTech features',
      status: 'partial',
      route: '/ttfiles-demo',
      icon: <FileText className="w-5 h-5" />,
      requirements: [
        'Memories reporting to admin',
        'Help request system (Jira-style)',
        'Complete UI consistency'
      ]
    },
    {
      name: 'Admin Center',
      description: 'Platform administration',
      status: 'implemented',
      route: '/admin',
      icon: <Shield className="w-5 h-5" />,
      issues: ['Some tabs may have auth issues']
    },
    {
      name: 'Enhanced Posting',
      description: 'Unified posting system',
      status: 'missing',
      icon: <MessageSquare className="w-5 h-5" />,
      requirements: [
        'Template system across platform',
        'Google Maps location picker',
        'Photo metadata extraction',
        'Location intelligence',
        '@mentions for users/events/groups'
      ]
    },
    {
      name: 'Database Security',
      description: 'Comprehensive audit system',
      status: 'partial',
      route: '/database-security',
      icon: <Shield className="w-5 h-5" />,
      issues: ['Script provided but not executed'],
      requirements: ['Run audit implementation script']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-500 text-white">Implemented</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500 text-white">Partial</Badge>;
      case 'missing':
        return <Badge className="bg-red-500 text-white">Missing</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const stats = {
    implemented: features.filter(f => f.status === 'implemented').length,
    partial: features.filter(f => f.status === 'partial').length,
    missing: features.filter(f => f.status === 'missing').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mundo Tango Feature Navigation
          </h1>
          <p className="text-gray-600">
            Navigate to all platform features and see implementation status
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-700">{stats.implemented}</div>
              <div className="text-sm text-green-600">Implemented</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-yellow-700">{stats.partial}</div>
              <div className="text-sm text-yellow-600">Partial</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-700">{stats.missing}</div>
              <div className="text-sm text-red-600">Missing</div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                  </div>
                  {getStatusIcon(feature.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{feature.description}</p>
                
                {getStatusBadge(feature.status)}
                
                {feature.issues && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Issues:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {feature.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {feature.requirements && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Required Features:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {feature.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {feature.route && feature.status !== 'missing' && (
                  <Button 
                    className="w-full"
                    onClick={() => setLocation(feature.route!)}
                  >
                    Navigate to Feature
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}