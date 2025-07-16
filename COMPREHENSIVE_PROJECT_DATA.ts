// Comprehensive Project Data for Mundo Tango & Life CEO Platform
// Based on complete feature inventory and implementation documentation

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Blocked' | 'Under Review';
  completion: number;
  mobileCompletion?: number;
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string;
  team?: string[];
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  tags?: string[];
  children?: ProjectItem[];
  webDevPrerequisites?: string[];
  mobileNextSteps?: string[];
  reviewers?: string[];
  lastReviewDate?: string;
  nextReviewDate?: string;
  budget?: number;
  actualCost?: number;
}

export const comprehensiveProjectData: ProjectItem[] = [
  {
    id: 'mundo-tango-life-ceo-platform',
    title: 'Mundo Tango & Life CEO Platform',
    description: 'Comprehensive enterprise platform combining social tango community with AI-powered life management system',
    type: 'Platform',
    status: 'In Progress',
    completion: 87,
    mobileCompletion: 65,
    priority: 'High',
    estimatedHours: 5000,
    actualHours: 4350,
    assignee: 'Scott Boddye',
    team: ['Executive Team', 'Platform Architecture', 'AI Team', 'Mobile Team'],
    reviewers: ['CTO', 'Lead Architect', 'AI Director'],
    startDate: '2025-06-27',
    endDate: '2025-08-30',
    dependencies: [],
    tags: ['Enterprise', 'AI', 'Social Platform', 'Life Management'],
    budget: 500000,
    actualCost: 435000,
    webDevPrerequisites: [
      '✅ Complete platform architecture separation',
      '✅ Implement comprehensive authentication system',
      '✅ Build social media features',
      '✅ Create AI agent architecture',
      '⏳ Production deployment preparation - Missing: Sentry integration, CDN setup',
      '⏳ WCAG AA compliance - Missing: Screen reader testing, Keyboard navigation'
    ],
    mobileNextSteps: [
      'Design native mobile architecture',
      'Implement React Native components',
      'Create offline synchronization',
      'Build push notification system',
      'Develop native device integrations'
    ],
    children: [
      {
        id: 'mundo-tango-social-platform',
        title: 'Mundo Tango Social Platform',
        description: 'Complete social media platform for global tango community with events, posts, and networking',
        type: 'Section',
        status: 'In Progress',
        completion: 90,
        mobileCompletion: 70,
        priority: 'High',
        estimatedHours: 2500,
        actualHours: 2250,
        assignee: 'Social Platform Team',
        team: ['Frontend Team', 'Backend Team', 'UX Team', 'QA Team'],
        reviewers: ['Product Manager', 'Tech Lead'],
        startDate: '2025-06-27',
        endDate: '2025-07-31',
        tags: ['Social Media', 'Community', 'Tango'],
        budget: 250000,
        actualCost: 225000,
        children: [
          {
            id: 'authentication-user-management',
            title: 'Authentication & User Management',
            description: 'Complete authentication system with multi-step registration, 19 community roles, and RBAC',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            mobileCompletion: 80,
            priority: 'High',
            estimatedHours: 350,
            actualHours: 340,
            assignee: 'Auth Team',
            team: ['Backend Team', 'Security Team', 'Frontend Team'],
            startDate: '2025-06-27',
            endDate: '2025-06-30',
            tags: ['Authentication', 'RBAC', 'User Management'],
            children: [
              {
                id: 'multi-step-registration',
                title: 'Multi-Step Registration Flow',
                description: 'Complete onboarding with location selection from 157,251 cities, role selection, and code of conduct',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                mobileCompletion: 85,
                priority: 'High',
                estimatedHours: 120,
                actualHours: 115,
                children: [
                  {
                    id: 'location-database-integration',
                    title: 'Global Cities Database Integration',
                    description: 'Integration of 157,251 cities with country flags and coordinates',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 40,
                    actualHours: 38,
                    tags: ['Database', 'Geography', 'Localization']
                  },
                  {
                    id: 'role-selection-system',
                    title: '19 Community Roles Implementation',
                    description: 'Dancer, Teacher, DJ, Organizer, Performer, and 14 other specialized tango roles',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 30,
                    actualHours: 28,
                    tags: ['Roles', 'Community', 'User Experience']
                  },
                  {
                    id: 'custom-role-requests',
                    title: 'Custom Role Request System',
                    description: 'User-initiated role requests with admin approval workflow',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Medium',
                    estimatedHours: 25,
                    actualHours: 24,
                    tags: ['Roles', 'Admin', 'Workflow']
                  },
                  {
                    id: 'onboarding-automation-analysis',
                    title: 'Comprehensive Onboarding Automation Analysis',
                    description: 'Complete 30L framework analysis of all onboarding automations including city group creation, professional group assignments, and location handling',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 20,
                    actualHours: 18,
                    startDate: '2025-07-16',
                    endDate: '2025-07-16',
                    tags: ['Analysis', 'Automation', '30L Framework']
                  }
                ]
              },
              {
                id: 'authentication-system',
                title: 'JWT + OAuth Authentication',
                description: 'Dual authentication with JWT tokens and Replit OAuth integration',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                mobileCompletion: 90,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 78,
                children: [
                  {
                    id: 'jwt-implementation',
                    title: 'JWT Token System',
                    description: 'Secure token generation and validation with bcrypt password hashing',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 40,
                    actualHours: 38
                  },
                  {
                    id: 'oauth-integration',
                    title: 'Replit OAuth Integration',
                    description: 'SSO integration with Replit authentication system',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 40,
                    actualHours: 40
                  },
                  {
                    id: 'code-of-conduct-fix',
                    title: 'Code of Conduct Registration Fix',
                    description: 'Fixed registration flow with individual checkbox tracking and legal compliance',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 8,
                    actualHours: 8,
                    startDate: '2025-01-08',
                    endDate: '2025-01-08',
                    tags: ['Registration', 'Legal', 'UX']
                  }
                ]
              },
              {
                id: 'rbac-implementation',
                title: 'RBAC with 6-Tier Hierarchy',
                description: 'Role-based access control: super_admin > admin > project_admin > team_lead > contributor > viewer',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 60,
                actualHours: 58,
                tags: ['Security', 'RBAC', 'Authorization']
              }
            ]
          },
          {
            id: 'social-media-features',
            title: 'Social Media Features',
            description: 'Complete social features including posts, comments, reactions, media, and real-time messaging',
            type: 'Feature',
            status: 'Completed',
            completion: 95,
            mobileCompletion: 75,
            priority: 'High',
            estimatedHours: 600,
            actualHours: 570,
            assignee: 'Social Team',
            team: ['Frontend Team', 'Backend Team', 'Real-time Team'],
            startDate: '2025-06-28',
            endDate: '2025-06-30',
            tags: ['Social Media', 'Real-time', 'UGC'],
            children: [
              {
                id: 'post-system',
                title: 'Enhanced Post Creation System',
                description: 'ModernPostCreator with rich text, mentions, hashtags, media, and Google Maps',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                mobileCompletion: 80,
                priority: 'High',
                estimatedHours: 200,
                actualHours: 190,
                children: [
                  {
                    id: 'rich-text-editor',
                    title: 'Rich Text Editor (Quill)',
                    description: 'React Quill integration with custom toolbar and formatting',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 40,
                    actualHours: 38,
                    children: [
                      {
                        id: 'quill-toolbar',
                        title: 'Custom Quill Toolbar',
                        description: 'Bold, italic, lists, links, images, videos, code blocks',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'High',
                        estimatedHours: 20,
                        actualHours: 19
                      },
                      {
                        id: 'content-sanitization',
                        title: 'Content Sanitization',
                        description: 'XSS prevention and content validation',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'High',
                        estimatedHours: 20,
                        actualHours: 19
                      }
                    ]
                  },
                  {
                    id: 'mention-system',
                    title: 'User Mention System',
                    description: '@username mentions with autocomplete and notifications',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 30,
                    actualHours: 28
                  },
                  {
                    id: 'media-management',
                    title: 'Media Upload & Management',
                    description: 'Drag-drop uploads, tagging, reuse, and visibility controls',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 48,
                    children: [
                      {
                        id: 'media-upload',
                        title: 'Media Upload System',
                        description: 'Multi-file upload with progress tracking',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'High',
                        estimatedHours: 25,
                        actualHours: 24
                      },
                      {
                        id: 'media-tagging',
                        title: 'Media Tagging System',
                        description: 'Tag-based organization and search',
                        type: 'Sub-task',
                        status: 'Completed',
                        completion: 100,
                        priority: 'Medium',
                        estimatedHours: 25,
                        actualHours: 24
                      }
                    ]
                  },
                  {
                    id: 'location-integration',
                    title: 'Google Maps Integration',
                    description: 'Location selection with Places API and coordinate capture',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 40,
                    actualHours: 38
                  }
                ]
              },
              {
                id: 'engagement-features',
                title: 'Social Engagement Features',
                description: 'Comments, reactions, shares, and real-time updates',
                type: 'Project',
                status: 'Completed',
                completion: 95,
                mobileCompletion: 70,
                priority: 'High',
                estimatedHours: 150,
                actualHours: 143,
                children: [
                  {
                    id: 'comment-system',
                    title: 'Nested Comment System',
                    description: 'Comments with replies, mentions, and real-time updates',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 48
                  },
                  {
                    id: 'reaction-system',
                    title: 'Emoji Reaction System',
                    description: 'Multiple emoji reactions (❤️ 🔥 😍 🎉) with upsert logic',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Medium',
                    estimatedHours: 30,
                    actualHours: 28
                  },
                  {
                    id: 'real-time-updates',
                    title: 'WebSocket Real-time Updates',
                    description: 'Live updates for posts, comments, and notifications',
                    type: 'Task',
                    status: 'Completed',
                    completion: 90,
                    priority: 'High',
                    estimatedHours: 70,
                    actualHours: 67
                  }
                ]
              },
              {
                id: 'messaging-system',
                title: 'Real-time Messaging',
                description: 'Private and group messaging with WebSocket',
                type: 'Project',
                status: 'In Progress',
                completion: 85,
                mobileCompletion: 60,
                priority: 'High',
                estimatedHours: 120,
                actualHours: 102
              }
            ]
          },
          {
            id: 'event-management',
            title: 'Event Management System',
            description: 'Comprehensive event system with 9 types, RSVPs, roles, and discovery',
            type: 'Feature',
            status: 'Completed',
            completion: 98,
            mobileCompletion: 75,
            priority: 'High',
            estimatedHours: 400,
            actualHours: 392,
            assignee: 'Events Team',
            team: ['Frontend Team', 'Backend Team', 'UX Team'],
            startDate: '2025-06-29',
            endDate: '2025-06-30',
            tags: ['Events', 'RSVP', 'Discovery'],
            children: [
              {
                id: 'event-types',
                title: 'Event Type System',
                description: 'Milonga, practica, workshop, festival, marathon, encuentro, competition, social, clase',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 78
              },
              {
                id: 'event-rsvp',
                title: 'RSVP & Role Assignment',
                description: 'RSVP system with role assignments (DJ, Teacher, Performer, etc.)',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 98,
                children: [
                  {
                    id: 'rsvp-statuses',
                    title: 'RSVP Status Management',
                    description: 'Going, Interested, Maybe status tracking',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 49
                  },
                  {
                    id: 'role-assignments',
                    title: 'Event Role Assignments',
                    description: 'Assign participants as DJ, Teacher, Host, etc.',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 49
                  }
                ]
              },
              {
                id: 'event-discovery',
                title: 'Event Discovery Features',
                description: 'Location-based, date-based, and social discovery',
                type: 'Project',
                status: 'Completed',
                completion: 95,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 76
              }
            ]
          },
          {
            id: 'community-features',
            title: 'Community Features',
            description: 'Groups, friends, networking, and city-based communities',
            type: 'Feature',
            status: 'Completed',
            completion: 95,
            mobileCompletion: 70,
            priority: 'High',
            estimatedHours: 400,
            actualHours: 380,
            assignee: 'Community Team',
            team: ['Frontend Team', 'Backend Team', 'Map Team'],
            tags: ['Community', 'Social', 'Groups', 'Maps'],
            lastReviewDate: '2025-01-09',
            children: [
              {
                id: 'groups-system',
                title: 'Groups System',
                description: 'City-based and interest-based groups with enhanced features',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 150,
                actualHours: 145,
                lastReviewDate: '2025-01-09',
                children: [
                  {
                    id: 'group-detail-page',
                    title: 'Group Detail Page MT Design',
                    description: 'Complete Mundo Tango design system implementation',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 30,
                    actualHours: 28,
                    tags: ['UI/UX', 'Design System'],
                    startDate: '2025-01-09',
                    endDate: '2025-01-09'
                  },
                  {
                    id: 'city-specific-photos',
                    title: 'Dynamic City Cover Photos',
                    description: 'Pexels API integration for city-specific imagery',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Medium',
                    estimatedHours: 20,
                    actualHours: 18,
                    tags: ['API', 'Media'],
                    startDate: '2025-01-09',
                    endDate: '2025-01-09'
                  },
                  {
                    id: 'buenos-aires-group-fix',
                    title: 'Buenos Aires Group Navigation Fix',
                    description: 'Fixed authentication and routing for city groups',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 15,
                    actualHours: 14,
                    tags: ['Bug Fix', 'Authentication'],
                    startDate: '2025-01-09',
                    endDate: '2025-01-09'
                  }
                ]
              },
              {
                id: 'interactive-maps',
                title: 'Interactive World Map',
                description: 'Leaflet.js open-source mapping with live data',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 75,
                startDate: '2025-01-09',
                endDate: '2025-01-09',
                children: [
                  {
                    id: 'leaflet-integration',
                    title: 'Replace Google Maps with Leaflet',
                    description: 'Open-source mapping solution, no API keys required',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 30,
                    actualHours: 28,
                    tags: ['Open Source', 'Maps']
                  },
                  {
                    id: 'city-markers',
                    title: 'Dynamic City Markers',
                    description: 'Size and color based on member count with popups',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 25,
                    actualHours: 23,
                    tags: ['Maps', 'UI/UX']
                  },
                  {
                    id: 'event-counts',
                    title: 'Live Event Counts in Map',
                    description: 'Show upcoming events per city in map popups',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Medium',
                    estimatedHours: 25,
                    actualHours: 24,
                    tags: ['Maps', 'Real-time']
                  }
                ]
              },
              {
                id: 'friends-networking',
                title: 'Friends & Networking',
                description: 'Friend requests, follows, and mutual connections',
                type: 'Project',
                status: 'Completed',
                completion: 90,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 90
              }
            ]
          }
        ]
      },
      {
        id: 'life-ceo-system',
        title: 'Life CEO AI System',
        description: 'AI-powered life management system with 16 specialized agents',
        type: 'Section',
        status: 'In Progress',
        completion: 85,
        mobileCompletion: 70,
        priority: 'High',
        estimatedHours: 1500,
        actualHours: 1275,
        assignee: 'AI Team',
        team: ['AI Team', 'Backend Team', 'Mobile Team'],
        reviewers: ['AI Director', 'CTO'],
        startDate: '2025-01-05',
        endDate: '2025-08-15',
        tags: ['AI', 'Life Management', 'Voice', 'Agents'],
        budget: 150000,
        actualCost: 127500,
        children: [
          {
            id: 'agent-architecture',
            title: 'Agent Architecture',
            description: '16 specialized AI agents for comprehensive life management',
            type: 'Feature',
            status: 'In Progress',
            completion: 90,
            mobileCompletion: 75,
            priority: 'High',
            estimatedHours: 600,
            actualHours: 540,
            children: [
              {
                id: 'core-agents',
                title: 'Core Life Management Agents',
                description: 'Business, Finance, Health, Relationships agents',
                type: 'Project',
                status: 'Completed',
                completion: 95,
                priority: 'High',
                estimatedHours: 200,
                actualHours: 190,
                children: [
                  {
                    id: 'business-agent',
                    title: 'Business Agent',
                    description: 'Professional life and meeting management',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 48
                  },
                  {
                    id: 'finance-agent',
                    title: 'Finance Agent',
                    description: 'Financial planning with Buenos Aires context',
                    type: 'Task',
                    status: 'Completed',
                    completion: 95,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 48
                  },
                  {
                    id: 'health-agent',
                    title: 'Health Agent',
                    description: 'Wellness and medical management',
                    type: 'Task',
                    status: 'Completed',
                    completion: 90,
                    priority: 'High',
                    estimatedHours: 50,
                    actualHours: 45
                  }
                ]
              },
              {
                id: 'support-agents',
                title: 'Support & Utility Agents',
                description: 'Learning, Creative, Network, Mobility, and 8 other agents',
                type: 'Project',
                status: 'In Progress',
                completion: 85,
                priority: 'High',
                estimatedHours: 400,
                actualHours: 340
              }
            ]
          },
          {
            id: 'voice-processing',
            title: 'Advanced Voice Processing',
            description: 'Voice interface with noise cancellation and multi-language support',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            mobileCompletion: 90,
            priority: 'High',
            estimatedHours: 200,
            actualHours: 195,
            children: [
              {
                id: 'audio-processing',
                title: 'Audio Processing Pipeline',
                description: 'Dynamic compression, high-pass filter, noise gate',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 98,
                children: [
                  {
                    id: 'dynamic-compression',
                    title: 'Dynamic Compression (4:1)',
                    description: 'Consistent voice levels with 50ms attack',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 30,
                    actualHours: 29
                  },
                  {
                    id: 'noise-filtering',
                    title: 'High-Pass Filter (85Hz)',
                    description: 'Remove low-frequency noise and rumble',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 30,
                    actualHours: 29
                  }
                ]
              }
            ]
          },
          {
            id: 'memory-system',
            title: 'AI Memory & Context System',
            description: 'Vector database with semantic search and context retention',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            mobileCompletion: 80,
            priority: 'High',
            estimatedHours: 250,
            actualHours: 245,
            children: [
              {
                id: 'vector-embeddings',
                title: 'Vector Embeddings (pgvector)',
                description: 'Semantic search with OpenAI embeddings',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 98
              },
              {
                id: 'context-management',
                title: 'Context & Conversation Threading',
                description: 'Maintain context across agent conversations',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 78
              }
            ]
          },
          {
            id: 'chat-interface',
            title: 'ChatGPT-like Interface',
            description: 'Enhanced chat UI with conversation management',
            type: 'Feature',
            status: 'Completed',
            completion: 95,
            mobileCompletion: 85,
            priority: 'High',
            estimatedHours: 150,
            actualHours: 143
          }
        ]
      },
      {
        id: 'admin-management',
        title: 'Administration & Management',
        description: 'Complete admin dashboard with user management, analytics, and compliance',
        type: 'Section',
        status: 'Completed',
        completion: 98,
        mobileCompletion: 65,
        priority: 'High',
        estimatedHours: 1000,
        actualHours: 980,
        assignee: 'Admin Team',
        team: ['Backend Team', 'Frontend Team', 'Security Team', 'Platform Team'],
        tags: ['Admin', 'Analytics', 'Compliance', 'Multi-tenant', 'RBAC'],
        lastReviewDate: '2025-01-10',
        children: [
          {
            id: 'multi-tenant-rbac',
            title: 'Multi-Tenant RBAC/ABAC System',
            description: 'Complete multi-tenant architecture with role-based access control',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 120,
            actualHours: 115,
            startDate: '2025-01-10',
            endDate: '2025-01-10',
            children: [
              {
                id: 'casl-integration',
                title: 'CASL Permission System',
                description: 'Integrated @casl/ability and @casl/react for permissions',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                tags: ['Security', 'RBAC']
              },
              {
                id: 'tenant-switcher',
                title: 'Super Admin Tenant Switcher',
                description: 'Interactive tenant switching for super admins only',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 30,
                actualHours: 28,
                tags: ['UI/UX', 'Multi-tenant']
              },
              {
                id: 'auth-middleware-fix',
                title: 'Authentication Middleware Unification',
                description: 'Unified authHelper.ts for consistent user ID extraction',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 25,
                actualHours: 24,
                tags: ['Security', 'Backend']
              },
              {
                id: 'test-tenants',
                title: 'Test Tenant Creation',
                description: 'Created 4 test tenants: Mundo Tango, Life CEO, Test Community, Beta Users',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                estimatedHours: 25,
                actualHours: 25,
                tags: ['Database', 'Testing']
              }
            ]
          },
          {
            id: 'global-statistics',
            title: 'Global Statistics Dashboard',
            description: 'Live platform metrics with real-time updates',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 80,
            actualHours: 75,
            startDate: '2025-01-10',
            endDate: '2025-01-10',
            children: [
              {
                id: 'statistics-api',
                title: 'Statistics API Endpoints',
                description: 'Global and realtime statistics endpoints',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 30,
                actualHours: 28,
                tags: ['API', 'Analytics']
              },
              {
                id: 'statistics-dashboard-ui',
                title: 'Statistics Dashboard Component',
                description: 'Interactive dashboard with 30-second refresh',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 30,
                actualHours: 28,
                tags: ['UI/UX', 'Analytics']
              },
              {
                id: 'admin-center-integration',
                title: 'Admin Center Integration',
                description: 'Added Global Statistics tab with globe icon',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'Medium',
                estimatedHours: 20,
                actualHours: 19,
                tags: ['Integration', 'UI/UX']
              }
            ]
          },
          {
            id: 'admin-dashboard',
            title: 'Admin Center Dashboard',
            description: 'Comprehensive admin interface with multiple management tabs',
            type: 'Feature',
            status: 'Completed',
            completion: 95,
            mobileCompletion: 70,
            priority: 'High',
            estimatedHours: 300,
            actualHours: 285,
            children: [
              {
                id: 'user-management',
                title: 'User Management Interface',
                description: 'Search, filter, role assignment, and bulk operations',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 98
              },
              {
                id: 'content-moderation',
                title: 'Content Moderation System',
                description: 'Report review, content removal, and user warnings',
                type: 'Project',
                status: 'Completed',
                completion: 90,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 72
              }
            ]
          },
          {
            id: 'compliance-system',
            title: 'Compliance & Monitoring',
            description: 'Automated compliance monitoring with 84% score',
            type: 'Feature',
            status: 'In Progress',
            completion: 85,
            mobileCompletion: 50,
            priority: 'High',
            estimatedHours: 200,
            actualHours: 170,
            children: [
              {
                id: 'automated-audits',
                title: 'Hourly Automated Audits',
                description: 'GDPR compliance, security, and performance monitoring',
                type: 'Project',
                status: 'Completed',
                completion: 90,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 90
              }
            ]
          },
          {
            id: 'project-tracker',
            title: 'Enhanced Project Tracker',
            description: '6-level hierarchical project tracking system',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            mobileCompletion: 70,
            priority: 'High',
            estimatedHours: 150,
            actualHours: 148,
            children: [
              {
                id: 'hierarchical-tree-view',
                title: 'EnhancedHierarchicalTreeView',
                description: 'Tree view with color-coded levels and team filtering',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 78,
                children: [
                  {
                    id: '6-level-hierarchy',
                    title: '6-Level Hierarchy Display',
                    description: 'Platform→Section→Feature→Project→Task→Sub-task',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 40,
                    actualHours: 39
                  },
                  {
                    id: 'visual-indicators',
                    title: 'Visual Hierarchy Indicators',
                    description: 'Color-coded borders, depth indicators, child badges',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Medium',
                    estimatedHours: 40,
                    actualHours: 39
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'automation-systems',
        title: 'Automation Systems',
        description: 'Five key automation systems for seamless user experience',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        mobileCompletion: 80,
        priority: 'High',
        estimatedHours: 200,
        actualHours: 190,
        assignee: 'Automation Team',
        team: ['Backend Team', 'AI Team', 'Map Team'],
        tags: ['Automation', 'AI', 'UX', 'Open Source'],
        startDate: '2025-01-09',
        endDate: '2025-01-09',
        lastReviewDate: '2025-01-09',
        children: [
          {
            id: 'city-group-automation',
            title: 'Automatic City Group Assignment',
            description: 'Users automatically assigned to city groups during registration',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 38,
            children: [
              {
                id: 'location-detection',
                title: 'Location Detection & Assignment',
                description: 'Detect user location and assign to appropriate city group',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                tags: ['Automation', 'Groups']
              }
            ]
          },
          {
            id: 'professional-group-automation',
            title: 'Professional Group Assignment',
            description: 'Map tango roles to professional groups automatically',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 38,
            children: [
              {
                id: 'role-mapping',
                title: 'Role to Group Mapping',
                description: 'Teachers Network, DJs United, etc. based on user roles',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                tags: ['Automation', 'Roles']
              }
            ]
          },
          {
            id: 'event-geocoding',
            title: 'Event Creation Geocoding',
            description: 'Automatic address to coordinates conversion',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 38,
            children: [
              {
                id: 'openstreetmap-integration',
                title: 'OpenStreetMap Geocoding',
                description: 'Convert addresses to map coordinates automatically',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                tags: ['Maps', 'Open Source']
              }
            ]
          },
          {
            id: 'host-homes-marketplace',
            title: 'Host Homes Marketplace',
            description: 'Automatic geocoding for home listings on map',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 38,
            children: [
              {
                id: 'home-geocoding',
                title: 'Home Listing Geocoding',
                description: 'Automatic map placement for host homes',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                tags: ['Maps', 'Marketplace']
              }
            ]
          },
          {
            id: 'recommendations-system',
            title: 'Recommendations System',
            description: 'Location-based recommendations with map integration',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            estimatedHours: 40,
            actualHours: 38,
            children: [
              {
                id: 'location-recommendations',
                title: 'Location-Based Recommendations',
                description: 'Suggest events, groups, and users based on location',
                type: 'Task',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                tags: ['AI', 'Maps', 'Recommendations']
              }
            ]
          }
        ]
      },
      {
        id: 'technical-infrastructure',
        title: 'Technical Infrastructure',
        description: 'Database, APIs, security, and deployment infrastructure',
        type: 'Section',
        status: 'In Progress',
        completion: 87,
        mobileCompletion: 60,
        priority: 'High',
        estimatedHours: 1200,
        actualHours: 1044,
        assignee: 'Infrastructure Team',
        team: ['DevOps', 'Backend Team', 'Security Team'],
        tags: ['Infrastructure', 'Database', 'Security'],
        children: [
          {
            id: 'database-architecture',
            title: 'Database Architecture',
            description: '55+ PostgreSQL tables with RLS and performance optimization',
            type: 'Feature',
            status: 'Completed',
            completion: 95,
            priority: 'High',
            estimatedHours: 300,
            actualHours: 285,
            children: [
              {
                id: 'core-tables',
                title: 'Core Database Tables',
                description: 'Users, posts, events, media, roles, and 50+ other tables',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 150,
                actualHours: 148
              },
              {
                id: 'performance-indexes',
                title: '47 Performance Indexes',
                description: 'Location queries, text search, social features',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 78
              },
              {
                id: 'row-level-security',
                title: 'Row-Level Security (RLS)',
                description: 'PostgreSQL RLS policies for data protection',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 70,
                actualHours: 73,
                endDate: '2025-01-08',
                tags: ['Security', 'Database', 'RLS'],
                children: [
                  {
                    id: 'rls-24-tables',
                    title: 'RLS Policies on 24 Tables',
                    description: 'Comprehensive RLS policies deployed on 24 critical tables',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    actualHours: 1,
                    startDate: '2025-01-08',
                    endDate: '2025-01-08',
                    tags: ['Security', 'RLS']
                  },
                  {
                    id: 'rls-schema-fixes',
                    title: 'Schema Compatibility Fixes',
                    description: 'Fixed column references for follows table (following_id) and user_roles structure',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    actualHours: 2,
                    startDate: '2025-01-08',
                    endDate: '2025-01-08',
                    tags: ['Database', 'Fix']
                  }
                ]
              },
              {
                id: 'health-check-functions',
                title: 'Database Health Check Functions',
                description: '2 monitoring functions deployed for database health analysis and cache hit ratios',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 16,
                actualHours: 18,
                startDate: '2025-01-08',
                endDate: '2025-01-08',
                tags: ['Monitoring', 'Database', 'Performance'],
                children: [
                  {
                    id: 'quick-health-check',
                    title: 'quick_health_check() Function',
                    description: 'Lightweight monitoring endpoint for database size and connections',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    actualHours: 0.5,
                    tags: ['Monitoring']
                  },
                  {
                    id: 'comprehensive-health-check',
                    title: 'check_database_health() Function',
                    description: 'Comprehensive analysis with cache hit ratios and long-running queries',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    actualHours: 0.5,
                    tags: ['Monitoring', 'Performance']
                  }
                ]
              },
              {
                id: 'audit-logging-system',
                title: 'Comprehensive Audit Logging',
                description: 'Audit triggers deployed on 7 critical tables with field-level change tracking',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 24,
                actualHours: 26,
                startDate: '2025-01-08',
                endDate: '2025-01-08',
                tags: ['Security', 'Compliance', 'Database'],
                children: [
                  {
                    id: 'audit-tables',
                    title: 'Audit Triggers on 7 Tables',
                    description: 'Applied to: users, posts, memories, events, user_roles, event_participants, media_assets',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    actualHours: 1,
                    tags: ['Security', 'Audit']
                  },
                  {
                    id: 'audit-admin-access',
                    title: 'Admin-Only Access Policy',
                    description: 'RLS policy ensuring only admins can view audit logs',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    actualHours: 1,
                    tags: ['Security', 'RLS']
                  }
                ]
              },
              {
                id: 'database-sync-verification',
                title: 'Database Sync Verification System',
                description: 'Automated script to verify database changes are pushed to production',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 8,
                actualHours: 8,
                startDate: '2025-01-08',
                endDate: '2025-01-08',
                tags: ['DevOps', 'Database', 'Automation']
              }
            ]
          },
          {
            id: 'api-infrastructure',
            title: 'API Infrastructure',
            description: '100+ REST API endpoints with authentication',
            type: 'Feature',
            status: 'Completed',
            completion: 92,
            priority: 'High',
            estimatedHours: 400,
            actualHours: 368,
            children: [
              {
                id: 'auth-endpoints',
                title: 'Authentication Endpoints',
                description: '/api/auth/*, /api/roles/* endpoints',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 78
              },
              {
                id: 'social-endpoints',
                title: 'Social Feature Endpoints',
                description: '/api/posts/*, /api/comments/*, /api/reactions/*',
                type: 'Project',
                status: 'Completed',
                completion: 95,
                priority: 'High',
                estimatedHours: 120,
                actualHours: 114
              },
              {
                id: 'life-ceo-endpoints',
                title: 'Life CEO API Endpoints',
                description: '/api/life-ceo/*, agent chat endpoints',
                type: 'Project',
                status: 'Completed',
                completion: 90,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 90
              }
            ]
          },
          {
            id: 'security-implementation',
            title: 'Security Implementation',
            description: 'JWT, CORS, rate limiting, SQL injection prevention',
            type: 'Feature',
            status: 'Completed',
            completion: 88,
            priority: 'High',
            estimatedHours: 200,
            actualHours: 176,
            children: [
              {
                id: 'authentication-security',
                title: 'Authentication Security',
                description: 'JWT tokens, bcrypt hashing, session management',
                type: 'Project',
                status: 'Completed',
                completion: 95,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 76
              },
              {
                id: 'service-worker-cache',
                title: 'Service Worker Cache Prevention',
                description: 'Fixed persistent old UI bug, implemented multi-layer cache management',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 40,
                actualHours: 38,
                startDate: '2025-01-09',
                endDate: '2025-01-09',
                tags: ['PWA', 'Cache', 'Performance'],
                children: [
                  {
                    id: 'cache-version-fix',
                    title: 'Cache Version Update',
                    description: 'Updated from life-ceo-v1 to life-ceo-v2 with immediate activation',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'Critical',
                    estimatedHours: 10,
                    actualHours: 9,
                    tags: ['Bug Fix']
                  },
                  {
                    id: 'cache-monitoring',
                    title: 'Runtime Cache Monitoring',
                    description: 'Created cache-monitor.ts with 5-minute version checking',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 15,
                    actualHours: 14,
                    tags: ['Monitoring']
                  },
                  {
                    id: 'cache-update-notifier',
                    title: 'User Update Notifications',
                    description: 'CacheUpdateNotifier component with one-click refresh',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 15,
                    actualHours: 15,
                    tags: ['UI/UX']
                  }
                ]
              },
              {
                id: 'performance-optimization-framework',
                title: 'Comprehensive Performance Optimization Framework',
                description: 'React performance utilities and component optimizations',
                type: 'Project',
                status: 'Completed',
                completion: 100,
                priority: 'High',
                estimatedHours: 60,
                actualHours: 56,
                startDate: '2025-07-15',
                endDate: '2025-07-16',
                tags: ['Performance', 'React', 'Optimization'],
                children: [
                  {
                    id: 'react-performance-utilities',
                    title: 'React Performance Utilities',
                    description: 'Created performance.tsx with React.memo HOC, useDebounce, useThrottle, useVirtualScroll',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 20,
                    actualHours: 18,
                    tags: ['React', 'Performance']
                  },
                  {
                    id: 'admin-center-optimization',
                    title: 'AdminCenter Component Optimization',
                    description: 'Wrapped AdminCenter with React.memo and created LazyTabs for optimized tab loading',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 15,
                    actualHours: 14,
                    tags: ['React', 'Admin', 'Performance']
                  },
                  {
                    id: 'compression-middleware',
                    title: 'Server-Side Compression',
                    description: 'Added compression middleware to Express server for 60-70% response size reduction',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 10,
                    actualHours: 9,
                    tags: ['Backend', 'Performance']
                  },
                  {
                    id: 'settings-api-fix',
                    title: 'Settings API Endpoint Fix',
                    description: 'Fixed settings endpoint to use proper database queries instead of undefined execution',
                    type: 'Task',
                    status: 'Completed',
                    completion: 100,
                    priority: 'High',
                    estimatedHours: 15,
                    actualHours: 15,
                    tags: ['API', 'Bug Fix']
                  }
                ]
              },
              {
                id: 'api-security',
                title: 'API Security Measures',
                description: 'CORS, rate limiting, input validation',
                type: 'Project',
                status: 'Completed',
                completion: 85,
                priority: 'High',
                estimatedHours: 60,
                actualHours: 51
              }
            ]
          },
          {
            id: 'deployment-infrastructure',
            title: 'Deployment & DevOps',
            description: 'Replit deployment with monitoring and backup',
            type: 'Feature',
            status: 'In Progress',
            completion: 70,
            mobileCompletion: 50,
            priority: 'High',
            estimatedHours: 300,
            actualHours: 210,
            children: [
              {
                id: 'replit-deployment',
                title: 'Replit Platform Deployment',
                description: 'Auto-scaling, environment management',
                type: 'Project',
                status: 'Completed',
                completion: 90,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 90
              },
              {
                id: 'monitoring-setup',
                title: 'Monitoring & Alerting',
                description: 'Performance monitoring, error tracking (Sentry needed)',
                type: 'Project',
                status: 'In Progress',
                completion: 60,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 60,
                webDevPrerequisites: [
                  '⏳ Integrate Sentry for error tracking',
                  '⏳ Set up performance monitoring',
                  '⏳ Configure alerting rules'
                ]
              },
              {
                id: 'backup-recovery',
                title: 'Backup & Recovery',
                description: 'Automated backups, disaster recovery (RPO 5min, RTO 30min)',
                type: 'Project',
                status: 'Planned',
                completion: 50,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 50,
                webDevPrerequisites: [
                  '⏳ Implement automated backup system',
                  '⏳ Create disaster recovery procedures',
                  '⏳ Test recovery processes'
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'production-readiness',
        title: 'Production Readiness (Layers 21-23)',
        description: 'Production resilience, user safety, and business continuity',
        type: 'Section',
        status: 'In Progress',
        completion: 60,
        mobileCompletion: 40,
        priority: 'High',
        estimatedHours: 800,
        actualHours: 480,
        assignee: 'Production Team',
        team: ['DevOps', 'Security Team', 'QA Team', 'Legal Team'],
        tags: ['Production', 'Resilience', 'Safety', 'Continuity'],
        webDevPrerequisites: [
          '⏳ Complete all Layer 21-23 implementations',
          '⏳ Pass security audit',
          '⏳ Achieve WCAG AA compliance',
          '⏳ Complete load testing'
        ],
        children: [
          {
            id: 'production-resilience',
            title: 'Layer 21: Production Resilience',
            description: 'Error tracking, security hardening, rate limiting, health monitoring',
            type: 'Feature',
            status: 'In Progress',
            completion: 60,
            priority: 'High',
            estimatedHours: 300,
            actualHours: 180,
            children: [
              {
                id: 'error-tracking',
                title: 'Error Tracking (Sentry)',
                description: 'Comprehensive error monitoring and alerting',
                type: 'Project',
                status: 'Planned',
                completion: 30,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 24
              },
              {
                id: 'security-hardening',
                title: 'Security Hardening (Helmet.js)',
                description: 'Additional security headers and protections',
                type: 'Project',
                status: 'In Progress',
                completion: 70,
                priority: 'High',
                estimatedHours: 60,
                actualHours: 42
              }
            ]
          },
          {
            id: 'user-safety-net',
            title: 'Layer 22: User Safety Net',
            description: 'GDPR compliance, WCAG accessibility, privacy dashboard',
            type: 'Feature',
            status: 'In Progress',
            completion: 65,
            priority: 'High',
            estimatedHours: 300,
            actualHours: 195,
            children: [
              {
                id: 'gdpr-compliance',
                title: 'GDPR Compliance Tools',
                description: 'Data export, deletion, and consent management',
                type: 'Project',
                status: 'In Progress',
                completion: 70,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 70
              },
              {
                id: 'wcag-accessibility',
                title: 'WCAG AA Accessibility',
                description: 'Screen reader support, keyboard navigation',
                type: 'Project',
                status: 'In Progress',
                completion: 60,
                priority: 'High',
                estimatedHours: 100,
                actualHours: 60
              }
            ]
          },
          {
            id: 'business-continuity',
            title: 'Layer 23: Business Continuity',
            description: 'Automated backups, disaster recovery, incident response',
            type: 'Feature',
            status: 'Planned',
            completion: 55,
            priority: 'High',
            estimatedHours: 200,
            actualHours: 110,
            children: [
              {
                id: 'automated-backups',
                title: 'Automated Backup System',
                description: 'Regular snapshots with point-in-time recovery',
                type: 'Project',
                status: 'Planned',
                completion: 40,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 32
              },
              {
                id: 'disaster-recovery',
                title: 'Disaster Recovery Plan',
                description: 'Multi-region failover, incident procedures',
                type: 'Project',
                status: 'Planned',
                completion: 50,
                priority: 'High',
                estimatedHours: 80,
                actualHours: 40
              }
            ]
          }
        ]
      }
    ]
  }
];

// Export helper functions
export const getAllTeams = (data: ProjectItem[]): string[] => {
  const teams = new Set<string>();
  
  const extractTeams = (items: ProjectItem[]) => {
    items.forEach(item => {
      if (item.team) {
        item.team.forEach(t => teams.add(t));
      }
      if (item.children) {
        extractTeams(item.children);
      }
    });
  };
  
  extractTeams(data);
  return Array.from(teams).sort();
};

export const getProjectStats = (data: ProjectItem[]) => {
  let totalProjects = 0;
  let completedProjects = 0;
  let totalHours = 0;
  let totalBudget = 0;
  let totalCost = 0;
  
  const calculateStats = (items: ProjectItem[]) => {
    items.forEach(item => {
      if (item.type === 'Project') {
        totalProjects++;
        if (item.status === 'Completed') {
          completedProjects++;
        }
      }
      if (item.actualHours) totalHours += item.actualHours;
      if (item.budget) totalBudget += item.budget;
      if (item.actualCost) totalCost += item.actualCost;
      
      if (item.children) {
        calculateStats(item.children);
      }
    });
  };
  
  calculateStats(data);
  
  return {
    totalProjects,
    completedProjects,
    totalHours,
    totalBudget,
    totalCost,
    completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
  };
};