// ESA LIFE CEO 56x21 - Intelligence Infrastructure Schema (Layers 31-46)
import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb, 
  real,
  index,
  uuid
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Layer 31: AI Model Management
export const aiModels = pgTable('ai_models', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'gpt-4', 'claude', 'local', etc.
  version: varchar('version', { length: 50 }).notNull(),
  capabilities: jsonb('capabilities').notNull(), // ['text-generation', 'embeddings', 'vision']
  configuration: jsonb('configuration').notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  performance: jsonb('performance'), // { latency, accuracy, cost }
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('idx_ai_models_type').on(table.type),
  index('idx_ai_models_status').on(table.status)
]);

// Layer 32: Semantic Memory System
export const semanticMemories = pgTable('semantic_memories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'episodic', 'procedural', 'declarative'
  content: text('content').notNull(),
  embedding: jsonb('embedding'), // Vector embedding for similarity search
  context: jsonb('context').notNull(),
  importance: real('importance').default(0.5),
  lastAccessed: timestamp('last_accessed').defaultNow(),
  accessCount: integer('access_count').default(1),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_semantic_memories_user').on(table.userId),
  index('idx_semantic_memories_agent').on(table.agentId),
  index('idx_semantic_memories_type').on(table.type)
]);

// Layer 33: ML Pipeline
export const mlPipelines = pgTable('ml_pipelines', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'training', 'inference', 'preprocessing'
  stages: jsonb('stages').notNull(), // Pipeline stages configuration
  inputSchema: jsonb('input_schema').notNull(),
  outputSchema: jsonb('output_schema').notNull(),
  status: varchar('status', { length: 50 }).default('idle'),
  lastRun: timestamp('last_run'),
  metrics: jsonb('metrics'), // Performance metrics
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Layer 34: NLP Processing
export const nlpTasks = pgTable('nlp_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id'),
  input: text('input').notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'sentiment', 'ner', 'classification', 'summarization'
  language: varchar('language', { length: 10 }).default('en'),
  result: jsonb('result').notNull(),
  confidence: real('confidence'),
  modelUsed: varchar('model_used', { length: 100 }),
  processingTime: integer('processing_time'), // milliseconds
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_nlp_tasks_user').on(table.userId),
  index('idx_nlp_tasks_type').on(table.type)
]);

// Layer 35: Agent Framework Core
export const agents = pgTable('agents', {
  id: varchar('id', { length: 100 }).primaryKey(), // e.g., 'health-advisor', 'career-coach'
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  capabilities: jsonb('capabilities').notNull(),
  personality: jsonb('personality'), // Tone, style, approach
  systemPrompt: text('system_prompt').notNull(),
  configuration: jsonb('configuration').notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  version: varchar('version', { length: 50 }).default('1.0.0'),
  metrics: jsonb('metrics'), // Usage stats, success rates
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('idx_agents_category').on(table.category),
  index('idx_agents_status').on(table.status)
]);

// Layer 36: Decision Engine
export const decisions = pgTable('decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  context: jsonb('context').notNull(),
  options: jsonb('options').notNull(), // Available choices
  criteria: jsonb('criteria').notNull(), // Decision criteria
  recommendation: jsonb('recommendation').notNull(),
  confidence: real('confidence').notNull(),
  reasoning: text('reasoning'),
  outcome: jsonb('outcome'), // Actual result if tracked
  feedback: jsonb('feedback'), // User feedback
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_decisions_user').on(table.userId),
  index('idx_decisions_agent').on(table.agentId)
]);

// Layer 37: Learning System
export const learningRecords = pgTable('learning_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  userId: integer('user_id'),
  type: varchar('type', { length: 50 }).notNull(), // 'reinforcement', 'supervised', 'feedback'
  input: jsonb('input').notNull(),
  expectedOutput: jsonb('expected_output'),
  actualOutput: jsonb('actual_output'),
  reward: real('reward'), // For reinforcement learning
  loss: real('loss'), // For supervised learning
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_learning_records_agent').on(table.agentId),
  index('idx_learning_records_user').on(table.userId)
]);

// Layer 38: Context Management
export const contexts = pgTable('contexts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  agentId: varchar('agent_id', { length: 100 }),
  type: varchar('type', { length: 50 }).notNull(), // 'conversation', 'task', 'environment'
  state: jsonb('state').notNull(), // Current context state
  history: jsonb('history').default([]), // Context history
  metadata: jsonb('metadata'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('idx_contexts_user').on(table.userId),
  index('idx_contexts_session').on(table.sessionId)
]);

// Layer 39: Intent Recognition
export const intents = pgTable('intents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  input: text('input').notNull(),
  recognizedIntent: varchar('recognized_intent', { length: 100 }).notNull(),
  confidence: real('confidence').notNull(),
  entities: jsonb('entities'), // Extracted entities
  alternativeIntents: jsonb('alternative_intents'), // Other possible intents
  agentRouted: varchar('agent_routed', { length: 100 }), // Which agent handled it
  fulfilled: boolean('fulfilled').default(false),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_intents_user').on(table.userId),
  index('idx_intents_recognized').on(table.recognizedIntent)
]);

