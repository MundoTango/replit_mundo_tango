#!/usr/bin/env npx tsx
/**
 * MT-11 Sub-tasks Enhancement Script
 * Adds detailed sub-tasks to key stories in Mundo Tango Social Platform epic
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// Key stories to add sub-tasks to (these would be the issue keys created from previous script)
// For now, we'll create sub-tasks as standalone tasks under MT-11
const EPIC_KEY = 'MT-11';

// Detailed sub-tasks for key Mundo Tango features
const MT_11_SUBTASKS = [
  // User Profile System Sub-tasks
  {
    summary: 'Profile: Dance Level Slider Component',
    description: 'Implement interactive slider component for leader/follower levels (1-10 scale) with visual feedback and tooltips. Include beginner/intermediate/advanced labels.',
    labels: ['mundo-tango', 'profile', 'component', 'frontend', 'layer-7']
  },
  {
    summary: 'Profile: Tango Roles Multi-Select',
    description: 'Create multi-select component for 20+ tango roles with icons, descriptions, and search functionality. Include role impact on friend suggestions.',
    labels: ['mundo-tango', 'profile', 'roles', 'frontend', 'layer-7']
  },
  {
    summary: 'Profile: Travel History Timeline',
    description: 'Build travel history component showing cities visited, dates, and events attended. Include map visualization and statistics.',
    labels: ['mundo-tango', 'profile', 'travel', 'frontend', 'layer-7']
  },
  {
    summary: 'Profile: Completion Gamification',
    description: 'Implement profile completion tracking with progress bars, achievements, and rewards for completing sections.',
    labels: ['mundo-tango', 'profile', 'gamification', 'frontend', 'layer-20']
  },
  {
    summary: 'Profile: Privacy Settings UI',
    description: 'Create granular privacy controls for each profile section with visibility options (public, friends, private).',
    labels: ['mundo-tango', 'profile', 'privacy', 'frontend', 'layer-14']
  },

  // Memory Timeline Sub-tasks
  {
    summary: 'Timeline: Rich Text Editor',
    description: 'Implement Quill-based rich text editor with mentions (@users), hashtags, and formatting options for memory posts.',
    labels: ['mundo-tango', 'timeline', 'editor', 'frontend', 'layer-7']
  },
  {
    summary: 'Timeline: Media Upload Pipeline',
    description: 'Build media upload system with drag-drop, progress tracking, automatic compression, and thumbnail generation.',
    labels: ['mundo-tango', 'timeline', 'media', 'backend', 'layer-9']
  },
  {
    summary: 'Timeline: Location Autocomplete',
    description: 'Integrate OpenStreetMap Nominatim for location search with debouncing and fallback to browser geolocation.',
    labels: ['mundo-tango', 'timeline', 'location', 'frontend', 'layer-15']
  },
  {
    summary: 'Timeline: Facebook-style Reactions',
    description: 'Implement reaction system with 6 emotion types, hover selector, and real-time reaction counts.',
    labels: ['mundo-tango', 'timeline', 'reactions', 'frontend', 'layer-8']
  },
  {
    summary: 'Timeline: Infinite Scroll Optimization',
    description: 'Optimize timeline with virtual scrolling, progressive image loading, and memory cleanup for 1000+ posts.',
    labels: ['mundo-tango', 'timeline', 'performance', 'frontend', 'layer-16']
  },

  // Group Management Sub-tasks
  {
    summary: 'Groups: Auto-Join by Location',
    description: 'Implement automatic city group assignment during registration based on user location with geocoding.',
    labels: ['mundo-tango', 'groups', 'automation', 'backend', 'layer-6']
  },
  {
    summary: 'Groups: Member Role Management',
    description: 'Create UI for assigning group roles (admin, moderator, member) with permission management.',
    labels: ['mundo-tango', 'groups', 'roles', 'frontend', 'layer-3']
  },
  {
    summary: 'Groups: Event Calendar Integration',
    description: 'Build group event calendar with RSVP system, recurring events, and capacity management.',
    labels: ['mundo-tango', 'groups', 'events', 'frontend', 'layer-8']
  },
  {
    summary: 'Groups: Discussion Forums',
    description: 'Implement threaded discussions within groups with moderation tools and pinned posts.',
    labels: ['mundo-tango', 'groups', 'forums', 'frontend', 'layer-8']
  },
  {
    summary: 'Groups: Invitation System',
    description: 'Create group invitation system with email invites, link sharing, and approval workflows.',
    labels: ['mundo-tango', 'groups', 'invitations', 'backend', 'layer-6']
  },

  // Friend System Sub-tasks
  {
    summary: 'Friends: Suggestion Algorithm',
    description: 'Implement ML-based friend suggestions using location, mutual friends, shared groups, and dance compatibility.',
    labels: ['mundo-tango', 'friends', 'ml', 'backend', 'layer-24']
  },
  {
    summary: 'Friends: Request Management UI',
    description: 'Build friend request interface with accept/decline, mutual friends display, and batch actions.',
    labels: ['mundo-tango', 'friends', 'ui', 'frontend', 'layer-7']
  },
  {
    summary: 'Friends: Network Visualization',
    description: 'Create interactive network graph showing friend connections and degrees of separation.',
    labels: ['mundo-tango', 'friends', 'visualization', 'frontend', 'layer-7']
  },
  {
    summary: 'Friends: Follow vs Friend System',
    description: 'Implement dual system for following (one-way) vs friends (mutual) with different permission levels.',
    labels: ['mundo-tango', 'friends', 'follow', 'backend', 'layer-6']
  },
  {
    summary: 'Friends: Activity Feed Filter',
    description: 'Create feed filters for friends-only content, close friends, and custom friend lists.',
    labels: ['mundo-tango', 'friends', 'feed', 'frontend', 'layer-8']
  },

  // Notification System Sub-tasks
  {
    summary: 'Notifications: Real-time WebSocket',
    description: 'Implement WebSocket connection for real-time notifications with reconnection logic and offline queuing.',
    labels: ['mundo-tango', 'notifications', 'websocket', 'backend', 'layer-5']
  },
  {
    summary: 'Notifications: Preference Center',
    description: 'Build notification preferences UI with granular controls for each notification type and delivery method.',
    labels: ['mundo-tango', 'notifications', 'preferences', 'frontend', 'layer-7']
  },
  {
    summary: 'Notifications: Email Templates',
    description: 'Create responsive email templates for all notification types with unsubscribe links and branding.',
    labels: ['mundo-tango', 'notifications', 'email', 'frontend', 'layer-12']
  },
  {
    summary: 'Notifications: Push Service',
    description: 'Implement web push notifications with service worker, permission handling, and device management.',
    labels: ['mundo-tango', 'notifications', 'push', 'backend', 'layer-10']
  },
  {
    summary: 'Notifications: Batching Logic',
    description: 'Create intelligent notification batching to prevent spam with daily/weekly digest options.',
    labels: ['mundo-tango', 'notifications', 'batching', 'backend', 'layer-6']
  },

  // Events System Sub-tasks
  {
    summary: 'Events: Ticketing Integration',
    description: 'Implement Stripe-based ticketing system with QR codes, refunds, and transfer capabilities.',
    labels: ['mundo-tango', 'events', 'payments', 'backend', 'layer-18']
  },
  {
    summary: 'Events: RSVP Management',
    description: 'Build RSVP system with waitlists, plus-ones, and automatic confirmations.',
    labels: ['mundo-tango', 'events', 'rsvp', 'backend', 'layer-8']
  },
  {
    summary: 'Events: Recurring Events',
    description: 'Implement recurring event creation with custom patterns and exception handling.',
    labels: ['mundo-tango', 'events', 'recurring', 'backend', 'layer-8']
  },
  {
    summary: 'Events: Check-in System',
    description: 'Create mobile-friendly check-in interface with QR scanning and attendance tracking.',
    labels: ['mundo-tango', 'events', 'checkin', 'frontend', 'layer-8']
  },
  {
    summary: 'Events: Analytics Dashboard',
    description: 'Build event analytics showing attendance trends, demographics, and engagement metrics.',
    labels: ['mundo-tango', 'events', 'analytics', 'frontend', 'layer-11']
  },

  // Community Map Sub-tasks
  {
    summary: 'Map: Leaflet Integration',
    description: 'Integrate Leaflet.js with OpenStreetMap tiles, clustering, and custom markers.',
    labels: ['mundo-tango', 'map', 'leaflet', 'frontend', 'layer-7']
  },
  {
    summary: 'Map: Layer Toggle System',
    description: 'Implement toggleable map layers for events, hosts, recommendations, and city groups.',
    labels: ['mundo-tango', 'map', 'layers', 'frontend', 'layer-7']
  },
  {
    summary: 'Map: Real-time Updates',
    description: 'Add WebSocket updates for live event changes and user locations on map.',
    labels: ['mundo-tango', 'map', 'realtime', 'frontend', 'layer-16']
  },
  {
    summary: 'Map: Mobile Optimization',
    description: 'Optimize map for mobile with touch gestures, location tracking, and performance.',
    labels: ['mundo-tango', 'map', 'mobile', 'frontend', 'layer-10']
  },
  {
    summary: 'Map: Search & Filters',
    description: 'Create map search with filters for date ranges, event types, and price ranges.',
    labels: ['mundo-tango', 'map', 'search', 'frontend', 'layer-7']
  },

  // Media System Sub-tasks
  {
    summary: 'Media: Image Optimization',
    description: 'Implement automatic image resizing, WebP conversion, and CDN integration.',
    labels: ['mundo-tango', 'media', 'images', 'backend', 'layer-9']
  },
  {
    summary: 'Media: Video Transcoding',
    description: 'Build video processing pipeline with HLS streaming and multiple quality levels.',
    labels: ['mundo-tango', 'media', 'video', 'backend', 'layer-9']
  },
  {
    summary: 'Media: Gallery Component',
    description: 'Create responsive photo gallery with lightbox, swipe gestures, and sharing.',
    labels: ['mundo-tango', 'media', 'gallery', 'frontend', 'layer-7']
  },
  {
    summary: 'Media: Face Detection',
    description: 'Implement privacy-preserving face detection for automatic photo tagging.',
    labels: ['mundo-tango', 'media', 'ai', 'backend', 'layer-24']
  },
  {
    summary: 'Media: Storage Management',
    description: 'Create user storage quotas, cleanup policies, and usage analytics.',
    labels: ['mundo-tango', 'media', 'storage', 'backend', 'layer-5']
  },

  // Search System Sub-tasks
  {
    summary: 'Search: Elasticsearch Setup',
    description: 'Configure Elasticsearch for users, posts, events, and groups with proper indexing.',
    labels: ['mundo-tango', 'search', 'elasticsearch', 'backend', 'layer-4']
  },
  {
    summary: 'Search: Autocomplete UI',
    description: 'Build search autocomplete with categorized results and keyboard navigation.',
    labels: ['mundo-tango', 'search', 'autocomplete', 'frontend', 'layer-7']
  },
  {
    summary: 'Search: Advanced Filters',
    description: 'Implement advanced search filters for location, date, type, and custom fields.',
    labels: ['mundo-tango', 'search', 'filters', 'frontend', 'layer-7']
  },
  {
    summary: 'Search: Relevance Tuning',
    description: 'Optimize search relevance with boosting, synonyms, and user behavior.',
    labels: ['mundo-tango', 'search', 'relevance', 'backend', 'layer-6']
  },
  {
    summary: 'Search: Multi-language Support',
    description: 'Add language-specific analyzers and stemming for international search.',
    labels: ['mundo-tango', 'search', 'i18n', 'backend', 'layer-15']
  },

  // Performance Sub-tasks
  {
    summary: 'Performance: Redis Caching',
    description: 'Implement Redis caching for feeds, user data, and frequently accessed content.',
    labels: ['mundo-tango', 'performance', 'redis', 'backend', 'layer-16']
  },
  {
    summary: 'Performance: Database Indexes',
    description: 'Create optimal database indexes for all query patterns with monitoring.',
    labels: ['mundo-tango', 'performance', 'database', 'backend', 'layer-2']
  },
  {
    summary: 'Performance: Bundle Optimization',
    description: 'Optimize JavaScript bundles with code splitting and lazy loading.',
    labels: ['mundo-tango', 'performance', 'bundle', 'frontend', 'layer-16']
  },
  {
    summary: 'Performance: Image Lazy Loading',
    description: 'Implement intersection observer for progressive image loading.',
    labels: ['mundo-tango', 'performance', 'images', 'frontend', 'layer-16']
  },
  {
    summary: 'Performance: API Response Time',
    description: 'Optimize API endpoints to respond in under 200ms with monitoring.',
    labels: ['mundo-tango', 'performance', 'api', 'backend', 'layer-16']
  }
];

// Helper function to convert text to ADF
function textToADF(text: string): any {
  return {
    version: 1,
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text
          }
        ]
      }
    ]
  };
}

// Helper function to create JIRA issue
async function createJiraIssue(issueData: any) {
  const authHeader = `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`;
  
  try {
    const response = await fetch(`${JIRA_CONFIG.instanceUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(issueData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create issue: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
}

// Main enhancement function
async function addMT11Subtasks() {
  console.log('🚀 Adding Detailed Sub-tasks to MT-11 (Mundo Tango Social Platform)...');
  console.log('================================================\n');
  console.log(`📋 Going deeper with implementation-level details`);
  console.log(`📋 Adding ${MT_11_SUBTASKS.length} detailed sub-tasks\n`);
  
  let successfulSubtasks = 0;
  
  for (const subtask of MT_11_SUBTASKS) {
    try {
      const subtaskData = {
        fields: {
          project: { key: JIRA_CONFIG.projectKey },
          summary: subtask.summary,
          description: textToADF(subtask.description),
          issuetype: { name: 'Sub-task' },
          labels: subtask.labels,
          parent: { key: EPIC_KEY }
        }
      };
      
      const created = await createJiraIssue(subtaskData);
      console.log(`✅ Created: ${created.key} - ${subtask.summary}`);
      successfulSubtasks++;
    } catch (error) {
      // If sub-task creation fails, try creating as a regular task
      try {
        const taskData = {
          fields: {
            project: { key: JIRA_CONFIG.projectKey },
            summary: `[Sub] ${subtask.summary}`,
            description: textToADF(subtask.description),
            issuetype: { name: 'Task' },
            labels: [...subtask.labels, 'subtask'],
            parent: { key: EPIC_KEY }
          }
        };
        
        const created = await createJiraIssue(taskData);
        console.log(`✅ Created as Task: ${created.key} - ${subtask.summary}`);
        successfulSubtasks++;
      } catch (taskError) {
        console.error(`❌ Failed to create subtask: ${subtask.summary}`);
      }
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n================================================');
  console.log(`📊 Sub-task Enhancement Summary:`);
  console.log(`  Total sub-tasks attempted: ${MT_11_SUBTASKS.length}`);
  console.log(`  Successfully created: ${successfulSubtasks}`);
  console.log(`  Failed: ${MT_11_SUBTASKS.length - successfulSubtasks}`);
  console.log('\n✅ MT-11 deep enhancement complete!');
  console.log(`🔗 View MT-11: ${JIRA_CONFIG.instanceUrl}/browse/MT-11`);
}

// Execute enhancement
addMT11Subtasks().catch(console.error);