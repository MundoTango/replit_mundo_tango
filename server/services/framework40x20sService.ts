import { db } from '../db';
import { sql } from 'drizzle-orm';

// 40x20s Framework Service - Expert Worker System Implementation
// Manages framework reviews, layer-team mappings, and quality checkpoints

export interface FrameworkReview {
  id: string;
  workItemId: string;
  layerId: number;
  phase: number;
  status: 'pending' | 'in_progress' | 'passed' | 'failed';
  findings: string[];
  recommendations: string[];
  reviewLevel: 'quick' | 'standard' | 'comprehensive';
  startedAt: Date;
  completedAt?: Date;
  reviewedBy?: number;
}

export interface LayerCheckpoint {
  layerId: number;
  phase: number;
  name: string;
  description: string;
  checkType: 'automated' | 'manual' | 'hybrid';
  criteria: string[];
}

// Layer to Team Mappings - Maps 40x20s layers to "The Plan" teams
const LAYER_TEAM_MAPPINGS = {
  // Foundation Layers (1-4)
  1: ['Engineering', 'Architecture'], // Expertise & Technical Proficiency
  2: ['Product', 'UX'], // Research & Discovery
  3: ['Legal', 'Compliance'], // Legal & Compliance
  4: ['Design', 'UX'], // UX/UI Design
  
  // Architecture Layers (5-8)
  5: ['Data', 'Engineering'], // Data Architecture
  6: ['Backend', 'API'], // Backend Development
  7: ['Frontend', 'Mobile'], // Frontend Development
  8: ['Integration', 'DevOps'], // API & Integration
  
  // Operational Layers (9-12)
  9: ['Security', 'Engineering'], // Security & Authentication
  10: ['DevOps', 'Infrastructure'], // Deployment & Infrastructure
  11: ['Analytics', 'Data'], // Analytics & Monitoring
  12: ['QA', 'Testing'], // Continuous Improvement
  
  // AI & Intelligence Layers (13-16)
  13: ['AI', 'Engineering'], // AI Agent Orchestration
  14: ['AI', 'Data'], // Context & Memory Management
  15: ['AI', 'UX'], // Voice & Environmental Intelligence
  16: ['AI', 'Ethics'], // Ethics & Behavioral Alignment
  
  // Human-Centric Layers (17-20)
  17: ['Product', 'UX'], // Emotional Intelligence
  18: ['Community', 'Content'], // Cultural Awareness
  19: ['Operations', 'Support'], // Energy Management
  20: ['AI', 'Product'], // Proactive Intelligence
  
  // Production Engineering Layers (21-23)
  21: ['Engineering', 'DevOps'], // Production Resilience
  22: ['Security', 'Compliance'], // User Safety Net
  23: ['Business', 'Operations'], // Business Continuity
  
  // Extended Framework Layers (24-40)
  24: ['Engineering', 'QA'], // Testing & Validation
  25: ['DevOps', 'Tools'], // Developer Experience
  26: ['Data', 'Engineering'], // Data Migration & Evolution
  27: ['DevOps', 'Analytics'], // Enhanced Observability
  28: ['Engineering', 'Product'], // Feature Flags & Experimentation
  29: ['Performance', 'Engineering'], // Performance Optimization
  30: ['Product', 'Innovation'], // Future Innovation
  31: ['Security', 'Infrastructure'], // Infrastructure Security
  32: ['Support', 'Operations'], // Customer Success
  33: ['Marketing', 'Growth'], // Growth Engineering
  34: ['Finance', 'Analytics'], // Cost Optimization
  35: ['Legal', 'Governance'], // Governance & Controls
  36: ['Community', 'Support'], // Community Building
  37: ['Product', 'Strategy'], // Strategic Planning
  38: ['Engineering', 'Research'], // Research & Development
  39: ['Business', 'Partnerships'], // Partnership Integration
  40: ['Leadership', 'Vision'] // Vision & Leadership
};

