import { comprehensiveProjectData, ProjectItem } from '../../client/src/data/comprehensive-project-data';

// 40x20s Framework Structure for JIRA Export
export interface JiraIssue {
  issueType: 'Epic' | 'Story' | 'Task' | 'Sub-task' | 'Bug';
  summary: string;
  description: string;
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  labels: string[];
  components: string[];
  storyPoints?: number;
  acceptanceCriteria?: string[];
  epicLink?: string;
  parentIssue?: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  assignee?: string;
  layer?: number; // 40L framework layer (1-40)
  phase?: number; // 20 phases (1-20)
  frameworkQuadrant?: string; // Which part of 40x20s grid
}

// Map our project structure to 40L framework layers
const layerMapping = {
  'Frontend': [7, 8, 9], // UI/UX, Mobile, PWA
  'Backend': [10, 11, 12], // API, Real-time, Background Jobs
  'Database': [15, 16], // Database, Data Migration
  'AI': [23, 24], // AI/ML, NLP
  'Security': [21, 22], // Authentication, User Safety
  'Performance': [25, 26], // Performance, Caching
  'QA': [31], // Testing & Validation
  'DevOps': [19, 20], // Deployment, Infrastructure
  'Analytics': [27, 28], // Analytics, Monitoring
  'Design': [7, 8], // UI/UX layers
  'Mobile': [8, 29], // Mobile, Cross-platform
  'UX': [7, 8, 9], // UI/UX layers
};

// Map priority levels
const priorityMap = {
  'Critical': 'Highest',
  'High': 'High',
  'Medium': 'Medium',
  'Low': 'Low'
} as const;

// Map status
const statusMap = {
  'Completed': 'Done',
  'In Progress': 'In Progress',
  'Planned': 'To Do',
  'Blocked': 'Blocked'
} as const;

// Calculate phase based on completion percentage
function calculatePhase(completion: number): number {
  if (completion === 0) return 1;
  if (completion === 100) return 20;
  return Math.ceil((completion / 100) * 20);
}

// Get layers for a team
function getLayersForTeams(teams: string[] = []): number[] {
  const layers = new Set<number>();
  teams.forEach(team => {
    const teamLayers = layerMapping[team as keyof typeof layerMapping];
    if (teamLayers) {
      teamLayers.forEach(layer => layers.add(layer));
    }
  });
  return Array.from(layers);
}

// Convert ProjectItem to JiraIssue(s)
function convertToJiraIssues(
  item: ProjectItem, 
  parentEpic?: string, 
  parentIssue?: string,
  issues: JiraIssue[] = []
): JiraIssue[] {
  const layers = getLayersForTeams(item.team);
  const phase = calculatePhase(item.completion || 0);
  
  // Map type to JIRA issue type
  let issueType: JiraIssue['issueType'];
  switch (item.type) {
    case 'Platform':
    case 'Section':
      issueType = 'Epic';
      break;
    case 'Feature':
    case 'Project':
      issueType = 'Story';
      break;
    case 'Task':
      issueType = 'Task';
      break;
    case 'Sub-task':
      issueType = 'Sub-task';
      break;
    default:
      issueType = 'Task';
  }

  // Create the JIRA issue
  const jiraIssue: JiraIssue = {
    issueType,
    summary: item.title,
    description: `${item.description}\n\n**40x20s Framework Details:**\n- Layers: ${layers.join(', ') || 'N/A'}\n- Phase: ${phase}/20\n- Completion: ${item.completion || 0}%\n- Mobile Completion: ${item.mobileCompletion || 0}%`,
    priority: priorityMap[item.priority],
    labels: [
      `40x20s-phase-${phase}`,
      ...layers.map(l => `layer-${l}`),
      item.type.toLowerCase(),
      ...(item.team || []).map(t => `team-${t.toLowerCase()}`)
    ],
    components: item.team || [],
    status: statusMap[item.status],
    layer: layers[0],
    phase,
    frameworkQuadrant: `L${layers.join('-')}-P${phase}`,
    epicLink: issueType === 'Epic' ? undefined : parentEpic,
    parentIssue: issueType === 'Sub-task' ? parentIssue : undefined,
    storyPoints: estimateStoryPoints(item),
    acceptanceCriteria: generateAcceptanceCriteria(item)
  };

  issues.push(jiraIssue);

  // Process children recursively
  if (item.children) {
    const currentEpic = issueType === 'Epic' ? item.id : parentEpic;
    const currentParent = issueType === 'Story' || issueType === 'Task' ? item.id : parentIssue;
    
    item.children.forEach(child => {
      convertToJiraIssues(child, currentEpic, currentParent, issues);
    });
  }

  return issues;
}

// Estimate story points based on complexity
function estimateStoryPoints(item: ProjectItem): number {
  const basePoints = {
    'Platform': 13,
    'Section': 8,
    'Feature': 5,
    'Project': 5,
    'Task': 3,
    'Sub-task': 1
  };

  let points = basePoints[item.type] || 3;

  // Adjust based on priority
  if (item.priority === 'Critical') points += 2;
  if (item.priority === 'High') points += 1;

  // Adjust based on team size
  if (item.team && item.team.length > 2) points += 1;

  // Adjust based on completion
  if (item.completion && item.completion < 50) points += 1;

  return Math.min(points, 13); // Cap at 13
}

