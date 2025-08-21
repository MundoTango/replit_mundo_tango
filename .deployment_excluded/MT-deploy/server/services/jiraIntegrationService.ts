import axios from 'axios';

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description: any; // ADF format
    issuetype: { name: string };
    priority: { name: string };
    [key: string]: any;
  };
}

interface JiraCreateIssueRequest {
  fields: {
    project: { key: string };
    summary: string;
    description: any; // ADF format
    issuetype: { name: string };
    priority?: { name: string };
    parent?: { key: string };
    labels?: string[];
    duedate?: string;
    assignee?: { accountId: string };
    components?: { name: string }[];
    [key: string]: any;
  };
}

export class JiraIntegrationService {
  // Convert markdown/JIRA markup to Atlassian Document Format (ADF)
  private convertToADF(text: string): any {
    // Simple ADF structure - for production use @atlaskit/editor-json-transformer
    const lines = text.split('\n');
    const content: any[] = [];

    for (const line of lines) {
      if (!line.trim()) {
        content.push({ type: 'paragraph', content: [] });
        continue;
      }

      // Handle headings
      if (line.startsWith('h2. ')) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: line.substring(4) }]
        });
      } else if (line.startsWith('h3. ')) {
        content.push({
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: line.substring(4) }]
        });
      } 
      // Handle bullet points
      else if (line.startsWith('* ')) {
        // Find or create the last bulletList
        let lastBulletList = content[content.length - 1];
        if (!lastBulletList || lastBulletList.type !== 'bulletList') {
          lastBulletList = { type: 'bulletList', content: [] };
          content.push(lastBulletList);
        }
        lastBulletList.content.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: line.substring(2) }]
          }]
        });
      }
      // Handle numbered lists
      else if (line.match(/^#\s/)) {
        content.push({
          type: 'paragraph',
          content: [{ 
            type: 'text', 
            text: line.substring(2),
            marks: [{ type: 'strong' }]
          }]
        });
      }
      // Handle tables (simplified - just convert to paragraph)
      else if (line.startsWith('||') || line.startsWith('|')) {
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: line }]
        });
      }
      // Regular paragraph
      else {
        const textContent: any[] = [];
        
        // Handle bold text
        const boldRegex = /\*([^*]+)\*/g;
        let lastIndex = 0;
        let match;
        
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            textContent.push({ type: 'text', text: line.substring(lastIndex, match.index) });
          }
          textContent.push({ 
            type: 'text', 
            text: match[1],
            marks: [{ type: 'strong' }]
          });
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < line.length) {
          textContent.push({ type: 'text', text: line.substring(lastIndex) });
        }
        
        content.push({
          type: 'paragraph',
          content: textContent.length > 0 ? textContent : [{ type: 'text', text: line }]
        });
      }
    }

    return {
      type: 'doc',
      version: 1,
      content
    };
  }
  private apiToken: string;
  private email: string;
  private domain: string;
  private projectKey: string = 'MT'; // Mundo Tango project key
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.apiToken = process.env.JIRA_API_TOKEN || '';
    this.email = process.env.JIRA_EMAIL || '';
    this.domain = process.env.JIRA_DOMAIN || '';
    this.baseUrl = `https://${this.domain}/rest/api/3`;
    
    // Set up authorization headers
    const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
    this.headers = {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  // Check if an issue already exists to prevent duplicates
  async checkExistingIssue(summary: string): Promise<JiraIssue | null> {
    try {
      const jql = `project = ${this.projectKey} AND summary ~ "${summary.replace(/"/g, '\\"')}"`;
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: this.headers,
        params: {
          jql,
          fields: 'summary,description,issuetype,priority,status',
          maxResults: 1
        }
      });

      if (response.data.issues && response.data.issues.length > 0) {
        return response.data.issues[0];
      }
      return null;
    } catch (error) {
      console.error('Error checking existing issue:', error);
      return null;
    }
  }

  // Create a new Jira issue
  async createIssue(issueData: JiraCreateIssueRequest): Promise<JiraIssue | null> {
    try {
      // Check for duplicates first
      const existing = await this.checkExistingIssue(issueData.fields.summary);
      if (existing) {
        console.log(`Issue already exists: ${existing.key} - ${existing.fields.summary}`);
        return existing;
      }

      const response = await axios.post(`${this.baseUrl}/issue`, issueData, {
        headers: this.headers
      });

      console.log(`Created issue: ${response.data.key} - ${issueData.fields.summary}`);
      return response.data;
    } catch (error: any) {
      console.error('Error creating issue:', error.response?.data || error.message);
      return null;
    }
  }

  // Create the master compliance epic
  async createMasterEpic(): Promise<string | null> {
    const epicData: JiraCreateIssueRequest = {
      fields: {
        project: { key: this.projectKey },
        summary: 'ESA-44x21 Platform Compliance Remediation',
        description: this.convertToADF(`
h2. Executive Summary

Overall Compliance: 25/100 ❌
Jira Sync Gap: 7 days behind
Security Risk: HIGH - Payment processing without audit
Documentation: 20% coverage
Test Coverage: ~15%

h2. Scope

Comprehensive ESA-44x21 compliance remediation across:
* 44 Technical Layers
* 21 Development Phases
* 924 Total Tasks

h2. Critical Findings

# *Payment Security*: No webhook signature verification
# *CSRF Protection*: Missing on payment endpoints
# *GDPR Compliance*: PII logged in production
# *Test Coverage*: Critical gaps in payment flows

h2. Timeline

* Sprint 1 (Aug 2-9): Security & Documentation
* Sprint 2 (Aug 9-16): Testing & Performance
* Sprint 3 (Aug 16-23): Integration & Polish

h2. Success Criteria

* 0 P0 security vulnerabilities
* 100% API documentation
* 80% test coverage
* Full ESA-44x21 compliance

h2. References

* Comprehensive Audit Report: ESA_44X21S_COMPREHENSIVE_AUDIT_AUGUST_2025.md
* Critical Action Plan: ESA_44X21S_CRITICAL_ACTION_PLAN_AUGUST_2025.md
* Payment Security Audit: ESA_44X21S_PAYMENT_SECURITY_AUDIT_RESULTS.md
`),
        issuetype: { name: 'Epic' },
        labels: ['ESA-44x21', 'compliance', 'security', 'august-2025']
      }
    };

    const epic = await this.createIssue(epicData);
    return epic?.key || null;
  }

  // Create layer epics
  async createLayerEpic(layerNumber: number, layerName: string, priority: string, isCritical: boolean = false): Promise<string | null> {
    const epicData: JiraCreateIssueRequest = {
      fields: {
        project: { key: this.projectKey },
        summary: `[Layer ${layerNumber}] ${layerName} Compliance`,
        description: this.convertToADF(`
h2. Layer ${layerNumber}: ${layerName}

${isCritical ? '*⚠️ CRITICAL LAYER - Immediate attention required*' : ''}

h3. Objectives

Ensure full ESA-44x21 compliance for Layer ${layerNumber} - ${layerName}

h3. Scope

* All 21 development phases
* Complete documentation
* Comprehensive testing
* Security validation

h3. Current Issues

${this.getLayerIssues(layerNumber)}

h3. Success Criteria

* All 21 phases validated
* Documentation complete
* Tests passing (>80% coverage)
* Security reviewed and approved

h3. Dependencies

${this.getLayerDependencies(layerNumber)}

h3. Priority Level: ${priority}
`),
        issuetype: { name: 'Epic' },
        labels: ['ESA-44x21', `layer-${layerNumber}`, layerName.toLowerCase().replace(/ /g, '-'), `priority-${priority.toLowerCase()}`]
      }
    };

    const epic = await this.createIssue(epicData);
    return epic?.key || null;
  }

  // Create phase story under a layer epic
  async createPhaseStory(layerNumber: number, layerName: string, phaseNumber: number, phaseName: string, epicKey: string, priority: string): Promise<string | null> {
    const storyData: JiraCreateIssueRequest = {
      fields: {
        project: { key: this.projectKey },
        summary: `[Layer ${layerNumber}] - Phase ${phaseNumber}: ${phaseName}`,
        description: this.convertToADF(`
h3. Phase ${phaseNumber}: ${phaseName}

*Layer*: ${layerNumber} - ${layerName}
*Epic*: ${epicKey}
*Priority Level*: ${priority}

h3. Objective

Complete Phase ${phaseNumber} (${phaseName}) for Layer ${layerNumber} (${layerName})

h3. Acceptance Criteria

${this.getPhaseAcceptanceCriteria(phaseNumber)}

h3. Technical Requirements

${this.getPhaseTechnicalRequirements(layerNumber, phaseNumber)}

h3. Definition of Done

* Code implementation complete
* Unit tests written (>80% coverage)
* Integration tests passing
* Security review completed
* Documentation updated
* Performance benchmarks met
* Peer review approved
* Deployed to staging
* Stakeholder sign-off

h3. Estimated Effort

* Development: ${this.getPhaseDevEffort(phaseNumber)} hours
* Testing: ${this.getPhaseTestEffort(phaseNumber)} hours
* Documentation: 2 hours
`),
        issuetype: { name: 'Story' },
        parent: { key: epicKey },
        labels: ['ESA-44x21', `layer-${layerNumber}`, `phase-${phaseNumber}`, `priority-${priority.toLowerCase()}`]
      }
    };

    const story = await this.createIssue(storyData);
    return story?.key || null;
  }

  // Helper methods for content generation
  private getLayerIssues(layerNumber: number): string {
    const issues: Record<number, string> = {
      3: '* GDPR compliance gaps\n* No data retention policy\n* Missing privacy impact assessment',
      9: '* No CSRF protection on payment endpoints\n* Missing webhook signature verification\n* Insufficient rate limiting',
      36: '* No penetration testing conducted\n* Missing security headers\n* Vulnerable to payment fraud',
      11: '* Test coverage below 20%\n* No integration tests for payments\n* Missing performance benchmarks',
      17: '* API documentation 80% missing\n* No security guidelines\n* Outdated user guides'
    };
    return issues[layerNumber] || '* Compliance validation required\n* Documentation updates needed\n* Testing gaps identified';
  }

  private getLayerDependencies(layerNumber: number): string {
    const deps: Record<number, string> = {
      6: 'Depends on Layer 5 (Data Layer) completion',
      7: 'Depends on Layer 6 (Backend Layer) APIs',
      9: 'Critical dependency for all payment features',
      11: 'Requires Layers 6-7 completion for testing',
      36: 'Depends on Layer 9 (Security) baseline'
    };
    return deps[layerNumber] || 'Standard layer dependencies apply';
  }

  private getPhaseAcceptanceCriteria(phaseNumber: number): string {
    const criteria: Record<number, string> = {
      0: '* Pre-implementation review complete\n* Existing code analyzed\n* Gap analysis documented',
      1: '* Requirements fully documented\n* Stakeholder approval obtained\n* Success metrics defined',
      8: '* Unit test coverage >80%\n* All tests passing\n* Edge cases covered',
      10: '* Security audit complete\n* Vulnerabilities addressed\n* Compliance verified',
      14: '* User documentation complete\n* API documentation updated\n* Code comments added'
    };
    return criteria[phaseNumber] || '* Phase objectives met\n* Quality standards achieved\n* Ready for next phase';
  }

  private getPhaseTechnicalRequirements(layerNumber: number, phaseNumber: number): string {
    if (layerNumber === 9 && phaseNumber === 10) {
      return '* Implement webhook signature verification\n* Add CSRF protection middleware\n* Configure rate limiting\n* Remove PII from logs';
    }
    if (layerNumber === 3 && phaseNumber === 14) {
      return '* Create GDPR compliance documentation\n* Document data flows\n* Update privacy policy\n* Create data retention policy';
    }
    return '* Implement phase requirements\n* Follow coding standards\n* Ensure backward compatibility';
  }

  private getPhaseDevEffort(phaseNumber: number): number {
    const efforts: Record<number, number> = {
      0: 2, 1: 4, 2: 8, 3: 6, 4: 8, 5: 16, 6: 16, 7: 8,
      8: 8, 9: 12, 10: 16, 11: 8, 12: 4, 13: 6, 14: 8,
      15: 4, 16: 8, 17: 6, 18: 4, 19: 4, 20: 6, 21: 4
    };
    return efforts[phaseNumber] || 6;
  }

  private getPhaseTestEffort(phaseNumber: number): number {
    const efforts: Record<number, number> = {
      8: 8, 9: 16, 10: 12, 11: 8, 17: 8
    };
    return efforts[phaseNumber] || 4;
  }

  // Main method to push all ESA-44x21 compliance items to Jira
  async pushESAComplianceToJira(): Promise<{
    success: boolean;
    summary: {
      totalEpics: number;
      totalStories: number;
      epicsFailed: number;
      storiesFailed: number;
    };
  }> {
    // Starting JIRA synchronization
    
    const summary = {
      totalEpics: 0,
      totalStories: 0,
      epicsFailed: 0,
      storiesFailed: 0
    };

    try {
      // Create master epic first
      console.log('Creating master compliance epic...');
      const masterEpicKey = await this.createMasterEpic();
      if (!masterEpicKey) {
        console.error('Failed to create master epic');
        return { success: false, summary };
      }

      // Layer definitions with priorities
      const layers = [
        { num: 1, name: 'Expertise Layer', priority: 'Medium' },
        { num: 2, name: 'Open Source Scan Layer', priority: 'Medium' },
        { num: 3, name: 'Legal & Compliance Layer', priority: 'Highest', critical: true },
        { num: 4, name: 'Consent & UX Safeguards Layer', priority: 'High' },
        { num: 5, name: 'Data Layer', priority: 'High' },
        { num: 6, name: 'Backend Layer', priority: 'High' },
        { num: 7, name: 'Frontend Layer', priority: 'High' },
        { num: 8, name: 'Sync & Automation Layer', priority: 'Medium' },
        { num: 9, name: 'Security & Permissions Layer', priority: 'Highest', critical: true },
        { num: 10, name: 'AI & Reasoning Layer', priority: 'Medium' },
        { num: 11, name: 'Testing & Observability Layer', priority: 'Highest' },
        { num: 12, name: 'Performance Optimization', priority: 'High' },
        { num: 13, name: 'Error Handling', priority: 'High' },
        { num: 14, name: 'Monitoring & Analytics', priority: 'High' },
        { num: 15, name: 'Third-party Services', priority: 'High' },
        { num: 16, name: 'Deployment & CI/CD', priority: 'Medium' },
        { num: 17, name: 'Documentation', priority: 'Highest' },
        { num: 18, name: 'User Training', priority: 'Medium' },
        { num: 19, name: 'Support & Maintenance', priority: 'Medium' },
        { num: 20, name: 'Feedback & Iteration', priority: 'Medium' },
        { num: 21, name: 'Design System', priority: 'High' },
        { num: 22, name: 'Accessibility', priority: 'High' },
        { num: 23, name: 'Mobile Optimization', priority: 'Medium' },
        { num: 24, name: 'Offline Capabilities', priority: 'Low' },
        { num: 25, name: 'Real-time Collaboration', priority: 'Medium' },
        { num: 26, name: 'Advanced Search', priority: 'Low' },
        { num: 27, name: 'Machine Learning', priority: 'Low' },
        { num: 28, name: 'Internationalization', priority: 'High' },
        { num: 29, name: 'Customization', priority: 'Low' },
        { num: 30, name: 'Integration Platform', priority: 'Medium' },
        { num: 31, name: 'Analytics & Insights', priority: 'Medium' },
        { num: 32, name: 'Compliance & Audit', priority: 'Highest' },
        { num: 33, name: 'Scalability', priority: 'Medium' },
        { num: 34, name: 'Multi-tenancy', priority: 'Low' },
        { num: 35, name: 'Enterprise Features', priority: 'Low' },
        { num: 36, name: 'Advanced Security', priority: 'Highest', critical: true },
        { num: 37, name: 'Data Governance', priority: 'High' },
        { num: 38, name: 'Business Intelligence', priority: 'Low' },
        { num: 39, name: 'API Management', priority: 'High' },
        { num: 40, name: 'DevOps Excellence', priority: 'Medium' },
        { num: 41, name: 'Quality Assurance', priority: 'High' },
        { num: 42, name: 'Innovation Pipeline', priority: 'Low' },
        { num: 43, name: 'Knowledge Management', priority: 'Medium' },
        { num: 44, name: 'Continuous Validation', priority: 'High' }
      ];

      // Phase definitions
      const phases = [
        'Pre-Implementation Review',
        'Requirements Analysis',
        'Architecture Design',
        'Technical Specification',
        'Database Schema',
        'API Development',
        'Frontend Implementation',
        'Integration Points',
        'Unit Testing',
        'Integration Testing',
        'Security Audit',
        'Performance Testing',
        'Deployment Scripts',
        'Monitoring Setup',
        'Documentation',
        'User Training',
        'Performance Optimization',
        'Scalability Testing',
        'Feature Flags',
        'A/B Testing',
        'Analytics',
        'Continuous Improvement'
      ];

      // Create layer epics and phase stories
      for (const layer of layers) {
        console.log(`\nProcessing Layer ${layer.num}: ${layer.name}`);
        
        const epicKey = await this.createLayerEpic(layer.num, layer.name, layer.priority, layer.critical);
        if (epicKey) {
          summary.totalEpics++;
          
          // Create phase stories for critical layers first
          if (layer.critical || layer.priority === 'Highest') {
            for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
              const storyPriority = phaseIdx <= 11 ? 'Highest' : 'High';
              const storyKey = await this.createPhaseStory(
                layer.num,
                layer.name,
                phaseIdx,
                phases[phaseIdx],
                epicKey,
                storyPriority
              );
              
              if (storyKey) {
                summary.totalStories++;
              } else {
                summary.storiesFailed++;
              }
              
              // Add delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } else {
          summary.epicsFailed++;
        }
        
        // Add delay between layers
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('\n=== JIRA Synchronization Complete ===');
      console.log(`Total Epics Created: ${summary.totalEpics}`);
      console.log(`Total Stories Created: ${summary.totalStories}`);
      console.log(`Epics Failed: ${summary.epicsFailed}`);
      console.log(`Stories Failed: ${summary.storiesFailed}`);

      return {
        success: summary.epicsFailed === 0,
        summary
      };

    } catch (error) {
      console.error('Fatal error during JIRA synchronization:', error);
      return { success: false, summary };
    }
  }
}

// Export singleton instance
export const jiraIntegrationService = new JiraIntegrationService();