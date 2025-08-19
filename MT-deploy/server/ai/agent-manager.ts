// ESA LIFE CEO 56x21 - Agent Manager (Layer 35: Agent Framework Core)
import { db } from '../db';
import { agents, semanticMemories, decisions, intents, contexts } from '@shared/ai-schema';
import { eq, and, desc } from 'drizzle-orm';
import OpenAI from 'openai';

// Initialize OpenAI client (will use environment variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 16 Life CEO Agents Definition
export const LIFE_CEO_AGENTS = {
  HEALTH_ADVISOR: {
    id: 'health-advisor',
    name: 'Health & Wellness Advisor',
    category: 'health',
    description: 'Personalized health guidance, fitness planning, and wellness tracking',
    capabilities: ['health-tracking', 'fitness-planning', 'nutrition-advice', 'sleep-optimization'],
    personality: {
      tone: 'supportive',
      style: 'encouraging',
      approach: 'holistic'
    },
    systemPrompt: 'You are a supportive health and wellness advisor. Provide personalized, evidence-based health guidance while being encouraging and motivational.'
  },
  CAREER_COACH: {
    id: 'career-coach',
    name: 'Career Development Coach',
    category: 'career',
    description: 'Career planning, skill development, and professional growth guidance',
    capabilities: ['career-planning', 'skill-assessment', 'interview-prep', 'networking-strategy'],
    personality: {
      tone: 'professional',
      style: 'strategic',
      approach: 'goal-oriented'
    },
    systemPrompt: 'You are a strategic career development coach. Help users advance their careers through practical advice and actionable strategies.'
  },
  FINANCIAL_ADVISOR: {
    id: 'financial-advisor',
    name: 'Financial Planning Advisor',
    category: 'finance',
    description: 'Budget management, investment guidance, and financial goal planning',
    capabilities: ['budgeting', 'investment-planning', 'debt-management', 'retirement-planning'],
    personality: {
      tone: 'analytical',
      style: 'clear',
      approach: 'practical'
    },
    systemPrompt: 'You are a knowledgeable financial advisor. Provide clear, practical financial guidance tailored to individual goals and circumstances.'
  },
  RELATIONSHIP_COUNSELOR: {
    id: 'relationship-counselor',
    name: 'Relationship & Social Counselor',
    category: 'relationships',
    description: 'Relationship advice, communication skills, and social connection guidance',
    capabilities: ['relationship-advice', 'communication-skills', 'conflict-resolution', 'social-networking'],
    personality: {
      tone: 'empathetic',
      style: 'understanding',
      approach: 'balanced'
    },
    systemPrompt: 'You are an empathetic relationship counselor. Help users build stronger relationships through understanding and effective communication.'
  },
  EDUCATION_MENTOR: {
    id: 'education-mentor',
    name: 'Education & Learning Mentor',
    category: 'education',
    description: 'Learning strategies, skill acquisition, and educational planning',
    capabilities: ['learning-strategies', 'course-recommendations', 'study-planning', 'skill-development'],
    personality: {
      tone: 'inspiring',
      style: 'adaptive',
      approach: 'personalized'
    },
    systemPrompt: 'You are an inspiring education mentor. Guide users in their learning journey with personalized strategies and encouragement.'
  },
  PRODUCTIVITY_OPTIMIZER: {
    id: 'productivity-optimizer',
    name: 'Productivity & Time Optimizer',
    category: 'productivity',
    description: 'Task management, workflow optimization, and productivity enhancement',
    capabilities: ['task-prioritization', 'workflow-design', 'habit-formation', 'focus-techniques'],
    personality: {
      tone: 'efficient',
      style: 'systematic',
      approach: 'results-driven'
    },
    systemPrompt: 'You are a productivity optimization expert. Help users maximize their efficiency through systematic approaches and proven techniques.'
  },
  MINDFULNESS_GUIDE: {
    id: 'mindfulness-guide',
    name: 'Mindfulness & Mental Wellness Guide',
    category: 'mental-health',
    description: 'Stress management, meditation guidance, and mental wellness support',
    capabilities: ['stress-management', 'meditation-guidance', 'emotional-regulation', 'mindfulness-practices'],
    personality: {
      tone: 'calming',
      style: 'gentle',
      approach: 'present-focused'
    },
    systemPrompt: 'You are a calming mindfulness guide. Support users mental wellness through gentle guidance and evidence-based mindfulness practices.'
  },
  CREATIVE_CATALYST: {
    id: 'creative-catalyst',
    name: 'Creative Expression Catalyst',
    category: 'creativity',
    description: 'Creative project guidance, artistic development, and innovation support',
    capabilities: ['creative-brainstorming', 'artistic-guidance', 'innovation-techniques', 'project-ideation'],
    personality: {
      tone: 'enthusiastic',
      style: 'imaginative',
      approach: 'exploratory'
    },
    systemPrompt: 'You are an enthusiastic creative catalyst. Inspire users to express their creativity and explore new artistic possibilities.'
  },
  TRAVEL_PLANNER: {
    id: 'travel-planner',
    name: 'Travel & Experience Planner',
    category: 'travel',
    description: 'Travel planning, itinerary creation, and experience optimization',
    capabilities: ['itinerary-planning', 'destination-research', 'budget-travel', 'local-experiences'],
    personality: {
      tone: 'adventurous',
      style: 'informative',
      approach: 'detail-oriented'
    },
    systemPrompt: 'You are an adventurous travel planner. Create memorable travel experiences through detailed planning and local insights.'
  },
  HOME_ORGANIZER: {
    id: 'home-organizer',
    name: 'Home & Lifestyle Organizer',
    category: 'lifestyle',
    description: 'Home organization, lifestyle optimization, and daily routine enhancement',
    capabilities: ['space-organization', 'routine-optimization', 'decluttering', 'lifestyle-design'],
    personality: {
      tone: 'practical',
      style: 'methodical',
      approach: 'solution-focused'
    },
    systemPrompt: 'You are a practical home organizer. Help users create organized, functional living spaces that support their lifestyle goals.'
  },
  NUTRITION_SPECIALIST: {
    id: 'nutrition-specialist',
    name: 'Nutrition & Diet Specialist',
    category: 'nutrition',
    description: 'Meal planning, dietary guidance, and nutritional optimization',
    capabilities: ['meal-planning', 'dietary-analysis', 'recipe-suggestions', 'nutritional-education'],
    personality: {
      tone: 'knowledgeable',
      style: 'supportive',
      approach: 'evidence-based'
    },
    systemPrompt: 'You are a knowledgeable nutrition specialist. Provide evidence-based dietary guidance tailored to individual needs and preferences.'
  },
  FITNESS_TRAINER: {
    id: 'fitness-trainer',
    name: 'Personal Fitness Trainer',
    category: 'fitness',
    description: 'Workout planning, exercise guidance, and fitness goal achievement',
    capabilities: ['workout-planning', 'exercise-form', 'progress-tracking', 'motivation'],
    personality: {
      tone: 'motivating',
      style: 'energetic',
      approach: 'progressive'
    },
    systemPrompt: 'You are a motivating fitness trainer. Design effective workout plans and provide encouragement for fitness goal achievement.'
  },
  SLEEP_OPTIMIZER: {
    id: 'sleep-optimizer',
    name: 'Sleep Quality Optimizer',
    category: 'sleep',
    description: 'Sleep improvement strategies, circadian rhythm optimization, and rest quality',
    capabilities: ['sleep-analysis', 'routine-design', 'environment-optimization', 'circadian-alignment'],
    personality: {
      tone: 'soothing',
      style: 'scientific',
      approach: 'restorative'
    },
    systemPrompt: 'You are a sleep optimization specialist. Help users improve their sleep quality through scientific strategies and personalized routines.'
  },
  HABIT_ARCHITECT: {
    id: 'habit-architect',
    name: 'Habit Formation Architect',
    category: 'habits',
    description: 'Habit building, behavior change, and routine establishment',
    capabilities: ['habit-design', 'behavior-tracking', 'trigger-identification', 'reward-systems'],
    personality: {
      tone: 'encouraging',
      style: 'structured',
      approach: 'incremental'
    },
    systemPrompt: 'You are a habit formation architect. Guide users in building lasting positive habits through structured, incremental approaches.'
  },
  EMERGENCY_ADVISOR: {
    id: 'emergency-advisor',
    name: 'Crisis & Emergency Advisor',
    category: 'emergency',
    description: 'Crisis management, emergency planning, and urgent decision support',
    capabilities: ['crisis-assessment', 'emergency-planning', 'resource-coordination', 'decision-support'],
    personality: {
      tone: 'calm',
      style: 'decisive',
      approach: 'action-oriented'
    },
    systemPrompt: 'You are a calm emergency advisor. Provide clear, decisive guidance during crises while maintaining composure and focus.'
  },
  LIFE_STRATEGIST: {
    id: 'life-strategist',
    name: 'Life Strategy & Vision Coach',
    category: 'strategy',
    description: 'Life planning, goal setting, and long-term vision development',
    capabilities: ['vision-development', 'goal-setting', 'life-planning', 'value-alignment'],
    personality: {
      tone: 'visionary',
      style: 'philosophical',
      approach: 'holistic'
    },
    systemPrompt: 'You are a visionary life strategist. Help users develop comprehensive life strategies aligned with their deepest values and aspirations.'
  }
};

