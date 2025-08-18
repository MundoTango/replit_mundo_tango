#!/usr/bin/env npx tsx
/**
 * Life CEO 40x20s Comprehensive JIRA Migration Script
 * Creates all work items in MT project with proper hierarchy and metadata
 */

import fetch from 'node-fetch';

// JIRA Configuration
const JIRA_CONFIG = {
  instanceUrl: 'https://mundotango-team.atlassian.net',
  email: 'admin@mundotango.life',
  apiToken: 'ATATT3xFfGF0Nb_1iigWiEviNSi-kFvP965nAMjH9z8Vs9nGCu87drxemBvCdolRWcSuyDezhWll2jYjakMNp3k60H5J_eR_4uzXIb4ElbG04zEpMc2v1H7-ng_3huq3Ao41EE9VMVHWLKDFKY59whw24pQjc9Xr43lpoKTG2YLknL0o_iRHvQ8=517ED328',
  projectKey: 'MT'
};

// 40x20s Framework Layer Definitions
const FRAMEWORK_LAYERS = {
  1: 'Foundation',
  2: 'Database',
  3: 'Authentication',
  4: 'Authorization',
  5: 'Data Architecture',
  6: 'API Design',
  7: 'Frontend UI/UX',
  8: 'Mobile',
  9: 'PWA',
  10: 'API Implementation',
  11: 'Real-time',
  12: 'Background Jobs',
  13: 'Payment',
  14: 'Marketplace',
  15: 'Database Optimization',
  16: 'Data Migration',
  17: 'Search',
  18: 'Recommendation',
  19: 'Deployment',
  20: 'Infrastructure',
  21: 'Authentication Security',
  22: 'User Safety',
  23: 'AI/ML',
  24: 'NLP',
  25: 'Performance',
  26: 'Caching',
  27: 'Analytics',
  28: 'Monitoring',
  29: 'Cross-platform',
  30: 'Internationalization',
  31: 'Testing & Validation',
  32: 'Developer Experience',
  33: 'Data Migration & Evolution',
  34: 'Enhanced Observability',
  35: 'Feature Flags & Experimentation',
  36: 'API Documentation',
  37: 'Content Management',
  38: 'Integration Platform',
  39: 'Edge Computing',
  40: 'Future Tech'
};

// Platform-Level Epics
const PLATFORM_EPICS = [
  {
    key: 'LIFECEO',
    summary: 'Life CEO AI Platform',
    description: `Complete AI-powered life management system with 16 specialized agents.
    
**Platform Overview:**
- 16 AI agents managing different life aspects
- Voice command interface
- Mobile-first design
- OpenAI GPT-4 integration
- Real-time agent communication

**40x20s Coverage:** Layers 23-24 (AI/ML, NLP), 7-8 (UI/Mobile), 10-12 (API/Real-time)`,
    labels: ['platform-lifeceo', 'ai-system', '40x20s-core'],
    components: ['AI', 'Backend', 'Frontend', 'Mobile']
  },
  {
    key: 'MUNDOTANGO',
    summary: 'Mundo Tango Social Platform',
    description: `Global tango community platform with social features, events, and marketplace.
    
**Platform Overview:**
- Social networking for tango dancers
- Event management system
- Host/Guest marketplace
- Community groups by city
- Real-time messaging

**40x20s Coverage:** Layers 7-9 (UI/Mobile/PWA), 13-14 (Payment/Marketplace), 17-18 (Search/Recommendation)`,
    labels: ['platform-mundotango', 'social-platform', '40x20s-core'],
    components: ['Frontend', 'Backend', 'Database', 'Real-time']
  }
];

