import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Filter,
  GitCommit,
  Layers,
  Plus,
  Search,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  Database,
  Shield,
  Settings,
  FileText,
  Monitor,
  Globe,
  Code,
  Palette,
  Server,
  Lock,
  TestTube,
  Rocket,
  Eye,
  BookOpen,
  Scale,
  Briefcase
} from 'lucide-react';

// 11L Layer Definitions with Icons and Colors
const LAYER_DEFINITIONS = [
  { id: 'Layer 1', name: 'User Interface & Experience', color: 'bg-blue-500', icon: Palette, emoji: '🎨' },
  { id: 'Layer 2', name: 'Backend API & Logic', color: 'bg-green-500', icon: Server, emoji: '⚙️' },
  { id: 'Layer 3', name: 'Database & Storage', color: 'bg-purple-500', icon: Database, emoji: '🗄️' },
  { id: 'Layer 4', name: 'Authentication & Security', color: 'bg-red-500', icon: Shield, emoji: '🔐' },
  { id: 'Layer 5', name: 'Integration & Services', color: 'bg-orange-500', icon: Globe, emoji: '🔗' },
  { id: 'Layer 6', name: 'Testing & Quality Assurance', color: 'bg-cyan-500', icon: TestTube, emoji: '🧪' },
  { id: 'Layer 7', name: 'DevOps & Deployment', color: 'bg-indigo-500', icon: Rocket, emoji: '🚀' },
  { id: 'Layer 8', name: 'Analytics & Monitoring', color: 'bg-pink-500', icon: Eye, emoji: '📊' },
  { id: 'Layer 9', name: 'Documentation & Training', color: 'bg-amber-500', icon: BookOpen, emoji: '📚' },
  { id: 'Layer 10', name: 'Legal & Compliance', color: 'bg-gray-500', icon: Scale, emoji: '⚖️' },
  { id: 'Layer 11', name: 'Strategic & Business', color: 'bg-emerald-500', icon: Briefcase, emoji: '🎯' }
];