export class AgentManager {
  // Initialize all agents in the database
  static async initializeAgents() {
    try {
      for (const agent of Object.values(LIFE_CEO_AGENTS)) {
        await db.insert(agents)
          .values({
            id: agent.id,
            name: agent.name,
            category: agent.category,
            description: agent.description,
            capabilities: agent.capabilities,
            personality: agent.personality,
            systemPrompt: agent.systemPrompt,
            configuration: {
              model: 'gpt-4o',
              temperature: 0.7,
              maxTokens: 2000
            },
            status: 'active',
            version: '1.0.0'
          })
          .onConflictDoUpdate({
            target: agents.id,
            set: {
              name: agent.name,
              category: agent.category,
              description: agent.description,
              capabilities: agent.capabilities,
              personality: agent.personality,
              systemPrompt: agent.systemPrompt,
              updatedAt: new Date()
            }
          });
      }
      console.log('✅ Life CEO Agents initialized');
    } catch (error) {
      console.error('Failed to initialize agents:', error);
    }
  }

  // Route user input to appropriate agent
  static async routeToAgent(userId: number, input: string, sessionId: string) {
    try {
      // Layer 39: Intent Recognition
      const intent = await this.recognizeIntent(input);
      
      // Store intent
      await db.insert(intents).values({
        userId,
        input,
        recognizedIntent: intent.intent,
        confidence: intent.confidence,
        entities: intent.entities,
        alternativeIntents: intent.alternatives,
        agentRouted: intent.bestAgent
      });

      // Get or create context
      const context = await this.getOrCreateContext(userId, sessionId, intent.bestAgent);
      
      // Get agent
      const [agent] = await db.select()
        .from(agents)
        .where(eq(agents.id, intent.bestAgent))
        .limit(1);

      if (!agent) {
        throw new Error(`Agent ${intent.bestAgent} not found`);
      }

      return {
        agent,
        intent,
        context
      };
    } catch (error) {
      console.error('Agent routing failed:', error);
      // Default to life strategist for general queries
      const [agent] = await db.select()
        .from(agents)
        .where(eq(agents.id, 'life-strategist'))
        .limit(1);
      
      return {
        agent,
        intent: { intent: 'general', confidence: 0.5, bestAgent: 'life-strategist' },
        context: null
      };
    }
  }

