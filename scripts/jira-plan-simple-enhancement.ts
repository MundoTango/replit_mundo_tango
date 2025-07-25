#!/usr/bin/env npx tsx
/**
 * JIRA Plan Enhancement Script - Simplified Version
 * Adds more stories with plain text descriptions
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// Epic keys from our previous migration
const EPIC_KEYS = {
  'Life CEO AI Platform': 'MT-9',
  'Mundo Tango Social Platform': 'MT-11',
  'Frontend & UI/UX Systems': 'MT-13',
  'Backend API & Services': 'MT-15',
  'AI & Machine Learning Systems': 'MT-17',
  'Infrastructure & DevOps': 'MT-19',
  'Mobile App Development': 'MT-21'
};

// Additional stories for each epic with simplified descriptions
const ADDITIONAL_STORIES = {
  'Life CEO AI Platform': [
    {
      summary: 'Personal Agent Implementation',
      description: 'Implement the Personal Agent for daily routines, health tracking, and personal development. Includes habit tracking, health metrics monitoring, goal setting, wearable device integration, and progress reports.',
      labels: ['life-ceo', 'ai-agent', 'personal', 'layer-17', 'phase-8']
    },
    {
      summary: 'Travel Agent System',
      description: 'Build Travel Agent for trip planning, flight tracking, accommodations, and travel logistics. Features include itinerary management, real-time alerts, local recommendations, and expense tracking.',
      labels: ['life-ceo', 'ai-agent', 'travel', 'layer-17', 'phase-9']
    },
    {
      summary: 'Health Agent Development',
      description: 'Create Health Agent for medical record management, medication tracking, health metrics analysis, and appointment scheduling. Must be HIPAA compliant with secure storage.',
      labels: ['life-ceo', 'ai-agent', 'health', 'layer-17', 'phase-10']
    },
    {
      summary: 'Financial Agent System',
      description: 'Develop Financial Agent for budget tracking, investment monitoring, expense categorization, and financial goal planning. Includes bank integration and real-time alerts.',
      labels: ['life-ceo', 'ai-agent', 'finance', 'layer-17', 'phase-11']
    },
    {
      summary: 'Productivity Agent',
      description: 'Build Productivity Agent for task management, calendar optimization, focus time protection, and meeting scheduling. Features Pomodoro tracking and deep work analytics.',
      labels: ['life-ceo', 'ai-agent', 'productivity', 'layer-17', 'phase-12']
    }
  ],
  'Mundo Tango Social Platform': [
    {
      summary: 'Advanced Event Management System',
      description: 'Enhance events with ticketing, payment processing, RSVP management, waitlists, recurring events, and QR code check-in. Includes organizer dashboard with analytics.',
      labels: ['mundo-tango', 'events', 'payments', 'layer-8', 'phase-11']
    },
    {
      summary: 'Community Recommendation Engine',
      description: 'Build AI-powered recommendations for events, friends, content, and teacher-student matching. Uses collaborative filtering and machine learning for personalization.',
      labels: ['mundo-tango', 'ml', 'recommendations', 'layer-24', 'phase-12']
    },
    {
      summary: 'Video Streaming Platform',
      description: 'Implement live streaming and video on demand for classes and performances. Features multi-bitrate streaming, chat, recording, and CDN integration.',
      labels: ['mundo-tango', 'video', 'streaming', 'layer-9', 'phase-13']
    },
    {
      summary: 'Marketplace Integration',
      description: 'Create marketplace for dance shoes, clothing, and accessories. Includes vendor management, payment processing, shipping integration, and review system.',
      labels: ['mundo-tango', 'marketplace', 'ecommerce', 'layer-8', 'phase-14']
    },
    {
      summary: 'Dance Partner Matching',
      description: 'Build intelligent partner matching based on level, style, location, and availability. Features compatibility scoring and practice session scheduling.',
      labels: ['mundo-tango', 'matching', 'social', 'layer-8', 'phase-15']
    }
  ],
  'Frontend & UI/UX Systems': [
    {
      summary: 'Design System 2.0',
      description: 'Complete design system overhaul with 50+ components, dark/light themes, WCAG AA compliance, responsive design, and animation library. Includes Storybook documentation.',
      labels: ['frontend', 'design-system', 'ui', 'layer-7', 'phase-14']
    },
    {
      summary: 'Progressive Web App Enhancement',
      description: 'Transform to full PWA with offline capabilities, background sync, push notifications, and installability. Implements service workers and IndexedDB.',
      labels: ['frontend', 'pwa', 'mobile', 'layer-7', 'phase-15']
    },
    {
      summary: 'Real-time Collaboration Features',
      description: 'Add live cursors, real-time document editing, presence indicators, and instant messaging. Uses WebSockets and Operational Transformation.',
      labels: ['frontend', 'realtime', 'collaboration', 'layer-7', 'phase-16']
    },
    {
      summary: 'Advanced Animation System',
      description: 'Create comprehensive animation library with micro-interactions, page transitions, gesture support, and performance optimization.',
      labels: ['frontend', 'animation', 'ux', 'layer-7', 'phase-17']
    },
    {
      summary: 'Accessibility Enhancement',
      description: 'Achieve WCAG AAA compliance with screen reader optimization, keyboard navigation, high contrast modes, and voice navigation support.',
      labels: ['frontend', 'accessibility', 'a11y', 'layer-7', 'phase-18']
    }
  ],
  'Backend API & Services': [
    {
      summary: 'GraphQL API Layer',
      description: 'Implement GraphQL alongside REST for flexible data fetching. Includes schema design, query optimization, subscriptions, and persisted queries.',
      labels: ['backend', 'graphql', 'api', 'layer-4', 'phase-17']
    },
    {
      summary: 'Event-Driven Architecture',
      description: 'Implement event sourcing and CQRS for scalability. Features event store, command/query separation, saga orchestration, and event replay.',
      labels: ['backend', 'architecture', 'events', 'layer-3', 'phase-18']
    },
    {
      summary: 'Multi-tenant Data Isolation',
      description: 'Enhance multi-tenancy with schema-based isolation, automated provisioning, cross-tenant analytics, and compliance reporting.',
      labels: ['backend', 'multi-tenant', 'database', 'layer-2', 'phase-19']
    },
    {
      summary: 'Advanced Caching Strategy',
      description: 'Implement multi-layer caching with Redis clusters, edge caching, intelligent invalidation, and cache warming strategies.',
      labels: ['backend', 'caching', 'performance', 'layer-4', 'phase-20']
    },
    {
      summary: 'API Gateway Implementation',
      description: 'Build API gateway for routing, authentication, rate limiting, request transformation, and API versioning.',
      labels: ['backend', 'api-gateway', 'infrastructure', 'layer-4', 'phase-21']
    }
  ],
  'AI & Machine Learning Systems': [
    {
      summary: 'Natural Language Processing Pipeline',
      description: 'Build NLP for multi-language support, sentiment analysis, content categorization, and toxicity detection. Uses transformer models with GPU inference.',
      labels: ['ai', 'nlp', 'ml', 'layer-24', 'phase-10']
    },
    {
      summary: 'Computer Vision for Media',
      description: 'Implement computer vision for content moderation, face detection, dance pose analysis, and video highlights. Includes edge deployment.',
      labels: ['ai', 'computer-vision', 'ml', 'layer-24', 'phase-11']
    },
    {
      summary: 'Predictive Analytics Dashboard',
      description: 'Create predictive analytics for user churn, event attendance, content virality, and revenue forecasting. Features explainable AI.',
      labels: ['ai', 'analytics', 'ml', 'layer-24', 'phase-12']
    },
    {
      summary: 'Personalization Engine',
      description: 'Build deep learning personalization for content feeds, notifications, and user experiences. Includes A/B testing and real-time adaptation.',
      labels: ['ai', 'personalization', 'ml', 'layer-24', 'phase-13']
    },
    {
      summary: 'Fraud Detection System',
      description: 'Implement ML-based fraud detection for fake accounts, spam content, and payment fraud. Features real-time scoring and pattern recognition.',
      labels: ['ai', 'fraud-detection', 'ml', 'layer-24', 'phase-14']
    }
  ],
  'Infrastructure & DevOps': [
    {
      summary: 'Kubernetes Migration',
      description: 'Migrate to Kubernetes with containerization, Helm charts, auto-scaling, service mesh, and GitOps deployment using ArgoCD.',
      labels: ['infrastructure', 'kubernetes', 'devops', 'layer-5', 'phase-18']
    },
    {
      summary: 'Global CDN Implementation',
      description: 'Deploy global CDN with edge computing, smart routing, DDoS protection, and real-time purging. Uses Cloudflare Workers.',
      labels: ['infrastructure', 'cdn', 'performance', 'layer-5', 'phase-19']
    },
    {
      summary: 'Disaster Recovery System',
      description: 'Implement disaster recovery with automated backups, multi-region failover, data replication, and chaos engineering testing.',
      labels: ['infrastructure', 'dr', 'reliability', 'layer-23', 'phase-20']
    },
    {
      summary: 'Observability Platform',
      description: 'Build comprehensive observability with distributed tracing, log aggregation, metrics collection, and intelligent alerting.',
      labels: ['infrastructure', 'observability', 'monitoring', 'layer-11', 'phase-21']
    },
    {
      summary: 'Security Hardening',
      description: 'Implement zero-trust architecture, secrets management, vulnerability scanning, and security incident response automation.',
      labels: ['infrastructure', 'security', 'compliance', 'layer-22', 'phase-22']
    }
  ],
  'Mobile App Development': [
    {
      summary: 'Native iOS App Development',
      description: 'Build native iOS app with Swift UI, offline-first architecture, biometric authentication, and Apple Pay. Includes App Store optimization.',
      labels: ['mobile', 'ios', 'native', 'layer-26', 'phase-15']
    },
    {
      summary: 'Native Android App Development',
      description: 'Build native Android app with Kotlin and Material Design 3, Google Pay integration, and Wear OS companion app.',
      labels: ['mobile', 'android', 'native', 'layer-26', 'phase-16']
    },
    {
      summary: 'Cross-Platform Synchronization',
      description: 'Build real-time sync between platforms with conflict resolution, offline queues, and delta sync using CRDTs.',
      labels: ['mobile', 'sync', 'cross-platform', 'layer-26', 'phase-17']
    },
    {
      summary: 'Mobile Performance Optimization',
      description: 'Optimize mobile apps for battery life, network usage, startup time, and memory consumption. Includes code splitting.',
      labels: ['mobile', 'performance', 'optimization', 'layer-26', 'phase-18']
    },
    {
      summary: 'Mobile Analytics Integration',
      description: 'Implement comprehensive mobile analytics with user journey tracking, crash reporting, and performance monitoring.',
      labels: ['mobile', 'analytics', 'monitoring', 'layer-26', 'phase-19']
    }
  ]
};

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
async function enhanceJiraPlan() {
  console.log('🚀 Enhancing JIRA Plan with Additional Stories (Simplified)...');
  console.log('================================================\n');
  
  let totalStories = 0;
  let successfulStories = 0;
  
  for (const [epicName, epicKey] of Object.entries(EPIC_KEYS)) {
    const stories = ADDITIONAL_STORIES[epicName as keyof typeof ADDITIONAL_STORIES] || [];
    
    if (stories.length > 0) {
      console.log(`\n📋 Adding stories to ${epicName} (${epicKey}):`);
      
      for (const story of stories) {
        try {
          const storyData = {
            fields: {
              project: { key: JIRA_CONFIG.projectKey },
              summary: story.summary,
              description: textToADF(story.description),
              issuetype: { name: 'Task' }, // Using Task as Story
              labels: story.labels,
              parent: { key: epicKey }
            }
          };
          
          const created = await createJiraIssue(storyData);
          console.log(`  ✅ Created: ${created.key} - ${story.summary}`);
          successfulStories++;
        } catch (error) {
          console.error(`  ❌ Failed to create story: ${story.summary}`);
        }
        totalStories++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  console.log('\n================================================');
  console.log(`📊 Enhancement Summary:`);
  console.log(`  Total stories attempted: ${totalStories}`);
  console.log(`  Successfully created: ${successfulStories}`);
  console.log(`  Failed: ${totalStories - successfulStories}`);
  console.log('\n✅ Enhancement complete!');
  console.log(`🔗 View your enhanced plan: ${JIRA_CONFIG.instanceUrl}/jira/plans/1/scenarios/1/timeline?vid=4`);
}

// Execute enhancement
enhanceJiraPlan().catch(console.error);