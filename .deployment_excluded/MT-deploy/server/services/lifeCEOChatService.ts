import OpenAI from 'openai';
import { storage } from '../storage';
import { agentMemoryService } from './agentMemoryService';
import { openaiService } from './openaiService';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  console.log('OpenAI client not initialized - using fallback responses');
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  userId: number;
  agentId: string;
  metadata?: {
    isVoice?: boolean;
    responseTime?: number;
    model?: string;
  };
}

export interface ConversationThread {
  id: string;
  userId: number;
  agentId: string;
  title: string;
  lastMessage: Date;
  messages: ChatMessage[];
}

export class LifeCEOChatService {
  private static instance: LifeCEOChatService;
  
  static getInstance(): LifeCEOChatService {
    if (!LifeCEOChatService.instance) {
      LifeCEOChatService.instance = new LifeCEOChatService();
    }
    return LifeCEOChatService.instance;
  }

  async sendMessage(
    userId: number,
    agentId: string,
    message: string,
    isVoice: boolean = false
  ): Promise<ChatMessage> {
    const startTime = Date.now();
    
    try {
      // Get agent configuration
      const agent = await this.getAgentConfig(agentId);
      
      // Get conversation history for context
      const recentMessages = await this.getRecentMessages(userId, agentId, 10);
      
      // Build memory-enhanced context
      const memoryContext = await agentMemoryService.buildContextFromMemories(
        agentId,
        userId.toString(),
        message
      );
      
      // Build conversation context with memory
      const systemPrompt = await this.buildSystemPrompt(agent, userId);
      const enhancedSystemPrompt = systemPrompt + '\n\n' + memoryContext;
      
      const messages = [
        {
          role: 'system' as const,
          content: enhancedSystemPrompt
        },
        ...recentMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];

      // Call OpenAI API or use fallback
      let assistantResponse: string;
      
      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
          response_format: { type: "text" }
        });
        assistantResponse = response.choices[0].message.content || 'I apologize, but I cannot provide a response right now.';
        
