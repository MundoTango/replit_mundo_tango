import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';

interface ProjectMetrics {
  timestamp: Date;
  hierarchy: HierarchyMetrics;
  usage: UsageMetrics;
  suggestions: Suggestion[];
}

interface HierarchyMetrics {
  totalFiles: number;
  totalDirectories: number;
  maxDepth: number;
  avgFilesPerDirectory: number;
  orphanedFiles: string[];
  misplacedFiles: string[];
  moduleCohesion: number;
  couplingScore: number;
}

interface UsageMetrics {
  hotModules: string[];
  coldModules: string[];
  importFrequency: Map<string, number>;
  lastModified: Map<string, Date>;
}

interface Suggestion {
  type: 'move' | 'split' | 'merge' | 'delete';
  target: string;
  reason: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

interface PreventionPattern {
  id: string;
  name: string;
  description: string;
  filePatterns: RegExp[];
  syntaxChecks: Array<{
    pattern: RegExp;
    message: string;
    severity: 'error' | 'warning';
  }>;
  autoFix?: (content: string) => string;
  layer: number; // 20L layer this pattern belongs to
}

class EvolutionService extends EventEmitter {
  private watcher: any | null = null;
  private metrics: ProjectMetrics[] = [];
  private rules: EvolutionRule[] = [];
  private rootPath: string;
  private preventionPatterns: Map<string, PreventionPattern> = new Map();

  constructor(rootPath: string) {
    super();
    this.rootPath = rootPath;
    this.loadDefaultRules();
    this.loadPreventionPatterns();
  }

  async initialize(): Promise<void> {
    console.log('🧬 Initializing Evolution Service...');
    
    // Create evolution directories
    await this.createEvolutionDirectories();
    
    // Start file watcher
    this.startFileWatcher();
    
    // Initial analysis
    await this.analyze();
    
    console.log('✅ Evolution Service initialized');
  }

  private async createEvolutionDirectories(): Promise<void> {
    const dirs = [
      'evolution/metrics',
      'evolution/analysis',
      'evolution/proposals',
      'evolution/history'
    ];

    for (const dir of dirs) {
      await fs.mkdir(path.join(this.rootPath, dir), { recursive: true });
    }
  }

