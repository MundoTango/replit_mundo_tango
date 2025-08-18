import { db } from '../server/db';
import { dailyActivities } from '../shared/schema';

async function populateHistoricalActivities() {
  console.log('Populating historical activities for December 2024 - January 2025...');
  
  const activities = [
    // January 9, 2025
    {
      user_id: 7,
      project_id: 'leaflet-maps',
      project_title: 'Interactive Maps with Leaflet',
      activity_type: 'created' as const,
      description: 'Replaced Google Maps with open-source Leaflet solution',
      changes: [
        'Integrated Leaflet.js with OpenStreetMap tiles',
        'Created reusable LeafletMap component',
        'Added city group markers with member counts'
      ],
      team: ['Frontend', 'UX'],
      tags: ['maps', 'open-source'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2025, 0, 9, 14, 20),
      metadata: { layer: 7, framework: '23L' }
    },
    {
      user_id: 7,
      project_id: 'enhanced-timeline-v2',
      project_title: 'Enhanced Timeline V2',
      activity_type: 'completed' as const,
      description: 'Complete rewrite fixing all social features',
      changes: [
        'Fixed location display from user profile',
        'Corrected tango roles with RoleEmojiDisplay',
        'Facebook-style reactions working properly'
      ],
      team: ['Frontend'],
      tags: ['timeline', 'social'],
      completion_before: 40,
      completion_after: 100,
      timestamp: new Date(2025, 0, 9, 11, 15),
      metadata: { layer: 7, framework: '23L' }
    },

    // January 8, 2025
    {
      user_id: 7,
      project_id: 'database-optimizations',
      project_title: 'Database Optimizations',
      activity_type: 'completed' as const,
      description: 'Deployed comprehensive database security improvements',
      changes: [
        'RLS enabled on 24 tables (up from 10)',
        '2 health check functions operational',
        'Audit logging on 7 critical tables'
      ],
      team: ['Backend', 'Security'],
      tags: ['database', 'security', 'optimization'],
      completion_before: 78,
      completion_after: 100,
      timestamp: new Date(2025, 0, 8, 16, 45),
      metadata: { layer: 5, framework: '23L' }
    },
    {
      user_id: 7,
      project_id: 'code-of-conduct',
      project_title: 'Code of Conduct Agreement System',
      activity_type: 'created' as const,
      description: 'Implemented comprehensive agreement tracking',
      changes: [
        'Individual checkbox for each guideline',
        'Database tracking with timestamps and IP',
        'Legal compliance for user agreements'
      ],
      team: ['Frontend', 'Backend', 'Legal'],
      tags: ['compliance', 'registration'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2025, 0, 8, 10, 30),
      metadata: { layer: 3, framework: '23L' }
    },

    // January 7, 2025
    {
      user_id: 7,
      project_id: 'typescript-stabilization',
      project_title: 'TypeScript Infrastructure',
      activity_type: 'completed' as const,
      description: 'Resolved all 27 TypeScript compilation errors',
      changes: [
        'Zero build failures achieved',
        'Enhanced type safety across platform',
        'Created reusable error resolution patterns'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['typescript', 'stability'],
      completion_before: 20,
      completion_after: 100,
      timestamp: new Date(2025, 0, 7, 17, 0),
      metadata: { layer: 21, framework: '20L' }
    },
    {
      user_id: 7,
      project_id: 'project-tracker',
      project_title: 'Enhanced Project Tracker',
      activity_type: 'updated' as const,
      description: 'Added hierarchical tree view with team management',
      changes: [
        '6-level project hierarchy implemented',
        'Dual view system (tree/cards)',
        'Team filtering with visual badges'
      ],
      team: ['Frontend', 'UX'],
      tags: ['project-management', 'ui'],
      completion_before: 60,
      completion_after: 90,
      timestamp: new Date(2025, 0, 7, 13, 20),
      metadata: { layer: 11, framework: '23L' }
    },

    // January 6, 2025
    {
      user_id: 7,
      project_id: 'life-ceo-phase1',
      project_title: 'Life CEO Phase 1',
      activity_type: 'completed' as const,
      description: 'Foundation implementation with agent architecture',
      changes: [
        'Separate database schemas for Life CEO',
        'API gateway infrastructure',
        'Business Agent implementation',
        'Mobile-first React interface'
      ],
      team: ['Architecture', 'Backend', 'AI'],
      tags: ['life-ceo', 'ai-agents'],
      completion_before: 70,
      completion_after: 100,
      timestamp: new Date(2025, 0, 6, 18, 30),
      metadata: { layer: 13, framework: '20L' }
    },

    // January 5, 2025
    {
      user_id: 7,
      project_id: 'voice-enhancement',
      project_title: 'Voice Processing Enhancement',
      activity_type: 'created' as const,
      description: 'Advanced audio processing for real-world conditions',
      changes: [
        'Dynamic compression 4:1 ratio',
        'High-pass filter at 85Hz',
        'Adaptive noise gate implementation'
      ],
      team: ['Frontend', 'AI'],
      tags: ['voice', 'audio-processing'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2025, 0, 5, 15, 45),
      metadata: { layer: 15, framework: '20L' }
    },

    // December 31, 2024
    {
      user_id: 7,
      project_id: 'year-end-stability',
      project_title: 'Year-End Platform Stability',
      activity_type: 'completed' as const,
      description: 'Achieved 87% production readiness',
      changes: [
        'All critical systems operational',
        'Performance benchmarks met',
        'Security audits passed'
      ],
      team: ['All Teams'],
      tags: ['milestone', 'stability'],
      completion_before: 75,
      completion_after: 87,
      timestamp: new Date(2024, 11, 31, 23, 59),
      metadata: { layer: 23, framework: '23L' }
    },

    // December 28, 2024
    {
      user_id: 7,
      project_id: 'community-features',
      project_title: 'Community Features Enhancement',
      activity_type: 'updated' as const,
      description: 'Housing and recommendations components',
      changes: [
        'HostHomesList with sophisticated filtering',
        'RecommendationsList with local/visitor logic',
        'GroupDetailPageMT integration'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['community', 'features'],
      completion_before: 50,
      completion_after: 85,
      timestamp: new Date(2024, 11, 28, 14, 20),
      metadata: { layer: 7, framework: '23L' }
    },

    // December 25, 2024
    {
      user_id: 7,
      project_id: 'christmas-deployment',
      project_title: 'Christmas Production Deployment',
      activity_type: 'reviewed' as const,
      description: 'Production environment validation',
      changes: [
        'Load testing completed',
        'Backup systems verified',
        'Monitoring dashboards configured'
      ],
      team: ['DevOps', 'Backend'],
      tags: ['deployment', 'production'],
      completion_before: 90,
      completion_after: 95,
      timestamp: new Date(2024, 11, 25, 10, 0),
      metadata: { layer: 10, framework: '23L' }
    },

    // December 20, 2024
    {
      user_id: 7,
      project_id: 'automation-systems',
      project_title: 'Five Key Automation Systems',
      activity_type: 'created' as const,
      description: 'Comprehensive automation framework implementation',
      changes: [
        'City group auto-assignment',
        'Professional group mapping',
        'Automatic geocoding for events',
        'Host homes marketplace',
        'Recommendations system'
      ],
      team: ['Backend', 'Automation'],
      tags: ['automation', 'backend'],
      completion_before: 0,
      completion_after: 80,
      timestamp: new Date(2024, 11, 20, 16, 30),
      metadata: { layer: 8, framework: '23L' }
    },

    // December 15, 2024
    {
      user_id: 7,
      project_id: 'admin-center',
      project_title: 'Admin Center Development',
      activity_type: 'updated' as const,
      description: 'Added global statistics dashboard',
      changes: [
        'Live platform metrics API',
        'Real-time data updates',
        'Multi-tenant support'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['admin', 'dashboard'],
      completion_before: 40,
      completion_after: 75,
      timestamp: new Date(2024, 11, 15, 11, 45),
      metadata: { layer: 11, framework: '23L' }
    },

    // December 10, 2024
    {
      user_id: 7,
      project_id: 'host-onboarding',
      project_title: 'Host Onboarding Wizard',
      activity_type: 'created' as const,
      description: '8-step wizard inspired by Airbnb/VRBO',
      changes: [
        'Property type selection',
        'Location with geocoding',
        'Amenities selection',
        'Photo upload system',
        'Pricing configuration'
      ],
      team: ['Frontend', 'UX'],
      tags: ['host', 'onboarding'],
      completion_before: 0,
      completion_after: 60,
      timestamp: new Date(2024, 11, 10, 14, 0),
      metadata: { layer: 7, framework: '23L' }
    },

    // December 5, 2024
    {
      user_id: 7,
      project_id: '23l-framework',
      project_title: '23L Framework Creation',
      activity_type: 'created' as const,
      description: 'Comprehensive 23-layer production validation system',
      changes: [
        'Foundation layers 1-4 defined',
        'Architecture layers 5-8 established',
        'Operational layers 9-12 created',
        'AI layers 13-16 designed',
        'Human-centric layers 17-20',
        'Production engineering 21-23'
      ],
      team: ['Architecture', 'Documentation'],
      tags: ['framework', 'methodology'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2024, 11, 5, 9, 30),
      metadata: { layer: 1, framework: '23L' }
    },

    // December 1, 2024
    {
      user_id: 7,
      project_id: 'platform-foundation',
      project_title: 'Mundo Tango Platform Foundation',
      activity_type: 'created' as const,
      description: 'Initial platform architecture and setup',
      changes: [
        'Next.js/React frontend setup',
        'Node.js/Express backend',
        'PostgreSQL with Drizzle ORM',
        'OAuth authentication',
        'Tailwind CSS styling'
      ],
      team: ['Architecture', 'Full Stack'],
      tags: ['foundation', 'setup'],
      completion_before: 0,
      completion_after: 30,
      timestamp: new Date(2024, 11, 1, 10, 0),
      metadata: { layer: 5, framework: 'pre-23L' }
    }
  ];

  try {
    await db.insert(dailyActivities).values(activities);
    console.log('Successfully populated', activities.length, 'historical activities');
  } catch (error) {
    console.error('Error populating activities:', error);
  }
  
  process.exit(0);
}

populateHistoricalActivities();