// Technical Layer Epics
const TECHNICAL_EPICS = [
  {
    key: 'FRONTEND',
    summary: 'Frontend & UI/UX Systems',
    description: `All frontend development including React components, MT Ocean theme, and user interfaces.
    
**Technical Stack:**
- React 18 with TypeScript
- Tailwind CSS with MT Ocean theme
- Glassmorphic design system
- Responsive layouts
- Performance optimizations

**40x20s Coverage:** Layers 7-9 (UI/UX, Mobile, PWA)`,
    labels: ['technical-frontend', 'ui-ux', '40x20s-layer-7-9'],
    components: ['Frontend', 'Design', 'UX']
  },
  {
    key: 'BACKEND',
    summary: 'Backend API & Services',
    description: `Complete backend infrastructure with Express, PostgreSQL, and microservices.
    
**Technical Stack:**
- Node.js/Express server
- PostgreSQL with Drizzle ORM
- RESTful API design
- WebSocket real-time
- Background job processing

**40x20s Coverage:** Layers 10-12 (API, Real-time, Background Jobs)`,
    labels: ['technical-backend', 'api', '40x20s-layer-10-12'],
    components: ['Backend', 'API', 'Database']
  },
  {
    key: 'AI',
    summary: 'AI & Machine Learning Systems',
    description: `AI infrastructure for Life CEO agents and intelligent features.
    
**Technical Stack:**
- OpenAI GPT-4 integration
- Vector embeddings
- Natural language processing
- Predictive analytics
- Agent communication system

**40x20s Coverage:** Layers 23-24 (AI/ML, NLP)`,
    labels: ['technical-ai', 'machine-learning', '40x20s-layer-23-24'],
    components: ['AI', 'Backend', 'Data Science']
  },
  {
    key: 'INFRASTRUCTURE',
    summary: 'Infrastructure & DevOps',
    description: `Complete infrastructure including deployment, monitoring, and performance.
    
**Technical Stack:**
- Replit deployment
- Redis caching
- PostgreSQL database
- Performance monitoring
- Security implementation

**40x20s Coverage:** Layers 19-20 (Deployment, Infrastructure), 25-26 (Performance, Caching)`,
    labels: ['technical-infrastructure', 'devops', '40x20s-layer-19-20-25-26'],
    components: ['DevOps', 'Infrastructure', 'Security']
  },
  {
    key: 'MOBILE',
    summary: 'Mobile App Development',
    description: `Mobile wrapper applications for iOS and Android platforms.
    
**Technical Stack:**
- React Native/Capacitor evaluation
- PWA capabilities
- Native API integration
- Push notifications
- Offline support

**40x20s Coverage:** Layers 8-9 (Mobile, PWA), 29 (Cross-platform)`,
    labels: ['technical-mobile', 'cross-platform', '40x20s-layer-8-9-29'],
    components: ['Mobile', 'Frontend', 'Native']
  }
];