// Complete Platform Inventory - ALL Items from Platform Review
const COMPREHENSIVE_PLATFORM_INVENTORY = [
  // Layer 1: User Interface & Experience
  {
    id: 'ui-001',
    title: 'TrangoTech Design System Implementation',
    type: 'Framework',
    layer: 'Layer 1',
    completionPercentage: 95,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete TrangoTech branding with gradient headers, modern navigation, and consistent styling',
    blockers: [],
    dependencies: [],
    estimatedHours: 60,
    actualHours: 65,
    tags: ['Design System', 'UI/UX', 'Branding']
  },
  {
    id: 'ui-002',
    title: 'Enhanced Post Engagement System',
    type: 'Feature',
    layer: 'Layer 1',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Tango-specific reactions (❤️ 🔥 😍 🎉) with WYSIWYG comments and real-time engagement',
    blockers: [],
    dependencies: ['api-003', 'db-004'],
    estimatedHours: 40,
    actualHours: 45,
    tags: ['Social Features', 'Real-time', 'Engagement']
  },
  {
    id: 'ui-003',
    title: 'Role Emoji Display System',
    type: 'Component',
    layer: 'Layer 1',
    completionPercentage: 75,
    mvpStatus: 'In Progress',
    reviewStatus: 'Pending',
    riskLevel: 'Low',
    description: 'Emoji-only role display with hover descriptions (needs refinement)',
    blockers: ['User wants emoji-only format with hover descriptions'],
    dependencies: ['auth-002'],
    estimatedHours: 8,
    actualHours: 6,
    tags: ['Roles', 'UX', 'Display']
  },
  {
    id: 'ui-004',
    title: 'Mobile-First Responsive Optimization',
    type: 'Enhancement',
    layer: 'Layer 1',
    completionPercentage: 60,
    mvpStatus: 'Deferred',
    reviewStatus: 'Pending',
    riskLevel: 'Moderate',
    description: 'Complete mobile responsiveness across all components and breakpoints',
    blockers: ['Desktop-first approach needs mobile optimization'],
    dependencies: [],
    estimatedHours: 35,
    actualHours: 20,
    tags: ['Mobile', 'Responsive', 'UX']
  },
  {
    id: 'ui-005',
    title: 'Admin Center Dashboard (9 Interfaces)',
    type: 'Feature',
    layer: 'Layer 1',
    completionPercentage: 90,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Comprehensive admin center with Overview, User Management, Content Moderation, Analytics, etc.',
    blockers: [],
    dependencies: ['api-012', 'api-013'],
    estimatedHours: 80,
    actualHours: 85,
    tags: ['Admin', 'Dashboard', 'Management']
  },

  // Layer 2: Backend API & Logic
  {
    id: 'api-001',
    title: 'Express.js Server Architecture',
    type: 'Framework',
    layer: 'Layer 2',
    completionPercentage: 85,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Node.js/Express server with comprehensive API endpoint structure',
    blockers: [],
    dependencies: [],
    estimatedHours: 50,
    actualHours: 55,
    tags: ['Server', 'Architecture', 'API']
  },
  {
    id: 'api-002',
    title: 'TypeScript Error Resolution (83+ errors)',
    type: 'Fix',
    layer: 'Layer 2',
    completionPercentage: 15,
    mvpStatus: 'Blocked',
    reviewStatus: 'Rejected',
    riskLevel: 'High',
    description: 'Critical TypeScript errors in server/routes.ts blocking maintainability',
    blockers: ['Massive TS error accumulation', 'Missing service imports', 'Schema misalignment'],
    dependencies: ['db-001', 'svc-002'],
    estimatedHours: 25,
    actualHours: 8,
    tags: ['TypeScript', 'Critical', 'Maintenance']
  },
  {
    id: 'api-003',
    title: 'Enhanced Post API Endpoints',
    type: 'Feature',
    layer: 'Layer 2',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete post creation, comments, reactions, and engagement APIs',
    blockers: [],
    dependencies: ['db-004'],
    estimatedHours: 30,
    actualHours: 35,
    tags: ['Posts', 'Social', 'API']
  },
  {
    id: 'api-004',
    title: 'Project Tracker API System',
    type: 'Feature',
    layer: 'Layer 2',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete project tracking APIs with CRUD operations and analytics',
    blockers: [],
    dependencies: ['db-008'],
    estimatedHours: 20,
    actualHours: 22,
    tags: ['Project Tracking', 'Admin', 'Analytics']
  },
  {
    id: 'api-012',
    title: 'Admin Statistics API',
    type: 'Feature',
    layer: 'Layer 2',
    completionPercentage: 70,
    mvpStatus: 'In Progress',
    reviewStatus: 'Pending',
    riskLevel: 'High',
    description: 'Admin dashboard statistics with database query failures',
    blockers: ['Missing "type" column causing SQL errors'],
    dependencies: ['db-001'],
    estimatedHours: 15,
    actualHours: 12,
    tags: ['Admin', 'Statistics', 'Dashboard']
  },
  {
    id: 'api-013',
    title: 'Admin Compliance API',
    type: 'Feature',
    layer: 'Layer 2',
    completionPercentage: 50,
    mvpStatus: 'Blocked',
    reviewStatus: 'Pending',
    riskLevel: 'High',
    description: 'Compliance monitoring endpoints (500 errors due to missing service)',
    blockers: ['Missing automatedComplianceMonitor service'],
    dependencies: ['svc-002'],
    estimatedHours: 20,
    actualHours: 10,
    tags: ['Compliance', 'Admin', 'Monitoring']
  },

  // Layer 3: Database & Storage
  {
    id: 'db-001',
    title: 'Database Schema Alignment',
    type: 'Fix',
    layer: 'Layer 3',
    completionPercentage: 60,
    mvpStatus: 'Blocked',
    reviewStatus: 'Rejected',
    riskLevel: 'High',
    description: 'Critical schema-API misalignment causing runtime SQL failures',
    blockers: ['Missing columns: type, memoriesTable, notificationsTable'],
    dependencies: [],
    estimatedHours: 20,
    actualHours: 12,
    tags: ['Schema', 'Critical', 'SQL']
  },
  {
    id: 'db-002',
    title: 'PostgreSQL with Drizzle ORM',
    type: 'Framework',
    layer: 'Layer 3',
    completionPercentage: 95,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete database architecture with 55+ tables and comprehensive schema',
    blockers: [],
    dependencies: [],
    estimatedHours: 100,
    actualHours: 110,
    tags: ['Database', 'ORM', 'Architecture']
  },
  {
    id: 'db-003',
    title: 'Row-Level Security (RLS) Policies',
    type: 'Security',
    layer: 'Layer 3',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Comprehensive RLS policies for data protection and user context',
    blockers: [],
    dependencies: ['auth-001'],
    estimatedHours: 40,
    actualHours: 45,
    tags: ['Security', 'RLS', 'Data Protection']
  },
  {
    id: 'db-004',
    title: 'Enhanced Post Tables Structure',
    type: 'Feature',
    layer: 'Layer 3',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete post, comments, reactions, and media tables with relationships',
    blockers: [],
    dependencies: [],
    estimatedHours: 25,
    actualHours: 30,
    tags: ['Posts', 'Social', 'Database']
  },
  {
    id: 'db-008',
    title: 'Project Tracker Database Schema',
    type: 'Feature',
    layer: 'Layer 3',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete project tracking tables with item management and analytics',
    blockers: [],
    dependencies: [],
    estimatedHours: 15,
    actualHours: 18,
    tags: ['Project Tracking', 'Schema', 'Analytics']
  },

  // Layer 4: Authentication & Security
  {
    id: 'auth-001',
    title: 'Replit OAuth Integration',
    type: 'Framework',
    layer: 'Layer 4',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete OAuth authentication with session management and security context',
    blockers: [],
    dependencies: [],
    estimatedHours: 30,
    actualHours: 35,
    tags: ['OAuth', 'Authentication', 'Security']
  },
  {
    id: 'auth-002',
    title: 'Multi-Role Authentication System (23 Roles)',
    type: 'Feature',
    layer: 'Layer 4',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Sophisticated role management with RBAC/ABAC permission system',
    blockers: [],
    dependencies: ['db-003'],
    estimatedHours: 50,
    actualHours: 55,
    tags: ['Roles', 'RBAC', 'Permissions']
  },
  {
    id: 'auth-003',
    title: 'Security Context Middleware',
    type: 'Security',
    layer: 'Layer 4',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Enterprise-grade security middleware with audit logging',
    blockers: [],
    dependencies: ['auth-001'],
    estimatedHours: 20,
    actualHours: 25,
    tags: ['Security', 'Middleware', 'Audit']
  },

  // Layer 5: Integration & Services
  {
    id: 'svc-001',
    title: 'Google Maps Platform Integration',
    type: 'Integration',
    layer: 'Layer 5',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete Google Maps API integration for location selection and events',
    blockers: [],
    dependencies: [],
    estimatedHours: 25,
    actualHours: 30,
    tags: ['Google Maps', 'Location', 'API']
  },
  {
    id: 'svc-002',
    title: 'Missing Compliance Monitor Service',
    type: 'Fix',
    layer: 'Layer 5',
    completionPercentage: 0,
    mvpStatus: 'Blocked',
    reviewStatus: 'Rejected',
    riskLevel: 'High',
    description: 'Critical missing automatedComplianceMonitor service causing admin failures',
    blockers: ['Service module not found', 'Import path resolution needed'],
    dependencies: [],
    estimatedHours: 15,
    actualHours: 2,
    tags: ['Compliance', 'Service', 'Critical']
  },
  {
    id: 'svc-003',
    title: 'Pexels API for Dynamic Photos',
    type: 'Integration',
    layer: 'Layer 5',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Automated city photo fetching for group creation with authentic imagery',
    blockers: [],
    dependencies: [],
    estimatedHours: 15,
    actualHours: 18,
    tags: ['Pexels', 'Photos', 'Automation']
  },
  {
    id: 'svc-004',
    title: 'Supabase Real-time Integration',
    type: 'Integration',
    layer: 'Layer 5',
    completionPercentage: 80,
    mvpStatus: 'In Progress',
    reviewStatus: 'Pending',
    riskLevel: 'Moderate',
    description: 'Real-time features with WebSocket integration (configuration warnings)',
    blockers: ['VITE_SUPABASE_URL configuration warnings'],
    dependencies: [],
    estimatedHours: 20,
    actualHours: 16,
    tags: ['Supabase', 'Real-time', 'WebSocket']
  },

  // Layer 6: Testing & Quality Assurance
  {
    id: 'test-001',
    title: 'Comprehensive Test Coverage Implementation',
    type: 'Framework',
    layer: 'Layer 6',
    completionPercentage: 20,
    mvpStatus: 'Deferred',
    reviewStatus: 'Pending',
    riskLevel: 'High',
    description: 'Testing infrastructure prepared but not implemented - blocking production confidence',
    blockers: ['TypeScript errors preventing test execution', 'No comprehensive coverage'],
    dependencies: ['api-002'],
    estimatedHours: 60,
    actualHours: 12,
    tags: ['Testing', 'Quality', 'Coverage']
  },
  {
    id: 'test-002',
    title: 'Jest/Vitest Configuration',
    type: 'Setup',
    layer: 'Layer 6',
    completionPercentage: 100,
    mvpStatus: 'Ready',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete testing framework configuration with React Testing Library',
    blockers: [],
    dependencies: [],
    estimatedHours: 10,
    actualHours: 12,
    tags: ['Jest', 'Configuration', 'Setup']
  },

  // Layer 7: DevOps & Deployment
  {
    id: 'devops-001',
    title: 'Replit Deployment Configuration',
    type: 'Infrastructure',
    layer: 'Layer 7',
    completionPercentage: 95,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete deployment setup with environment management and workflows',
    blockers: [],
    dependencies: [],
    estimatedHours: 20,
    actualHours: 25,
    tags: ['Deployment', 'Infrastructure', 'Replit']
  },
  {
    id: 'devops-002',
    title: 'PostgreSQL Database Hosting (Neon)',
    type: 'Infrastructure',
    layer: 'Layer 7',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Production database hosting with proper backup and scaling',
    blockers: [],
    dependencies: [],
    estimatedHours: 15,
    actualHours: 18,
    tags: ['Database', 'Hosting', 'Neon']
  },

  // Layer 8: Analytics & Monitoring
  {
    id: 'analytics-001',
    title: 'Plausible Analytics Integration',
    type: 'Integration',
    layer: 'Layer 8',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete privacy-first analytics with comprehensive event tracking',
    blockers: [],
    dependencies: [],
    estimatedHours: 10,
    actualHours: 12,
    tags: ['Analytics', 'Privacy', 'Tracking']
  },
  {
    id: 'analytics-002',
    title: 'Project Tracker Analytics Dashboard',
    type: 'Feature',
    layer: 'Layer 8',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete project tracking analytics with filtering and insights',
    blockers: [],
    dependencies: ['api-004'],
    estimatedHours: 25,
    actualHours: 28,
    tags: ['Project Tracking', 'Analytics', 'Dashboard']
  },
  {
    id: 'analytics-003',
    title: 'Compliance Scoring System',
    type: 'Feature',
    layer: 'Layer 8',
    completionPercentage: 85,
    mvpStatus: 'In Progress',
    reviewStatus: 'Pending',
    riskLevel: 'Moderate',
    description: 'Automated compliance monitoring with 84% overall score (missing service)',
    blockers: ['Missing automated monitoring service'],
    dependencies: ['svc-002'],
    estimatedHours: 30,
    actualHours: 25,
    tags: ['Compliance', 'Monitoring', 'Scoring']
  },

  // Layer 9: Documentation & Training
  {
    id: 'docs-001',
    title: 'Comprehensive Project Documentation',
    type: 'Documentation',
    layer: 'Layer 9',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete replit.md with 800+ changelog entries and implementation guides',
    blockers: [],
    dependencies: [],
    estimatedHours: 40,
    actualHours: 45,
    tags: ['Documentation', 'Changelog', 'Guides']
  },
  {
    id: 'docs-002',
    title: '11L Framework Documentation',
    type: 'Framework',
    layer: 'Layer 9',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete 11-Layer development framework with systematic approach guides',
    blockers: [],
    dependencies: [],
    estimatedHours: 20,
    actualHours: 22,
    tags: ['Framework', 'Methodology', '11L']
  },

  // Layer 10: Legal & Compliance
  {
    id: 'legal-001',
    title: 'GDPR Compliance Framework',
    type: 'Compliance',
    layer: 'Layer 10',
    completionPercentage: 95,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete GDPR implementation with 90% compliance score and data subject rights',
    blockers: [],
    dependencies: [],
    estimatedHours: 50,
    actualHours: 55,
    tags: ['GDPR', 'Privacy', 'Compliance']
  },
  {
    id: 'legal-002',
    title: 'SOC 2 Type II Preparation',
    type: 'Compliance',
    layer: 'Layer 10',
    completionPercentage: 80,
    mvpStatus: 'In Progress',
    reviewStatus: 'Pending',
    riskLevel: 'Moderate',
    description: 'Enterprise security compliance framework with 75% score',
    blockers: ['Need automated monitoring service restoration'],
    dependencies: ['svc-002'],
    estimatedHours: 40,
    actualHours: 32,
    tags: ['SOC 2', 'Security', 'Enterprise']
  },

  // Layer 11: Strategic & Business
  {
    id: 'strategic-001',
    title: 'Automated City Group Creation System',
    type: 'Automation',
    layer: 'Layer 11',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Intelligent location-based community building with global scaling',
    blockers: [],
    dependencies: ['svc-003'],
    estimatedHours: 35,
    actualHours: 40,
    tags: ['Automation', 'Community', 'Global']
  },
  {
    id: 'strategic-002',
    title: 'Event Management with RSVP System',
    type: 'Feature',
    layer: 'Layer 11',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete event lifecycle management with role assignments and community building',
    blockers: [],
    dependencies: [],
    estimatedHours: 45,
    actualHours: 50,
    tags: ['Events', 'Community', 'RSVP']
  },
  {
    id: 'strategic-003',
    title: '11L Project Tracker System',
    type: 'Framework',
    layer: 'Layer 11',
    completionPercentage: 100,
    mvpStatus: 'Signed Off',
    reviewStatus: 'Approved',
    riskLevel: 'Low',
    description: 'Complete strategic oversight system for project management and planning',
    blockers: [],
    dependencies: ['analytics-002'],
    estimatedHours: 60,
    actualHours: 65,
    tags: ['Project Management', 'Strategy', 'Oversight']
  }
];

