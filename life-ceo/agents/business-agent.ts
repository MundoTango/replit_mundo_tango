// Business Agent - Manages professional life and career
import { BaseAgent, AgentMessage, AgentTask } from './base-agent';
import OpenAI from 'openai';

export class BusinessAgent extends BaseAgent {
  private openai: OpenAI;
  private businessContext: {
    projects: Map<string, any>;
    meetings: Map<string, any>;
    contacts: Map<string, any>;
    opportunities: Map<string, any>;
  };

  constructor() {
    super({
      type: 'business',
      name: 'Business Agent',
      description: 'Manages professional life, career development, and business opportunities',
      permissions: ['calendar_access', 'email_access', 'contact_management'],
      priority: 'high'
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.businessContext = {
      projects: new Map(),
      meetings: new Map(),
      contacts: new Map(),
      opportunities: new Map()
    };
  }

  async processMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'request':
        await this.handleRequest(message);
        break;
      case 'notification':
        await this.handleNotification(message);
        break;
      default:
        // Store for context
        await this.storeMemory(message, 0.5, ['message', message.from]);
    }
  }

  private async handleRequest(message: AgentMessage): Promise<void> {
    const { payload } = message;
    
    switch (payload.action) {
      case 'schedule_meeting':
        await this.scheduleMeeting(payload.data);
        break;
      case 'project_update':
        await this.updateProject(payload.data);
        break;
      case 'opportunity_analysis':
        await this.analyzeOpportunity(payload.data);
        break;
      case 'network_suggestion':
        await this.suggestNetworking();
        break;
      default:
        // Use AI to process unknown requests
        await this.processWithAI(payload);
    }
  }

  private async scheduleMeeting(data: any): Promise<void> {
    const meeting = {
      id: this.generateId(),
      title: data.title,
      participants: data.participants,
      time: new Date(data.time),
      location: data.location || 'Buenos Aires',
      agenda: data.agenda,
      importance: this.calculateImportance(data)
    };

    this.businessContext.meetings.set(meeting.id, meeting);
    
    // Create task for preparation
    await this.createTask({
      title: `Prepare for meeting: ${meeting.title}`,
      description: `Review agenda and prepare materials`,
      priority: meeting.importance > 0.7 ? 'high' : 'medium',
      dueDate: new Date(meeting.time.getTime() - 30 * 60 * 1000) // 30 mins before
    });

    // Store in memory
    await this.storeMemory(meeting, meeting.importance, ['meeting', 'scheduled']);

    // Notify other relevant agents
    await this.sendMessage({
      to: 'calendar',
      type: 'notification',
      payload: { event: 'meeting_scheduled', data: meeting },
      priority: 'medium'
    });
  }

  private async updateProject(data: any): Promise<void> {
    const project = this.businessContext.projects.get(data.projectId) || {
      id: data.projectId,
      name: data.name,
      status: 'active',
      milestones: [],
      team: []
    };

    // Update project data
    Object.assign(project, data.updates);
    this.businessContext.projects.set(project.id, project);

    // Analyze project health
    const health = await this.analyzeProjectHealth(project);
    
    if (health.score < 0.5) {
      // Create urgent task
      await this.createTask({
        title: `Critical: Review project ${project.name}`,
        description: health.issues.join(', '),
        priority: 'high',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      });
    }

    await this.storeMemory({ project, health }, health.score < 0.5 ? 0.9 : 0.6, ['project', 'update']);
  }