// Detailed Stories by Epic
const EPIC_STORIES = {
  LIFECEO: [
    {
      summary: 'Business Agent Implementation',
      description: `Complete implementation of Business Agent for Life CEO system.
      
**Features:**
- Business strategy recommendations
- Financial analysis
- Partnership opportunities
- Market insights
      
**Acceptance Criteria:**
- Agent responds to business queries
- Integrates with financial data
- Provides actionable recommendations`,
      storyPoints: 8,
      labels: ['agent-business', 'ai-implementation'],
      tasks: [
        'Create Business Agent core logic',
        'Implement financial data integration',
        'Add market analysis capabilities',
        'Create agent communication interface',
        'Add voice command support'
      ]
    },
    {
      summary: 'Health Agent Implementation',
      description: `Health and wellness management agent.
      
**Features:**
- Health tracking
- Fitness recommendations
- Medical reminders
- Wellness insights`,
      storyPoints: 8,
      labels: ['agent-health', 'ai-implementation'],
      tasks: [
        'Create Health Agent core logic',
        'Implement health data tracking',
        'Add fitness recommendation engine',
        'Create medical reminder system'
      ]
    },
    {
      summary: 'Voice Command Interface',
      description: `Natural language voice interface for Life CEO.
      
**Features:**
- Voice recognition
- Natural language processing
- Multi-language support
- Command routing`,
      storyPoints: 13,
      labels: ['voice-interface', 'nlp'],
      tasks: [
        'Implement voice recognition API',
        'Create NLP command parser',
        'Add multi-language support',
        'Build command routing system',
        'Add voice feedback system'
      ]
    },
    {
      summary: '40x20s Framework Integration',
      description: `Complete integration of 40x20s methodology into Life CEO.
      
**Features:**
- Framework visualization
- Progress tracking
- Quality checkpoints
- Automated reporting`,
      storyPoints: 5,
      labels: ['40x20s-framework', 'methodology'],
      tasks: [
        'Create 40x20s dashboard',
        'Implement progress tracking',
        'Add quality checkpoint system',
        'Build automated reports'
      ]
    }
  ],
  
  MUNDOTANGO: [
    {
      summary: 'Enhanced Timeline V2',
      description: `Complete social timeline with Facebook-style features.
      
**Features:**
- Infinite scroll
- Rich media support
- Real-time updates
- Social interactions
      
**Acceptance Criteria:**
- Timeline loads in <3 seconds
- Supports all media types
- Real-time comment updates`,
      storyPoints: 13,
      labels: ['timeline', 'social-features'],
      tasks: [
        'Create timeline component architecture',
        'Implement infinite scroll',
        'Add media upload system',
        'Build real-time update system',
        'Add social interaction features'
      ]
    },
    {
      summary: 'Community Groups System',
      description: `City-based community groups with auto-assignment.
      
**Features:**
- Auto city detection
- Group management
- Event integration
- Member roles`,
      storyPoints: 8,
      labels: ['community', 'groups'],
      tasks: [
        'Create group database schema',
        'Implement city auto-detection',
        'Build group management UI',
        'Add member role system'
      ]
    },
    {
      summary: 'Host/Guest Marketplace',
      description: `Complete hospitality marketplace for tango travelers.
      
**Features:**
- Host home listings
- Guest booking system
- Payment integration
- Review system`,
      storyPoints: 13,
      labels: ['marketplace', 'hospitality'],
      tasks: [
        'Create marketplace database schema',
        'Build host onboarding wizard',
        'Implement booking system',
        'Add payment processing',
        'Create review system'
      ]
    },
    {
      summary: 'MT Ocean Theme Implementation',
      description: `Complete UI redesign with glassmorphic ocean theme.
      
**Features:**
- Turquoise-to-cyan gradients
- Glassmorphic components
- Responsive design
- Smooth animations`,
      storyPoints: 8,
      labels: ['ui-design', 'theme'],
      tasks: [
        'Create design system documentation',
        'Update all components to MT theme',
        'Add glassmorphic effects',
        'Implement responsive layouts'
      ]
    }
  ],
  
  FRONTEND: [
    {
      summary: 'Performance Optimization - 72% Improvement',
      description: `Achieved 72% performance improvement from 11.3s to 3.2s render time.
      
**Optimizations:**
- Bundle size reduction (31MB to 0.16MB)
- Lazy loading implementation
- Cache optimization
- Code splitting
      
**Results:**
- Render time: 3.2s
- Bundle size: 0.16MB
- Cache hit rate: 60-70%`,
      storyPoints: 13,
      labels: ['performance', 'optimization', 'achievement'],
      tasks: [
        'Implement code splitting',
        'Add lazy loading for routes',
        'Optimize bundle size',
        'Add performance monitoring',
        'Implement caching strategy'
      ]
    },
    {
      summary: 'Component Library Development',
      description: `Comprehensive React component library with MT theme.
      
**Components:**
- Form components
- Navigation elements
- Card layouts
- Modal systems`,
      storyPoints: 8,
      labels: ['components', 'ui-library'],
      tasks: [
        'Create base component architecture',
        'Build form components',
        'Implement navigation components',
        'Add modal and dialog systems'
      ]
    },
    {
      summary: 'Responsive Mobile Design',
      description: `Complete mobile-responsive design implementation.
      
**Features:**
- Mobile-first approach
- Touch optimizations
- Responsive grids
- Mobile navigation`,
      storyPoints: 5,
      labels: ['mobile', 'responsive'],
      tasks: [
        'Implement responsive grid system',
        'Add touch gesture support',
        'Create mobile navigation',
        'Optimize for small screens'
      ]
    }
  ],
  
  BACKEND: [
    {
      summary: 'Database Architecture with RLS',
      description: `Comprehensive database design with Row Level Security.
      
**Implementation:**
- 64 tables total
- 40 tables with RLS enabled
- Audit logging system
- Performance indexes
      
**Security:**
- Row Level Security policies
- Audit trail for changes
- Role-based access`,
      storyPoints: 13,
      labels: ['database', 'security', 'rls'],
      tasks: [
        'Design database schema',
        'Implement RLS policies',
        'Create audit logging system',
        'Add performance indexes',
        'Build health check functions'
      ]
    },
    {
      summary: 'RESTful API Development',
      description: `Complete REST API with authentication and authorization.
      
**Endpoints:**
- User management
- Content CRUD
- Social features
- Admin functions`,
      storyPoints: 8,
      labels: ['api', 'rest'],
      tasks: [
        'Create API architecture',
        'Implement authentication',
        'Build CRUD endpoints',
        'Add validation middleware',
        'Create API documentation'
      ]
    },
    {
      summary: 'Real-time WebSocket System',
      description: `WebSocket implementation for real-time features.
      
**Features:**
- Live notifications
- Chat messaging
- Real-time updates
- Presence system`,
      storyPoints: 8,
      labels: ['websocket', 'real-time'],
      tasks: [
        'Set up WebSocket server',
        'Implement notification system',
        'Create chat functionality',
        'Add presence tracking'
      ]
    },
    {
      summary: 'Caching Layer Implementation',
      description: `Redis caching with fallback to in-memory.
      
**Implementation:**
- Redis integration
- In-memory fallback
- Cache invalidation
- Performance metrics`,
      storyPoints: 5,
      labels: ['caching', 'performance'],
      tasks: [
        'Set up Redis connection',
        'Implement cache service',
        'Add fallback mechanism',
        'Create invalidation strategy'
      ]
    }
  ],
  
  AI: [
    {
      summary: '16 Agent System Architecture',
      description: `Complete architecture for 16 Life CEO agents.
      
**Agents:**
- Business, Health, Finance
- Social, Travel, Education
- Entertainment, Shopping
- And 8 more specialized agents`,
      storyPoints: 21,
      labels: ['ai-agents', 'architecture'],
      tasks: [
        'Design agent communication protocol',
        'Create agent base class',
        'Implement inter-agent messaging',
        'Build agent orchestration system',
        'Add agent learning capabilities'
      ]
    },
    {
      summary: 'OpenAI GPT-4 Integration',
      description: `Integration with OpenAI for intelligent responses.
      
**Features:**
- Context management
- Prompt engineering
- Response optimization
- Cost management`,
      storyPoints: 8,
      labels: ['openai', 'gpt-4'],
      tasks: [
        'Set up OpenAI client',
        'Create prompt templates',
        'Implement context management',
        'Add response caching'
      ]
    },
    {
      summary: 'Natural Language Processing',
      description: `NLP system for understanding user intent.
      
**Features:**
- Intent recognition
- Entity extraction
- Sentiment analysis
- Multi-language support`,
      storyPoints: 13,
      labels: ['nlp', 'language-processing'],
      tasks: [
        'Implement intent classifier',
        'Create entity extractor',
        'Add sentiment analysis',
        'Build language detection'
      ]
    }
  ],
  
  INFRASTRUCTURE: [
    {
      summary: 'Performance Monitoring System',
      description: `Comprehensive performance monitoring implementation.
      
**Features:**
- Real-time metrics
- Performance dashboards
- Alert system
- Optimization recommendations`,
      storyPoints: 8,
      labels: ['monitoring', 'performance'],
      tasks: [
        'Set up metrics collection',
        'Create performance dashboard',
        'Implement alerting system',
        'Add optimization engine'
      ]
    },
    {
      summary: 'Security Implementation',
      description: `Complete security infrastructure.
      
**Implementation:**
- Authentication system
- Authorization (RBAC/ABAC)
- Data encryption
- Security monitoring`,
      storyPoints: 13,
      labels: ['security', 'authentication'],
      tasks: [
        'Implement auth system',
        'Create RBAC/ABAC',
        'Add data encryption',
        'Set up security monitoring',
        'Create audit system'
      ]
    },
    {
      summary: 'Deployment Pipeline',
      description: `CI/CD pipeline for automated deployment.
      
**Features:**
- Automated testing
- Build optimization
- Deployment automation
- Rollback capability`,
      storyPoints: 5,
      labels: ['deployment', 'ci-cd'],
      tasks: [
        'Set up build pipeline',
        'Add automated tests',
        'Create deployment scripts',
        'Implement rollback system'
      ]
    },
    {
      summary: 'Database Optimization',
      description: `Database performance and reliability improvements.
      
**Optimizations:**
- Query optimization
- Index creation
- Connection pooling
- Backup system`,
      storyPoints: 8,
      labels: ['database', 'optimization'],
      tasks: [
        'Analyze slow queries',
        'Create optimal indexes',
        'Implement connection pooling',
        'Set up backup strategy'
      ]
    }
  ],
  
  MOBILE: [
    {
      summary: 'Mobile Wrapper Strategy',
      description: `3-phase mobile app development strategy.
      
**Phases:**
1. WebToApp.design evaluation
2. Capacitor implementation
3. Native development
      
**Timeline:**
- Phase 1: 2 weeks
- Phase 2: 4 weeks
- Phase 3: 8 weeks`,
      storyPoints: 13,
      labels: ['mobile-strategy', 'wrapper-app'],
      tasks: [
        'Evaluate WebToApp.design',
        'Test Capacitor framework',
        'Create native prototypes',
        'Choose final approach',
        'Implement chosen solution'
      ]
    },
    {
      summary: 'PWA Implementation',
      description: `Progressive Web App capabilities.
      
**Features:**
- Offline support
- Push notifications
- App installation
- Background sync`,
      storyPoints: 8,
      labels: ['pwa', 'mobile-web'],
      tasks: [
        'Create service worker',
        'Implement offline cache',
        'Add push notifications',
        'Enable app installation'
      ]
    },
    {
      summary: 'Mobile UI Optimization',
      description: `Mobile-specific UI enhancements.
      
**Optimizations:**
- Touch gestures
- Mobile navigation
- Performance tuning
- Battery optimization`,
      storyPoints: 5,
      labels: ['mobile-ui', 'optimization'],
      tasks: [
        'Implement touch gestures',
        'Create mobile navigation',
        'Optimize performance',
        'Add battery considerations'
      ]
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
      content.push({
        type: 'paragraph',
        content: [{
          type: 'text',
          text: line.replace(/\*\*/g, ''),
          marks: [{ type: 'strong' }]
        }]
      });
    } else if (line.startsWith('- ')) {
      // Bullet list
      if (content.length === 0 || content[content.length - 1].type !== 'bulletList') {
        content.push({
          type: 'bulletList',
          content: []
        });
      }
      content[content.length - 1].content.push({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: line.substring(2)
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

// Main migration function
async function executeMigration() {
  console.log('🚀 Life CEO 40x20s JIRA Migration Starting...');
  console.log(`📍 Target: ${JIRA_CONFIG.instanceUrl}/projects/${JIRA_CONFIG.projectKey}`);
  console.log('================================================\n');
  
  const createdIssues = {
    epics: [] as any[],
    stories: [] as any[],
    tasks: [] as any[]
  };
  
  // Create Platform Epics
  console.log('📋 Creating Platform Epics...');
  for (const epic of PLATFORM_EPICS) {
    try {
      console.log(`  Creating: ${epic.summary}`);
      const issueData = {
        fields: {
          project: { key: JIRA_CONFIG.projectKey },
          summary: epic.summary,
          description: markdownToADF(epic.description),
          issuetype: { name: 'Epic' },
          labels: [...epic.labels, '40x20s-framework', 'platform-epic']
        }
      };
      
      const created = await createJiraIssue(issueData);
      createdIssues.epics.push({ ...created, epicKey: epic.key });
      console.log(`  ✅ Created: ${created.key}`);
      
      // Create stories for this epic
      const stories = EPIC_STORIES[epic.key as keyof typeof EPIC_STORIES] || [];
      for (const story of stories) {
        console.log(`    Creating story: ${story.summary}`);
        const storyData = {
          fields: {
            project: { key: JIRA_CONFIG.projectKey },
            summary: story.summary,
            description: markdownToADF(story.description),
            issuetype: { name: 'Task' }, // Using Task as Story
            labels: [...story.labels, ...epic.labels, `story-points-${story.storyPoints}`],
            parent: { key: created.key } // Link to epic
          }
        };
        
        const createdStory = await createJiraIssue(storyData);
        createdIssues.stories.push(createdStory);
        console.log(`    ✅ Created story: ${createdStory.key}`);
        
        // Create tasks for this story
        for (const task of story.tasks) {
          const taskData = {
            fields: {
              project: { key: JIRA_CONFIG.projectKey },
              summary: task,
              description: markdownToADF(`Task for: ${story.summary}\n\nPart of the ${epic.summary} implementation.`),
              issuetype: { name: 'Sub-task' },
              parent: { key: createdStory.key }
            }
          };
          
          const createdTask = await createJiraIssue(taskData);
          createdIssues.tasks.push(createdTask);
          console.log(`      ✅ Created task: ${createdTask.key} - ${task}`);
        }
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to create epic: ${epic.summary}`, error);
    }
  }
  
  // Create Technical Epics
  console.log('\n📋 Creating Technical Layer Epics...');
  for (const epic of TECHNICAL_EPICS) {
    try {
      console.log(`  Creating: ${epic.summary}`);
      const issueData = {
        fields: {
          project: { key: JIRA_CONFIG.projectKey },
          summary: epic.summary,
          description: markdownToADF(epic.description),
          issuetype: { name: 'Epic' },
          labels: [...epic.labels, '40x20s-framework', 'technical-epic']
        }
      };
      
      const created = await createJiraIssue(issueData);
      createdIssues.epics.push({ ...created, epicKey: epic.key });
      console.log(`  ✅ Created: ${created.key}`);
      
      // Create stories for this epic
      const stories = EPIC_STORIES[epic.key as keyof typeof EPIC_STORIES] || [];
      for (const story of stories) {
        console.log(`    Creating story: ${story.summary}`);
        const storyData = {
          fields: {
            project: { key: JIRA_CONFIG.projectKey },
            summary: story.summary,
            description: markdownToADF(story.description),
            issuetype: { name: 'Task' }, // Using Task as Story
            labels: [...story.labels, ...epic.labels, `story-points-${story.storyPoints}`],
            parent: { key: created.key }
          }
        };
        
        const createdStory = await createJiraIssue(storyData);
        createdIssues.stories.push(createdStory);
        console.log(`    ✅ Created story: ${createdStory.key}`);
        
        // Create tasks for this story
        for (const task of story.tasks) {
          const taskData = {
            fields: {
              project: { key: JIRA_CONFIG.projectKey },
              summary: task,
              description: markdownToADF(`Task for: ${story.summary}\n\nPart of the ${epic.summary} implementation.`),
              issuetype: { name: 'Sub-task' },
              parent: { key: createdStory.key }
            }
          };
          
          const createdTask = await createJiraIssue(taskData);
          createdIssues.tasks.push(createdTask);
          console.log(`      ✅ Created task: ${createdTask.key} - ${task}`);
        }
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to create epic: ${epic.summary}`, error);
    }
  }
  
  // Summary
  console.log('\n================================================');
  console.log('📊 Migration Summary:');
  console.log(`  Epics created: ${createdIssues.epics.length}`);
  console.log(`  Stories created: ${createdIssues.stories.length}`);
  console.log(`  Tasks created: ${createdIssues.tasks.length}`);
  console.log(`  Total issues: ${createdIssues.epics.length + createdIssues.stories.length + createdIssues.tasks.length}`);
  console.log('\n✅ Migration complete!');
  console.log(`🔗 View your board: ${JIRA_CONFIG.instanceUrl}/jira/software/projects/${JIRA_CONFIG.projectKey}/boards/34`);
}

// Execute migration
executeMigration().catch(console.error);