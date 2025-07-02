import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Edit,
  Save,
  X,
  UserCheck,
  Network,
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
  Briefcase,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon
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

// Hierarchical structure for detailed breakdown
const PLATFORM_HIERARCHICAL_STRUCTURE = {
  'Mundo Tango Platform': {
    description: 'Global tango community platform with comprehensive social features',
    completion: 82,
    children: {
      'Core Application Features': {
        description: 'Primary user-facing features and functionality',
        completion: 89,
        children: {
          'Moments & Feed System': {
            completion: 95,
            tasks: [
              'Post Creation Interface - 100%',
              'Media Upload Integration - 100%', 
              'Real-time Feed Updates - 95%',
              'Comment & Reaction System - 90%',
              'Tag-based Filtering - 85%'
            ]
          },
          'Events & RSVP Management': {
            completion: 92,
            tasks: [
              'Event Creation Workflow - 100%',
              'RSVP System - 95%',
              'Role Assignment Features - 90%',
              'Calendar Integration - 85%',
              'Location-based Discovery - 90%'
            ]
          },
          'Community & Groups': {
            completion: 87,
            tasks: [
              'City Group Auto-creation - 100%',
              'Auto-join Functionality - 95%',
              'Group Management Interface - 80%',
              'Member Administration - 85%',
              'Group Discovery Features - 80%'
            ]
          },
          'Social Features': {
            completion: 85,
            tasks: [
              'Friend Request System - 90%',
              'User Profiles - 95%',
              'Messaging Interface - 75%',
              'Activity Feed - 85%',
              'Notification System - 80%'
            ]
          }
        }
      },
      'Administrative Systems': {
        description: 'Backend management and administrative interfaces',
        completion: 76,
        children: {
          'User Management': {
            completion: 89,
            tasks: [
              'Role Assignment System - 95%',
              'User Moderation Tools - 85%',
              'Bulk Operations - 80%',
              'Account Management - 90%',
              'Security Controls - 85%'
            ]
          },
          'Analytics Dashboard': {
            completion: 73,
            tasks: [
              'Platform Metrics - 80%',
              'User Engagement Tracking - 75%',
              'Performance Monitoring - 70%',
              'Report Generation - 65%',
              'Real-time Analytics - 70%'
            ]
          },
          'Content Moderation': {
            completion: 68,
            tasks: [
              'Auto-moderation System - 70%',
              'Reporting Workflows - 75%',
              'Review Interface - 65%',
              'Policy Enforcement - 60%',
              'Appeal Process - 65%'
            ]
          },
          'System Health Monitoring': {
            completion: 82,
            tasks: [
              'Uptime Monitoring - 95%',
              'Performance Tracking - 85%',
              'Error Logging - 80%',
              'Alert System - 75%',
              'Health Dashboards - 80%'
            ]
          }
        }
      },
      'Infrastructure & Security': {
        description: 'Technical foundation and security systems',
        completion: 88,
        children: {
          'Authentication & Authorization': {
            completion: 93,
            tasks: [
              'OAuth Integration - 100%',
              'Role-based Access Control - 95%',
              'Session Management - 90%',
              'Security Middleware - 90%',
              'Multi-role Support - 90%'
            ]
          },
          'Database & Storage': {
            completion: 91,
            tasks: [
              'PostgreSQL Setup - 100%',
              'Media Storage (Supabase) - 95%',
              'Backup Systems - 85%',
              'Performance Optimization - 90%',
              'Data Migration Tools - 85%'
            ]
          },
          'API Infrastructure': {
            completion: 85,
            tasks: [
              'RESTful API Design - 90%',
              'Authentication Middleware - 95%',
              'Rate Limiting - 80%',
              'Error Handling - 85%',
              'Documentation - 75%'
            ]
          }
        }
      },
      'Advanced Features': {
        description: 'Enhanced functionality and intelligent systems',
        completion: 75,
        children: {
          '11L Project Tracker': {
            completion: 75,
            tasks: [
              'Dual-view Interface - 80%',
              'Jira-style Cards - 85%',
              'Analytics Integration - 70%',
              'Hierarchical Breakdown - 70%',
              'Progress Tracking - 75%'
            ]
          },
          'Compliance Systems': {
            completion: 71,
            tasks: [
              'GDPR Compliance - 90%',
              'Privacy Controls - 80%',
              'Audit Logging - 75%',
              'Data Subject Rights - 85%',
              'SOC 2 Preparation - 60%'
            ]
          },
          'Automation Systems': {
            completion: 88,
            tasks: [
              'City Group Creation - 100%',
              'Photo Fetching (Pexels) - 95%',
              'Auto-join Logic - 90%',
              'Event Assignment - 85%',
              'Notification Triggers - 80%'
            ]
          }
        }
      }
    }
  }
};

