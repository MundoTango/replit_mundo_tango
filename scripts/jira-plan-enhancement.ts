#!/usr/bin/env npx tsx
/**
 * JIRA Plan Enhancement Script
 * Adds more stories and details to existing MT project epics
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

// Additional stories for each epic
const ADDITIONAL_STORIES = {
  'Life CEO AI Platform': [
    {
      summary: 'Personal Agent Implementation',
      description: `Implement the Personal Agent for Life CEO system managing daily routines, health tracking, and personal development.

**Acceptance Criteria:**
- [ ] Agent tracks daily habits and routines
- [ ] Health metrics monitoring (sleep, exercise, nutrition)
- [ ] Personal goal setting and tracking
- [ ] Integration with wearable devices
- [ ] Daily/weekly progress reports

**Technical Requirements:**
- OpenAI GPT-4 integration
- Real-time data processing
- Mobile-first interface
- Voice command support

**40x20s Framework:**
- Layer: 17 (AI Agent Architecture)
- Phase: 8 (Implementation)`,
      labels: ['life-ceo', 'ai-agent', 'personal', 'layer-17', 'phase-8'],
      storyPoints: 8
    },
    {
      summary: 'Travel Agent System',
      description: `Build comprehensive Travel Agent for managing trips, accommodations, and travel logistics.

**Acceptance Criteria:**
- [ ] Trip planning and itinerary management
- [ ] Flight and accommodation tracking
- [ ] Local recommendations integration
- [ ] Real-time travel alerts
- [ ] Expense tracking for trips

**Technical Requirements:**
- Integration with travel APIs (Amadeus, Booking.com)
- Offline capability for travel documents
- Multi-currency support
- Calendar synchronization

**40x20s Framework:**
- Layer: 17 (AI Agent Architecture)
- Phase: 9 (Integration)`,
      labels: ['life-ceo', 'ai-agent', 'travel', 'layer-17', 'phase-9'],
      storyPoints: 13
    },
    {
      summary: 'Health Agent Development',
      description: `Create Health Agent for comprehensive health monitoring and medical record management.

**Acceptance Criteria:**
- [ ] Medical record digitization and storage
- [ ] Medication reminders and tracking
- [ ] Health metrics analysis and trends
- [ ] Doctor appointment scheduling
- [ ] Emergency contact system

**Technical Requirements:**
- HIPAA compliant data storage
- Integration with health APIs
- Secure document upload
- Biometric data processing

**40x20s Framework:**
- Layer: 17 (AI Agent Architecture)
- Phase: 10 (Security)`,
      labels: ['life-ceo', 'ai-agent', 'health', 'layer-17', 'phase-10'],
      storyPoints: 21
    }
  ],
  'Mundo Tango Social Platform': [
    {
      summary: 'Advanced Event Management System',
      description: `Enhance event system with ticketing, RSVPs, and organizer tools.

**Acceptance Criteria:**
- [ ] Event ticketing system with payment integration
- [ ] RSVP management with waitlists
- [ ] Event series and recurring events
- [ ] Organizer dashboard with analytics
- [ ] QR code check-in system

**Technical Requirements:**
- Stripe payment integration
- QR code generation
- Real-time capacity tracking
- Email notification system

**40x20s Framework:**
- Layer: 8 (Core Features)
- Phase: 11 (Enhancement)`,
      labels: ['mundo-tango', 'events', 'payments', 'layer-8', 'phase-11'],
      storyPoints: 13
    },
    {
      summary: 'Community Recommendation Engine',
      description: `Build AI-powered recommendation system for events, people, and content.

**Acceptance Criteria:**
- [ ] Personalized event recommendations
- [ ] Friend suggestions based on dance style
- [ ] Content recommendations (posts, videos)
- [ ] Teacher/student matching
- [ ] Venue recommendations

**Technical Requirements:**
- Machine learning models
- Collaborative filtering
- Real-time processing
- A/B testing framework

**40x20s Framework:**
- Layer: 24 (Machine Learning)
- Phase: 12 (Intelligence)`,
      labels: ['mundo-tango', 'ml', 'recommendations', 'layer-24', 'phase-12'],
      storyPoints: 21
    },
    {
      summary: 'Video Streaming Platform',
      description: `Implement video streaming for classes, performances, and events.

**Acceptance Criteria:**
- [ ] Live streaming capability
- [ ] Video on demand library
- [ ] Multi-bitrate streaming
- [ ] Chat during live streams
- [ ] Recording and replay features

**Technical Requirements:**
- WebRTC implementation
- CDN integration
- Video transcoding
- Storage optimization

**40x20s Framework:**
- Layer: 9 (Media Handling)
- Phase: 13 (Streaming)`,
      labels: ['mundo-tango', 'video', 'streaming', 'layer-9', 'phase-13'],
      storyPoints: 34
    }
  ],
  'Frontend & UI/UX Systems': [
    {
      summary: 'Design System 2.0',
      description: `Complete overhaul of design system with accessibility and theming.

**Acceptance Criteria:**
- [ ] Component library with 50+ components
- [ ] Dark/light theme support
- [ ] WCAG AA accessibility compliance
- [ ] Responsive design system
- [ ] Animation library

**Technical Requirements:**
- Storybook documentation
- Figma design tokens
- CSS-in-JS theming
- Performance budgets

**40x20s Framework:**
- Layer: 7 (Frontend)
- Phase: 14 (Polish)`,
      labels: ['frontend', 'design-system', 'ui', 'layer-7', 'phase-14'],
      storyPoints: 21
    },
    {
      summary: 'Progressive Web App Enhancement',
      description: `Transform platform into full PWA with offline capabilities.

**Acceptance Criteria:**
- [ ] Offline-first architecture
- [ ] Background sync
- [ ] Push notifications
- [ ] App-like navigation
- [ ] Install prompts

**Technical Requirements:**
- Service Worker implementation
- IndexedDB for offline storage
- Web Push API
- App manifest optimization

**40x20s Framework:**
- Layer: 7 (Frontend)
- Phase: 15 (Mobile)`,
      labels: ['frontend', 'pwa', 'mobile', 'layer-7', 'phase-15'],
      storyPoints: 13
    },
    {
      summary: 'Real-time Collaboration Features',
      description: `Add real-time collaborative features across the platform.

**Acceptance Criteria:**
- [ ] Live cursors in shared spaces
- [ ] Real-time document editing
- [ ] Presence indicators
- [ ] Live activity feeds
- [ ] Instant messaging

**Technical Requirements:**
- WebSocket implementation
- Operational Transformation
- Presence service
- Message queue system

**40x20s Framework:**
- Layer: 7 (Frontend)
- Phase: 16 (Collaboration)`,
      labels: ['frontend', 'realtime', 'collaboration', 'layer-7', 'phase-16'],
      storyPoints: 21
    }
  ],
  'Backend API & Services': [
    {
      summary: 'GraphQL API Layer',
      description: `Implement GraphQL API alongside REST for flexible data fetching.

**Acceptance Criteria:**
- [ ] GraphQL schema design
- [ ] Query optimization
- [ ] Subscription support
- [ ] Authentication/authorization
- [ ] Rate limiting

**Technical Requirements:**
- Apollo Server setup
- DataLoader for N+1 prevention
- Schema stitching
- Persisted queries

**40x20s Framework:**
- Layer: 4 (API Layer)
- Phase: 17 (Evolution)`,
      labels: ['backend', 'graphql', 'api', 'layer-4', 'phase-17'],
      storyPoints: 21
    },
    {
      summary: 'Event-Driven Architecture',
      description: `Implement event sourcing and CQRS patterns for scalability.

**Acceptance Criteria:**
- [ ] Event store implementation
- [ ] Command/query separation
- [ ] Event replay capability
- [ ] Saga orchestration
- [ ] Event versioning

**Technical Requirements:**
- Kafka or EventStore
- Event schema registry
- Projection builders
- Compensation logic

**40x20s Framework:**
- Layer: 3 (Architecture)
- Phase: 18 (Scale)`,
      labels: ['backend', 'architecture', 'events', 'layer-3', 'phase-18'],
      storyPoints: 34
    },
    {
      summary: 'Multi-tenant Data Isolation',
      description: `Enhance multi-tenant architecture with complete data isolation.

**Acceptance Criteria:**
- [ ] Schema-based isolation
- [ ] Tenant provisioning automation
- [ ] Cross-tenant analytics
- [ ] Backup per tenant
- [ ] Compliance reporting

**Technical Requirements:**
- PostgreSQL schemas
- Automated migrations
- Tenant routing
- Isolated caching

**40x20s Framework:**
- Layer: 2 (Database)
- Phase: 19 (Enterprise)`,
      labels: ['backend', 'multi-tenant', 'database', 'layer-2', 'phase-19'],
      storyPoints: 21
    }
  ],
  'AI & Machine Learning Systems': [
    {
      summary: 'Natural Language Processing Pipeline',
      description: `Build NLP pipeline for content moderation and understanding.

**Acceptance Criteria:**
- [ ] Multi-language support (10+ languages)
- [ ] Sentiment analysis
- [ ] Content categorization
- [ ] Toxicity detection
- [ ] Named entity recognition

**Technical Requirements:**
- Transformer models
- GPU inference
- Model versioning
- A/B testing framework

**40x20s Framework:**
- Layer: 24 (Machine Learning)
- Phase: 10 (Intelligence)`,
      labels: ['ai', 'nlp', 'ml', 'layer-24', 'phase-10'],
      storyPoints: 21
    },
    {
      summary: 'Computer Vision for Media',
      description: `Implement computer vision for photo/video analysis and moderation.

**Acceptance Criteria:**
- [ ] Inappropriate content detection
- [ ] Face detection for privacy
- [ ] Dance pose analysis
- [ ] Video highlight extraction
- [ ] Image quality enhancement

**Technical Requirements:**
- TensorFlow/PyTorch models
- GPU clusters
- Edge deployment
- Model monitoring

**40x20s Framework:**
- Layer: 24 (Machine Learning)
- Phase: 11 (Vision)`,
      labels: ['ai', 'computer-vision', 'ml', 'layer-24', 'phase-11'],
      storyPoints: 34
    },
    {
      summary: 'Predictive Analytics Dashboard',
      description: `Create predictive analytics for user behavior and platform growth.

**Acceptance Criteria:**
- [ ] User churn prediction
- [ ] Event attendance forecasting
- [ ] Content virality prediction
- [ ] Revenue forecasting
- [ ] Anomaly detection

**Technical Requirements:**
- Time series models
- Real-time scoring
- Explainable AI
- Dashboard integration

**40x20s Framework:**
- Layer: 24 (Machine Learning)
- Phase: 12 (Analytics)`,
      labels: ['ai', 'analytics', 'ml', 'layer-24', 'phase-12'],
      storyPoints: 21
    }
  ],
  'Infrastructure & DevOps': [
    {
      summary: 'Kubernetes Migration',
      description: `Migrate platform to Kubernetes for orchestration and scaling.

**Acceptance Criteria:**
- [ ] Containerization of all services
- [ ] Helm charts creation
- [ ] Auto-scaling policies
- [ ] Service mesh implementation
- [ ] GitOps deployment

**Technical Requirements:**
- Docker optimization
- Istio service mesh
- ArgoCD for GitOps
- Prometheus monitoring

**40x20s Framework:**
- Layer: 5 (Infrastructure)
- Phase: 18 (Scale)`,
      labels: ['infrastructure', 'kubernetes', 'devops', 'layer-5', 'phase-18'],
      storyPoints: 34
    },
    {
      summary: 'Global CDN Implementation',
      description: `Deploy global CDN for worldwide performance optimization.

**Acceptance Criteria:**
- [ ] Multi-region deployment
- [ ] Edge computing functions
- [ ] Smart routing
- [ ] DDoS protection
- [ ] Real-time purging

**Technical Requirements:**
- Cloudflare Workers
- Edge caching strategies
- Geographic routing
- Performance monitoring

**40x20s Framework:**
- Layer: 5 (Infrastructure)
- Phase: 19 (Global)`,
      labels: ['infrastructure', 'cdn', 'performance', 'layer-5', 'phase-19'],
      storyPoints: 21
    },
    {
      summary: 'Disaster Recovery System',
      description: `Implement comprehensive disaster recovery and business continuity.

**Acceptance Criteria:**
- [ ] Automated backups (RPO < 1 hour)
- [ ] Multi-region failover (RTO < 5 minutes)
- [ ] Data replication
- [ ] Runbook automation
- [ ] Regular DR testing

**Technical Requirements:**
- Cross-region replication
- Automated failover
- Backup verification
- Chaos engineering

**40x20s Framework:**
- Layer: 23 (Business Continuity)
- Phase: 20 (Reliability)`,
      labels: ['infrastructure', 'dr', 'reliability', 'layer-23', 'phase-20'],
      storyPoints: 21
    }
  ],
  'Mobile App Development': [
    {
      summary: 'Native iOS App Development',
      description: `Build native iOS app with full feature parity to web platform.

**Acceptance Criteria:**
- [ ] Swift UI implementation
- [ ] Offline-first architecture
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Apple Pay integration

**Technical Requirements:**
- Swift 5.0+
- Core Data for offline
- CloudKit sync
- App Store optimization

**40x20s Framework:**
- Layer: 26 (Mobile)
- Phase: 15 (Native)`,
      labels: ['mobile', 'ios', 'native', 'layer-26', 'phase-15'],
      storyPoints: 55
    },
    {
      summary: 'Native Android App Development',
      description: `Build native Android app with Material Design 3.

**Acceptance Criteria:**
- [ ] Kotlin implementation
- [ ] Material You theming
- [ ] Background sync
- [ ] Google Pay integration
- [ ] Wear OS companion app

**Technical Requirements:**
- Kotlin + Compose
- Room database
- WorkManager
- Play Store optimization

**40x20s Framework:**
- Layer: 26 (Mobile)
- Phase: 16 (Native)`,
      labels: ['mobile', 'android', 'native', 'layer-26', 'phase-16'],
      storyPoints: 55
    },
    {
      summary: 'Cross-Platform Synchronization',
      description: `Build real-time sync between web, iOS, and Android platforms.

**Acceptance Criteria:**
- [ ] Real-time data sync
- [ ] Conflict resolution
- [ ] Offline queue management
- [ ] Binary data sync
- [ ] Version compatibility

**Technical Requirements:**
- WebSocket sync protocol
- CRDT implementation
- Delta sync
- Compression algorithms

**40x20s Framework:**
- Layer: 26 (Mobile)
- Phase: 17 (Sync)`,
      labels: ['mobile', 'sync', 'cross-platform', 'layer-26', 'phase-17'],
      storyPoints: 34
    }
  ]
};

// Helper function to convert markdown to ADF
function markdownToADF(markdown: string): any {
  const lines = markdown.split('\n');
  const content: any[] = [];
  
  lines.forEach(line => {
    if (line.startsWith('**') && line.endsWith('**')) {
      // Bold text
      const text = line.slice(2, -2);
      content.push({
        type: 'paragraph',
        content: [{
          type: 'text',
          text: text,
          marks: [{ type: 'strong' }]
        }]
      });
    } else if (line.startsWith('- [ ]')) {
      // Task list
      content.push({
        type: 'taskList',
        content: [{
          type: 'taskItem',
          attrs: { state: 'TODO' },
          content: [{
            type: 'text',
            text: line.slice(6)
          }]
        }]
      });
    } else if (line.trim() === '') {
      // Empty line - skip
    } else {
      // Regular paragraph
      content.push({
        type: 'paragraph',
        content: [{
          type: 'text',
          text: line
        }]
      });
    }
  });
  
  return {
    version: 1,
    type: 'doc',
    content: content
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
  console.log('🚀 Enhancing JIRA Plan with Additional Stories...');
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
              description: markdownToADF(story.description),
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