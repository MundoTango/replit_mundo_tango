// ESA LIFE CEO 56x21 - AI Routes (Intelligence Infrastructure API)
import { Router } from 'express';
import { AgentManager } from '../ai/agent-manager';
import { db } from '../db';
import { 
  agents, 
  semanticMemories, 
  nlpTasks,
  recommendations,
  predictions,
  intelligenceMetrics
} from '@shared/ai-schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Initialize agents on server start
AgentManager.initializeAgents();

// Chat with Life CEO Agent
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id || 1; // Default for development

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Route to appropriate agent
    const { agent, intent, context } = await AgentManager.routeToAgent(
      userId,
      message,
      sessionId || `session-${Date.now()}`
    );

    // Process with selected agent
    const result = await AgentManager.processWithAgent(
      agent,
      userId,
      message,
      context
    );

    // Track metrics
    await db.insert(intelligenceMetrics).values({
      agentId: agent.id,
      userId,
      metricType: 'chat_interaction',
      value: result.success ? 1 : 0,
      context: {
        intent: intent.intent,
        confidence: intent.confidence
      }
    });

    res.json({
      success: result.success,
      response: result.response,
      agent: {
        id: agent.id,
        name: agent.name,
        category: agent.category
      },
      intent: intent.intent,
      confidence: intent.confidence
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Get all available agents
router.get('/agents', async (req, res) => {
  try {
    const allAgents = await db.select()
      .from(agents)
      .where(eq(agents.status, 'active'))
      .orderBy(agents.category);

    res.json({
      success: true,
      agents: allAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        category: agent.category,
        description: agent.description,
        capabilities: agent.capabilities
      }))
    });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get user's semantic memories - simplified for now
router.get('/memories', async (req, res) => {
  try {
    const userId = req.user?.id || 7; // Default user ID 7
    
    // Return empty array for now to unblock platform
    res.json({
      success: true,
      memories: []
    });
  } catch (error) {
    console.error('Failed to fetch memories:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Get recommendations for user - simplified for now
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id || 7; // Default user ID 7
    
    // Return empty array for now to unblock platform
    res.json({
      success: true,
      recommendations: []
    });
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Update recommendation status
router.patch('/recommendations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    await db.update(recommendations)
      .set({
        status,
        feedback
      })
      .where(eq(recommendations.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Get predictions for user
router.get('/predictions', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { type, timeframe } = req.query;

    const whereConditions = type
      ? and(
          eq(predictions.userId, userId),
          eq(predictions.type, String(type))
        )
      : eq(predictions.userId, userId);

    const preds = await db.select()
      .from(predictions)
      .where(whereConditions)
      .orderBy(desc(predictions.createdAt))
      .limit(10);

    res.json({
      success: true,
      predictions: preds
    });
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Get intelligence metrics
router.get('/metrics', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { agentId, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const whereConditions = agentId
      ? and(
          eq(intelligenceMetrics.userId, userId),
          eq(intelligenceMetrics.agentId, String(agentId)),
          gte(intelligenceMetrics.timestamp, startDate)
        )
      : and(
          eq(intelligenceMetrics.userId, userId),
          gte(intelligenceMetrics.timestamp, startDate)
        );

    const metrics = await db.select()
      .from(intelligenceMetrics)
      .where(whereConditions)
      .orderBy(desc(intelligenceMetrics.timestamp));

    // Aggregate metrics by type
    type AggregatedMetrics = {
      [key: string]: {
        count: number;
        total: number;
        average: number;
      };
    };

    const aggregated = metrics.reduce<AggregatedMetrics>((acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = {
          count: 0,
          total: 0,
          average: 0
        };
      }
      acc[metric.metricType].count++;
      acc[metric.metricType].total += metric.value;
      acc[metric.metricType].average = acc[metric.metricType].total / acc[metric.metricType].count;
      return acc;
    }, {});

    res.json({
      success: true,
      metrics: aggregated,
      raw: metrics
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Process NLP task
router.post('/nlp', async (req, res) => {
  try {
    const { text, type = 'sentiment' } = req.body;
    const userId = req.user?.id || 1;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Simple NLP processing (can be enhanced with actual NLP libraries)
    let result = {};
    let confidence = 0.8;

    switch (type) {
      case 'sentiment':
        // Simple sentiment analysis
        const positive = ['good', 'great', 'excellent', 'happy', 'wonderful'];
        const negative = ['bad', 'terrible', 'awful', 'sad', 'horrible'];
        const lowerText = text.toLowerCase();
        const positiveScore = positive.filter(word => lowerText.includes(word)).length;
        const negativeScore = negative.filter(word => lowerText.includes(word)).length;
        
        result = {
          sentiment: positiveScore > negativeScore ? 'positive' : 
                    negativeScore > positiveScore ? 'negative' : 'neutral',
          score: (positiveScore - negativeScore) / (positiveScore + negativeScore + 1)
        };
        break;

      case 'classification':
        // Simple topic classification
        const topics = {
          health: ['health', 'medical', 'doctor', 'wellness'],
          finance: ['money', 'budget', 'investment', 'savings'],
          career: ['job', 'work', 'career', 'professional']
        };
        
        let bestTopic = 'general';
        let bestScore = 0;
        
        for (const [topic, keywords] of Object.entries(topics)) {
          const score = keywords.filter(word => text.toLowerCase().includes(word)).length;
          if (score > bestScore) {
            bestTopic = topic;
            bestScore = score;
          }
        }
        
        result = { topic: bestTopic, confidence: Math.min(bestScore * 0.25, 1.0) };
        break;

      case 'summarization':
        // Simple extractive summarization (take first and last sentences)
        const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim());
        result = {
          summary: sentences.length > 2 
            ? `${sentences[0].trim()}. ${sentences[sentences.length - 1].trim()}.`
            : text
        };
        break;

      default:
        result = { processed: true };
    }

    // Store NLP task
    const [task] = await db.insert(nlpTasks)
      .values({
        userId,
        input: text,
        type,
        language: 'en',
        result,
        confidence,
        modelUsed: 'simple-rule-based',
        processingTime: 10
      })
      .returning();

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('NLP processing failed:', error);
    res.status(500).json({ error: 'Failed to process NLP task' });
  }
});

export default router;