  private startFileWatcher(): void {
    this.watcher = chokidar.watch(this.rootPath, {
      ignored: [
        /(^|[\/\\])\../, // dot files
        /node_modules/,
        /evolution\//,
        /\.git/,
        /dist/,
        /build/
      ],
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('add', (filePath: string) => this.handleFileAdd(filePath))
      .on('unlink', (filePath: string) => this.handleFileRemove(filePath))
      .on('change', (filePath: string) => this.handleFileChange(filePath));
  }

  private async handleFileAdd(filePath: string): Promise<void> {
    console.log(`📄 New file detected: ${filePath}`);
    
    const suggestion = await this.suggestOptimalLocation(filePath);
    if (suggestion.confidence > 0.8) {
      this.emit('suggestion', {
        type: 'file-location',
        current: filePath,
        suggested: suggestion.path,
        reason: suggestion.reason,
        confidence: suggestion.confidence
      });
    }
  }

  private async handleFileRemove(filePath: string): Promise<void> {
    console.log(`🗑️ File removed: ${filePath}`);
    // Update metrics to reflect removal
    await this.updateMetrics();
  }

  private async handleFileChange(filePath: string): Promise<void> {
    // Check prevention patterns
    await this.checkPreventionPatterns(filePath);
    
    // Track change frequency for hot/cold module detection
    await this.updateUsageMetrics(filePath);
  }

  private async checkPreventionPatterns(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(this.rootPath, filePath);
      
      for (const [id, pattern] of this.preventionPatterns) {
        // Check if file matches pattern
        const matches = pattern.filePatterns.some(regex => regex.test(relativePath));
        if (!matches) continue;
        
        // Run syntax checks
        for (const check of pattern.syntaxChecks) {
          if (check.pattern.test(content)) {
            console.log(`⚠️  Prevention Pattern [${pattern.name}] triggered:`);
            console.log(`   File: ${relativePath}`);
            console.log(`   ${check.severity.toUpperCase()}: ${check.message}`);
            console.log(`   Layer ${pattern.layer} issue detected`);
            
            // Auto-fix if available
            if (pattern.autoFix && check.severity === 'error') {
              const fixed = pattern.autoFix(content);
              if (fixed !== content) {
                await fs.writeFile(filePath, fixed);
                console.log(`   ✅ Auto-fixed the issue`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error checking prevention patterns for ${filePath}:`, error);
    }
  }

  async analyze(): Promise<ProjectMetrics> {
    console.log('🔍 Analyzing project hierarchy...');
    
    const hierarchyMetrics = await this.analyzeHierarchy();
    const usageMetrics = await this.analyzeUsage();
    const suggestions = await this.generateSuggestions(hierarchyMetrics, usageMetrics);
    
    const metrics: ProjectMetrics = {
      timestamp: new Date(),
      hierarchy: hierarchyMetrics,
      usage: usageMetrics,
      suggestions
    };
    
    this.metrics.push(metrics);
    await this.saveMetrics(metrics);
    
    return metrics;
  }

  private async analyzeHierarchy(): Promise<HierarchyMetrics> {
    const fileMap = new Map<string, string[]>();
    const directorySizes = new Map<string, number>();
    let maxDepth = 0;

    const traverse = async (dir: string, depth: number = 0): Promise<void> => {
      maxDepth = Math.max(maxDepth, depth);
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !this.shouldIgnoreDirectory(entry.name)) {
          await traverse(fullPath, depth + 1);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }

      fileMap.set(dir, files);
      directorySizes.set(dir, files.length);
    };

    await traverse(this.rootPath);

    const totalFiles = Array.from(fileMap.values()).reduce((sum, files) => sum + files.length, 0);
    const totalDirectories = fileMap.size;
    const avgFilesPerDirectory = totalFiles / totalDirectories;

    // Detect misplaced files
    const misplacedFiles = await this.detectMisplacedFiles(fileMap);
    const orphanedFiles = await this.detectOrphanedFiles(fileMap);

    // Calculate cohesion and coupling
    const { cohesion, coupling } = await this.calculateModuleMetrics(fileMap);

    return {
      totalFiles,
      totalDirectories,
      maxDepth,
      avgFilesPerDirectory,
      orphanedFiles,
      misplacedFiles,
      moduleCohesion: cohesion,
      couplingScore: coupling
    };
  }

  private async analyzeUsage(): Promise<UsageMetrics> {
    // This would integrate with git history or file modification times
    const hotModules: string[] = [];
    const coldModules: string[] = [];
    const importFrequency = new Map<string, number>();
    const lastModified = new Map<string, Date>();

    // Placeholder implementation - would analyze actual usage patterns
    return {
      hotModules,
      coldModules,
      importFrequency,
      lastModified
    };
  }

  private async generateSuggestions(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Apply evolution rules
    for (const rule of this.rules) {
      const ruleSuggestions = await rule.evaluate(hierarchy, usage, this.rootPath);
      suggestions.push(...ruleSuggestions);
    }

    // Sort by confidence and impact
    suggestions.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      const impactWeight = { low: 1, medium: 2, high: 3 };
      return impactWeight[b.impact] - impactWeight[a.impact];
    });

    return suggestions;
  }

  private async suggestOptimalLocation(filePath: string): Promise<{
    path: string;
    reason: string;
    confidence: number;
  }> {
    const fileName = path.basename(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Analyze file content and name to determine optimal location
    const analysis = this.analyzeFileContent(fileContent, fileName);
    
    return {
      path: analysis.suggestedPath,
      reason: analysis.reason,
      confidence: analysis.confidence
    };
  }

  private analyzeFileContent(content: string, fileName: string): {
    suggestedPath: string;
    reason: string;
    confidence: number;
  } {
    // Pattern matching for different file types
    const patterns = [
      {
        pattern: /export.*Agent|class.*Agent/,
        path: 'life-ceo/agents/',
        reason: 'Agent class detected'
      },
      {
        pattern: /export.*Service|class.*Service/,
        path: 'services/',
        reason: 'Service class detected'
      },
      {
        pattern: /export.*Component|function.*\(.*props.*\)|jsx|tsx/,
        path: 'components/',
        reason: 'React component detected'
      },
      {
        pattern: /export.*Route|router\.|app\.(get|post|put|delete)/,
        path: 'routes/',
        reason: 'Route handler detected'
      }
    ];

    for (const { pattern, path, reason } of patterns) {
      if (pattern.test(content)) {
        return {
          suggestedPath: path + fileName,
          reason,
          confidence: 0.85
        };
      }
    }

    return {
      suggestedPath: fileName,
      reason: 'No clear pattern detected',
      confidence: 0.3
    };
  }

  private async detectMisplacedFiles(fileMap: Map<string, string[]>): Promise<string[]> {
    const misplaced: string[] = [];
    
    // Check for files that don't match their directory pattern
    for (const [dir, files] of fileMap) {
      for (const file of files) {
        if (this.isFileMisplaced(file, dir)) {
          misplaced.push(file);
        }
      }
    }
    
    return misplaced;
  }

  private isFileMisplaced(filePath: string, directory: string): boolean {
    const fileName = path.basename(filePath);
    const dirName = path.basename(directory);
    
    // Check common misplacement patterns
    if (dirName === 'components' && !fileName.includes('Component') && !fileName.endsWith('.tsx')) {
      return true;
    }
    if (dirName === 'services' && !fileName.includes('Service') && !fileName.endsWith('.ts')) {
      return true;
    }
    if (dirName === 'utils' && fileName.includes('Component')) {
      return true;
    }
    
    return false;
  }

  private async detectOrphanedFiles(fileMap: Map<string, string[]>): Promise<string[]> {
    // Files with no imports/exports to/from other files
    // This would require AST analysis
    return [];
  }

  private async calculateModuleMetrics(fileMap: Map<string, string[]>): Promise<{
    cohesion: number;
    coupling: number;
  }> {
    // Placeholder - would analyze import/export relationships
    return {
      cohesion: 0.85,
      coupling: 0.23
    };
  }

  private shouldIgnoreDirectory(name: string): boolean {
    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return ignoreDirs.includes(name);
  }

  private async saveMetrics(metrics: ProjectMetrics): Promise<void> {
    const timestamp = metrics.timestamp.toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(this.rootPath, 'evolution/metrics', `${timestamp}.json`);
    await fs.writeFile(filePath, JSON.stringify(metrics, null, 2));
  }

  private async updateMetrics(): Promise<void> {
    // Incremental update instead of full analysis
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics) {
      latestMetrics.timestamp = new Date();
      await this.saveMetrics(latestMetrics);
    }
  }

  private async updateUsageMetrics(filePath: string): Promise<void> {
    // Track file change frequency
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics) {
      latestMetrics.usage.lastModified.set(filePath, new Date());
    }
  }

  private loadDefaultRules(): void {
    this.rules = [
      new FileSizeRule(),
      new DeadCodeRule(),
      new CouplingRule(),
      new NamingConventionRule(),
      new DirectoryDepthRule()
    ];
  }

  private loadPreventionPatterns(): void {
    // Layer 5: Middleware Syntax Prevention
    this.preventionPatterns.set('middleware-syntax', {
      id: 'middleware-syntax',
      name: 'Middleware Syntax Prevention',
      description: 'Prevents syntax errors in middleware declarations',
      filePatterns: [/middleware\.(ts|js)$/, /auth\.(ts|js)$/],
      syntaxChecks: [
        {
          pattern: /\}\s*export/,
          message: 'Missing semicolon or parenthesis before export statement',
          severity: 'error'
        },
        {
          pattern: /\);\s*\)\s*export/,
          message: 'Double closing parenthesis detected before export',
          severity: 'error'
        },
        {
          pattern: /export\s+\{[^}]*\}\s*$/,
          message: 'Export statement should not be at end of file after middleware definition',
          severity: 'warning'
        }
      ],
      autoFix: (content: string) => {
        // Auto-fix double closing parentheses
        return content.replace(/\);\s*\)\s*export/, '); export');
      },
      layer: 5 // Backend implementation layer
    });

    // Layer 6: Frontend Authentication Consistency
    this.preventionPatterns.set('frontend-auth', {
      id: 'frontend-auth',
      name: 'Frontend Authentication Consistency',
      description: 'Ensures authentication patterns are consistent across frontend',
      filePatterns: [/components.*\.(tsx|jsx)$/, /pages.*\.(tsx|jsx)$/],
      syntaxChecks: [
        {
          pattern: /useAuth\(\).*undefined/,
          message: 'useAuth hook might return undefined - add null checks',
          severity: 'warning'
        },
        {
          pattern: /localStorage\.(getItem|setItem).*token/,
          message: 'Direct localStorage access for tokens - use auth service instead',
          severity: 'warning'
        }
      ],
      layer: 6
    });

    // Layer 7: API Integration Patterns
    this.preventionPatterns.set('api-integration', {
      id: 'api-integration',
      name: 'API Integration Prevention',
      description: 'Prevents common API integration mistakes',
      filePatterns: [/api.*\.(ts|js)$/, /routes.*\.(ts|js)$/],
      syntaxChecks: [
        {
          pattern: /app\.(get|post|put|delete)\s*\([^)]*\)\s*[^{]/,
          message: 'Route handler missing proper function body',
          severity: 'error'
        },
        {
          pattern: /async\s+\([^)]*\)\s*=>\s*[^{]/,
          message: 'Async arrow function missing proper error handling',
          severity: 'warning'
        }
      ],
      layer: 7
    });

    console.log(`✅ Loaded ${this.preventionPatterns.size} prevention patterns`);
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
    }
  }
}

// Evolution Rules
interface EvolutionRule {
  name: string;
  evaluate(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics,
    rootPath: string
  ): Promise<Suggestion[]>;
}

class FileSizeRule implements EvolutionRule {
  name = 'File Size Rule';

  async evaluate(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics,
    rootPath: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check for large files that should be split
    // This is a placeholder - would check actual file sizes
    
    return suggestions;
  }
}

class DeadCodeRule implements EvolutionRule {
  name = 'Dead Code Rule';

  async evaluate(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics,
    rootPath: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    for (const coldModule of usage.coldModules) {
      suggestions.push({
        type: 'delete',
        target: coldModule,
        reason: 'No usage detected in 30 days',
        confidence: 0.7,
        impact: 'low'
      });
    }
    
    return suggestions;
  }
}

class CouplingRule implements EvolutionRule {
  name = 'Coupling Rule';

  async evaluate(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics,
    rootPath: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    if (hierarchy.couplingScore > 0.3) {
      suggestions.push({
        type: 'split',
        target: 'High coupling detected',
        reason: `Coupling score ${hierarchy.couplingScore} exceeds threshold`,
        confidence: 0.8,
        impact: 'high'
      });
    }
    
    return suggestions;
  }
}

class NamingConventionRule implements EvolutionRule {
  name = 'Naming Convention Rule';

  async evaluate(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics,
    rootPath: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    for (const misplacedFile of hierarchy.misplacedFiles) {
      suggestions.push({
        type: 'move',
        target: misplacedFile,
        reason: 'File naming doesn\'t match directory convention',
        confidence: 0.9,
        impact: 'medium'
      });
    }
    
    return suggestions;
  }
}

class DirectoryDepthRule implements EvolutionRule {
  name = 'Directory Depth Rule';

  async evaluate(
    hierarchy: HierarchyMetrics,
    usage: UsageMetrics,
    rootPath: string
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    if (hierarchy.maxDepth > 5) {
      suggestions.push({
        type: 'merge',
        target: 'Deep directory nesting',
        reason: `Max depth ${hierarchy.maxDepth} makes navigation difficult`,
        confidence: 0.6,
        impact: 'medium'
      });
    }
    
    return suggestions;
  }
}

export default EvolutionService;