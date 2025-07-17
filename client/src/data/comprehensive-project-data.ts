export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Blocked';
  completion?: number;
  mobileCompletion?: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  team?: string[];
  children?: ProjectItem[];
}

export const comprehensiveProjectData: ProjectItem[] = [
  {
    id: 'life-ceo-system',
    title: 'Life CEO System',
    description: 'AI-powered life management platform with 16 specialized agents',
    type: 'Platform',
    status: 'In Progress',
    completion: 85,
    priority: 'Critical',
    team: ['AI', 'Backend', 'Frontend'],
    children: [
      {
        id: 'agent-system',
        title: 'Agent System',
        description: '16 specialized AI agents for different life aspects',
        type: 'Section',
        status: 'In Progress',
        completion: 80,
        priority: 'Critical',
        team: ['AI', 'Backend']
      },
      {
        id: 'voice-interface',
        title: 'Voice Interface',
        description: 'Natural language processing and voice commands',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'High',
        team: ['Frontend', 'AI']
      }
    ]
  },
  {
    id: 'mundo-tango',
    title: 'Mundo Tango Platform',
    description: 'Social platform for tango dancers worldwide',
    type: 'Platform',
    status: 'In Progress',
    completion: 75,
    priority: 'High',
    team: ['Frontend', 'Backend', 'Database'],
    children: [
      {
        id: 'admin-center',
        title: 'Admin Center',
        description: 'Administrative interface with analytics and management tools',
        type: 'Section',
        status: 'Completed',
        completion: 95,
        priority: 'High',
        team: ['Frontend', 'Backend'],
        children: [
          {
            id: 'project-tracker',
            title: 'Project Tracker (The Plan)',
            description: 'Hierarchical project management system with 5-view dashboard',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend'],
            children: [
              {
                id: 'hierarchical-view',
                title: 'Hierarchical Tree View',
                description: '6-level project hierarchy visualization',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend']
              },
              {
                id: 'daily-activity-integration',
                title: 'Daily Activity Integration',
                description: 'Integrated as 5th tab within The Plan',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend']
              },
              {
                id: 'automatic-work-capture',
                title: 'Automatic Work Capture',
                description: 'System to automatically log all project activities',
                type: 'Task',
                status: 'In Progress',
                completion: 75,
                priority: 'Critical',
                team: ['Backend', 'Frontend']
              }
            ]
          },
          {
            id: 'daily-activity-view',
            title: 'Daily Activity View',
            description: 'Real-time activity tracking and visualization',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend', 'Backend']
          },
          {
            id: 'super-admin-tenant-switching',
            title: 'Super Admin Tenant Switching',
            description: 'Multi-tenant RBAC/ABAC with CASL integration',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend', 'Security']
          },
          {
            id: 'global-statistics-dashboard',
            title: 'Global Statistics Dashboard',
            description: 'Live platform metrics with tenant-specific views',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend', 'Backend']
          },
          {
            id: 'framework-30l-dashboard',
            title: '30L Framework Dashboard',
            description: 'Interactive 30-layer framework monitoring system',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          }
        ]
      },
      {
        id: 'guest-onboarding-system',
        title: 'Guest Onboarding System',
        description: 'Comprehensive guest booking and profile management',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Critical',
        team: ['Frontend', 'Backend', 'Database'],
        children: [
          {
            id: 'guest-booking-api',
            title: 'Guest Booking API',
            description: 'Complete booking request system with status management',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend']
          },
          {
            id: 'guest-profile-system',
            title: 'Guest Profile System',
            description: '8-step wizard for accommodation preferences',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'sophisticated-filtering',
            title: 'Sophisticated Filtering System',
            description: 'LinkedIn-style relationship and recommendation filters',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend', 'Backend']
          },
          {
            id: 'production-reliability',
            title: 'Production Reliability 100%',
            description: 'All 23 roles mapped with downstream systems',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend', 'Database']
          }
        ]
      },
      {
        id: 'community-features',
        title: 'Community Features',
        description: 'Social and community engagement features',
        type: 'Section',
        status: 'In Progress',
        completion: 85,
        priority: 'High',
        team: ['Frontend', 'Backend'],
        children: [
          {
            id: 'group-events-functionality',
            title: 'Group Events Functionality',
            description: 'City-based events with RSVP and host info',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend', 'Backend']
          },
          {
            id: 'enhanced-timeline-v2',
            title: 'Enhanced Timeline V2',
            description: 'Facebook-style social features and interactions',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'community-world-map',
            title: 'Community World Map',
            description: 'Interactive Leaflet map with city groups',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'five-automation-systems',
            title: 'Five Key Automation Systems',
            description: 'City/professional group assignment, geocoding, recommendations',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend']
          }
        ]
      },
      {
        id: 'host-features',
        title: 'Host Features',
        description: 'Host home management and onboarding',
        type: 'Section',
        status: 'Completed',
        completion: 95,
        priority: 'High',
        team: ['Frontend', 'Backend'],
        children: [
          {
            id: 'host-onboarding-wizard',
            title: 'Host Onboarding Wizard',
            description: '8-step Airbnb-style property listing wizard',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'google-maps-integration',
            title: 'Google Maps Integration',
            description: 'Interactive map with geocoding and address autocomplete',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'host-homes-marketplace',
            title: 'Host Homes Marketplace',
            description: 'Property listings with amenities and pricing',
            type: 'Feature',
            status: 'Completed',
            completion: 90,
            priority: 'High',
            team: ['Backend', 'Database']
          }
        ]
      },
      {
        id: 'design-system',
        title: 'Design System Updates',
        description: 'UI/UX improvements and theme changes',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Medium',
        team: ['Frontend', 'Design'],
        children: [
          {
            id: 'ocean-theme-implementation',
            title: 'Ocean Theme Color Scheme',
            description: 'Turquoise-blue gradient design system',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Medium',
            team: ['Frontend', 'Design']
          },
          {
            id: 'navigation-cleanup',
            title: 'Navigation Improvements',
            description: 'Timeline renamed to Memories, UI cleanup',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Low',
            team: ['Frontend']
          }
        ]
      }
    ]
  },
  {
    id: 'technical-infrastructure',
    title: 'Technical Infrastructure',
    description: 'Core technical systems and frameworks',
    type: 'Platform',
    status: 'In Progress',
    completion: 90,
    priority: 'Critical',
    team: ['DevOps', 'Backend', 'Database'],
    children: [
      {
        id: 'database-security',
        title: 'Database Security',
        description: 'Row-level security, audit logging, health monitoring',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Critical',
        team: ['Database', 'Security'],
        children: [
          {
            id: 'row-level-security',
            title: 'Row Level Security Implementation',
            description: '40 tables with RLS enabled and comprehensive policies',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Database', 'Security']
          },
          {
            id: 'audit-logging-system',
            title: 'Audit Logging System',
            description: '7 critical tables monitored with automatic change tracking',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Database']
          },
          {
            id: 'health-check-functions',
            title: 'Health Check Functions',
            description: 'quick_health_check() and check_database_health() monitoring',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Database']
          }
        ]
      },
      {
        id: 'performance-optimization',
        title: 'Performance Optimization',
        description: 'Comprehensive performance improvements using 23L framework',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Critical',
        team: ['Frontend', 'Backend', 'Database'],
        children: [
          {
            id: 'cache-fix',
            title: 'Critical Cache Issue Fix',
            description: 'Removed aggressive forceCacheClear() causing 2-3s delays',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Frontend']
          },
          {
            id: 'server-compression',
            title: 'Server-Side Compression',
            description: '60-70% reduction in response sizes',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Backend']
          },
          {
            id: 'database-query-optimization',
            title: 'Database Query Optimization',
            description: 'Comprehensive indexes for frequent queries',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Database']
          },
          {
            id: 'react-performance-utilities',
            title: 'React Performance Utilities',
            description: 'withPerformance HOC, useDebounce, useThrottle, useVirtualScroll',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Medium',
            team: ['Frontend']
          }
        ]
      },
      {
        id: 'api-infrastructure',
        title: 'API Infrastructure',
        description: 'RESTful APIs and real-time websocket connections',
        type: 'Section',
        status: 'In Progress',
        completion: 85,
        priority: 'High',
        team: ['Backend']
      },
      {
        id: '30l-framework-implementation',
        title: '30L Framework Implementation',
        description: 'Comprehensive 30-layer production validation system',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Critical',
        team: ['Architecture', 'Frontend', 'Backend'],
        children: [
          {
            id: '30l-evolution',
            title: 'Framework Evolution from 23L to 30L',
            description: 'Added 7 new layers for enterprise scalability',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Architecture']
          },
          {
            id: 'layer-documentation',
            title: 'Complete Layer Documentation',
            description: 'Detailed explanations for all 30 layers with metrics',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Documentation']
          },
          {
            id: 'framework-dashboard-enhancement',
            title: 'Framework Dashboard Enhancement',
            description: '4-tab system with Overview, Progress, Components, Issues',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          }
        ]
      },
      {
        id: 'authentication-fixes',
        title: 'Authentication & Session Management',
        description: 'Fixed authentication issues across the platform',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Critical',
        team: ['Backend', 'Security'],
        children: [
          {
            id: 'unified-auth-helper',
            title: 'Unified Authentication Helper',
            description: 'Created authHelper.ts to standardize user ID extraction',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend']
          },
          {
            id: 'session-based-auth',
            title: 'Session-Based Authentication',
            description: 'Fixed mismatch between JWT and session cookies',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend']
          },
          {
            id: 'replit-oauth-integration',
            title: 'Replit OAuth Integration',
            description: 'Proper session cookie handling with credentials: include',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend']
          }
        ]
      }
    ]
  }
];