// Generate acceptance criteria
function generateAcceptanceCriteria(item: ProjectItem): string[] {
  const criteria: string[] = [];

  // Basic criteria for all items
  criteria.push(`${item.title} is fully functional and tested`);
  
  if (item.team?.includes('Frontend')) {
    criteria.push('UI components are responsive and follow MT ocean theme');
    criteria.push('All user interactions have proper feedback');
  }
  
  if (item.team?.includes('Backend')) {
    criteria.push('API endpoints return correct status codes and data');
    criteria.push('Error handling is comprehensive');
  }
  
  if (item.team?.includes('Database')) {
    criteria.push('Database queries are optimized');
    criteria.push('Data integrity is maintained');
  }
  
  if (item.priority === 'Critical') {
    criteria.push('Performance meets <3s page load target');
    criteria.push('Security review completed');
  }

  if (item.mobileCompletion !== undefined) {
    criteria.push(`Mobile experience achieves ${item.mobileCompletion}% functionality`);
  }

  return criteria;
}

// Generate JIRA CSV export
export function generateJiraCSV(): string {
  const allIssues: JiraIssue[] = [];
  
  // Convert all project data to JIRA issues
  comprehensiveProjectData.forEach(platform => {
    convertToJiraIssues(platform, undefined, undefined, allIssues);
  });

  // CSV Headers
  const headers = [
    'Issue Type',
    'Summary',
    'Description',
    'Priority',
    'Labels',
    'Components',
    'Story Points',
    'Status',
    'Epic Link',
    'Parent',
    'Layer',
    'Phase',
    'Framework Quadrant',
    'Acceptance Criteria'
  ];

  // Convert to CSV rows
  const rows = allIssues.map(issue => [
    issue.issueType,
    `"${issue.summary.replace(/"/g, '""')}"`,
    `"${issue.description.replace(/"/g, '""')}"`,
    issue.priority,
    `"${issue.labels.join(', ')}"`,
    `"${issue.components.join(', ')}"`,
    issue.storyPoints || '',
    issue.status,
    issue.epicLink || '',
    issue.parentIssue || '',
    issue.layer || '',
    issue.phase || '',
    issue.frameworkQuadrant || '',
    `"${(issue.acceptanceCriteria || []).join('\\n')}"`,
  ]);

  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

// Generate JIRA JSON export (for API import)
export function generateJiraJSON(): object {
  const allIssues: JiraIssue[] = [];
  
  // Convert all project data to JIRA issues
  comprehensiveProjectData.forEach(platform => {
    convertToJiraIssues(platform, undefined, undefined, allIssues);
  });

  return {
    project: {
      key: 'MT',
      name: 'Mundo Tango',
      description: 'Social platform for tango dancers worldwide with Life CEO integration'
    },
    issues: allIssues,
    metadata: {
      exportDate: new Date().toISOString(),
      framework: '40x20s',
      totalIssues: allIssues.length,
      issueBreakdown: {
        epics: allIssues.filter(i => i.issueType === 'Epic').length,
        stories: allIssues.filter(i => i.issueType === 'Story').length,
        tasks: allIssues.filter(i => i.issueType === 'Task').length,
        subtasks: allIssues.filter(i => i.issueType === 'Sub-task').length,
      },
      layerCoverage: Array.from(new Set(allIssues.map(i => i.layer).filter(Boolean))).sort(),
      phaseCoverage: Array.from(new Set(allIssues.map(i => i.phase).filter(Boolean))).sort(),
    }
  };
}

// Generate 40x20s Framework Summary
export function generate40x20sSummary(): object {
  const summary: any = {
    framework: '40x20s Expert Worker System',
    totalCheckpoints: 800, // 40 layers × 20 phases
    layers: {},
    phases: {},
    coverage: {
      totalItems: 0,
      byLayer: {},
      byPhase: {},
      byQuadrant: {}
    }
  };

  const allIssues: JiraIssue[] = [];
  comprehensiveProjectData.forEach(platform => {
    convertToJiraIssues(platform, undefined, undefined, allIssues);
  });

  // Analyze coverage
  allIssues.forEach(issue => {
    summary.coverage.totalItems++;
    
    if (issue.layer) {
      summary.coverage.byLayer[issue.layer] = (summary.coverage.byLayer[issue.layer] || 0) + 1;
    }
    
    if (issue.phase) {
      summary.coverage.byPhase[issue.phase] = (summary.coverage.byPhase[issue.phase] || 0) + 1;
    }
    
    if (issue.frameworkQuadrant) {
      summary.coverage.byQuadrant[issue.frameworkQuadrant] = 
        (summary.coverage.byQuadrant[issue.frameworkQuadrant] || 0) + 1;
    }
  });

  // Add layer descriptions
  summary.layers = {
    1: 'Foundation',
    7: 'Frontend UI/UX',
    8: 'Mobile',
    9: 'PWA',
    10: 'API Layer',
    11: 'Real-time',
    12: 'Background Jobs',
    15: 'Database',
    16: 'Data Migration',
    19: 'Deployment',
    20: 'Infrastructure',
    21: 'Authentication',
    22: 'User Safety',
    23: 'AI/ML',
    24: 'NLP',
    25: 'Performance',
    26: 'Caching',
    27: 'Analytics',
    28: 'Monitoring',
    29: 'Cross-platform',
    31: 'Testing & Validation',
    35: 'Feature Flags',
    40: 'Future Innovation'
  };

  // Add phase descriptions
  summary.phases = {
    1: 'Planning & Design',
    5: 'Development',
    10: 'Testing',
    15: 'Deployment',
    20: 'Post-Launch & Optimization'
  };

  return summary;
}

// Main export function
export function exportMundoTangoToJira(format: 'csv' | 'json' | 'summary' = 'json') {
  switch (format) {
    case 'csv':
      return generateJiraCSV();
    case 'json':
      return generateJiraJSON();
    case 'summary':
      return generate40x20sSummary();
    default:
      return generateJiraJSON();
  }
}