import { logger } from '../lib/logger';

interface Learning {
  id: string;
  timestamp: Date;
  pattern: string;
  problem: string;
  solution: string;
  layer: string;
  confidence: number;
  implementation?: string;
  metrics?: {
    timeToResolution?: number;
    issuesFixed?: number;
    filesChanged?: number;
  };
}

class LifeCEOLearningAbsorptionService {
  private learnings: Map<string, Learning> = new Map();
  private patterns: Map<string, string> = new Map();

  constructor() {
    this.initializeRecentLearnings();
  }

  private initializeRecentLearnings() {
    // Absorb the 24-hour Redis debugging learnings
    const redisLearnings: Learning[] = [
      {
        id: 'module-loading-order',
        timestamp: new Date('2025-07-26T22:00:00Z'),
        pattern: 'lazy-initialization',
        problem: 'Module-level singleton instances creating immediate connections before environment variables are loaded',
        solution: 'Implement lazy initialization pattern for all external service connections',
        layer: 'Layer 1-10 (Foundation)',
        confidence: 0.98,
        implementation: `
// Instead of immediate connection
const redis = new Redis();

// Use lazy initialization
let redis: Redis | null = null;
const getRedis = () => {
  if (!redis && process.env.DISABLE_REDIS !== 'true') {
    redis = new Redis();
  }
  return redis;
};`,
        metrics: {
          timeToResolution: 45,
          issuesFixed: 5,
          filesChanged: 6
        }
      },
      {
        id: 'env-loading-sequence',
        timestamp: new Date('2025-07-26T22:15:00Z'),
        pattern: 'dotenv-first',
        problem: 'DISABLE_REDIS was undefined despite being in .env file',
        solution: 'Load dotenv.config() at the very top of server entry point before ANY imports',
        layer: 'Layer 2 (Configuration Management)',
        confidence: 1.0,
        implementation: `
// server/index.ts - MUST be first
import dotenv from "dotenv";
dotenv.config();

// Now safe to import modules
import { otherModules } from "./modules";`
      },
      {
        id: 'error-logging-enhancement',
        timestamp: new Date('2025-07-26T22:20:00Z'),
        pattern: 'structured-error-logging',
        problem: 'Unhandled promise rejections showing empty objects',
        solution: 'Enhanced error serialization for better debugging visibility',
        layer: 'Layer 11 (Monitoring & Logging)',
        confidence: 0.95,
        implementation: `
process.on('unhandledRejection', (reason, promise) => {
  const errorDetails = reason instanceof Error ? {
    message: reason.message,
    stack: reason.stack,
    name: reason.name
  } : reason;
  logger.fatal(errorDetails, 'Unhandled Rejection');
  console.error('Unhandled Promise Rejection:', reason);
});`
      }
    ];

    // Store learnings
    redisLearnings.forEach(learning => {
      this.learnings.set(learning.id, learning);
      this.patterns.set(learning.pattern, learning.solution);
    });

    logger.info('Life CEO absorbed 24-hour debugging learnings', {
      learningsCount: redisLearnings.length,
      patterns: Array.from(this.patterns.keys())
    });
  }

  // Apply learned patterns to new code
  public applyPattern(code: string, context: string): string {
    let improvedCode = code;

    // Apply lazy initialization pattern
    if (context.includes('service') && code.includes('new Redis') && !code.includes('lazy')) {
      improvedCode = this.applyLazyInitialization(code);
    }

    // Apply dotenv-first pattern
    if (context.includes('index.ts') && !code.includes('dotenv.config()')) {
      improvedCode = this.applyDotenvFirst(code);
    }

    return improvedCode;
  }

  private applyLazyInitialization(code: string): string {
    // Transform immediate initialization to lazy pattern
    const pattern = /const\s+(\w+)\s*=\s*new\s+(\w+)\(/g;
    return code.replace(pattern, (match, varName, className) => {
      return `let ${varName}: ${className} | null = null;
const get${className} = () => {
  if (!${varName} && process.env.DISABLE_${className.toUpperCase()} !== 'true') {
    ${varName} = new ${className}();
  }
  return ${varName};
};`;
    });
  }

  private applyDotenvFirst(code: string): string {
    // Ensure dotenv is loaded first
    const imports = code.match(/^import .+$/gm) || [];
    const dotenvImport = 'import dotenv from "dotenv";\ndotenv.config();\n';
    
    if (imports.length > 0 && !code.includes('dotenv.config()')) {
      return dotenvImport + '\n' + code;
    }
    return code;
  }

  // Predict potential issues based on learned patterns
  public predictIssues(filePath: string, content: string): string[] {
    const issues: string[] = [];

    // Check for immediate Redis/service connections
    if (content.includes('new Redis(') && !content.includes('lazy')) {
      issues.push('Potential issue: Redis connection created at module level. Use lazy initialization.');
    }

    // Check for missing dotenv in entry files
    if (filePath.endsWith('index.ts') && !content.includes('dotenv.config()')) {
      issues.push('Potential issue: Environment variables may not be loaded. Add dotenv.config() at top.');
    }

    // Check for poor error handling
    if (content.includes('unhandledRejection') && !content.includes('instanceof Error')) {
      issues.push('Potential issue: Error logging may show empty objects. Use structured error serialization.');
    }

    return issues;
  }

  // Generate recommendations based on context
  public getRecommendations(context: string): string[] {
    const recommendations: string[] = [];

    if (context.includes('redis') || context.includes('database')) {
      recommendations.push('Use lazy initialization pattern for external service connections');
      recommendations.push('Check DISABLE_REDIS environment variable before connecting');
    }

    if (context.includes('startup') || context.includes('initialization')) {
      recommendations.push('Load environment variables before any module imports');
      recommendations.push('Implement startup validation for required environment variables');
    }

    return recommendations;
  }

  // Get success metrics
  public getMetrics(): any {
    const totalLearnings = this.learnings.size;
    const avgConfidence = Array.from(this.learnings.values())
      .reduce((sum, l) => sum + l.confidence, 0) / totalLearnings;
    
    const totalTimeToResolution = Array.from(this.learnings.values())
      .reduce((sum, l) => sum + (l.metrics?.timeToResolution || 0), 0);

    return {
      totalLearnings,
      averageConfidence: avgConfidence,
      patternsIdentified: this.patterns.size,
      totalDebugTimesSaved: totalTimeToResolution,
      appliedToFiles: 0 // Will increment as patterns are applied
    };
  }
}

export const lifeCeoLearningAbsorption = new LifeCEOLearningAbsorptionService();