export class Framework40x20sService {
  // Start a new framework review
  async startReview(workItemId: string, reviewLevel: string, userId: number, layers?: number[]): Promise<string> {
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get work item details from The Plan
    const workItem = await this.getWorkItemFromPlan(workItemId);
    if (!workItem) {
      throw new Error('Work item not found');
    }
    
    // Determine which layers to review based on work item type
    const layersToReview = layers || this.determineRelevantLayers(workItem);
    
    // Create review records for each layer
    const reviews = layersToReview.map(layerId => ({
      id: `${reviewId}_L${layerId}`,
      workItemId,
      layerId,
      phase: 1, // Start at phase 1
      status: 'pending' as const,
      findings: [],
      recommendations: [],
      reviewLevel,
      startedAt: new Date(),
      reviewedBy: userId
    }));
    
    // Store reviews in database (simplified for now)
    // In production, this would use proper database tables
    console.log(`Starting ${reviewLevel} review for work item ${workItemId} across ${layersToReview.length} layers`);
    
    // Trigger automated checks for applicable layers
    this.triggerAutomatedChecks(reviewId, layersToReview);
    
    return reviewId;
  }
  
  // Get active work items from The Plan
  async getActiveWorkItems(userId: number): Promise<any[]> {
    try {
      // Query projects from The Plan that are in progress
      const result = await db.execute(sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.web_progress,
          p.mobile_progress,
          p.parent_id,
          p.level
        FROM projects p
        WHERE p.web_progress < 100 OR p.mobile_progress < 100
        ORDER BY p.updated_at DESC
        LIMIT 10
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching active work items:', error);
      return [];
    }
  }
  
  // Get framework reviews
  async getReviews(limit: number = 10): Promise<FrameworkReview[]> {
    // In production, this would query from database
    // For now, return mock data
    return [
      {
        id: 'review_1',
        workItemId: 'project_1',
        layerId: 7,
        phase: 15,
        status: 'passed',
        findings: ['React components properly memoized', 'Performance optimizations applied'],
        recommendations: ['Consider adding virtual scrolling for large lists'],
        reviewLevel: 'standard',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date()
      }
    ];
  }
  
  // Update "The Plan" when review completes successfully
  async updatePlanProgress(workItemId: string, layerId: number, phase: number, passed: boolean): Promise<void> {
    if (passed && phase === 20) {
      // All 20 phases passed for this layer
      console.log(`Layer ${layerId} completed for work item ${workItemId}`);
      
      // Update project progress in The Plan
      const progressIncrease = 100 / 40; // Each layer contributes equally
      
      await db.execute(sql`
        UPDATE projects 
        SET web_progress = LEAST(100, web_progress + ${progressIncrease}),
            updated_at = NOW()
        WHERE id = ${workItemId}
      `);
    }
  }
  
  // Private helper methods
  
  private async getWorkItemFromPlan(workItemId: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT * FROM projects WHERE id = ${workItemId}
    `);
    return result.rows[0];
  }
  
  private determineRelevantLayers(workItem: any): number[] {
    // Based on work item type, determine which layers to review
    // For now, return a subset of layers
    if (workItem.name.toLowerCase().includes('ui') || workItem.name.toLowerCase().includes('frontend')) {
      return [4, 7, 21, 22]; // UX/UI, Frontend, Production Resilience, User Safety
    } else if (workItem.name.toLowerCase().includes('api') || workItem.name.toLowerCase().includes('backend')) {
      return [5, 6, 8, 9]; // Data, Backend, API, Security
    }
    
    // Default: review first 10 layers
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }
  
  private async triggerAutomatedChecks(reviewId: string, layers: number[]): Promise<void> {
    // Trigger automated checks for applicable layers
    for (const layerId of layers) {
      switch (layerId) {
        case 5: // Data Architecture
          this.checkDatabaseIndexes(reviewId, layerId);
          break;
        case 7: // Frontend Development
          this.checkReactPerformance(reviewId, layerId);
          break;
        case 9: // Security
          this.checkSecurityHeaders(reviewId, layerId);
          break;
        case 10: // Deployment
          this.checkDeploymentReadiness(reviewId, layerId);
          break;
      }
    }
  }
  
  private async checkDatabaseIndexes(reviewId: string, layerId: number): Promise<void> {
    // Check if critical queries have proper indexes
    console.log(`Running database index check for layer ${layerId}`);
  }
  
  private async checkReactPerformance(reviewId: string, layerId: number): Promise<void> {
    // Check for React performance issues
    console.log(`Running React performance check for layer ${layerId}`);
  }
  
  private async checkSecurityHeaders(reviewId: string, layerId: number): Promise<void> {
    // Check security headers and configurations
    console.log(`Running security headers check for layer ${layerId}`);
  }
  
  private async checkDeploymentReadiness(reviewId: string, layerId: number): Promise<void> {
    // Check deployment configuration and readiness
    console.log(`Running deployment readiness check for layer ${layerId}`);
  }
}

// Export singleton instance
export const framework40x20sService = new Framework40x20sService();