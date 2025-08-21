import { db } from '../db';
import { life_ceo_agent_memories } from '../../shared/schema';
import { eq, and, desc, sql, gt, lt } from 'drizzle-orm';
import { openaiService } from './openaiService';

interface Memory {
  id: string;
  agentType: string;
  userId: string;
  content: any;
  importance: number;
  tags: string[];
  embedding?: number[];
  createdAt: Date;
  expiresAt?: Date;
}

interface MemorySearchResult extends Memory {
  similarity: number;
}

export class AgentMemoryService {
  /**
   * Store a new memory for an agent
   */
  async storeMemory(
    agentType: string,
    userId: string,
    content: any,
    importance: number = 0.5,
    tags: string[] = []
  ): Promise<Memory> {
    // Generate embedding for the content
    const contentText = typeof content === 'string' ? content : JSON.stringify(content);
    const embedding = await this.generateEmbedding(contentText);

    // Store in database
    const [memory] = await db
      .insert(life_ceo_agent_memories)
      .values({
        agentType,
        userId,
        content,
        importance,
        tags,
        embedding: sql`${embedding}::vector`,
        createdAt: new Date()
      })
      .returning();

    return this.formatMemory(memory);
  }

  /**
   * Search memories using semantic similarity
   */
  async searchMemories(
    agentType: string,
    userId: string,
    query: string,
    limit: number = 10,
    minSimilarity: number = 0.7
  ): Promise<MemorySearchResult[]> {
    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query);

    // Search using cosine similarity
    const memories = await db
      .select({
        memory: life_ceo_agent_memories,
        similarity: sql<number>`1 - (${life_ceo_agent_memories.embedding} <=> ${sql`${queryEmbedding}::vector`})`
      })
      .from(life_ceo_agent_memories)
      .where(
        and(
          eq(life_ceo_agent_memories.agentType, agentType),
          eq(life_ceo_agent_memories.userId, userId),
          sql`1 - (${life_ceo_agent_memories.embedding} <=> ${sql`${queryEmbedding}::vector`}) > ${minSimilarity}`
        )
      )
      .orderBy(desc(sql`1 - (${life_ceo_agent_memories.embedding} <=> ${sql`${queryEmbedding}::vector`})`))
      .limit(limit);

    return memories.map(({ memory, similarity }) => ({
      ...this.formatMemory(memory),
      similarity
    }));
  }

  /**
   * Get recent memories for an agent
   */
  async getRecentMemories(
    agentType: string,
    userId: string,
    limit: number = 20
  ): Promise<Memory[]> {
    const memories = await db
      .select()
      .from(life_ceo_agent_memories)
      .where(
        and(
          eq(life_ceo_agent_memories.agentType, agentType),
          eq(life_ceo_agent_memories.userId, userId)
        )
      )
      .orderBy(desc(life_ceo_agent_memories.createdAt))
      .limit(limit);

    return memories.map(this.formatMemory);
  }

  /**
   * Get memories by importance threshold
   */
  async getImportantMemories(
    agentType: string,
    userId: string,
    minImportance: number = 0.7
  ): Promise<Memory[]> {
    const memories = await db
      .select()
      .from(life_ceo_agent_memories)
      .where(
        and(
          eq(life_ceo_agent_memories.agentType, agentType),
          eq(life_ceo_agent_memories.userId, userId),
          gt(life_ceo_agent_memories.importance, minImportance)
        )
      )
      .orderBy(desc(life_ceo_agent_memories.importance));

    return memories.map(this.formatMemory);
  }

  /**
   * Share memory between agents
   */
  async shareMemory(
    fromAgent: string,
    toAgent: string,
    userId: string,
    memoryId: string
  ): Promise<Memory> {
    // Get the original memory
    const [originalMemory] = await db
      .select()
      .from(life_ceo_agent_memories)
      .where(
        and(
          eq(life_ceo_agent_memories.id, memoryId),
          eq(life_ceo_agent_memories.agentType, fromAgent),
          eq(life_ceo_agent_memories.userId, userId)
        )
      );

    if (!originalMemory) {
      throw new Error('Memory not found');
    }

    // Create a copy for the target agent
    const [sharedMemory] = await db
      .insert(life_ceo_agent_memories)
      .values({
        agentType: toAgent,
        userId,
        content: {
          ...(typeof originalMemory.content === 'object' ? originalMemory.content : {}),
          sharedFrom: fromAgent,
          originalMemoryId: memoryId
        },
        importance: (originalMemory.importance || 0.5) * 0.8, // Slightly reduce importance for shared memories
        tags: [...(originalMemory.tags || []), 'shared', `from-${fromAgent}`],
        embedding: originalMemory.embedding,
        createdAt: new Date()
      })
      .returning();

    return this.formatMemory(sharedMemory);
  }

  /**
   * Clean up expired memories
   */
  async cleanupExpiredMemories(): Promise<number> {
    const result = await db
      .delete(life_ceo_agent_memories)
      .where(
        and(
          lt(life_ceo_agent_memories.expiresAt, new Date()),
          sql`${life_ceo_agent_memories.expiresAt} IS NOT NULL`
        )
      );

    return result.rowCount || 0;
  }

  /**
   * Generate embedding using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openaiService.createEmbedding(text);
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return a zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  /**
   * Format memory for response
   */
  private formatMemory(memory: any): Memory {
    return {
      id: memory.id,
      agentType: memory.agentType,
      userId: memory.userId,
      content: memory.content,
      importance: memory.importance || 0.5,
      tags: memory.tags || [],
      createdAt: memory.createdAt,
      expiresAt: memory.expiresAt
    };
  }

  /**
   * Build context from memories for agent decision making
   */
  async buildContextFromMemories(
    agentType: string,
    userId: string,
    currentContext: string
  ): Promise<string> {
    // Get relevant memories based on current context
    const relevantMemories = await this.searchMemories(
      agentType,
      userId,
      currentContext,
      5,
      0.6
    );

    // Get recent important memories
    const importantMemories = await this.getImportantMemories(
      agentType,
      userId,
      0.8
    );

    // Combine and format memories for context
    const contextParts = [
      '## Relevant Context from Memory:',
      ...relevantMemories.map(m => 
        `- [Relevance: ${(m.similarity * 100).toFixed(0)}%] ${this.summarizeMemory(m)}`
      ),
      '',
      '## Important Past Information:',
      ...importantMemories.slice(0, 3).map(m => 
        `- [Importance: ${(m.importance * 100).toFixed(0)}%] ${this.summarizeMemory(m)}`
      )
    ];

    return contextParts.join('\n');
  }

  /**
   * Summarize a memory for context building
   */
  private summarizeMemory(memory: Memory): string {
    const content = memory.content;
    if (typeof content === 'string') {
      return content.slice(0, 200) + (content.length > 200 ? '...' : '');
    }
    
    // Extract key information from structured content
    const key = content.type || content.title || content.summary || 'Memory';
    const detail = content.detail || content.description || '';
    return `${key}: ${detail}`.slice(0, 200);
  }
}

export const agentMemoryService = new AgentMemoryService();