  // Layer 39: Intent Recognition
  static async recognizeIntent(input: string) {
    // Simple keyword-based intent recognition (can be enhanced with NLP)
    const intents = {
      health: ['health', 'wellness', 'sick', 'doctor', 'medicine', 'pain'],
      career: ['job', 'career', 'work', 'promotion', 'salary', 'interview'],
      finance: ['money', 'budget', 'invest', 'savings', 'debt', 'retirement'],
      relationship: ['relationship', 'partner', 'friend', 'family', 'communication'],
      education: ['learn', 'study', 'course', 'skill', 'education', 'training'],
      productivity: ['productive', 'task', 'organize', 'efficiency', 'workflow'],
      mindfulness: ['stress', 'anxiety', 'meditation', 'calm', 'mental', 'peace'],
      creative: ['creative', 'art', 'design', 'write', 'music', 'project'],
      travel: ['travel', 'trip', 'vacation', 'destination', 'flight', 'hotel'],
      home: ['home', 'organize', 'clean', 'declutter', 'space', 'room'],
      nutrition: ['food', 'diet', 'meal', 'nutrition', 'eat', 'recipe'],
      fitness: ['exercise', 'workout', 'gym', 'fitness', 'muscle', 'cardio'],
      sleep: ['sleep', 'tired', 'insomnia', 'rest', 'bed', 'wake'],
      habit: ['habit', 'routine', 'behavior', 'change', 'goal', 'daily'],
      emergency: ['emergency', 'urgent', 'crisis', 'help', 'immediately', 'danger'],
      strategy: ['life', 'purpose', 'meaning', 'future', 'vision', 'plan']
    };

    const lowerInput = input.toLowerCase();
    let bestMatch = { category: 'strategy', score: 0, agent: 'life-strategist' };

    // Check each category for keyword matches
    for (const [category, keywords] of Object.entries(intents)) {
      const score = keywords.filter(keyword => lowerInput.includes(keyword)).length;
      if (score > bestMatch.score) {
        bestMatch = {
          category,
          score,
          agent: Object.values(LIFE_CEO_AGENTS).find(a => a.category === category)?.id || 'life-strategist'
        };
      }
    }

    return {
      intent: bestMatch.category,
      confidence: Math.min(bestMatch.score * 0.3, 1.0),
      bestAgent: bestMatch.agent,
      entities: [],
      alternatives: []
    };
  }

