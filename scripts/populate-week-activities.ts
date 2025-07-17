import { db } from '../server/db';
import { dailyActivities } from '../shared/schema';

async function populateWeekActivities() {
  console.log('Populating activities for the past week...');
  
  const today = new Date();
  const activities = [
    // Yesterday - January 16
    {
      user_id: 7,
      project_id: 'guest-onboarding',
      project_title: 'Guest Onboarding System',
      activity_type: 'completed' as const,
      description: 'Completed comprehensive guest profile system',
      changes: [
        'Created GuestProfileDisplay component',
        'Added Guest Profile tab to user profiles',
        'Implemented privacy controls for guest data'
      ],
      team: ['Frontend', 'UX'],
      tags: ['guest', 'profile', 'production'],
      completion_before: 95,
      completion_after: 100,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 14, 30),
      metadata: { layer: 7, framework: '30L' }
    },
    {
      user_id: 7,
      project_id: 'ocean-theme',
      project_title: 'Ocean Theme Implementation',
      activity_type: 'updated' as const,
      description: 'Finalized turquoise-blue ocean theme migration',
      changes: [
        'Updated remaining components with ocean colors',
        'Fixed gradient inconsistencies',
        'Updated design system documentation'
      ],
      team: ['Frontend', 'Design'],
      tags: ['theme', 'design-system'],
      completion_before: 98,
      completion_after: 100,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 15),
      metadata: { layer: 4, framework: '30L' }
    },
    
    // January 15
    {
      user_id: 7,
      project_id: 'ocean-theme',
      project_title: 'Ocean Theme Implementation',
      activity_type: 'created' as const,
      description: 'Started ocean theme color scheme overhaul',
      changes: [
        'Created MUNDO_TANGO_DESIGN_SYSTEM.md',
        'Defined turquoise-blue gradient palette',
        'Updated CSS variables in index.css'
      ],
      team: ['Frontend', 'Design'],
      tags: ['theme', 'design-system'],
      completion_before: 0,
      completion_after: 60,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0),
      metadata: { layer: 4, framework: '23L' }
    },
    {
      user_id: 7,
      project_id: 'guest-onboarding',
      project_title: 'Guest Onboarding System',
      activity_type: 'updated' as const,
      description: 'Implemented sophisticated filtering system',
      changes: [
        'Added LinkedIn-style relationship filters',
        'Created date range picker for events',
        'Implemented local vs visitor recommendations'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['filtering', 'ux'],
      completion_before: 70,
      completion_after: 95,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 16, 45),
      metadata: { layer: 7, framework: '23L' }
    },
    
    // January 14
    {
      user_id: 7,
      project_id: '30l-framework',
      project_title: '30L Framework Enhancement',
      activity_type: 'created' as const,
      description: 'Evolved 23L to 30L Framework with new layers',
      changes: [
        'Added layers 24-30 for AI Ethics, Localization, Analytics',
        'Created Framework30LDashboard component',
        'Updated all references from 23L to 30L'
      ],
      team: ['Architecture', 'Documentation'],
      tags: ['framework', 'enhancement'],
      completion_before: 0,
      completion_after: 85,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 11, 20),
      metadata: { layer: 1, framework: '30L' }
    },
    
    // January 13
    {
      user_id: 7,
      project_id: 'performance-optimization',
      project_title: 'Performance Optimization',
      activity_type: 'completed' as const,
      description: 'Fixed critical cache issues causing delays',
      changes: [
        'Removed aggressive forceCacheClear() from App.tsx',
        'Added compression middleware to Express',
        'Created database indexes for frequent queries'
      ],
      team: ['Backend', 'Performance'],
      tags: ['performance', 'critical-fix'],
      completion_before: 80,
      completion_after: 100,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 15, 30),
      metadata: { layer: 10, framework: '23L' }
    },
    
    // January 12
    {
      user_id: 7,
      project_id: 'database-security',
      project_title: 'Database Security Enhancement',
      activity_type: 'updated' as const,
      description: 'Implemented comprehensive RLS policies',
      changes: [
        'Enabled RLS on 40 tables (up from 10)',
        'Created audit logging system',
        'Added health check functions'
      ],
      team: ['Backend', 'Security'],
      tags: ['security', 'database'],
      completion_before: 40,
      completion_after: 85,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 13, 0),
      metadata: { layer: 9, framework: '23L' }
    },
    
    // January 11
    {
      user_id: 7,
      project_id: 'group-events',
      project_title: 'Group Events Functionality',
      activity_type: 'completed' as const,
      description: 'Fixed group detail page tabs with live data',
      changes: [
        'About Tab shows dynamic group data',
        'Events Tab fetches city-based events',
        'Posts Tab displays group-specific posts'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['groups', 'events'],
      completion_before: 60,
      completion_after: 100,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 17, 45),
      metadata: { layer: 7, framework: '23L' }
    },
    
    // January 10
    {
      user_id: 7,
      project_id: 'multi-tenant-rbac',
      project_title: 'Multi-Tenant RBAC Implementation',
      activity_type: 'created' as const,
      description: 'Implemented super admin tenant switching',
      changes: [
        'Created TenantSwitcher component',
        'Integrated CASL for RBAC/ABAC',
        'Assigned super_admin role to Scott Boddye'
      ],
      team: ['Backend', 'Security'],
      tags: ['rbac', 'multi-tenant'],
      completion_before: 0,
      completion_after: 75,
      timestamp: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 10, 30),
      metadata: { layer: 9, framework: '23L' }
    }
  ];

  try {
    await db.insert(dailyActivities).values(activities);
    console.log('Successfully populated', activities.length, 'activities for the past week');
  } catch (error) {
    console.error('Error populating activities:', error);
  }
  
  process.exit(0);
}

populateWeekActivities();