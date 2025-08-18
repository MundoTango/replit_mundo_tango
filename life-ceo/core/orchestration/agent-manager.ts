import { EventEmitter } from 'events';
import { z } from 'zod';

// Agent types matching the 16 specialized agents
export enum AgentType {
  BUSINESS = 'business',
  FINANCE = 'finance',
  HEALTH = 'health',
  RELATIONSHIPS = 'relationships',
  LEARNING = 'learning',
  CREATIVE = 'creative',
  NETWORK = 'network',
  GLOBAL_MOBILITY = 'global_mobility',
  SECURITY = 'security',
  EMERGENCY = 'emergency',
  MEMORY = 'memory',
  VOICE = 'voice',
  DATA = 'data',
  WORKFLOW = 'workflow',
  LEGAL = 'legal',
  HOME = 'home'
}

// Agent message schema
export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  from: z.nativeEnum(AgentType),
  to: z.nativeEnum(AgentType).optional(),
  type: z.enum(['request', 'response', 'notification', 'broadcast']),
  payload: z.any(),
  timestamp: z.date(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  context: z.object({
    userId: z.string(),
    sessionId: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      country: z.string().optional(),
      timezone: z.string().optional()
    }).optional(),
    cultural: z.object({
      language: z.string().default('en'),
      region: z.string().optional()
    }).optional()
  })
});

export type AgentMessage = z.infer<typeof AgentMessageSchema>;

// Base agent interface
export interface IAgent {
  type: AgentType;
  name: string;
  description: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  
  initialize(): Promise<void>;
  processMessage(message: AgentMessage): Promise<AgentMessage | null>;
  shutdown(): Promise<void>;
  getCapabilities(): string[];
  getStatus(): { status: string; metrics: any };
}

// Agent Manager for orchestrating all agents
export class AgentManager extends EventEmitter {
  private agents: Map<AgentType, IAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private processing: boolean = false;

  constructor() {
    super();
  }

  // Register an agent with the manager
  async registerAgent(agent: IAgent): Promise<void> {
    await agent.initialize();
    this.agents.set(agent.type, agent);
    console.log(`Agent registered: ${agent.name} (${agent.type})`);
    this.emit('agent:registered', agent);
  }

  // Send a message to an agent or broadcast
  async sendMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    this.emit('message:queued', message);
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process the message queue
  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      
      try {
        if (message.type === 'broadcast') {
          // Send to all agents
          const responses = await Promise.all(
            Array.from(this.agents.values()).map(agent => 
              agent.processMessage(message)
            )
          );
          this.emit('message:broadcast:complete', { message, responses });
        } else if (message.to) {
          // Send to specific agent
          const agent = this.agents.get(message.to);
          if (agent) {
            const response = await agent.processMessage(message);
            if (response) {
              this.emit('message:response', response);
              // Queue the response if it needs to go to another agent
              if (response.to) {
                this.messageQueue.push(response);
              }
            }
          } else {
            console.error(`Agent not found: ${message.to}`);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        this.emit('message:error', { message, error });
      }
    }

    this.processing = false;
  }

  // Get all registered agents
  getAgents(): IAgent[] {
    return Array.from(this.agents.values());
  }

  // Get a specific agent
  getAgent(type: AgentType): IAgent | undefined {
    return this.agents.get(type);
  }

  // Shutdown all agents
  async shutdown(): Promise<void> {
    console.log('Shutting down all agents...');
    await Promise.all(
      Array.from(this.agents.values()).map(agent => agent.shutdown())
    );
    this.agents.clear();
    this.emit('shutdown:complete');
  }

  // Get system status
  getSystemStatus(): any {
    const agentStatuses = Array.from(this.agents.entries()).map(([type, agent]) => ({
      type,
      ...agent.getStatus()
    }));

    return {
      totalAgents: this.agents.size,
      queueLength: this.messageQueue.length,
      processing: this.processing,
      agents: agentStatuses
    };
  }

  // Buenos Aires context integration
  applyBuenosAiresContext(message: AgentMessage): AgentMessage {
    return {
      ...message,
      context: {
        ...message.context,
        location: {
          city: 'Buenos Aires',
          country: 'Argentina',
          timezone: 'America/Argentina/Buenos_Aires',
          ...message.context.location
        },
        cultural: {
          language: 'es',
          region: 'LATAM',
          ...message.context.cultural
        }
      }
    };
  }
}