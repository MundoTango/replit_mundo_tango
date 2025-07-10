export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'Platform' | 'Section' | 'Feature' | 'Project' | 'Task' | 'Sub-task';
  status: 'Completed' | 'In Progress' | 'Planned' | 'Blocked';
  completion?: number;
  mobileCompletion?: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  team?: string[];
  children?: ProjectItem[];
}

export const comprehensiveProjectData: ProjectItem[] = [
  {
    id: 'life-ceo-system',
    title: 'Life CEO System',
    description: 'AI-powered life management platform with 16 specialized agents',
    type: 'Platform',
    status: 'In Progress',
    completion: 85,
    priority: 'Critical',
    team: ['AI', 'Backend', 'Frontend'],
    children: [
      {
        id: 'agent-system',
        title: 'Agent System',
        description: '16 specialized AI agents for different life aspects',
        type: 'Section',
        status: 'In Progress',
        completion: 80,
        priority: 'Critical',
        team: ['AI', 'Backend']
      },
      {
        id: 'voice-interface',
        title: 'Voice Interface',
        description: 'Natural language processing and voice commands',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'High',
        team: ['Frontend', 'AI']
      }
    ]
  },
  {
    id: 'mundo-tango',
    title: 'Mundo Tango Platform',
    description: 'Social platform for tango dancers worldwide',
    type: 'Platform',
    status: 'In Progress',
    completion: 75,
    priority: 'High',
    team: ['Frontend', 'Backend', 'Database'],
    children: [
      {
        id: 'admin-center',
        title: 'Admin Center',
        description: 'Administrative interface with analytics and management tools',
        type: 'Section',
        status: 'Completed',
        completion: 95,
        priority: 'High',
        team: ['Frontend', 'Backend'],
        children: [
          {
            id: 'project-tracker',
            title: 'Project Tracker',
            description: 'Hierarchical project management system',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend']
          },
          {
            id: 'daily-activity-view',
            title: 'Daily Activity View',
            description: 'Real-time activity tracking and visualization',
            type: 'Feature',
            status: 'Completed',
            completion: 100,
            priority: 'High',
            team: ['Frontend', 'Backend']
          }
        ]
      }
    ]
  },
  {
    id: 'technical-infrastructure',
    title: 'Technical Infrastructure',
    description: 'Core technical systems and frameworks',
    type: 'Platform',
    status: 'In Progress',
    completion: 90,
    priority: 'Critical',
    team: ['DevOps', 'Backend', 'Database'],
    children: [
      {
        id: 'database-security',
        title: 'Database Security',
        description: 'Row-level security, audit logging, health monitoring',
        type: 'Section',
        status: 'Completed',
        completion: 100,
        priority: 'Critical',
        team: ['Database', 'Security']
      },
      {
        id: 'api-infrastructure',
        title: 'API Infrastructure',
        description: 'RESTful APIs and real-time websocket connections',
        type: 'Section',
        status: 'In Progress',
        completion: 85,
        priority: 'High',
        team: ['Backend']
      }
    ]
  }
];