export const Comprehensive11LProjectTracker: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(['platform', 'app', 'admin']));
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [hierarchicalBreakdown, setHierarchicalBreakdown] = useState<any>(null);
  const [expandedHierarchy, setExpandedHierarchy] = useState<Set<string>>(new Set());
  
  // Enhanced editable functionality
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [showDependencies, setShowDependencies] = useState<boolean>(false);
  const [completionHistory, setCompletionHistory] = useState<any[]>([]);

  // Edit functionality handlers
  const handleFieldEdit = (field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (selectedItem) {
      // In a real implementation, this would save to the backend
      const updatedItem = { ...selectedItem, ...editValues };
      setSelectedItem(updatedItem);
      
      // Update the item in the main data array
      // This would typically trigger a re-fetch or update the state management
      console.log('Saving updates:', editValues);
      
      setIsEditMode(false);
      setEditValues({});
    }
  };

  const handleShowDependencies = () => {
    setShowDependencies(true);
  };

  // Enhanced metadata with team assignments and completion rollups
  const enhanceItemWithMetadata = (item: any) => {
    // Calculate completion rollup from subtasks
    const calculateCompletionRollup = (item: any) => {
      if (!item.subtasks || item.subtasks.length === 0) {
        return item.completionPercentage;
      }
      
      const subtaskAverage = item.subtasks.reduce((sum: number, subtask: any) => {
        return sum + (subtask.completionPercentage || 0);
      }, 0) / item.subtasks.length;
      
      // Weight: 70% individual completion, 30% subtask rollup
      return Math.round((item.completionPercentage * 0.7) + (subtaskAverage * 0.3));
    };

    return {
      ...item,
      rollupCompletion: calculateCompletionRollup(item),
      assignedTeam: item.assignedTeam || ['Frontend Team'],
      humanReviewed: item.humanReviewed || false,
      lastReviewDate: item.lastReviewDate || '2025-01-01',
      reviewer: item.reviewer || 'Scott Boddye',
      subtasks: item.subtasks || [],
      dependencyCount: item.dependencies?.length || 0,
      riskFactors: item.riskFactors || []
    };
  };

  // Handle card click for detailed view
  const handleCardClick = (item: any) => {
    const enhancedItem = enhanceItemWithMetadata(item);
    setSelectedItem(enhancedItem);
    setEditValues(enhancedItem);
    setShowItemModal(true);
    setIsEditMode(false);
    
    // Check if this is a platform component that needs hierarchical breakdown
    if (item.title === 'Mundo Tango Platform' || item.title === 'Platform Components') {
      setHierarchicalBreakdown(PLATFORM_HIERARCHICAL_STRUCTURE['Mundo Tango Platform']);
      setExpandedHierarchy(new Set(['Core Application Features', 'Administrative Systems']));
    } else {
      setHierarchicalBreakdown(null);
    }
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('11L Card Clicked', {
        props: {
          layer: item.layer,
          title: item.title,
          type: item.type,
          status: item.mvpStatus
        }
      });
    }
  }



  // Toggle hierarchy expansion
  const toggleHierarchyExpansion = (key: string) => {
    const newExpanded = new Set(expandedHierarchy);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedHierarchy(newExpanded);
  }

  // Render hierarchical breakdown component
  const renderHierarchicalBreakdown = (data: any, level: number = 0, parentKey: string = '') => {
    if (!data) return null;

    return (
      <div className={`space-y-3 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-blue-200' : ''}`}>
        {Object.entries(data.children || {}).map(([key, value]: [string, any]) => {
          const fullKey = `${parentKey}-${key}`;
          const isExpanded = expandedHierarchy.has(fullKey);
          const hasChildren = value.children && Object.keys(value.children).length > 0;
          const hasTasks = value.tasks && value.tasks.length > 0;

          return (
            <div key={fullKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Section Header */}
              <div 
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  hasChildren ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'
                }`}
                onClick={() => hasChildren && toggleHierarchyExpansion(fullKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasChildren && (
                      <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </div>
                    )}
                    <div>
                      <h4 className={`font-semibold ${level === 0 ? 'text-lg text-blue-900' : 'text-base text-gray-800'}`}>
                        {key}
                      </h4>
                      {value.description && (
                        <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        value.completion >= 90 ? 'text-green-600' :
                        value.completion >= 70 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {value.completion}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            value.completion >= 90 ? 'bg-green-500' :
                            value.completion >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${value.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && hasChildren && (
                <div className="p-4 pt-0">
                  {renderHierarchicalBreakdown(value, level + 1, fullKey)}
                </div>
              )}

              {/* Task List */}
              {hasTasks && !hasChildren && (
                <div className="p-4 pt-0">
                  <div className="space-y-2">
                    {value.tasks.map((task: string, index: number) => {
                      const [taskName, percentage] = task.split(' - ');
                      const percentValue = parseInt(percentage?.replace('%', '') || '0');
                      
                      return (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{taskName}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${
                              percentValue >= 90 ? 'text-green-600' :
                              percentValue >= 70 ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              {percentage}
                            </span>
                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  percentValue >= 90 ? 'bg-green-500' :
                                  percentValue >= 70 ? 'bg-blue-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${percentValue}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };;

  // Get layer statistics for Layer Distribution view
  const getLayerStats = () => {
    const layerMap = new Map();
    
    COMPREHENSIVE_PLATFORM_INVENTORY.forEach(item => {
      if (!layerMap.has(item.layer)) {
        layerMap.set(item.layer, {
          name: item.layer,
          items: [],
          totalItems: 0,
          completedItems: 0,
          avgCompletion: 0
        });
      }
      
      const layer = layerMap.get(item.layer);
      layer.items.push(item);
      layer.totalItems++;
      if (item.mvpStatus === 'Complete' || item.completionPercentage >= 90) {
        layer.completedItems++;
      }
    });

    // Calculate average completion for each layer
    layerMap.forEach((layer, key) => {
      const totalCompletion = layer.items.reduce((sum: number, item: any) => sum + item.completionPercentage, 0);
      layer.avgCompletion = Math.round(totalCompletion / layer.items.length);
      layerMap.set(key, layer);
    });

    return Array.from(layerMap.values());
  };

  // Layer expansion toggle with analytics tracking
  const toggleLayerExpansion = (layerId: string) => {
    const newExpandedLayers = new Set(expandedLayers);
    if (newExpandedLayers.has(layerId)) {
      newExpandedLayers.delete(layerId);
      console.log('📈 Analytics: Layer collapsed', { layerId, timestamp: new Date().toISOString() });
    } else {
      newExpandedLayers.add(layerId);
      console.log('📈 Analytics: Layer expanded', { layerId, timestamp: new Date().toISOString() });
    }
    setExpandedLayers(newExpandedLayers);
  };

  // Functional action handlers
  const handleStatusUpdate = async (itemId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to update item status
      console.log(`Updating item ${itemId} status to ${newStatus}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      const itemIndex = COMPREHENSIVE_PLATFORM_INVENTORY.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        COMPREHENSIVE_PLATFORM_INVENTORY[itemIndex].mvpStatus = newStatus as any;
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiskUpdate = async (itemId: string, newRisk: string) => {
    setIsLoading(true);
    try {
      console.log(`Updating item ${itemId} risk level to ${newRisk}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const itemIndex = COMPREHENSIVE_PLATFORM_INVENTORY.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        COMPREHENSIVE_PLATFORM_INVENTORY[itemIndex].riskLevel = newRisk as any;
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to update risk level:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    console.log('🔄 Export Data button clicked - starting export process...');
    
    // Layer 8: Analytics tracking for button usage
    console.log('📈 Analytics: Export Data button clicked', {
      timestamp: new Date().toISOString(),
      totalItems,
      filteredItems: filteredItems.length,
      selectedLayer,
      selectedStatus,
      selectedRisk,
      searchQuery
    });
    
    setIsLoading(true);
    
    try {
      const exportData = {
        summary: {
          totalItems,
          completedItems,
          mvpSignedOff,
          highRiskItems,
          blockedItems,
          lastUpdated: lastUpdated.toISOString()
        },
        layerDistribution,
        items: filteredItems,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Comprehensive 11L Project Tracker',
          version: '1.0.0',
          totalLayers: LAYER_DEFINITIONS.length
        }
      };
      
      console.log('📊 Export data prepared:', { 
        totalItems: exportData.summary.totalItems,
        filteredItems: exportData.items.length,
        layers: exportData.metadata.totalLayers
      });
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `11L-project-tracker-${new Date().toISOString().split('T')[0]}.json`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      console.log('📁 Triggering download...');
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('✅ Export completed successfully');
      }, 100);
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    console.log('📋 Generate Report button clicked - starting report generation...');
    
    // Layer 8: Analytics tracking for button usage
    console.log('📈 Analytics: Generate Report button clicked', {
      timestamp: new Date().toISOString(),
      totalItems,
      completedItems,
      highRiskItems,
      blockedItems,
      selectedFilters: { selectedLayer, selectedStatus, selectedRisk, searchQuery },
      platformHealth: Math.round((completedItems/totalItems)*100)
    });
    
    setIsLoading(true);
    
    try {
      const timestamp = new Date().toISOString();
      const dateString = timestamp.split('T')[0];
      
      const criticalIssues = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.riskLevel === 'High');
      const blockedItemsList = COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.blockers.length > 0);
      
      const reportContent = `# 📊 Comprehensive 11L Project Tracker Report

**Generated:** ${timestamp}  
**Report Version:** 1.0.0  
**Platform:** Mundo Tango  

---

## 📈 Executive Summary

- **Total Items:** ${totalItems}
- **Completed Items:** ${completedItems} (${Math.round((completedItems/totalItems)*100)}%)
- **MVP Signed Off:** ${mvpSignedOff}
- **High Risk Items:** ${highRiskItems}
- **Blocked Items:** ${blockedItems}
- **Overall Platform Health:** ${Math.round((completedItems/totalItems)*100)}%

---

## 🏗️ Layer Distribution & Analysis

${layerDistribution.map((layer, index) => 
  `### ${layer.emoji} Layer ${index + 1}: ${layer.name}
- **Items:** ${layer.count}
- **Completed:** ${layer.completed}/${layer.count} (${Math.round(layer.avgCompletion)}%)
- **Status:** ${layer.avgCompletion >= 90 ? '✅ Excellent' : layer.avgCompletion >= 70 ? '⚠️ Good' : '🚨 Needs Attention'}`
).join('\n\n')}

---

## 🚨 Critical Issues (High Risk)

${criticalIssues.length > 0 ? criticalIssues.map(item => 
  `### ${item.title}
- **Layer:** ${item.layer}
- **Status:** ${item.mvpStatus}
- **Description:** ${item.description}
- **Risk Level:** ${item.riskLevel}
${item.blockers.length > 0 ? `- **Blockers:** ${item.blockers.join(', ')}` : ''}
- **Progress:** ${item.completionPercentage}%`
).join('\n\n') : 'No critical issues identified. ✅'}

---

## 🔒 Blocked Items Analysis

${blockedItemsList.length > 0 ? blockedItemsList.map(item => 
  `### ${item.title}
- **Layer:** ${item.layer}
- **Blockers:** ${item.blockers.join(', ')}
- **Impact:** ${item.riskLevel} Risk
- **Current Progress:** ${item.completionPercentage}%`
).join('\n\n') : 'No blocked items. ✅'}

---

## 📋 Next Steps & Recommendations

${criticalIssues.length > 0 || blockedItemsList.length > 0 ? `
### Immediate Actions Required:
${criticalIssues.length > 0 ? `- Address ${criticalIssues.length} high-risk items` : ''}
${blockedItemsList.length > 0 ? `- Resolve ${blockedItemsList.length} blocked items` : ''}

### Priority Focus Areas:
${layerDistribution.filter(l => l.avgCompletion < 70).map(l => `- ${l.name} (${Math.round(l.avgCompletion)}% complete)`).join('\n')}
` : `
### System Health: Excellent ✅
- All layers performing well
- No critical issues identified
- Continue current development pace
`}

---

**Report Generated by:** Comprehensive 11L Project Tracker  
**Last Updated:** ${lastUpdated.toISOString()}  
**Platform Version:** Mundo Tango v1.0.0`.trim();

      console.log('📄 Report content generated:', { 
        contentLength: reportContent.length,
        criticalIssues: criticalIssues.length,
        blockedItems: blockedItemsList.length
      });
      
      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `11L-project-report-${dateString}.md`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      console.log('📁 Triggering report download...');
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('✅ Report generated successfully');
      }, 100);
      
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      alert('Report generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get tasks by layer
  const getTasksByLayer = (layerId: string) => {
    return COMPREHENSIVE_PLATFORM_INVENTORY.filter(item => item.layer === layerId);
  };

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
          <p className="text-gray-600 mt-1">Hierarchical Platform Structure with Layer Distribution & Health Analytics</p>
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
            disabled={isLoading}
          >
            Overview
          </Button>
          <Button 
            variant={view === 'detailed' ? 'default' : 'outline'}
            onClick={() => setView('detailed')}
            disabled={isLoading}
          >
            Detailed View
          </Button>
          <Button 
            variant={view === 'analytics' ? 'default' : 'outline'}
            onClick={() => setView('analytics')}
            disabled={isLoading}
          >
            Analytics
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportData}
            disabled={isLoading}
            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Database className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Exporting...' : 'Export Data'}
          </Button>
          <Button 
            variant="outline"
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <FileText className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate Report'}
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
          {/* Mundo Tango Platform Structure - Enhanced Jira Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Mundo Tango Platform Structure
              </CardTitle>
              <div className="text-sm text-gray-600 mt-2">
                Interactive project cards with detailed metadata tracking and Jira-style organization
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Epic: Mundo Tango Platform */}
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Globe className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-blue-900">Mundo Tango Platform</h2>
                        <p className="text-sm text-blue-700">Global tango community platform with comprehensive social features</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white text-lg px-3 py-1">82%</Badge>
                      <div className="text-sm text-blue-700 font-medium mt-1">Epic Progress</div>
                    </div>
                  </div>
                  
                  {/* Stories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Story: App Features */}
                    <Card 
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-green-500 bg-white"
                      onClick={() => {
                        const mockAppItem = {
                          id: 'app-features',
                          title: 'Mundo Tango App Features',
                          description: 'Core social media functionality including posts, events, communities, and user management',
                          layer: 'Frontend',
                          type: 'Feature Set',
                          mvpStatus: 'Done',
                          completionPercentage: 89,
                          riskLevel: 'Low',
                          actualHours: 340,
                          estimatedHours: 380,
                          reviewStatus: 'Approved',
                          blockers: [],
                          dependencies: ['Authentication', 'Database Schema'],
                          tags: ['Social Media', 'User Experience', 'Real-time', 'Mobile Ready']
                        };
                        handleCardClick(mockAppItem);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-green-900">Mundo Tango App</div>
                              <div className="text-xs text-gray-500 mt-1">Core Features</div>
                            </div>
                            <Badge className="bg-green-600 text-white text-xs">DONE</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Completion</span>
                              <span className="font-medium">89%</span>
                            </div>
                            <Progress value={89} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>340h / 380h</span>
                            <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                              Low Risk
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600">6 Components Active</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Story: Admin Center */}
                    <Card 
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500 bg-white"
                      onClick={() => {
                        const mockAdminItem = {
                          id: 'admin-center',
                          title: 'Admin Center Management',
                          description: 'Comprehensive administrative interface with user management, analytics, and system monitoring',
                          layer: 'Backend',
                          type: 'Admin Interface',
                          mvpStatus: 'In Progress',
                          completionPercentage: 76,
                          riskLevel: 'Medium',
                          actualHours: 285,
                          estimatedHours: 375,
                          reviewStatus: 'In Review',
                          blockers: ['GDPR Compliance Review'],
                          dependencies: ['User Roles', 'Analytics API'],
                          tags: ['Administration', 'Analytics', 'Monitoring', 'Security']
                        };
                        handleCardClick(mockAdminItem);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-blue-900">Admin Center</div>
                              <div className="text-xs text-gray-500 mt-1">Management Portal</div>
                            </div>
                            <Badge className="bg-blue-600 text-white text-xs">IN PROGRESS</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Completion</span>
                              <span className="font-medium">76%</span>
                            </div>
                            <Progress value={76} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>285h / 375h</span>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs">
                              Medium Risk
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>1 blocker</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Story: 11L Project Tracker */}
                    <Card 
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-purple-500 bg-white"
                      onClick={() => {
                        const mockTrackerItem = {
                          id: '11l-tracker',
                          title: '11L Project Tracker System',
                          description: 'Advanced project tracking with dual-view interface and comprehensive metadata analysis',
                          layer: 'Intelligence',
                          type: 'Tracking System',
                          mvpStatus: 'In Progress',
                          completionPercentage: 75,
                          riskLevel: 'Low',
                          actualHours: 165,
                          estimatedHours: 220,
                          reviewStatus: 'Active Development',
                          blockers: [],
                          dependencies: ['Admin Center', 'Analytics Integration'],
                          tags: ['Project Management', 'Analytics', 'Visualization', 'Jira-Style']
                        };
                        handleCardClick(mockTrackerItem);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-purple-900">11L Project Tracker</div>
                              <div className="text-xs text-gray-500 mt-1">Analytics System</div>
                            </div>
                            <Badge className="bg-purple-600 text-white text-xs">IN PROGRESS</Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Completion</span>
                              <span className="font-medium">75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>165h / 220h</span>
                            <Badge variant="outline" className="bg-green-100 text-green-700 text-xs">
                              Low Risk
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-purple-600">Active Development</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>

                {/* Sub-Components Section */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 
                    className="text-lg font-semibold mb-4 text-gray-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                    onClick={() => {
                      const mockPlatformComponents = {
                        id: 'platform-components',
                        title: 'Platform Components',
                        description: 'Individual platform components and modules with detailed hierarchical breakdown',
                        layer: 'Frontend',
                        type: 'Component Suite',
                        mvpStatus: 'In Progress',
                        completionPercentage: 89,
                        riskLevel: 'Low',
                        actualHours: 890,
                        estimatedHours: 1000,
                        reviewStatus: 'Active Development',
                        blockers: [],
                        dependencies: ['Core Platform'],
                        tags: ['Components', 'Platform', 'Architecture']
                      };
                      handleCardClick(mockPlatformComponents);
                    }}
                  >
                    <BarChart3 className="h-5 w-5" />
                    Platform Components
                    <span className="text-sm text-gray-500 font-normal">(Click for breakdown)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    
                    {[
                      { name: 'Moments & Feed', completion: 95, color: 'purple', icon: Eye },
                      { name: 'Events & RSVP', completion: 92, color: 'orange', icon: CalendarIcon },
                      { name: 'Community & Groups', completion: 87, color: 'teal', icon: Users },
                      { name: 'Friends & Social', completion: 85, color: 'pink', icon: Users },
                      { name: 'Auth & Onboarding', completion: 93, color: 'red', icon: Shield },
                      { name: 'Media & Storage', completion: 91, color: 'indigo', icon: Database },
                      { name: 'User Management', completion: 89, color: 'gray', icon: Users },
                      { name: 'Analytics Dashboard', completion: 73, color: 'cyan', icon: BarChart3 }
                    ].map((component, index) => {
                      const Icon = component.icon;
                      return (
                        <Card 
                          key={index}
                          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-l-2"
                          style={{ borderLeftColor: 
                            component.color === 'purple' ? '#8B5CF6' :
                            component.color === 'orange' ? '#F97316' :
                            component.color === 'teal' ? '#14B8A6' :
                            component.color === 'pink' ? '#EC4899' :
                            component.color === 'red' ? '#EF4444' :
                            component.color === 'indigo' ? '#6366F1' :
                            component.color === 'gray' ? '#6B7280' :
                            component.color === 'cyan' ? '#06B6D4' : '#6B7280'
                          }}
                          onClick={() => {
                            const mockComponentItem = {
                              id: `component-${index}`,
                              title: component.name,
                              description: `Platform component for ${component.name.toLowerCase()} functionality`,
                              layer: 'Frontend',
                              type: 'Component',
                              mvpStatus: component.completion >= 90 ? 'Done' : 'In Progress',
                              completionPercentage: component.completion,
                              riskLevel: component.completion >= 90 ? 'Low' : component.completion >= 80 ? 'Medium' : 'High',
                              actualHours: Math.floor(component.completion * 2.5),
                              estimatedHours: 250,
                              reviewStatus: component.completion >= 90 ? 'Approved' : 'In Review',
                              blockers: component.completion < 80 ? ['Performance Optimization'] : [],
                              dependencies: ['Core Platform'],
                              tags: ['Component', 'Feature', component.color]
                            };
                            handleCardClick(mockComponentItem);
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" style={{ color: 
                                  component.color === 'purple' ? '#8B5CF6' :
                                  component.color === 'orange' ? '#F97316' :
                                  component.color === 'teal' ? '#14B8A6' :
                                  component.color === 'pink' ? '#EC4899' :
                                  component.color === 'red' ? '#EF4444' :
                                  component.color === 'indigo' ? '#6366F1' :
                                  component.color === 'gray' ? '#6B7280' :
                                  component.color === 'cyan' ? '#06B6D4' : '#6B7280'
                                }} />
                                <span className="text-xs font-medium truncate">{component.name}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Progress</span>
                                  <span className="font-medium">{component.completion}%</span>
                                </div>
                                <Progress value={component.completion} className="h-1" />
                              </div>
                              <Badge 
                                className={`text-xs ${
                                  component.completion >= 90 ? 'bg-green-600' : 
                                  component.completion >= 80 ? 'bg-blue-600' : 'bg-yellow-600'
                                } text-white`}
                              >
                                {component.completion >= 90 ? 'DONE' : 'IN PROGRESS'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layer Distribution & Health - Original Hierarchical Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Layer Distribution & Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getLayerStats().map((layer, index) => {
                  const layerInfo = getLayerInfo(layer.name);
                  const Icon = layerInfo.icon;
                  
                  return (
                    <div key={layer.name} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${layerInfo.color} bg-opacity-20`}>
                            <Icon className={`h-4 w-4 ${layerInfo.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="text-sm font-medium">{layer.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {layer.completedItems}/{layer.totalItems}
                          </Badge>
                          <div className="text-lg font-bold">{layer.avgCompletion}%</div>
                        </div>
                      </div>
                      <Progress value={layer.avgCompletion} className="h-2" />
                      <div className="mt-2 text-xs text-gray-600">
                        {layer.items.map((item: any) => item.title).join(', ')}
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

      {/* Item Detail Modal - Jira Style */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${getLayerInfo(selectedItem.layer).color} text-white`}>
                  {selectedItem.layer}
                </Badge>
                <Badge variant="outline">{selectedItem.type}</Badge>
                <Badge className={`${getStatusColor(selectedItem.mvpStatus)} text-white`}>
                  {selectedItem.mvpStatus}
                </Badge>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                  <p className="text-gray-600 mt-2">{selectedItem.description}</p>
                </div>

                {/* Enhanced Progress Section with Editable Fields */}
                <div className="space-y-6">
                  
                  {/* Editable Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Project Metrics & Team Assignment</h3>
                    <div className="flex gap-2">
                      {!isEditMode ? (
                        <Button
                          onClick={() => setIsEditMode(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleSaveEdit}
                            size="sm"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            onClick={() => setIsEditMode(false)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Individual Completion */}
                    <div className="bg-blue-50 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-blue-800 mb-2">Individual Completion</div>
                      {isEditMode ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.completionPercentage || 0}
                          onChange={(e) => handleFieldEdit('completionPercentage', parseInt(e.target.value))}
                          className="w-full text-2xl font-bold bg-white border rounded px-2 py-1"
                        />
                      ) : (
                        <div className="text-2xl font-bold text-blue-900">{selectedItem.completionPercentage}%</div>
                      )}
                      <Progress value={selectedItem.completionPercentage} className="mt-2" />
                    </div>

                    {/* Rollup Completion */}
                    <div className="bg-purple-50 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-purple-800 mb-2">Rollup Completion</div>
                      <div className="text-2xl font-bold text-purple-900">{selectedItem.rollupCompletion}%</div>
                      <Progress value={selectedItem.rollupCompletion} className="mt-2" />
                      <div className="text-xs text-purple-600 mt-1">
                        Includes {selectedItem.subtasks?.length || 0} subtasks
                      </div>
                    </div>
                    
                    {/* Hours Progress */}
                    <div className="bg-green-50 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-green-800 mb-2">Hours Progress</div>
                      {isEditMode ? (
                        <div className="space-y-1">
                          <input
                            type="number"
                            value={editValues.actualHours || 0}
                            onChange={(e) => handleFieldEdit('actualHours', parseInt(e.target.value))}
                            className="w-full text-lg font-bold bg-white border rounded px-2 py-1"
                            placeholder="Actual"
                          />
                          <input
                            type="number"
                            value={editValues.estimatedHours || 0}
                            onChange={(e) => handleFieldEdit('estimatedHours', parseInt(e.target.value))}
                            className="w-full text-sm bg-white border rounded px-2 py-1"
                            placeholder="Estimated"
                          />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-green-900">
                          {selectedItem.actualHours} / {selectedItem.estimatedHours}
                        </div>
                      )}
                      <Progress 
                        value={Math.min((selectedItem.actualHours / selectedItem.estimatedHours) * 100, 100)} 
                        className="mt-2" 
                      />
                    </div>
                    
                    {/* Risk Level */}
                    <div className={`p-4 rounded-lg border ${
                      selectedItem.riskLevel === 'High' ? 'bg-red-50' :
                      selectedItem.riskLevel === 'Moderate' ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <div className={`text-sm font-medium mb-2 ${
                        selectedItem.riskLevel === 'High' ? 'text-red-800' :
                        selectedItem.riskLevel === 'Moderate' ? 'text-yellow-800' : 'text-green-800'
                      }`}>
                        Risk Level
                      </div>
                      {isEditMode ? (
                        <select
                          value={editValues.riskLevel || 'Low'}
                          onChange={(e) => handleFieldEdit('riskLevel', e.target.value)}
                          className="w-full text-lg font-bold bg-white border rounded px-2 py-1"
                        >
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </select>
                      ) : (
                        <div className={`text-2xl font-bold ${
                          selectedItem.riskLevel === 'High' ? 'text-red-900' :
                          selectedItem.riskLevel === 'Moderate' ? 'text-yellow-900' : 'text-green-900'
                        }`}>
                          {selectedItem.riskLevel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Assignment & Review Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Assigned Team */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Responsible Team
                      </div>
                      {isEditMode ? (
                        <textarea
                          value={editValues.assignedTeam?.join(', ') || ''}
                          onChange={(e) => handleFieldEdit('assignedTeam', e.target.value.split(', '))}
                          className="w-full bg-white border rounded px-3 py-2"
                          placeholder="Frontend Team, Backend Team, QA Team"
                          rows={2}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.assignedTeam?.map((team: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {team}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Human Review Status */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Human Review Status
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${selectedItem.humanReviewed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="font-medium">
                            {selectedItem.humanReviewed ? 'Reviewed' : 'Pending Review'}
                          </span>
                          {isEditMode && (
                            <input
                              type="checkbox"
                              checked={editValues.humanReviewed || false}
                              onChange={(e) => handleFieldEdit('humanReviewed', e.target.checked)}
                              className="ml-auto"
                            />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Last review: {selectedItem.lastReviewDate} by {selectedItem.reviewer}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dependencies Section */}
                  {selectedItem.dependencies && selectedItem.dependencies.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-orange-800 flex items-center gap-2">
                          <Network className="h-4 w-4" />
                          Dependencies ({selectedItem.dependencyCount})
                        </div>
                        <Button
                          onClick={handleShowDependencies}
                          variant="outline"
                          size="sm"
                          className="text-orange-700 border-orange-300 hover:bg-orange-100"
                        >
                          View Dependency Map
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.dependencies.map((dep: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-orange-700 border-orange-300">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Review Status:</span>
                        <Badge variant="outline">{selectedItem.reviewStatus}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span>{selectedItem.version || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <Badge className={selectedItem.riskLevel === 'High' ? 'bg-red-600' : 
                                         selectedItem.riskLevel === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'}>
                          {selectedItem.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hierarchical Breakdown Section */}
                {hierarchicalBreakdown && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Platform Hierarchical Breakdown
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-blue-900">{hierarchicalBreakdown.description}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="text-lg font-semibold text-blue-700">
                            Overall Progress: {hierarchicalBreakdown.completion}%
                          </div>
                          <div className="flex-1 bg-blue-200 rounded-full h-3">
                            <div 
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${hierarchicalBreakdown.completion}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {renderHierarchicalBreakdown(hierarchicalBreakdown)}
                    </div>
                  </div>
                )}

                {/* Blockers Section */}
                {selectedItem.blockers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Blockers ({selectedItem.blockers.length})
                    </h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedItem.blockers.map((blocker: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-red-800">
                            <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Dependencies Section */}
                {selectedItem.dependencies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Dependencies ({selectedItem.dependencies.length})
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.dependencies.map((dep: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowItemModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      // Analytics tracking for action
                      if (typeof window !== 'undefined' && window.plausible) {
                        window.plausible('11L Item Action', {
                          props: {
                            action: 'view_details',
                            layer: selectedItem.layer,
                            title: selectedItem.title
                          }
                        });
                      }
                    }}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dependencies Detail Modal */}
      {showDependencies && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[102] p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Network className="h-5 w-5 text-orange-600" />
                Dependency Map: {selectedItem.title}
              </h2>
              <button
                onClick={() => setShowDependencies(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Dependency Overview */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2">Dependency Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Dependencies:</span> {selectedItem.dependencyCount}
                    </div>
                    <div>
                      <span className="font-medium">Critical Path Impact:</span> High
                    </div>
                  </div>
                </div>

                {/* Dependency List with Details */}
                <div className="space-y-4">
                  {selectedItem.dependencies?.map((dep: string, index: number) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{dep}</h4>
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          Blocking
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Status: Pending completion of upstream task</div>
                        <div>Impact: Direct blocking dependency - cannot proceed without this</div>
                        <div>Estimated Resolution: Based on upstream task timeline</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dependency Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Monitor upstream task completion status daily</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Identify parallel work streams to maintain velocity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Escalate to project management if delays exceed 2 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comprehensive11LProjectTracker;