// Layer 40: Knowledge Graph
export const knowledgeNodes = pgTable('knowledge_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 100 }).notNull(), // 'concept', 'entity', 'fact'
  label: varchar('label', { length: 255 }).notNull(),
  properties: jsonb('properties').notNull(),
  embedding: jsonb('embedding'), // For similarity search
  category: varchar('category', { length: 100 }),
  confidence: real('confidence').default(1.0),
  source: varchar('source', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  index('idx_knowledge_nodes_type').on(table.type),
  index('idx_knowledge_nodes_category').on(table.category)
]);

export const knowledgeEdges = pgTable('knowledge_edges', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceId: uuid('source_id').notNull().references(() => knowledgeNodes.id),
  targetId: uuid('target_id').notNull().references(() => knowledgeNodes.id),
  relationship: varchar('relationship', { length: 100 }).notNull(),
  properties: jsonb('properties'),
  weight: real('weight').default(1.0),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_knowledge_edges_source').on(table.sourceId),
  index('idx_knowledge_edges_target').on(table.targetId)
]);

// Layer 41: Reasoning Engine
export const reasoningChains = pgTable('reasoning_chains', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id'),
  agentId: varchar('agent_id', { length: 100 }).notNull(),
  question: text('question').notNull(),
  steps: jsonb('steps').notNull(), // Chain of thought steps
  conclusion: text('conclusion').notNull(),
  confidence: real('confidence').notNull(),
  evidence: jsonb('evidence'), // Supporting facts
  assumptions: jsonb('assumptions'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_reasoning_chains_user').on(table.userId),
  index('idx_reasoning_chains_agent').on(table.agentId)
]);

// Layer 42: Personalization
export const userProfiles = pgTable('user_profiles_ai', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().unique(),
  preferences: jsonb('preferences').notNull(),
  interests: jsonb('interests').notNull(),
  learningStyle: varchar('learning_style', { length: 50 }),
  communicationStyle: varchar('communication_style', { length: 50 }),
  goals: jsonb('goals'),
  context: jsonb('context'), // Life situation, background
  behaviorPatterns: jsonb('behavior_patterns'),
  lastUpdated: timestamp('last_updated').defaultNow()
}, (table) => [
  index('idx_user_profiles_ai_user').on(table.userId)
]);

// Layer 43: Recommendation System
export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'content', 'action', 'connection'
  item: jsonb('item').notNull(), // What's being recommended
  score: real('score').notNull(), // Relevance score
  reasoning: text('reasoning'),
  factors: jsonb('factors'), // What influenced the recommendation
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'accepted', 'rejected'
  feedback: jsonb('feedback'),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_recommendations_user').on(table.userId),
  index('idx_recommendations_type').on(table.type),
  index('idx_recommendations_status').on(table.status)
]);

// Layer 44: Prediction Engine
export const predictions = pgTable('predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id'),
  type: varchar('type', { length: 100 }).notNull(), // 'behavior', 'outcome', 'trend'
  target: varchar('target', { length: 255 }).notNull(), // What's being predicted
  prediction: jsonb('prediction').notNull(),
  confidence: real('confidence').notNull(),
  timeframe: varchar('timeframe', { length: 50 }), // 'short', 'medium', 'long'
  factors: jsonb('factors'), // Input factors
  actual: jsonb('actual'), // Actual outcome if known
  accuracy: real('accuracy'), // Calculated after outcome
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_predictions_user').on(table.userId),
  index('idx_predictions_type').on(table.type)
]);

// Layer 45: Optimization Algorithms
export const optimizations = pgTable('optimizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id'),
  type: varchar('type', { length: 100 }).notNull(), // 'schedule', 'resource', 'route'
  objective: text('objective').notNull(),
  constraints: jsonb('constraints').notNull(),
  variables: jsonb('variables').notNull(),
  solution: jsonb('solution').notNull(),
  improvement: real('improvement'), // % improvement
  algorithm: varchar('algorithm', { length: 100 }),
  executionTime: integer('execution_time'), // milliseconds
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  index('idx_optimizations_user').on(table.userId),
  index('idx_optimizations_type').on(table.type)
]);

// Layer 46: Intelligence Metrics
export const intelligenceMetrics = pgTable('intelligence_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: varchar('agent_id', { length: 100 }),
  userId: integer('user_id'),
  metricType: varchar('metric_type', { length: 100 }).notNull(),
  value: real('value').notNull(),
  unit: varchar('unit', { length: 50 }),
  context: jsonb('context'),
  timestamp: timestamp('timestamp').defaultNow()
}, (table) => [
  index('idx_intelligence_metrics_agent').on(table.agentId),
  index('idx_intelligence_metrics_user').on(table.userId),
  index('idx_intelligence_metrics_type').on(table.metricType),
  index('idx_intelligence_metrics_timestamp').on(table.timestamp)
]);

// Export schemas and types
export const insertAiModelSchema = createInsertSchema(aiModels);
export const insertSemanticMemorySchema = createInsertSchema(semanticMemories);
export const insertAgentSchema = createInsertSchema(agents);
export const insertDecisionSchema = createInsertSchema(decisions);
export const insertIntentSchema = createInsertSchema(intents);
export const insertRecommendationSchema = createInsertSchema(recommendations);
export const insertPredictionSchema = createInsertSchema(predictions);

export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;
export type SemanticMemory = typeof semanticMemories.$inferSelect;
export type InsertSemanticMemory = z.infer<typeof insertSemanticMemorySchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;
export type Intent = typeof intents.$inferSelect;
export type InsertIntent = z.infer<typeof insertIntentSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;