#!/usr/bin/env npx tsx
/**
 * MT-11 Comprehensive Enhancement Script
 * Adds comprehensive stories to Mundo Tango Social Platform epic using 40x20s framework
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// MT-11 Epic key
const EPIC_KEY = 'MT-11';

// Comprehensive stories for Mundo Tango Social Platform based on 40x20s analysis
const MT_11_STORIES = [
  // Layer 1: Foundation
  {
    summary: 'User Profile System Enhancement',
    description: 'Complete user profile system with dance levels, roles (20+ tango roles), languages, travel details, and social connections. Includes profile completion tracking and gamification.',
    labels: ['mundo-tango', 'profiles', 'users', 'layer-1', 'phase-1']
  },
  {
    summary: 'Authentication & Multi-Factor Security',
    description: 'Implement OAuth2, biometric authentication, session management, and multi-factor authentication. Support for social logins and passwordless options.',
    labels: ['mundo-tango', 'security', 'auth', 'layer-1', 'phase-2']
  },
  
  // Layer 2: Database
  {
    summary: 'Social Graph Database Design',
    description: 'Implement graph database for social connections, friend relationships, followers/following, and network analysis. Support for friend-of-friend queries.',
    labels: ['mundo-tango', 'database', 'social-graph', 'layer-2', 'phase-3']
  },
  {
    summary: 'Activity Feed Architecture',
    description: 'Design and implement activity feed system with personalized timelines, memory posts, and real-time updates. Include caching and pagination.',
    labels: ['mundo-tango', 'feed', 'timeline', 'layer-2', 'phase-4']
  },
  
  // Layer 3: Architecture
  {
    summary: 'Group Management System',
    description: 'Complete group system for city groups, professional groups, and interest groups. Includes auto-join by location, group events, and member management.',
    labels: ['mundo-tango', 'groups', 'community', 'layer-3', 'phase-5']
  },
  {
    summary: 'Notification System Architecture',
    description: 'Real-time notification system with push, email, and in-app notifications. Role-based preferences and intelligent batching.',
    labels: ['mundo-tango', 'notifications', 'realtime', 'layer-3', 'phase-6']
  },
  
  // Layer 4: API Layer
  {
    summary: 'Social Media Integration APIs',
    description: 'APIs for Facebook, Instagram, Twitter integration. Share memories to social platforms and import content.',
    labels: ['mundo-tango', 'api', 'social-media', 'layer-4', 'phase-7']
  },
  {
    summary: 'Third-Party Developer APIs',
    description: 'Public APIs for third-party developers with OAuth2, rate limiting, webhooks, and comprehensive documentation.',
    labels: ['mundo-tango', 'api', 'developer', 'layer-4', 'phase-8']
  },
  
  // Layer 5: Infrastructure
  {
    summary: 'Global Content Delivery Network',
    description: 'CDN implementation for media assets, profile images, and video content. Geographic optimization and edge caching.',
    labels: ['mundo-tango', 'cdn', 'infrastructure', 'layer-5', 'phase-9']
  },
  {
    summary: 'Message Queue System',
    description: 'Implement message queues for async processing, email sending, notifications, and background jobs using BullMQ.',
    labels: ['mundo-tango', 'queues', 'infrastructure', 'layer-5', 'phase-10']
  },
  
  // Layer 6: Business Logic
  {
    summary: 'Friend Suggestion Algorithm',
    description: 'Intelligent friend suggestions based on location, mutual connections, dance roles, events attended, and interests.',
    labels: ['mundo-tango', 'friends', 'algorithm', 'layer-6', 'phase-11']
  },
  {
    summary: 'Content Moderation System',
    description: 'AI-powered content moderation for posts, comments, and media. Community reporting and admin review workflows.',
    labels: ['mundo-tango', 'moderation', 'safety', 'layer-6', 'phase-12']
  },
  
  // Layer 7: Frontend
  {
    summary: 'Interactive Community Maps',
    description: 'Real-time maps showing city groups, events, host homes, and recommendations. Layer toggles and clustering.',
    labels: ['mundo-tango', 'maps', 'frontend', 'layer-7', 'phase-13']
  },
  {
    summary: 'Rich Media Post Creator',
    description: 'Advanced post creation with rich text, mentions, tags, location, media embeds, and recommendation attachments.',
    labels: ['mundo-tango', 'posts', 'frontend', 'layer-7', 'phase-14']
  },
  
  // Layer 8: Core Features
  {
    summary: 'Memory Timeline System',
    description: 'Facebook-style timeline with memories, life events, milestones, and throwback features. Rich media support.',
    labels: ['mundo-tango', 'memories', 'timeline', 'layer-8', 'phase-15']
  },
  {
    summary: 'Guest & Host Matching',
    description: 'Complete hospitality system for matching guests with hosts. Booking system, reviews, and verification.',
    labels: ['mundo-tango', 'hospitality', 'matching', 'layer-8', 'phase-16']
  },
  
  // Layer 9: Media Handling
  {
    summary: 'Photo Gallery System',
    description: 'User photo galleries with albums, tagging, face detection, and sharing. Automatic compression and optimization.',
    labels: ['mundo-tango', 'photos', 'media', 'layer-9', 'phase-17']
  },
  {
    summary: 'Video Upload & Processing',
    description: 'Video upload system with transcoding, thumbnail generation, and streaming optimization. Support for dance videos.',
    labels: ['mundo-tango', 'video', 'media', 'layer-9', 'phase-18']
  },
  
  // Layer 10: Deployment
  {
    summary: 'Progressive Web App',
    description: 'PWA implementation with offline support, push notifications, and app-like experience on mobile devices.',
    labels: ['mundo-tango', 'pwa', 'mobile', 'layer-10', 'phase-19']
  },
  {
    summary: 'Multi-Region Deployment',
    description: 'Deploy to multiple regions for global performance. Database replication and geographic routing.',
    labels: ['mundo-tango', 'deployment', 'global', 'layer-10', 'phase-20']
  },
  
  // Layer 11: Analytics
  {
    summary: 'User Engagement Analytics',
    description: 'Track user engagement, retention, and growth metrics. Custom dashboards for community managers.',
    labels: ['mundo-tango', 'analytics', 'metrics', 'layer-11', 'phase-1']
  },
  {
    summary: 'Community Health Metrics',
    description: 'Monitor community health with activity levels, engagement rates, and toxicity detection.',
    labels: ['mundo-tango', 'analytics', 'community', 'layer-11', 'phase-2']
  },
  
  // Layer 12: Documentation
  {
    summary: 'User Onboarding System',
    description: 'Interactive onboarding with tutorials, tooltips, and progress tracking. Role-specific onboarding paths.',
    labels: ['mundo-tango', 'onboarding', 'ux', 'layer-12', 'phase-3']
  },
  {
    summary: 'Help Center & FAQs',
    description: 'Comprehensive help center with searchable FAQs, video tutorials, and community guidelines.',
    labels: ['mundo-tango', 'documentation', 'support', 'layer-12', 'phase-4']
  },
  
  // Layer 13: Testing
  {
    summary: 'Social Features E2E Testing',
    description: 'End-to-end tests for all social features including posts, comments, likes, shares, and friend requests.',
    labels: ['mundo-tango', 'testing', 'e2e', 'layer-13', 'phase-5']
  },
  {
    summary: 'Load Testing Social Interactions',
    description: 'Load test social features with thousands of concurrent users. Timeline rendering and notification delivery.',
    labels: ['mundo-tango', 'testing', 'performance', 'layer-13', 'phase-6']
  },
  
  // Layer 14: Security
  {
    summary: 'Privacy Controls System',
    description: 'Granular privacy controls for profiles, posts, and content. Block lists and visibility settings.',
    labels: ['mundo-tango', 'privacy', 'security', 'layer-14', 'phase-7']
  },
  {
    summary: 'Data Export & Portability',
    description: 'GDPR-compliant data export system. Users can download all their data in standard formats.',
    labels: ['mundo-tango', 'gdpr', 'privacy', 'layer-14', 'phase-8']
  },
  
  // Layer 15: Environmental
  {
    summary: 'Localization System',
    description: 'Support for 20+ languages with community translation tools. RTL support and cultural adaptations.',
    labels: ['mundo-tango', 'i18n', 'localization', 'layer-15', 'phase-9']
  },
  {
    summary: 'Accessibility Compliance',
    description: 'WCAG AAA compliance for all social features. Screen reader optimization and keyboard navigation.',
    labels: ['mundo-tango', 'accessibility', 'a11y', 'layer-15', 'phase-10']
  },
  
  // Layer 16: Performance
  {
    summary: 'Timeline Performance Optimization',
    description: 'Optimize timeline rendering to sub-3 second loads. Virtual scrolling and progressive loading.',
    labels: ['mundo-tango', 'performance', 'timeline', 'layer-16', 'phase-11']
  },
  {
    summary: 'Real-time Updates Optimization',
    description: 'Optimize WebSocket connections for real-time updates. Connection pooling and intelligent reconnection.',
    labels: ['mundo-tango', 'performance', 'realtime', 'layer-16', 'phase-12']
  },
  
  // Layer 17: AI Agent
  {
    summary: 'Community Manager AI Agent',
    description: 'AI agent for community management, conflict resolution, and engagement boosting.',
    labels: ['mundo-tango', 'ai-agent', 'community', 'layer-17', 'phase-13']
  },
  {
    summary: 'Content Recommendation AI',
    description: 'AI-powered content recommendations based on user preferences and behavior patterns.',
    labels: ['mundo-tango', 'ai', 'recommendations', 'layer-17', 'phase-14']
  },
  
  // Layer 18: Integration
  {
    summary: 'Calendar Integration',
    description: 'Sync events with Google Calendar, Apple Calendar, and Outlook. Two-way synchronization.',
    labels: ['mundo-tango', 'integration', 'calendar', 'layer-18', 'phase-15']
  },
  {
    summary: 'Payment Integration',
    description: 'Stripe integration for event tickets, premium features, and marketplace transactions.',
    labels: ['mundo-tango', 'payments', 'stripe', 'layer-18', 'phase-16']
  },
  
  // Layer 19: Monitoring
  {
    summary: 'Social Interaction Monitoring',
    description: 'Monitor social interactions for abuse, spam, and harmful content. Real-time alerts.',
    labels: ['mundo-tango', 'monitoring', 'safety', 'layer-19', 'phase-17']
  },
  {
    summary: 'Community Growth Tracking',
    description: 'Track community growth, engagement trends, and viral content. Predictive analytics.',
    labels: ['mundo-tango', 'monitoring', 'growth', 'layer-19', 'phase-18']
  },
  
  // Layer 20: Business Metrics
  {
    summary: 'Engagement Scoring System',
    description: 'Calculate user engagement scores for gamification and rewards. Leaderboards and achievements.',
    labels: ['mundo-tango', 'gamification', 'engagement', 'layer-20', 'phase-19']
  },
  {
    summary: 'Community Value Metrics',
    description: 'Measure community value creation, connections made, and social impact.',
    labels: ['mundo-tango', 'metrics', 'value', 'layer-20', 'phase-20']
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
async function enhanceMT11() {
  console.log('🚀 Enhancing MT-11 (Mundo Tango Social Platform) with Comprehensive Stories...');
  console.log('================================================\n');
  console.log(`📋 Using 40x20s Framework to ensure complete coverage`);
  console.log(`📋 Adding ${MT_11_STORIES.length} comprehensive stories to MT-11\n`);
  
  let successfulStories = 0;
  
  for (const story of MT_11_STORIES) {
    try {
      const storyData = {
        fields: {
          project: { key: JIRA_CONFIG.projectKey },
          summary: story.summary,
          description: textToADF(story.description),
          issuetype: { name: 'Task' },
          labels: story.labels,
          parent: { key: EPIC_KEY }
        }
      };
      
      const created = await createJiraIssue(storyData);
      console.log(`✅ Created: ${created.key} - ${story.summary}`);
      successfulStories++;
    } catch (error) {
      console.error(`❌ Failed to create story: ${story.summary}`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n================================================');
  console.log(`📊 Enhancement Summary:`);
  console.log(`  Total stories attempted: ${MT_11_STORIES.length}`);
  console.log(`  Successfully created: ${successfulStories}`);
  console.log(`  Failed: ${MT_11_STORIES.length - successfulStories}`);
  console.log('\n✅ MT-11 enhancement complete!');
  console.log(`🔗 View MT-11: ${JIRA_CONFIG.instanceUrl}/browse/MT-11`);
}

// Execute enhancement
enhanceMT11().catch(console.error);