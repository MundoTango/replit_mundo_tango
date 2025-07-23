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
          },
          {
            id: 'framework-40x20s',
            title: '40x20s Framework Expert Worker System',
            description: 'Expert Worker System that systematically reviews, builds, tests, and fixes platform work across 40 layers × 20 phases = 800 quality checkpoints',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Frontend', 'Backend', 'QA', 'DevOps'],
            children: [
              {
                id: 'framework-dashboard',
                title: 'Framework Dashboard UI',
                description: 'Interactive dashboard with 3 review levels (Quick, Standard, Comprehensive)',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend']
              },
              {
                id: 'backend-service',
                title: 'Backend Service & API',
                description: 'framework40x20sService with automated checks and team mappings',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Backend']
              },
              {
                id: 'the-plan-integration',
                title: 'The Plan Integration',
                description: 'Seamless integration with project tracking, automatic progress updates',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Critical',
                team: ['Backend', 'Frontend']
              },
              {
                id: 'performance-improvements',
                title: 'Performance Optimization',
                description: 'Redis caching on posts/feed & events/sidebar, React.memo optimizations - achieved 40-50% speed improvement',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Backend', 'Frontend']
              }
            ]
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
          },
          {
            id: 'search-discovery-system',
            title: 'Search & Discovery System',
            description: 'Universal search across users, posts, events, groups, memories',
            type: 'Feature',
            status: 'In Progress',
            completion: 25,
            priority: 'Critical',
            team: ['Frontend', 'Backend'],
            children: [
              {
                id: 'phase-1-basic-search',
                title: 'Phase 1: Basic Search Foundation',
                description: 'Core search API and routes with memory search working',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'Critical',
                team: ['Backend'],
                children: [
                  {
                    id: 'search-route-mounting-fix',
                    title: 'Search Route Mounting Fix',
                    description: 'Fixed Express router middleware import/export',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    team: ['Backend']
                  },
                  {
                    id: 'database-table-fix',
                    title: 'Database Table Correction',
                    description: 'Switched from empty posts table to memories table',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    team: ['Backend']
                  },
                  {
                    id: 'schema-mismatch-fix',
                    title: 'Schema Mismatch Resolution',
                    description: 'Fixed isPrivate field and emotion_visibility checks',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    team: ['Backend']
                  }
                ]
              },
              {
                id: 'phase-2-multi-content',
                title: 'Phase 2: Multi-Content Type Search',
                description: 'Extend search to events, groups, housing, recommendations',
                type: 'Project',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Backend']
              },
              {
                id: 'phase-3-intelligence',
                title: 'Phase 3: Search Intelligence',
                description: 'Fuzzy matching, relevance scoring, trending',
                type: 'Project',
                status: 'Planned',
                completion: 0,
                priority: 'Medium',
                team: ['Backend']
              },
              {
                id: 'phase-4-filters',
                title: 'Phase 4: Advanced Filters',
                description: 'Location, date, category, price filtering',
                type: 'Project',
                status: 'Planned',
                completion: 0,
                priority: 'Medium',
                team: ['Backend', 'Frontend']
              },
              {
                id: 'phase-5-ui-ux',
                title: 'Phase 5: Search UI/UX',
                description: 'Autocomplete, suggestions, history, mobile',
                type: 'Project',
                status: 'Planned',
                completion: 0,
                priority: 'Medium',
                team: ['Frontend']
              },
              {
                id: 'phase-6-analytics',
                title: 'Phase 6: Analytics & Optimization',
                description: 'Search metrics, A/B testing, performance',
                type: 'Project',
                status: 'Planned',
                completion: 0,
                priority: 'Low',
                team: ['Backend', 'Frontend']
              },
              {
                id: 'search-ui-components',
                title: 'Search UI Components',
                description: 'BeautifulSearch interface with autocomplete and filters',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend']
              },
              {
                id: 'trending-searches',
                title: 'Trending Searches Feature',
                description: 'Track and display popular search queries',
                type: 'Task',
                status: 'Blocked',
                completion: 40,
                priority: 'Medium',
                team: ['Backend', 'Database']
              },
              {
                id: 'search-performance-optimization',
                title: 'Search Performance Optimization',
                description: 'Query optimization and caching for search results',
                type: 'Task',
                status: 'In Progress',
                completion: 60,
                priority: 'High',
                team: ['Backend', 'Database']
              }
            ]
          },
          {
            id: 'beautiful-post-creator',
            title: 'Beautiful Post Creator UI Enhancement',
            description: 'Glassmorphic post creator with gradient animations and location features',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend', 'Design'],
            children: [
              {
                id: 'glassmorphic-design',
                title: 'Glassmorphic Design Implementation',
                description: 'Beautiful UI with backdrop blur effects and gradient animations',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend', 'Design']
              },
              {
                id: 'location-geolocation',
                title: 'Native Geolocation with OpenStreetMap',
                description: 'Browser geolocation API with Nominatim fallback',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend']
              },
              {
                id: 'enhanced-visual-hierarchy',
                title: 'Enhanced Visual Hierarchy',
                description: 'Improved spacing, typography, and interactive elements',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                team: ['Design']
              }
            ]
          },
          {
            id: 'micro-interactions',
            title: 'Micro-Interactions and Particle Effects',
            description: 'Platform-wide UI/UX enhancement with particle effects, ripples, and confetti',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Medium',
            team: ['Frontend', 'UX'],
            children: [
              {
                id: 'particle-effects-system',
                title: 'Particle Effects System',
                description: 'Typing particles, success confetti, and animated feedback',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                team: ['Frontend']
              },
              {
                id: 'ripple-effects',
                title: 'Ripple Effects on Buttons',
                description: 'Material Design inspired ripple animations',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                team: ['Frontend']
              },
              {
                id: 'magnetic-buttons',
                title: 'Magnetic Button Effects',
                description: 'Cursor-following magnetic interaction on hover',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Low',
                team: ['Frontend']
              },
              {
                id: 'global-animation-library',
                title: 'Global CSS Animation Library',
                description: 'Comprehensive animation classes for platform-wide use',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend', 'Design']
              }
            ]
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
          },
          {
            id: 'host-dashboard',
            title: 'Host Dashboard',
            description: 'Comprehensive dashboard for hosts to manage properties and bookings',
            type: 'Feature',
            status: 'In Progress',
            completion: 25,
            priority: 'Critical',
            team: ['Frontend', 'Backend'],
            children: [
              {
                id: 'property-management-interface',
                title: 'Property Management Interface',
                description: 'CRUD operations for host properties with real-time updates',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'Critical',
                team: ['Frontend']
              },
              {
                id: 'booking-requests-management',
                title: 'Booking Requests Management',
                description: 'Interface to review, approve, and manage guest bookings',
                type: 'Task',
                status: 'In Progress',
                completion: 40,
                priority: 'Critical',
                team: ['Frontend', 'Backend']
              },
              {
                id: 'host-analytics',
                title: 'Host Analytics Dashboard',
                description: 'Occupancy rates, revenue tracking, guest demographics',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Frontend', 'Backend']
              },
              {
                id: 'calendar-availability-manager',
                title: 'Calendar & Availability Manager',
                description: 'Interactive calendar for managing property availability',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Frontend']
              }
            ]
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
          },
          {
            id: 'memories-page-design-audit',
            title: 'Memories Page Production Design Audit',
            description: 'Comprehensive 35L framework design audit ensuring Memories page serves as template for site-wide deployment',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Frontend', 'Design', 'UX'],
            children: [
              {
                id: 'loading-states-implementation',
                title: 'Loading States & Skeleton Screens',
                description: 'Beautiful skeleton loading states for posts and events',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend']
              },
              {
                id: 'design-system-documentation',
                title: 'Design System Documentation Update',
                description: 'Added micro-interactions and loading states to MUNDO_TANGO_DESIGN_SYSTEM.md',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Design', 'Documentation']
              },
              {
                id: 'css-animation-library',
                title: 'CSS Animation Library Completion',
                description: 'Added missing keyframes and animation classes',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                team: ['Frontend']
              },
              {
                id: 'upcoming-events-filtering',
                title: 'User-Specific Event Filtering',
                description: 'Fixed EventsBoard to show personalized upcoming events',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                team: ['Frontend', 'Backend']
              }
            ]
          }
        ]
      },
      {
        id: 'trust-safety-features',
        title: 'Trust & Safety Features',
        description: 'Comprehensive safety and moderation systems',
        type: 'Section',
        status: 'In Progress',
        completion: 75,
        priority: 'Critical',
        team: ['Backend', 'Frontend', 'Security'],
        children: [
          {
            id: 'enhanced-reporting-system',
            title: 'Enhanced Reporting System',
            description: 'Comprehensive reporting with admin moderation queue',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'Critical',
            team: ['Backend', 'Frontend']
          },
          {
            id: 'content-moderation-ai',
            title: 'AI Content Moderation',
            description: 'Automatic detection of inappropriate content',
            type: 'Feature',
            status: 'Planned',
            completion: 0,
            priority: 'High',
            team: ['AI', 'Backend']
          },
          {
            id: 'user-verification-system',
            title: 'User Verification System',
            description: 'Multi-level verification for hosts and guests',
            type: 'Feature',
            status: 'In Progress',
            completion: 40,
            priority: 'High',
            team: ['Backend', 'Security']
          },
          {
            id: 'emergency-response-system',
            title: 'Emergency Response System',
            description: '24/7 emergency contact and response protocol',
            type: 'Feature',
            status: 'Planned',
            completion: 0,
            priority: 'Critical',
            team: ['Backend', 'Operations']
          }
        ]
      },
      {
        id: 'city-auto-creation-system',
        title: 'City Auto-Creation System',
        description: 'Automatic city group creation from 3 trigger points',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'High',
        team: ['Backend', 'Database'],
        children: [
          {
            id: 'city-normalization-service',
            title: 'City Normalization Service',
            description: 'Handle city name variations and abbreviations',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Backend'],
            children: [
              {
                id: 'abbreviation-mapping',
                title: 'Abbreviation Mapping',
                description: 'Map common abbreviations (NYC → New York City)',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Backend']
              },
              {
                id: 'geocoding-integration',
                title: 'Geocoding Integration',
                description: 'OpenStreetMap Nominatim API for coordinates',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Backend']
              }
            ]
          },
          {
            id: 'trigger-implementation',
            title: 'Trigger Implementation',
            description: '3 triggers: registration, recommendation, event creation',
            type: 'Feature',
            status: 'Planned',
            completion: 0,
            priority: 'Critical',
            team: ['Backend'],
            children: [
              {
                id: 'registration-trigger',
                title: 'User Registration Trigger',
                description: 'Auto-create city group when user registers',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'Critical',
                team: ['Backend']
              },
              {
                id: 'recommendation-trigger',
                title: 'Recommendation Creation Trigger',
                description: 'Detect new cities in recommendations',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Backend']
              },
              {
                id: 'event-trigger',
                title: 'Event Creation Trigger',
                description: 'Create groups for new event locations',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Backend']
              }
            ]
          },
          {
            id: 'admin-assignment-logic',
            title: 'Admin Assignment Logic',
            description: 'First 5 users become city admins',
            type: 'Feature',
            status: 'Planned',
            completion: 0,
            priority: 'High',
            team: ['Backend']
          },
          {
            id: 'city-group-merger-tool',
            title: 'City Group Merger Tool',
            description: 'UI to merge duplicate city groups',
            type: 'Feature',
            status: 'Planned',
            completion: 0,
            priority: 'Medium',
            team: ['Frontend', 'Backend']
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
  },
  {
    id: 'infrastructure-optimization',
    title: 'Infrastructure & Technical Debt',
    description: 'Critical infrastructure improvements and technical debt resolution based on CTO analysis',
    type: 'Platform',
    status: 'In Progress',
    completion: 15,
    priority: 'Critical',
    team: ['Backend', 'DevOps', 'Frontend'],
    children: [
      {
        id: 'caching-layer',
        title: 'Redis Caching Implementation',
        description: 'Implement Redis caching layer for improved performance and reduced database load',
        type: 'Section',
        status: 'Planned',
        completion: 0,
        priority: 'Critical',
        team: ['Backend', 'DevOps'],
        children: [
          {
            id: 'redis-setup',
            title: 'Redis Server Setup',
            description: 'Install and configure Redis server with persistence and clustering',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Critical',
            team: ['DevOps']
          },
          {
            id: 'cache-strategy',
            title: 'Cache Strategy Implementation',
            description: 'Implement caching for posts, user data, and frequently accessed content',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Critical',
            team: ['Backend']
          }
        ]
      },
      {
        id: 'error-tracking',
        title: 'Error Tracking & Monitoring',
        description: 'Implement Sentry for error tracking and performance monitoring',
        type: 'Section',
        status: 'Planned',
        completion: 0,
        priority: 'Critical',
        team: ['Backend', 'Frontend'],
        children: [
          {
            id: 'sentry-integration',
            title: 'Sentry Integration',
            description: 'Integrate Sentry for both frontend and backend error tracking',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Critical',
            team: ['Backend', 'Frontend']
          },
          {
            id: 'apm-tools',
            title: 'APM Tools Setup',
            description: 'Set up DataDog or New Relic for application performance monitoring',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'High',
            team: ['DevOps']
          }
        ]
      },
      {
        id: 'api-documentation',
        title: 'API Documentation & Standards',
        description: 'Create comprehensive OpenAPI 3.0 documentation for all endpoints',
        type: 'Section',
        status: 'In Progress',
        completion: 20,
        priority: 'High',
        team: ['Backend'],
        children: [
          {
            id: 'openapi-spec',
            title: 'OpenAPI 3.0 Specification',
            description: 'Document all API endpoints with request/response schemas',
            type: 'Task',
            status: 'In Progress',
            completion: 20,
            priority: 'High',
            team: ['Backend']
          },
          {
            id: 'api-versioning',
            title: 'API Versioning Strategy',
            description: 'Implement versioning for API endpoints (v1, v2)',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Medium',
            team: ['Backend']
          }
        ]
      },
      {
        id: 'testing-suite',
        title: 'Comprehensive Testing Suite',
        description: 'Achieve >80% test coverage with unit, integration, and E2E tests',
        type: 'Section',
        status: 'In Progress',
        completion: 25,
        priority: 'High',
        team: ['Frontend', 'Backend', 'QA'],
        children: [
          {
            id: 'unit-tests',
            title: 'Unit Test Coverage',
            description: 'Write unit tests for all critical components and functions',
            type: 'Task',
            status: 'In Progress',
            completion: 35,
            priority: 'High',
            team: ['Frontend', 'Backend']
          },
          {
            id: 'e2e-tests',
            title: 'E2E Tests with Playwright',
            description: 'Implement end-to-end tests for critical user flows',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'High',
            team: ['QA']
          }
        ]
      },
      {
        id: 'cloud-migration',
        title: 'Cloud Migration Strategy',
        description: 'Plan and execute migration from Replit to AWS/GCP for scale',
        type: 'Section',
        status: 'Planned',
        completion: 5,
        priority: 'Medium',
        team: ['DevOps', 'Backend'],
        children: [
          {
            id: 'containerization',
            title: 'Docker Containerization',
            description: 'Containerize application components for cloud deployment',
            type: 'Task',
            status: 'Planned',
            completion: 10,
            priority: 'Medium',
            team: ['DevOps']
          },
          {
            id: 'kubernetes-setup',
            title: 'Kubernetes Configuration',
            description: 'Set up Kubernetes orchestration for scalable deployment',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Medium',
            team: ['DevOps']
          },
          {
            id: 'multi-region',
            title: 'Multi-Region Deployment',
            description: 'Implement multi-region deployment for global availability',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Low',
            team: ['DevOps']
          }
        ]
      },
      {
        id: 'performance-optimization',
        title: 'Frontend Performance',
        description: 'Optimize frontend bundle size and loading performance',
        type: 'Section',
        status: 'In Progress',
        completion: 30,
        priority: 'High',
        team: ['Frontend'],
        children: [
          {
            id: 'code-splitting',
            title: 'Code Splitting Strategy',
            description: 'Implement dynamic imports and route-based code splitting',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'react-server-components',
            title: 'React Server Components',
            description: 'Implement React Server Components for improved performance',
            type: 'Task',
            status: 'Planned',
            completion: 0,
            priority: 'Medium',
            team: ['Frontend']
          },
          {
            id: 'bundle-optimization',
            title: 'Bundle Size Optimization',
            description: 'Reduce bundle size from 2.3MB to under 1.5MB',
            type: 'Task',
            status: 'In Progress',
            completion: 40,
            priority: 'High',
            team: ['Frontend']
          }
        ]
      },
      {
        id: 'security-compliance',
        title: 'Security & Compliance Enhancement',
        description: 'Enterprise-grade security and compliance implementation',
        type: 'Section',
        status: 'In Progress',
        completion: 35,
        priority: 'Critical',
        team: ['Security', 'Backend', 'Compliance'],
        children: [
          {
            id: 'soc2-type2-compliance',
            title: 'SOC 2 Type II Compliance',
            description: 'Achieve SOC 2 Type II certification - currently at 70% readiness',
            type: 'Feature',
            status: 'In Progress',
            completion: 70,
            priority: 'Critical',
            team: ['Security', 'Compliance'],
            children: [
              {
                id: 'access-controls',
                title: 'Access Control Policies',
                description: 'Implement comprehensive access control and authentication policies',
                type: 'Task',
                status: 'In Progress',
                completion: 80,
                priority: 'Critical',
                team: ['Security']
              },
              {
                id: 'data-encryption',
                title: 'Data Encryption at Rest',
                description: 'Implement encryption for all sensitive data at rest',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'Critical',
                team: ['Security', 'Backend']
              },
              {
                id: 'audit-trail-enhancement',
                title: 'Comprehensive Audit Trail',
                description: 'Enhance audit logging to cover all critical operations',
                type: 'Task',
                status: 'In Progress',
                completion: 60,
                priority: 'High',
                team: ['Backend', 'Security']
              }
            ]
          },
          {
            id: 'enterprise-data-handling',
            title: 'Enterprise Data Handling',
            description: 'Improve data handling to meet enterprise standards',
            type: 'Feature',
            status: 'In Progress',
            completion: 45,
            priority: 'Critical',
            team: ['Backend', 'Security'],
            children: [
              {
                id: 'data-classification',
                title: 'Data Classification System',
                description: 'Implement data classification for PII and sensitive information',
                type: 'Task',
                status: 'In Progress',
                completion: 50,
                priority: 'Critical',
                team: ['Security']
              },
              {
                id: 'data-retention-policies',
                title: 'Data Retention Policies',
                description: 'Implement automated data retention and deletion policies',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Backend', 'Compliance']
              },
              {
                id: 'gdpr-compliance-enhancement',
                title: 'GDPR Compliance Enhancement',
                description: 'Enhance GDPR compliance features including data export and deletion',
                type: 'Task',
                status: 'In Progress',
                completion: 65,
                priority: 'High',
                team: ['Backend', 'Compliance']
              }
            ]
          },
          {
            id: 'security-monitoring',
            title: 'Real-time Security Monitoring',
            description: 'Implement real-time security threat detection and monitoring',
            type: 'Feature',
            status: 'Planned',
            completion: 0,
            priority: 'High',
            team: ['Security', 'DevOps'],
            children: [
              {
                id: 'intrusion-detection',
                title: 'Intrusion Detection System',
                description: 'Deploy IDS/IPS for real-time threat detection',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'High',
                team: ['Security', 'DevOps']
              },
              {
                id: 'security-dashboard',
                title: 'Security Operations Dashboard',
                description: 'Build comprehensive security monitoring dashboard',
                type: 'Task',
                status: 'Planned',
                completion: 0,
                priority: 'Medium',
                team: ['Frontend', 'Security']
              }
            ]
          }
        ]
      }
    ]
  }
];

// Function to count all items recursively
export function countAllProjects(items: ProjectItem[] = comprehensiveProjectData): number {
  let count = 0;
  
  const countRecursive = (items: ProjectItem[]) => {
    items.forEach(item => {
      count++;
      if (item.children) {
        countRecursive(item.children);
      }
    });
  };
  
  countRecursive(items);
  return count;
}

// Function to get all features (type: 'Feature') from the project data
export function getAllFeatures(items: ProjectItem[] = comprehensiveProjectData): ProjectItem[] {
  const features: ProjectItem[] = [];
  
  const findFeatures = (items: ProjectItem[]) => {
    items.forEach(item => {
      if (item.type === 'Feature') {
        features.push(item);
      }
      if (item.children) {
        findFeatures(item.children);
      }
    });
  };
  
  findFeatures(items);
  return features;
}

// Get all unique teams from the project data
export const getAllTeams: string[] = (() => {
  const teams = new Set<string>();
  teams.add('all'); // Add 'all' option
  
  const extractTeams = (items: ProjectItem[]) => {
    items.forEach(item => {
      if (item.team) {
        item.team.forEach(team => teams.add(team));
      }
      if (item.children) {
        extractTeams(item.children);
      }
    });
  };
  
  extractTeams(comprehensiveProjectData);
  return Array.from(teams);
})();

// Get team statistics for Teams tab
export function getTeamStatistics() {
  const teamStats = new Map<string, {
    projects: ProjectItem[];
    completedCount: number;
    inProgressCount: number;
    totalCompletion: number;
  }>();
  
  const processItems = (items: ProjectItem[]) => {
    items.forEach(item => {
      if (item.team) {
        item.team.forEach(teamName => {
          if (!teamStats.has(teamName)) {
            teamStats.set(teamName, {
              projects: [],
              completedCount: 0,
              inProgressCount: 0,
              totalCompletion: 0
            });
          }
          
          const stats = teamStats.get(teamName)!;
          stats.projects.push(item);
          
          if (item.status === 'Completed') {
            stats.completedCount++;
          } else if (item.status === 'In Progress') {
            stats.inProgressCount++;
          }
          
          stats.totalCompletion += item.completion || 0;
        });
      }
      
      if (item.children) {
        processItems(item.children);
      }
    });
  };
  
  processItems(comprehensiveProjectData);
  
  // Convert to array and calculate averages
  return Array.from(teamStats.entries()).map(([teamName, stats]) => ({
    teamName,
    projectCount: stats.projects.length,
    completedCount: stats.completedCount,
    inProgressCount: stats.inProgressCount,
    avgCompletion: stats.projects.length > 0 ? Math.round(stats.totalCompletion / stats.projects.length) : 0,
    projects: stats.projects
  })).sort((a, b) => b.projectCount - a.projectCount);
}

// Get analytics data for Analytics tab
export function getProjectAnalytics() {
  const typeStats = new Map<string, { count: number; completed: number; totalCompletion: number }>();
  const statusStats = new Map<string, number>();
  const priorityStats = new Map<string, number>();
  let totalProjects = 0;
  let totalCompletion = 0;
  
  const processItems = (items: ProjectItem[]) => {
    items.forEach(item => {
      totalProjects++;
      totalCompletion += item.completion || 0;
      
      // Type statistics
      if (!typeStats.has(item.type)) {
        typeStats.set(item.type, { count: 0, completed: 0, totalCompletion: 0 });
      }
      const typeData = typeStats.get(item.type)!;
      typeData.count++;
      typeData.totalCompletion += item.completion || 0;
      if (item.status === 'Completed') {
        typeData.completed++;
      }
      
      // Status statistics
      statusStats.set(item.status, (statusStats.get(item.status) || 0) + 1);
      
      // Priority statistics
      if (item.priority) {
        priorityStats.set(item.priority, (priorityStats.get(item.priority) || 0) + 1);
      }
      
      if (item.children) {
        processItems(item.children);
      }
    });
  };
  
  processItems(comprehensiveProjectData);
  
  return {
    totalProjects,
    avgCompletion: totalProjects > 0 ? Math.round(totalCompletion / totalProjects) : 0,
    typeStats: Array.from(typeStats.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      completed: data.completed,
      avgCompletion: data.count > 0 ? Math.round(data.totalCompletion / data.count) : 0
    })),
    statusStats: Array.from(statusStats.entries()).map(([status, count]) => ({ status, count })),
    priorityStats: Array.from(priorityStats.entries()).map(([priority, count]) => ({ priority, count }))
  };
}

