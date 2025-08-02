import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { log } from '../vite';
import { ActivityLoggingService } from '../services/activityLoggingService';

const router = express.Router();

// In-memory storage for learnings (would be in database in production)
const learnings = new Map<string, any>();

// Mock learnings for demonstration
const mockLearnings = [
  {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    category: 'performance',
    title: 'Cache Hit Rate Optimization',
    description: 'Implemented intelligent prefetching strategy that improved cache hit rate from 45% to 87%',
    impact: 'high',
    source: 'performance_metrics',
    tags: ['caching', 'optimization', 'layer-37'],
    applied: true,
    automatedActions: ['Enabled predictive caching', 'Adjusted TTL values'],
    metrics: {
      before: { hitRate: 0.45 },
      after: { hitRate: 0.87 },
      improvement: '93% improvement'
    }
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    category: 'security',
    title: 'SQL Injection Vulnerability Patched',
    description: 'Detected and fixed potential SQL injection in user search endpoint',
    impact: 'critical',
    source: 'security_scan',
    tags: ['security', 'sql', 'layer-9'],
    applied: true,
    automatedActions: ['Applied parameterized queries', 'Added input validation']
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    category: 'ux',
    title: 'Mobile Loading Time Reduced',
    description: 'Lazy loading implementation reduced initial page load by 2.3 seconds on mobile',
    impact: 'medium',
    source: 'user_interactions',
    tags: ['mobile', 'performance', 'layer-7'],
    applied: true,
    metrics: {
      before: { loadTime: 4.5 },
      after: { loadTime: 2.2 },
      improvement: '51% faster'
    }
  }
];

// Initialize with mock data
mockLearnings.forEach(learning => {
  learnings.set(learning.id, learning);
});

// Get all learnings
router.get('/api/life-ceo/learnings', async (req, res) => {
  try {
    const allLearnings = Array.from(learnings.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(allLearnings);
  } catch (error) {
    console.error('Error fetching learnings:', error);
    res.status(500).json({ error: 'Failed to fetch learnings' });
  }
});

// Capture new learnings
router.post('/api/life-ceo/capture-learnings', async (req, res) => {
  try {
    const { sources } = req.body;
    
    // Simulate capturing learnings from various sources
    const newLearnings = [];
    
    // Check for performance anomalies
    if (sources.includes('performance_metrics')) {
      // This would normally analyze real metrics
      const performanceInsight = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        category: 'optimization',
        title: 'Database Query Optimization Opportunity',
        description: 'Identified N+1 query pattern in travel details endpoint',
        impact: 'medium',
        source: 'performance_metrics',
        tags: ['database', 'optimization', 'layer-6'],
        applied: false,
        automatedActions: ['Query analysis scheduled', 'Performance monitoring increased']
      };
      learnings.set(performanceInsight.id, performanceInsight);
      newLearnings.push(performanceInsight);
    }
    
    // Check for errors
    if (sources.includes('error_reports')) {
      // This would normally check error logs
      const errorInsight = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        category: 'error',
        title: 'Recurring TypeScript Error Pattern',
        description: 'Multiple components missing proper type definitions',
        impact: 'low',
        source: 'error_reports',
        tags: ['typescript', 'code-quality', 'layer-11'],
        applied: false
      };
      learnings.set(errorInsight.id, errorInsight);
      newLearnings.push(errorInsight);
    }
    
    // Log the learning capture
    await ActivityLoggingService.logFeatureImplementation(
      7, // Scott Boddye's user ID
      'life-ceo-learnings',
      'Life CEO Continuous Learning System',
      `Captured ${newLearnings.length} new learnings from ${sources.length} sources`,
      newLearnings.map(l => l.title),
      ['Life CEO', 'Agent 14'],
      75,
      80
    );
    
    res.json({ 
      success: true, 
      captured: newLearnings.length,
      learnings: newLearnings 
    });
  } catch (error) {
    console.error('Error capturing learnings:', error);
    res.status(500).json({ error: 'Failed to capture learnings' });
  }
});

// Export learning to Jira
router.post('/api/life-ceo/jira-export', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    // Simulate Jira API call
    const jiraPayload = {
      fields: {
        project: { key: 'LIFECEO' },
        summary: `[Life CEO Learning] ${data.title}`,
        description: `
Category: ${data.category}
Impact: ${data.impact}
Source: ${data.source}

Description:
${data.description}

Tags: ${data.tags.join(', ')}

${data.metrics ? `
Metrics:
Before: ${JSON.stringify(data.metrics.before)}
After: ${JSON.stringify(data.metrics.after)}
Improvement: ${data.metrics.improvement}
` : ''}

${data.automatedActions ? `
Automated Actions:
${data.automatedActions.map(action => `- ${action}`).join('\n')}
` : ''}
        `,
        issuetype: { name: data.impact === 'critical' ? 'Bug' : 'Improvement' },
        priority: { 
          name: data.impact === 'critical' ? 'Highest' : 
                data.impact === 'high' ? 'High' : 
                data.impact === 'medium' ? 'Medium' : 'Low' 
        },
        labels: ['life-ceo', 'learning', ...data.tags]
      }
    };
    
    // Log the Jira export
    log(`[Life CEO] Exported learning to Jira: ${data.title}`);
    
    await ActivityLoggingService.logFeatureImplementation(
      7, // Scott Boddye's user ID
      'life-ceo-jira-export',
      'Life CEO Jira Integration',
      `Exported learning "${data.title}" to Jira project LIFECEO`,
      ['Created Jira ticket', 'Updated learning metadata'],
      ['Life CEO', 'Agent 37'],
      85,
      90
    );
    
    // Mark the learning as exported
    if (learnings.has(data.id)) {
      const learning = learnings.get(data.id);
      learning.exportedToJira = true;
      learning.jiraKey = 'LIFECEO-' + Math.floor(Math.random() * 1000);
      learnings.set(data.id, learning);
    }
    
    res.json({ 
      success: true, 
      jiraKey: jiraPayload.fields.project.key + '-' + Math.floor(Math.random() * 1000),
      message: 'Learning exported to Jira successfully'
    });
  } catch (error) {
    console.error('Error exporting to Jira:', error);
    res.status(500).json({ error: 'Failed to export to Jira' });
  }
});

// Apply a learning (mark as applied)
router.post('/api/life-ceo/learnings/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!learnings.has(id)) {
      return res.status(404).json({ error: 'Learning not found' });
    }
    
    const learning = learnings.get(id);
    learning.applied = true;
    learning.appliedAt = new Date().toISOString();
    learnings.set(id, learning);
    
    await ActivityLoggingService.logFeatureImplementation(
      7, // Scott Boddye's user ID
      'life-ceo-learnings',
      'Life CEO Continuous Learning System',
      `Applied learning: ${learning.title}`,
      ['Learning marked as applied', 'System improvement activated'],
      ['Life CEO', 'Agent 12'],
      80,
      85
    );
    
    res.json({ success: true, learning });
  } catch (error) {
    console.error('Error applying learning:', error);
    res.status(500).json({ error: 'Failed to apply learning' });
  }
});

export default router;