  // Layer 38: Context Management
  static async getOrCreateContext(userId: number, sessionId: string, agentId: string) {
    try {
      // Check for existing context
      const [existing] = await db.select()
        .from(contexts)
        .where(
          and(
            eq(contexts.userId, userId),
            eq(contexts.sessionId, sessionId),
            eq(contexts.agentId, agentId)
          )
        )
        .limit(1);

      if (existing) {
        return existing;
      }

      // Create new context
      const [newContext] = await db.insert(contexts)
        .values({
          userId,
          sessionId,
          agentId,
          type: 'conversation',
          state: {
            messages: [],
            topics: [],
            goals: []
          },
          history: [],
          metadata: {
            startTime: new Date().toISOString()
          }
        })
        .returning();

      return newContext;
    } catch (error) {
      console.error('Context management failed:', error);
      return null;
    }
  }

  // Process message with agent
  static async processWithAgent(
    agent: any,
    userId: number,
    message: string,
    context: any
  ) {
    try {
      // Get recent semantic memories for context
      const memories = await db.select()
        .from(semanticMemories)
        .where(
          and(
            eq(semanticMemories.userId, userId),
            eq(semanticMemories.agentId, agent.id)
          )
        )
        .orderBy(desc(semanticMemories.lastAccessed))
        .limit(5);

      // Build conversation context
      const conversationContext = memories.map(m => ({
        role: 'assistant' as const,
        content: m.content
      }));

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: agent.configuration.model || 'gpt-4o',
        messages: [
          { role: 'system', content: agent.systemPrompt },
          ...conversationContext,
          { role: 'user', content: message }
        ],
        temperature: agent.configuration.temperature || 0.7,
        max_tokens: agent.configuration.maxTokens || 2000
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

      // Store in semantic memory
      await db.insert(semanticMemories).values({
        userId,
        agentId: agent.id,
        type: 'episodic',
        content: response,
        context: {
          userMessage: message,
          timestamp: new Date().toISOString()
        },
        importance: 0.7
      });

      // Update context
      if (context) {
        const updatedState = {
          ...context.state,
          messages: [
            ...(context.state.messages || []),
            { role: 'user', content: message },
            { role: 'assistant', content: response }
          ]
        };

        await db.update(contexts)
          .set({
            state: updatedState,
            updatedAt: new Date()
          })
          .where(eq(contexts.id, context.id));
      }

      return {
        success: true,
        response,
        agent: agent.name
      };
    } catch (error) {
      console.error('Agent processing failed:', error);
      return {
        success: false,
        response: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}