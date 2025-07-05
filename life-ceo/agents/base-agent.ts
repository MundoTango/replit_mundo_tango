// Base Agent Class for Life CEO System
import { EventEmitter } from 'events';

export interface AgentConfig {
  type: string;
  name: string;
  description: string;
  permissions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentContext {
  userId: string;
  location?: {
    city: string;
    country: string;
    timezone: string;
  };
  language: string;
  preferences: Record<string, any>;
  currentTime: Date;
}

export interface AgentMemory {
  id: string;
  content: any;
  timestamp: Date;
  importance: number;
  tags: string[];
}

export interface AgentTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface AgentMessage {
  from: string;
  to?: string;
  type: 'request' | 'response' | 'notification' | 'insight';
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export abstract class BaseAgent extends EventEmitter {
  protected config: AgentConfig;
  protected context: AgentContext;
  protected memories: Map<string, AgentMemory> = new Map();
  protected tasks: Map<string, AgentTask> = new Map();
  protected isActive: boolean = false;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.context = {
      userId: '',
      language: 'en',
      preferences: {},
      currentTime: new Date()
    };
  }

  // Lifecycle methods
  async initialize(context: AgentContext): Promise<void> {
    this.context = context;
    this.isActive = true;
    await this.loadMemories();
    await this.loadTasks();
    this.emit('initialized', { agent: this.config.type });
  }

  async shutdown(): Promise<void> {
    this.isActive = false;
    await this.saveMemories();
    await this.saveTasks();
    this.emit('shutdown', { agent: this.config.type });
  }

  // Memory management
  async storeMemory(content: any, importance: number = 0.5, tags: string[] = []): Promise<void> {
    const memory: AgentMemory = {
      id: this.generateId(),
      content,
      timestamp: new Date(),
      importance,
      tags: [...tags, this.config.type]
    };
    
    this.memories.set(memory.id, memory);
    await this.persistMemory(memory);
  }

  async recallMemories(query: string, limit: number = 10): Promise<AgentMemory[]> {
    // This would use vector search in production
    const memories = Array.from(this.memories.values());
    return memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  // Task management
  async createTask(task: Omit<AgentTask, 'id' | 'status'>): Promise<AgentTask> {
    const newTask: AgentTask = {
      ...task,
      id: this.generateId(),
      status: 'pending'
    };
    
    this.tasks.set(newTask.id, newTask);
    await this.persistTask(newTask);
    this.emit('taskCreated', newTask);
    
    return newTask;
  }

  async updateTaskStatus(taskId: string, status: AgentTask['status']): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      await this.persistTask(task);
      this.emit('taskUpdated', task);
    }
  }

  // Inter-agent communication
  async sendMessage(message: Omit<AgentMessage, 'from'>): Promise<void> {
    const fullMessage: AgentMessage = {
      ...message,
      from: this.config.type
    };
    
    this.emit('messageSent', fullMessage);
    // In production, this would use the message queue
  }

  async receiveMessage(message: AgentMessage): Promise<void> {
    this.emit('messageReceived', message);
    await this.processMessage(message);
  }

  // Abstract methods to be implemented by specific agents
  abstract processMessage(message: AgentMessage): Promise<void>;
  abstract generateInsights(): Promise<any[]>;
  abstract executeTask(task: AgentTask): Promise<void>;

  // Context awareness
  updateContext(updates: Partial<AgentContext>): void {
    this.context = { ...this.context, ...updates };
    this.emit('contextUpdated', this.context);
  }

  // Buenos Aires specific context
  getBuenosAiresContext(): any {
    return {
      timezone: 'America/Argentina/Buenos_Aires',
      culture: {
        language: 'es-AR',
        workHours: { start: 9, end: 18 },
        siesta: { start: 13, end: 15 },
        dinnerTime: { start: 21, end: 23 }
      },
      currency: 'ARS',
      emergencyNumbers: {
        police: 911,
        medical: 107,
        fire: 100
      }
    };
  }

  // Helper methods
  protected generateId(): string {
    return `${this.config.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected async loadMemories(): Promise<void> {
    // Load from database
  }

  protected async saveMemories(): Promise<void> {
    // Save to database
  }

  protected async loadTasks(): Promise<void> {
    // Load from database
  }

  protected async saveTasks(): Promise<void> {
    // Save to database
  }

  protected async persistMemory(memory: AgentMemory): Promise<void> {
    // Persist to database
  }

  protected async persistTask(task: AgentTask): Promise<void> {
    // Persist to database
  }

  // Getters
  getConfig(): AgentConfig {
    return this.config;
  }

  getContext(): AgentContext {
    return this.context;
  }

  getTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  getActiveTaskCount(): number {
    return Array.from(this.tasks.values())
      .filter(task => task.status === 'pending' || task.status === 'in_progress')
      .length;
  }
}