// Get timeline data for Timeline tab
export function getProjectTimeline() {
  const timeline: Array<{
    date: string;
    title: string;
    projects: ProjectItem[];
    completion: number;
  }> = [];
  
  // Group projects by creation/update dates (using completion as proxy)
  const phases = [
    {
      date: 'June 27-28, 2025',
      title: 'Phase 1: Platform Foundation',
      minCompletion: 90,
      types: ['Platform', 'Section']
    },
    {
      date: 'July 1-5, 2025',
      title: 'Phase 2: Core Features',
      minCompletion: 80,
      types: ['Feature']
    },
    {
      date: 'July 6-10, 2025',
      title: 'Phase 3: Advanced Systems',
      minCompletion: 60,
      types: ['Project', 'Feature']
    },
    {
      date: 'July 11-17, 2025',
      title: 'Phase 4: Optimization & Polish',
      minCompletion: 0,
      types: ['Task', 'Sub-task']
    }
  ];
  
  phases.forEach(phase => {
    const phaseProjects: ProjectItem[] = [];
    
    const findProjects = (items: ProjectItem[]) => {
      items.forEach(item => {
        if (phase.types.includes(item.type) && (item.completion || 0) >= phase.minCompletion) {
          phaseProjects.push(item);
        }
        if (item.children) {
          findProjects(item.children);
        }
      });
    };
    
    findProjects(comprehensiveProjectData);
    
    if (phaseProjects.length > 0) {
      const avgCompletion = phaseProjects.reduce((sum, p) => sum + (p.completion || 0), 0) / phaseProjects.length;
      timeline.push({
        date: phase.date,
        title: phase.title,
        projects: phaseProjects,
        completion: Math.round(avgCompletion)
      });
    }
  });
  
  return timeline;
}