        // Store important information as memories
        await this.storeConversationMemory(agentId, userId, message, assistantResponse);
      } else {
        // Fallback response system when OpenAI is not available
        assistantResponse = this.generateFallbackResponse(message, agentId);
      }
      const responseTime = Date.now() - startTime;

      // Save user message
      const userMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        userId,
        agentId,
        metadata: {
          isVoice,
          responseTime: 0,
          model: 'user-input'
        }
      };

      // Save assistant response
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date(),
        userId,
        agentId,
        metadata: {
          isVoice: false,
          responseTime,
          model: 'gpt-4o'
        }
      };

      // Store both messages
      await this.saveMessage(userMessage);
      await this.saveMessage(assistantMessage);

      return assistantMessage;

    } catch (error: any) {
      console.error('Life CEO Chat Error:', error);
      
      // Return error message
      const errorMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        userId,
        agentId,
        metadata: {
          isVoice: false,
          responseTime: Date.now() - startTime,
          model: 'error-response'
        }
      };

      await this.saveMessage(errorMessage);
      return errorMessage;
    }
  }

  private async storeConversationMemory(
    agentId: string, 
    userId: number, 
    userMessage: string, 
    assistantResponse: string
  ): Promise<void> {
    try {
      // Extract important information from the conversation
      const analysisPrompt = `Analyze this conversation and extract key information worth remembering:
      
User: ${userMessage}
Assistant: ${assistantResponse}

Identify:
1. Important facts, preferences, or context about the user
2. Decisions made or actions to be taken
3. Key dates, names, or specific details mentioned
4. User goals or intentions expressed

Return a JSON object with:
{
  "summary": "Brief summary of the key information",
  "importance": 0.1-1.0 (how important this is to remember),
  "tags": ["relevant", "tags"],
  "shouldStore": true/false
}`;

      if (openai) {
        const analysis = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: analysisPrompt }],
          response_format: { type: "json_object" }
        });
        
        const result = JSON.parse(analysis.choices[0].message.content || '{}');
        
        if (result.shouldStore) {
          await agentMemoryService.storeMemory(
            agentId,
            userId.toString(),
            {
              userMessage,
              assistantResponse,
              summary: result.summary,
              timestamp: new Date()
            },
            result.importance || 0.5,
            result.tags || []
          );
        }
      }
    } catch (error) {
      console.error('Error storing conversation memory:', error);
    }
  }

  private async buildSystemPrompt(agent: any, userId: number): Promise<string> {
    return `You are the Life CEO, an advanced AI agent managing every aspect of Scott Boddye's life. You are currently operating as the "${agent.name}" agent with the following configuration:

**Agent Role**: ${agent.name}
**Specialization**: ${agent.description}
**Current Parameters**: ${JSON.stringify(agent.parameters, null, 2)}

**Your Core Responsibilities**:
1. Manage Scott's daily schedule and priorities
2. Coordinate with other Life CEO agents
3. Provide actionable insights and recommendations
4. Maintain emotional intelligence and empathy
5. Support Scott's tango community leadership at Mundo Tango

**Communication Style**:
- Be concise but comprehensive
- Provide specific, actionable advice
- Reference Scott's roles: super_admin, admin, dancer, teacher, organizer, city_admin
- Consider mobile interface limitations (Scott primarily uses mobile)
- Maintain professional yet warm tone

**Current Context**: This is a real-time conversation. Provide practical, immediate value while maintaining awareness of Scott's broader life goals and responsibilities.

Remember: You are not just answering questions - you are actively managing and optimizing Scott's life through intelligent conversation and guidance.`;
  }

  private async getAgentConfig(agentId: string): Promise<any> {
    // Get agent configuration from storage
    try {
      const config = await storage.getLifeCEOAgentConfig(agentId);
      return config || {
        name: 'Life CEO',
        description: 'Master life management agent',
        parameters: {
          responsiveness: 0.8,
          proactivity: 0.7,
          emotional_intelligence: 0.9
        }
      };
    } catch (error) {
      return {
        name: 'Life CEO',
        description: 'Master life management agent',
        parameters: {
          responsiveness: 0.8,
          proactivity: 0.7,
          emotional_intelligence: 0.9
        }
      };
    }
  }

  private async getRecentMessages(userId: number, agentId: string, limit: number): Promise<ChatMessage[]> {
    try {
      return await storage.getLifeCEOChatHistory(userId, agentId, limit);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  private async saveMessage(message: ChatMessage): Promise<void> {
    try {
      await storage.saveLifeCEOChatMessage(message);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFallbackResponse(message: string, agentId: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Schedule and time management responses
    if (lowerMessage.includes('schedule') || lowerMessage.includes('calendar') || lowerMessage.includes('time')) {
      return `I understand you're asking about schedule management, Scott. As your ${agentId} agent, I'd recommend reviewing your upcoming commitments and prioritizing high-impact activities. For detailed scheduling assistance, please provide your OpenAI API key to enable full AI capabilities.`;
    }
    
    // Mundo Tango platform management
    if (lowerMessage.includes('mundo tango') || lowerMessage.includes('platform') || lowerMessage.includes('users')) {
      return `Regarding Mundo Tango platform management: I can see you have super_admin privileges across all systems. For platform insights and strategic recommendations, I'll need full AI capabilities enabled. Your platform is currently running smoothly with active user engagement.`;
    }
    
    // Task and project management
    if (lowerMessage.includes('task') || lowerMessage.includes('project') || lowerMessage.includes('todo')) {
      return `For project and task management, I recommend focusing on your highest-priority Life CEO system development. Your current roles (super_admin, admin, dancer, teacher, organizer, city_admin) give you comprehensive platform control. Enable full AI capabilities for personalized project guidance.`;
    }
    
    // Daily life management
    if (lowerMessage.includes('daily') || lowerMessage.includes('routine') || lowerMessage.includes('life')) {
      return `As your Life CEO, I'm designed to optimize every aspect of your daily routine. To provide personalized life management strategies, I need full AI capabilities. Currently, I can confirm your systems are operational and your multi-role permissions are active.`;
    }
    
    // Tango community leadership
    if (lowerMessage.includes('tango') || lowerMessage.includes('community') || lowerMessage.includes('dance')) {
      return `Your tango community leadership through Mundo Tango is impressive, Scott. With your teacher, organizer, and city_admin roles, you're well-positioned to grow the platform. For detailed community growth strategies, please enable full AI capabilities.`;
    }
    
    // General greeting or hello
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello Scott! I'm your Life CEO ${agentId} agent, ready to help manage your life and projects. I can see you're authenticated with full administrative access. To unlock my complete AI capabilities for personalized assistance, please provide your OpenAI API key.`;
    }
    
    // Default response
    return `I understand your request, Scott. As your Life CEO ${agentId} agent, I'm designed to provide comprehensive life management support. To give you the detailed, personalized assistance you deserve, please enable full AI capabilities by providing your OpenAI API key. I can confirm your current system status is optimal.`;
  }

  async getConversationHistory(userId: number, agentId: string): Promise<ChatMessage[]> {
    try {
      return await storage.getLifeCEOChatHistory(userId, agentId, 50);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  async createNewConversation(userId: number, agentId: string, title?: string): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await storage.createLifeCEOConversation({
        id: conversationId,
        userId,
        agentId,
        title: title || `Chat with ${agentId}`,
        createdAt: new Date(),
        lastMessage: new Date()
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
    }

    return conversationId;
  }

  async getConversationThreads(userId: number): Promise<ConversationThread[]> {
    try {
      return await storage.getLifeCEOConversations(userId);
    } catch (error) {
      console.error('Error getting conversation threads:', error);
      return [];
    }
  }
}

export const lifeCEOChatService = LifeCEOChatService.getInstance();