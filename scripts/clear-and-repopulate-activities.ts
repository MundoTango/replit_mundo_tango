import { db } from '../server/db';
import { dailyActivities } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function clearAndRepopulateActivities() {
  console.log('Clearing all existing activities...');
  
  // Clear all existing activities
  await db.delete(dailyActivities);
  
  console.log('Populating activities for the past month (June 17 - July 17, 2025)...');
  
  const activities = [
    // Today - July 17, 2025
    {
      user_id: 7,
      project_id: '30l-framework-integration',
      project_title: '30L Framework Navigation Restructure',
      activity_type: 'updated' as const,
      description: 'Fixed Daily Activity data extraction and navigation structure',
      changes: [
        'Removed Daily Activity from main tabs',
        'Added 30L Framework as tab within The Plan',
        'Fixed JSON parsing in apiRequest'
      ],
      team: ['Frontend', 'Backend'],
      tags: ['30L', 'navigation', 'bugfix'],
      completion_before: 80,
      completion_after: 90,
      timestamp: new Date(2025, 6, 17, 9, 30),
      metadata: { layer: 7, framework: '30L' }
    },
    
    // July 16, 2025
    {
      user_id: 7,
      project_id: 'guest-onboarding',
      project_title: 'Guest Onboarding System',
      activity_type: 'completed' as const,
      description: 'Completed comprehensive guest profile system',
      changes: [
        'Created GuestProfileDisplay component',
        'Added Guest Profile tab to user profiles',
        'Implemented privacy controls'
      ],
      team: ['Frontend', 'UX'],
      tags: ['guest', 'profile', 'production'],
      completion_before: 95,
      completion_after: 100,
      timestamp: new Date(2025, 6, 16, 14, 30),
      metadata: { layer: 7, framework: '30L' }
    },
    
    // July 15, 2025
    {
      user_id: 7,
      project_id: 'ocean-theme',
      project_title: 'Ocean Theme Implementation',
      activity_type: 'created' as const,
      description: 'Started ocean theme color scheme overhaul',
      changes: [
        'Created MUNDO_TANGO_DESIGN_SYSTEM.md',
        'Defined turquoise-blue gradient palette',
        'Updated CSS variables'
      ],
      team: ['Frontend', 'Design'],
      tags: ['theme', 'design-system'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2025, 6, 15, 9, 0),
      metadata: { layer: 4, framework: '30L' }
    },
    
    // July 14, 2025
    {
      user_id: 7,
      project_id: '30l-framework',
      project_title: '30L Framework Enhancement',
      activity_type: 'created' as const,
      description: 'Evolved 23L to 30L Framework',
      changes: [
        'Added layers 24-30',
        'Created Framework30LDashboard',
        'Updated all references'
      ],
      team: ['Architecture'],
      tags: ['framework', 'enhancement'],
      completion_before: 0,
      completion_after: 85,
      timestamp: new Date(2025, 6, 14, 11, 20),
      metadata: { layer: 1, framework: '30L' }
    },
    
    // July 10, 2025
    {
      user_id: 7,
      project_id: 'multi-tenant-rbac',
      project_title: 'Multi-Tenant RBAC',
      activity_type: 'completed' as const,
      description: 'Super admin tenant switching',
      changes: [
        'TenantSwitcher component',
        'CASL integration',
        'Super admin role assignment'
      ],
      team: ['Backend', 'Security'],
      tags: ['rbac', 'multi-tenant'],
      completion_before: 75,
      completion_after: 100,
      timestamp: new Date(2025, 6, 10, 10, 30),
      metadata: { layer: 9, framework: '23L' }
    },
    
    // July 5, 2025
    {
      user_id: 7,
      project_id: 'database-security',
      project_title: 'Database Security',
      activity_type: 'updated' as const,
      description: 'Comprehensive RLS implementation',
      changes: [
        'RLS on 40 tables',
        'Audit logging system',
        'Health check functions'
      ],
      team: ['Backend', 'Security'],
      tags: ['security', 'database'],
      completion_before: 40,
      completion_after: 85,
      timestamp: new Date(2025, 6, 5, 13, 0),
      metadata: { layer: 5, framework: '23L' }
    },
    
    // June 30, 2025
    {
      user_id: 7,
      project_id: 'performance-optimization',
      project_title: 'Performance Optimization',
      activity_type: 'created' as const,
      description: 'Critical cache fixes',
      changes: [
        'Removed forceCacheClear',
        'Added compression',
        'Database indexes'
      ],
      team: ['Backend', 'Performance'],
      tags: ['performance', 'optimization'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2025, 5, 30, 15, 30),
      metadata: { layer: 10, framework: '23L' }
    },
    
    // June 25, 2025
    {
      user_id: 7,
      project_id: 'leaflet-maps',
      project_title: 'Interactive Maps',
      activity_type: 'created' as const,
      description: 'Leaflet.js integration',
      changes: [
        'OpenStreetMap tiles',
        'City group markers',
        'Interactive popups'
      ],
      team: ['Frontend'],
      tags: ['maps', 'open-source'],
      completion_before: 0,
      completion_after: 100,
      timestamp: new Date(2025, 5, 25, 14, 20),
      metadata: { layer: 7, framework: '23L' }
    },
    
    // June 20, 2025
    {
      user_id: 7,
      project_id: 'platform-foundation',
      project_title: 'Platform Setup',
      activity_type: 'created' as const,
      description: 'Initial Replit setup',
      changes: [
        'Next.js/React frontend',
        'Node.js/Express backend',
        'PostgreSQL database',
        'OAuth authentication'
      ],
      team: ['Full Stack'],
      tags: ['foundation', 'setup'],
      completion_before: 0,
      completion_after: 30,
      timestamp: new Date(2025, 5, 20, 10, 0),
      metadata: { layer: 5, framework: 'pre-23L' }
    }
  ];

  try {
    await db.insert(dailyActivities).values(activities);
    console.log('Successfully populated', activities.length, 'activities for the past month');
  } catch (error) {
    console.error('Error populating activities:', error);
  }
  
  process.exit(0);
}

clearAndRepopulateActivities();