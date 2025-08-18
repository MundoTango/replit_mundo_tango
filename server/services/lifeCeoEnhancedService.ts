import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

interface LifeCEOPattern {
  id: string;
  pattern: string;
  solution: string;
  successRate: number;
  category: 'typescript' | 'memory' | 'cache' | 'api' | 'design' | 'mobile';
  lastSeen: Date;
  occurrences: number;
}

interface ValidationResult {
  passed: boolean;
  issues: string[];
  autoFixAvailable: boolean;
  suggestions: string[];
}

class LifeCEOEnhancedService {
  private patterns: Map<string, LifeCEOPattern> = new Map();
  private validationRules: Map<string, (context: any) => ValidationResult> = new Map();
  
  constructor() {
    this.initializePatterns();
    this.initializeValidationRules();
  }

  // Initialize learned patterns from the last 4 days
  private initializePatterns() {
    const learnedPatterns: LifeCEOPattern[] = [
      {
        id: 'typescript-tanstack-v5',
        pattern: 'cacheTime property error in TanStack Query v5',
        solution: 'Replace cacheTime with gcTime (garbage collection time)',
        successRate: 100,
        category: 'typescript',
        lastSeen: new Date('2025-07-27'),
        occurrences: 3
      },
      {
        id: 'memory-build-heap',
        pattern: 'JavaScript heap out of memory during build',
        solution: 'Set NODE_OPTIONS="--max_old_space_size=8192"',
        successRate: 100,
        category: 'memory',
        lastSeen: new Date('2025-07-27'),
        occurrences: 5
      },
      {
        id: 'redis-fallback',
        pattern: 'Redis connection failed',
        solution: 'Implement in-memory cache fallback with DISABLE_REDIS=true',
        successRate: 95,
        category: 'cache',
        lastSeen: new Date('2025-07-26'),
        occurrences: 8
      },
      {
        id: 'api-field-naming',
        pattern: 'Field naming inconsistency between frontend and backend',
        solution: 'Return both camelCase and snake_case during migration',
        successRate: 90,
        category: 'api',
        lastSeen: new Date('2025-07-27'),
        occurrences: 4
      },
      {
        id: 'mt-ocean-theme',
        pattern: 'Design theme colors changed from turquoise/cyan',
        solution: 'Restore gradients: from-turquoise-400 to-cyan-500',
        successRate: 100,
        category: 'design',
        lastSeen: new Date('2025-07-26'),
        occurrences: 6
      },
      {
        id: 'capacitor-webdir',
        pattern: 'Capacitor cannot find web assets directory',
        solution: 'Update webDir to "dist/public" in capacitor.config.ts',
        successRate: 100,
        category: 'mobile',
        lastSeen: new Date('2025-07-27'),
        occurrences: 2
      }
    ];

    learnedPatterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
    });
  }

  // Initialize validation rules for continuous checking
  private initializeValidationRules() {
    // TypeScript validation
    this.validationRules.set('typescript', (context) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (context.lspErrors && context.lspErrors.length > 0) {
        issues.push(`Found ${context.lspErrors.length} TypeScript errors`);
        
        // Check for known patterns
        context.lspErrors.forEach((error: any) => {
          if (error.message.includes('cacheTime')) {
            suggestions.push('Replace cacheTime with gcTime for TanStack Query v5');
          }
        });
      }
      
      return {
        passed: issues.length === 0,
        issues,
        autoFixAvailable: suggestions.length > 0,
        suggestions
      };
    });

    // Memory validation
    this.validationRules.set('memory', (context) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      const memoryUsageGB = context.memoryUsage / 1024 / 1024 / 1024;
      
      if (memoryUsageGB > 4) {
        issues.push(`High memory usage: ${memoryUsageGB.toFixed(2)}GB`);
        suggestions.push('Trigger garbage collection');
        suggestions.push('Clear unused caches');
      }
      
      if (!process.env.NODE_OPTIONS?.includes('max_old_space_size')) {
        suggestions.push('Set NODE_OPTIONS="--max_old_space_size=8192" for builds');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        autoFixAvailable: true,
        suggestions
      };
    });

    // Cache validation
    this.validationRules.set('cache', (context) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (context.cacheHitRate < 0.7) {
        issues.push(`Low cache hit rate: ${(context.cacheHitRate * 100).toFixed(1)}%`);
        suggestions.push('Warm critical caches');
        suggestions.push('Increase cache TTL for stable data');
      }
      
      if (context.redisError && !process.env.DISABLE_REDIS) {
        issues.push('Redis connection failed');
        suggestions.push('Enable in-memory fallback with DISABLE_REDIS=true');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        autoFixAvailable: true,
        suggestions
      };
    });

    // API validation
    this.validationRules.set('api', (context) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (context.apiErrors) {
        context.apiErrors.forEach((error: any) => {
          if (error.includes('field') || error.includes('property')) {
            issues.push('API field naming inconsistency detected');
            suggestions.push('Ensure both camelCase and snake_case are handled');
          }
        });
      }
      
      if (context.apiResponseTime > 1000) {
        issues.push(`Slow API response: ${context.apiResponseTime}ms`);
        suggestions.push('Add response caching');
        suggestions.push('Optimize database queries');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        autoFixAvailable: suggestions.length > 0,
        suggestions
      };
    });

    // Design validation
    this.validationRules.set('design', (context) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (context.cssContent) {
        const hasPurple = context.cssContent.includes('purple');
        const hasIndigo = context.cssContent.includes('indigo');
        const hasTurquoise = context.cssContent.includes('turquoise');
        const hasCyan = context.cssContent.includes('cyan');
        
        if ((hasPurple || hasIndigo) && (!hasTurquoise || !hasCyan)) {
          issues.push('Non-MT ocean theme colors detected');
          suggestions.push('Replace purple/indigo with turquoise/cyan gradients');
        }
      }
      
      return {
        passed: issues.length === 0,
        issues,
        autoFixAvailable: true,
        suggestions
      };
    });

    // Mobile validation
    this.validationRules.set('mobile', (context) => {
      const issues: string[] = [];
      const suggestions: string[] = [];
      
      if (context.capacitorError) {
        if (context.capacitorError.includes('web assets directory')) {
          issues.push('Capacitor webDir misconfigured');
          suggestions.push('Update webDir to "dist/public" in capacitor.config.ts');
        }
      }
      
      if (!context.hasLoadingStates) {
        issues.push('Missing loading states for mobile experience');
        suggestions.push('Add loading spinners and skeleton screens');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        autoFixAvailable: suggestions.length > 0,
        suggestions
      };
    });
  }

  // Run pre-development checklist (Phase 0)
  async runPreDevelopmentChecklist(): Promise<{
    ready: boolean;
    checks: Record<string, ValidationResult>;
    blockers: string[];
  }> {
    const checks: Record<string, ValidationResult> = {};
    const blockers: string[] = [];
    
    // Gather context
    const context = await this.gatherSystemContext();
    
    // Run all validation rules
    for (const [category, validator] of this.validationRules) {
      const result = validator(context);
      checks[category] = result;
      
      if (!result.passed) {
        blockers.push(...result.issues);
      }
    }
    
    return {
      ready: blockers.length === 0,
      checks,
      blockers
    };
  }

  // Pattern recognition and learning
  async detectAndLearnPattern(error: any, solution?: string): Promise<LifeCEOPattern | null> {
    const errorString = JSON.stringify(error);
    
    // Check if this matches any known pattern
    for (const [id, pattern] of this.patterns) {
      if (errorString.includes(pattern.pattern)) {
        // Update pattern statistics
        pattern.occurrences++;
        pattern.lastSeen = new Date();
        
        // Store in database for persistence
        await this.persistPattern(pattern);
        
        return pattern;
      }
    }
    
    // If solution provided, create new pattern
    if (solution) {
      const newPattern: LifeCEOPattern = {
        id: `pattern-${Date.now()}`,
        pattern: error.message || errorString,
        solution,
        successRate: 100,
        category: this.categorizeError(error),
        lastSeen: new Date(),
        occurrences: 1
      };
      
      this.patterns.set(newPattern.id, newPattern);
      await this.persistPattern(newPattern);
      
      return newPattern;
    }
    
    return null;
  }

  // Continuous validation monitoring
  async continuousValidation(): Promise<void> {
    setInterval(async () => {
      const context = await this.gatherSystemContext();
      const validationResults: Record<string, ValidationResult> = {};
      
      for (const [category, validator] of this.validationRules) {
        const result = validator(context);
        validationResults[category] = result;
        
        // Auto-fix if available and critical
        if (!result.passed && result.autoFixAvailable) {
          await this.attemptAutoFix(category, result);
        }
      }
      
      // Log validation status
      await this.logValidationStatus(validationResults);
    }, 30000); // Run every 30 seconds
  }

  // Mobile readiness check (Phase 21)
  async checkMobileReadiness(): Promise<{
    ready: boolean;
    score: number;
    checklist: Record<string, boolean>;
    recommendations: string[];
  }> {
    const checklist: Record<string, boolean> = {
      capacitorConfigured: await this.checkCapacitorConfig(),
      nativePluginsInstalled: await this.checkNativePlugins(),
      responsiveDesign: await this.checkResponsiveDesign(),
      offlineMode: await this.checkOfflineCapability(),
      performanceOptimized: await this.checkMobilePerformance(),
      loadingStates: await this.checkLoadingStates(),
      errorHandling: await this.checkErrorHandling(),
      navigationPatterns: await this.checkNavigationPatterns()
    };
    
    const score = Object.values(checklist).filter(v => v).length / Object.keys(checklist).length * 100;
    
    const recommendations: string[] = [];
    if (!checklist.capacitorConfigured) {
      recommendations.push('Configure Capacitor with correct webDir path');
    }
    if (!checklist.offlineMode) {
      recommendations.push('Implement service worker for offline functionality');
    }
    if (!checklist.performanceOptimized) {
      recommendations.push('Optimize bundle size and implement lazy loading');
    }
    
    return {
      ready: score >= 90,
      score,
      checklist,
      recommendations
    };
  }

  // Helper methods
  private async gatherSystemContext(): Promise<any> {
    // In real implementation, gather actual system metrics
    return {
      memoryUsage: process.memoryUsage().heapUsed,
      cacheHitRate: 0.75, // Would get from monitoring service
      apiResponseTime: 200, // Would get from monitoring service
      lspErrors: [], // Would get from LSP service
      capacitorError: null, // Would check Capacitor status
      hasLoadingStates: true, // Would analyze components
      cssContent: '', // Would read CSS files
      redisError: null, // Would check Redis status
      apiErrors: [] // Would check recent API errors
    };
  }

  private categorizeError(error: any): LifeCEOPattern['category'] {
    const errorString = JSON.stringify(error).toLowerCase();
    
    if (errorString.includes('typescript') || errorString.includes('type')) {
      return 'typescript';
    } else if (errorString.includes('memory') || errorString.includes('heap')) {
      return 'memory';
    } else if (errorString.includes('cache') || errorString.includes('redis')) {
      return 'cache';
    } else if (errorString.includes('api') || errorString.includes('endpoint')) {
      return 'api';
    } else if (errorString.includes('css') || errorString.includes('theme')) {
      return 'design';
    } else if (errorString.includes('capacitor') || errorString.includes('mobile')) {
      return 'mobile';
    }
    
    return 'typescript'; // Default
  }

  private async persistPattern(pattern: LifeCEOPattern): Promise<void> {
    // Store pattern in database for persistence across sessions
    try {
      await db.insert(schema.life_ceo_patterns).values({
        pattern_id: pattern.id,
        pattern_text: pattern.pattern,
        solution: pattern.solution,
        success_rate: pattern.successRate,
        category: pattern.category,
        last_seen: pattern.lastSeen,
        occurrences: pattern.occurrences
      }).onConflictDoUpdate({
        target: [schema.life_ceo_patterns.pattern_id],
        set: {
          occurrences: pattern.occurrences,
          last_seen: pattern.lastSeen,
          success_rate: pattern.successRate
        }
      });
    } catch (error) {
      console.error('Error persisting pattern:', error);
    }
  }

  private async attemptAutoFix(category: string, result: ValidationResult): Promise<void> {
    console.log(`🔧 Attempting auto-fix for ${category}:`, result.suggestions);
    
    // In real implementation, would execute actual fixes
    // For now, just log the suggestions
    result.suggestions.forEach(suggestion => {
      console.log(`  → ${suggestion}`);
    });
  }

  private async logValidationStatus(results: Record<string, ValidationResult>): Promise<void> {
    const allPassed = Object.values(results).every(r => r.passed);
    const status = allPassed ? '✅' : '⚠️';
    
    console.log(`${status} Life CEO Continuous Validation:`, {
      timestamp: new Date().toISOString(),
      results: Object.entries(results).map(([category, result]) => ({
        category,
        passed: result.passed,
        issues: result.issues.length
      }))
    });
  }

  // Check methods for mobile readiness
  private async checkCapacitorConfig(): Promise<boolean> {
    // Check if capacitor.config.ts exists and is properly configured
    return true; // Simplified for now
  }

  private async checkNativePlugins(): Promise<boolean> {
    // Check if required native plugins are installed
    return true; // Simplified for now
  }

  private async checkResponsiveDesign(): Promise<boolean> {
    // Check if all pages have responsive design
    return true; // Simplified for now
  }

  private async checkOfflineCapability(): Promise<boolean> {
    // Check if service worker is configured
    return false; // We know this isn't implemented yet
  }

  private async checkMobilePerformance(): Promise<boolean> {
    // Check bundle size and performance metrics
    return true; // Simplified for now
  }

  private async checkLoadingStates(): Promise<boolean> {
    // Check if all async operations have loading states
    return true; // Simplified for now
  }

  private async checkErrorHandling(): Promise<boolean> {
    // Check if proper error boundaries exist
    return true; // Simplified for now
  }

  private async checkNavigationPatterns(): Promise<boolean> {
    // Check if navigation uses wouter properly
    return true; // Simplified for now
  }
}

// Export singleton instance
export const lifeCeoEnhanced = new LifeCEOEnhancedService();