  private async analyzeOpportunity(data: any): Promise<void> {
    const prompt = `
      Analyze this business opportunity for someone living in Buenos Aires, Argentina:
      ${JSON.stringify(data)}
      
      Consider:
      1. Alignment with current projects and skills
      2. Market conditions in Buenos Aires/Argentina
      3. Time investment vs potential return
      4. Strategic career value
      
      Provide a structured analysis with recommendation.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: 'You are a business advisor with expertise in the Buenos Aires market.'
      }, {
        role: 'user',
        content: prompt
      }],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Store opportunity
    const opportunity = {
      id: this.generateId(),
      ...data,
      analysis,
      score: analysis.recommendationScore || 0.5,
      timestamp: new Date()
    };

    this.businessContext.opportunities.set(opportunity.id, opportunity);
    await this.storeMemory(opportunity, opportunity.score, ['opportunity', 'analyzed']);

    // Create follow-up task if promising
    if (opportunity.score > 0.7) {
      await this.createTask({
        title: `Follow up on opportunity: ${data.title}`,
        description: analysis.nextSteps?.join(', '),
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      });
    }
  }

  private async suggestNetworking(): Promise<void> {
    // Analyze current network and suggest connections
    const contacts = Array.from(this.businessContext.contacts.values());
    const recentInteractions = await this.recallMemories('contact interaction', 20);
    
    const suggestions = await this.generateNetworkingSuggestions(contacts, recentInteractions);
    
    for (const suggestion of suggestions) {
      await this.createTask({
        title: `Network: Reach out to ${suggestion.name}`,
        description: suggestion.reason,
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
      });
    }
  }

  async generateInsights(): Promise<any[]> {
    const insights = [];

    // Project insights
    const projects = Array.from(this.businessContext.projects.values());
    const activeProjects = projects.filter(p => p.status === 'active');
    
    if (activeProjects.length > 5) {
      insights.push({
        type: 'warning',
        title: 'Project Overload',
        content: `You have ${activeProjects.length} active projects. Consider delegating or postponing some.`,
        confidence: 0.8
      });
    }

    // Meeting patterns
    const meetings = Array.from(this.businessContext.meetings.values());
    const upcomingMeetings = meetings.filter(m => m.time > new Date());
    
    if (upcomingMeetings.length > 10) {
      insights.push({
        type: 'optimization',
        title: 'Meeting Optimization Needed',
        content: 'High meeting load detected. Consider batching or delegating some meetings.',
        confidence: 0.7
      });
    }

    // Buenos Aires specific insights
    const currentHour = new Date().getHours();
    if (currentHour >= 13 && currentHour <= 15) {
      insights.push({
        type: 'cultural',
        title: 'Siesta Time Consideration',
        content: 'Many Buenos Aires businesses observe siesta. Schedule important calls outside 13:00-15:00.',
        confidence: 0.9
      });
    }

    return insights;
  }

  async executeTask(task: AgentTask): Promise<void> {
    await this.updateTaskStatus(task.id, 'in_progress');

    try {
      // Task execution logic based on type
      if (task.title.includes('meeting')) {
        await this.prepareMeeting(task);
      } else if (task.title.includes('project')) {
        await this.reviewProject(task);
      } else if (task.title.includes('network')) {
        await this.executeNetworking(task);
      } else {
        // Generic task execution
        await this.executeGenericTask(task);
      }

      await this.updateTaskStatus(task.id, 'completed');
    } catch (error) {
      await this.updateTaskStatus(task.id, 'failed');
      throw error;
    }
  }

  // Helper methods
  private calculateImportance(data: any): number {
    let score = 0.5;
    if (data.participants?.length > 5) score += 0.2;
    if (data.title?.toLowerCase().includes('critical')) score += 0.3;
    if (data.title?.toLowerCase().includes('investor')) score += 0.2;
    return Math.min(score, 1);
  }

  private async analyzeProjectHealth(project: any): Promise<any> {
    const issues = [];
    let score = 1;

    if (!project.milestones?.length) {
      issues.push('No milestones defined');
      score -= 0.3;
    }

    if (project.lastUpdate && (Date.now() - project.lastUpdate > 7 * 24 * 60 * 60 * 1000)) {
      issues.push('No updates in over a week');
      score -= 0.2;
    }

    return { score: Math.max(score, 0), issues };
  }

  private async generateNetworkingSuggestions(contacts: any[], interactions: any[]): Promise<any[]> {
    // Simple logic - in production would use AI
    const suggestions = [];
    const interactedIds = new Set(interactions.map(i => i.content?.contactId));

    for (const contact of contacts) {
      if (!interactedIds.has(contact.id) && contact.importance > 0.6) {
        suggestions.push({
          name: contact.name,
          reason: 'No recent interaction with important contact'
        });
      }
    }

    return suggestions.slice(0, 3); // Top 3 suggestions
  }

  private async processWithAI(payload: any): Promise<void> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: 'You are a business assistant helping someone manage their professional life in Buenos Aires.'
      }, {
        role: 'user',
        content: JSON.stringify(payload)
      }]
    });

    // Process AI response
    const result = response.choices[0].message.content;
    await this.storeMemory({ request: payload, response: result }, 0.6, ['ai_processed']);
  }

  private async prepareMeeting(task: AgentTask): Promise<void> {
    // Meeting preparation logic
    console.log(`Preparing for meeting: ${task.title}`);
  }

  private async reviewProject(task: AgentTask): Promise<void> {
    // Project review logic
    console.log(`Reviewing project: ${task.title}`);
  }

  private async executeNetworking(task: AgentTask): Promise<void> {
    // Networking execution logic
    console.log(`Executing networking: ${task.title}`);
  }

  private async executeGenericTask(task: AgentTask): Promise<void> {
    // Generic task execution
    console.log(`Executing task: ${task.title}`);
  }

  private async handleNotification(message: AgentMessage): Promise<void> {
    // Handle notifications from other agents
    await this.storeMemory(message.payload, 0.4, ['notification', message.from]);
  }
}