export const Comprehensive11LProjectTracker: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // Calculate summary statistics
  const totalItems = COMPREHENSIVE_PLATFORM_INVENTORY.length;
  const completedItems = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.completionPercentage === 100).length;
  const mvpSignedOff = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.mvpStatus === 'Signed Off').length;
  const highRiskItems = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.riskLevel === 'High').length;
  const blockedItems = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.blockers.length > 0).length;

  // Layer distribution
  const layerDistribution = LAYER_DEFINITIONS.map(layer => ({
    ...layer,
    count: COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.layer === layer.id).length,
    completed: COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.layer === layer.id && item.completionPercentage === 100).length,
    avgCompletion: COMPREHENSIVE_PLATFORM_INVENTORY
      .filter(item => item.layer === layer.id)
      .reduce((acc, item) => acc + item.completionPercentage, 0) / 
      COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.layer === layer.id).length || 0
  }));

  // Filter items
  const filteredItems = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => {
    return (selectedLayer === 'all' || item.layer === selectedLayer) &&
           (selectedStatus === 'all' || item.mvpStatus === selectedStatus) &&
           (selectedRisk === 'all' || item.riskLevel === selectedRisk) &&
           (!searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
           );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Signed Off': return 'bg-green-500';
      case 'Ready': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Blocked': return 'bg-red-500';
      case 'Deferred': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getLayerInfo = (layerId: string) => {
    return LAYER_DEFINITIONS.find(layer => layer.id === layerId) || LAYER_DEFINITIONS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Layers className="h-8 w-8" />
            Comprehensive 11L Platform Tracker
          </h2>
          <p className="text-gray-600 mt-1">100% Complete Platform Inventory Across All 11 Layers</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{totalItems} Total Items</span>
            <span>•</span>
            <span>{completedItems} Completed</span>
            <span>•</span>
            <span>{mvpSignedOff} MVP Signed Off</span>
            <span>•</span>
            <span className="text-red-600">{highRiskItems} High Risk</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={view === 'overview' ? 'default' : 'outline'}
            onClick={() => setView('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={view === 'detailed' ? 'default' : 'outline'}
            onClick={() => setView('detailed')}
          >
            Detailed View
          </Button>
          <Button 
            variant={view === 'analytics' ? 'default' : 'outline'}
            onClick={() => setView('analytics')}
          >
            Analytics
          </Button>
        </div>
      </div>

      {/* Platform Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedItems}/{totalItems} items complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MVP Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mvpSignedOff}</div>
            <p className="text-xs text-muted-foreground">signed off items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskItems}</div>
            <p className="text-xs text-muted-foreground">need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Items</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{blockedItems}</div>
            <p className="text-xs text-muted-foreground">with blockers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Layers</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11/11</div>
            <p className="text-xs text-muted-foreground">all layers active</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filtering & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items, descriptions, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger>
                <SelectValue placeholder="All Layers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Layers</SelectItem>
                {LAYER_DEFINITIONS.map(layer => (
                  <SelectItem key={layer.id} value={layer.id}>
                    {layer.emoji} {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Signed Off">Signed Off</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger>
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
                <SelectItem value="Moderate">Moderate Risk</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              {filteredItems.length} of {totalItems} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Content */}
      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Layer Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Layer Distribution & Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {layerDistribution.map(layer => {
                  const Icon = layer.icon;
                  return (
                    <div key={layer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${layer.color}`}></div>
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{layer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {layer.completed}/{layer.count}
                        </Badge>
                        <div className="w-20 text-right text-sm text-gray-600">
                          {Math.round(layer.avgCompletion)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Critical Issues (High Risk)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {COMPREHENSIVE_PLATFORM_INVENTORY
                  .filter(item => item.riskLevel === 'High')
                  .map(item => (
                    <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-red-800">{item.title}</div>
                          <div className="text-sm text-red-600 mt-1">{item.description}</div>
                          {item.blockers.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-medium text-red-700">Blockers:</div>
                              <ul className="text-xs text-red-600 mt-1">
                                {item.blockers.map((blocker, index) => (
                                  <li key={index}>• {blocker}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(item.mvpStatus)} text-white text-xs`}>
                          {item.mvpStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {view === 'detailed' && (
        <div className="space-y-4">
          {filteredItems.map(item => {
            const layerInfo = getLayerInfo(item.layer);
            const Icon = layerInfo.icon;
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${layerInfo.color} text-white`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {item.layer}
                        </Badge>
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge className={`${getStatusColor(item.mvpStatus)} text-white`}>
                          {item.mvpStatus}
                        </Badge>
                        <Badge className={`${getRiskColor(item.riskLevel)} text-white`}>
                          {item.riskLevel} Risk
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="text-lg font-bold">{item.completionPercentage}%</div>
                      <div>complete</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <Progress value={item.completionPercentage} className="w-full" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">Hours</div>
                        <div className="text-gray-600">
                          {item.actualHours} / {item.estimatedHours} hours
                        </div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Review Status</div>
                        <Badge variant="outline">{item.reviewStatus}</Badge>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Dependencies</div>
                        <div className="text-gray-600">
                          {item.dependencies.length > 0 ? `${item.dependencies.length} items` : 'None'}
                        </div>
                      </div>
                    </div>

                    {/* Blockers */}
                    {item.blockers.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="font-medium text-red-800 mb-1">Blockers:</div>
                        <ul className="text-red-700 text-sm">
                          {item.blockers.map((blocker, index) => (
                            <li key={index}>• {blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dependencies */}
                    {item.dependencies.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">Dependencies:</div>
                        <div className="flex flex-wrap gap-1">
                          {item.dependencies.map((dep, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {view === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Completion by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Type-based analytics would go here */}
              <p className="text-gray-500">Advanced analytics coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Risk analytics would go here */}
              <p className="text-gray-500">Risk analysis charts coming soon...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Comprehensive11LProjectTracker;