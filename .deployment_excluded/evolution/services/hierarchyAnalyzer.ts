import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs/promises';
import { parse as parseGraphQL } from 'graphql';
import { parse as parseCSS } from 'css';

interface FileAnalysis {
  path: string;
  type: FileType;
  imports: string[];
  exports: string[];
  dependencies: string[];
  complexity: number;
  linesOfCode: number;
  domain: string;
  suggestedLocation?: string;
}

interface DomainMapping {
  pattern: RegExp;
  domain: string;
  suggestedPath: string;
}

enum FileType {
  Component = 'component',
  Service = 'service',
  Agent = 'agent',
  Utility = 'utility',
  Test = 'test',
  Config = 'config',
  Route = 'route',
  Schema = 'schema',
  Style = 'style',
  Document = 'document',
  Unknown = 'unknown'
}

export class HierarchyAnalyzer {
  private domainMappings: DomainMapping[] = [
    {
      pattern: /Agent|agent.*\.ts$/,
      domain: 'life-ceo',
      suggestedPath: 'systems/life-ceo/agents/'
    },
    {
      pattern: /Service|service.*\.ts$/,
      domain: 'shared',
      suggestedPath: 'systems/shared/services/'
    },
    {
      pattern: /Component|\.tsx$/,
      domain: 'frontend',
      suggestedPath: 'systems/shared/ui-kit/'
    },
    {
      pattern: /route|Route|api.*\.ts$/,
      domain: 'backend',
      suggestedPath: 'systems/shared/api/'
    },
    {
      pattern: /schema|Schema.*\.ts$/,
      domain: 'data',
      suggestedPath: 'systems/shared/database/schemas/'
    },
    {
      pattern: /test|spec|\.test\.|\.spec\./,
      domain: 'testing',
      suggestedPath: 'tests/'
    },
    {
      pattern: /\.css$|\.scss$|\.less$/,
      domain: 'styling',
      suggestedPath: 'systems/shared/styles/'
    }
  ];

  async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const content = await fs.readFile(filePath, 'utf-8');
    const fileType = this.detectFileType(filePath, content);
    const domain = this.detectDomain(filePath, content);
    const suggestedLocation = this.suggestLocation(filePath, fileType, domain);

    let imports: string[] = [];
    let exports: string[] = [];
    let complexity = 0;

    try {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const analysis = this.analyzeTypeScript(content);
        imports = analysis.imports;
        exports = analysis.exports;
        complexity = analysis.complexity;
      }
    } catch (error) {
      console.warn(`Failed to analyze ${filePath}:`, error);
    }

    const linesOfCode = content.split('\n').length;
    const dependencies = this.extractDependencies(imports);

    return {
      path: filePath,
      type: fileType,
      imports,
      exports,
      dependencies,
      complexity,
      linesOfCode,
      domain,
      suggestedLocation
    };
  }

  private detectFileType(filePath: string, content: string): FileType {
    const fileName = path.basename(filePath);
    
    // Test files
    if (/\.(test|spec)\.[tj]sx?$/.test(fileName)) {
      return FileType.Test;
    }

    // React components
    if (filePath.endsWith('.tsx') || content.includes('jsx') || content.includes('React')) {
      return FileType.Component;
    }

    // Agents
    if (/Agent|agent/i.test(fileName) || content.includes('extends BaseAgent')) {
      return FileType.Agent;
    }

    // Services
    if (/Service|service/i.test(fileName) || content.includes('class.*Service')) {
      return FileType.Service;
    }

    // Routes
    if (/route|Route/i.test(fileName) || content.includes('express.Router')) {
      return FileType.Route;
    }

    // Schemas
    if (/schema|Schema/i.test(fileName) || content.includes('z.object')) {
      return FileType.Schema;
    }

    // Config files
    if (/config|\.config\./i.test(fileName)) {
      return FileType.Config;
    }

    // Style files
    if (/\.(css|scss|less)$/.test(fileName)) {
      return FileType.Style;
    }

    // Documents
    if (/\.(md|mdx|txt|doc)$/.test(fileName)) {
      return FileType.Document;
    }

    // Utilities
    if (/util|helper|lib/i.test(fileName)) {
      return FileType.Utility;
    }

    return FileType.Unknown;
  }

  private detectDomain(filePath: string, content: string): string {
    // Check path-based domain
    if (filePath.includes('life-ceo')) return 'life-ceo';
    if (filePath.includes('mundo-tango') || filePath.includes('communities')) return 'mundo-tango';
    if (filePath.includes('shared')) return 'shared';
    
    // Check content-based domain
    for (const mapping of this.domainMappings) {
      if (mapping.pattern.test(filePath)) {
        return mapping.domain;
      }
    }

    // Analyze imports to determine domain
    if (content.includes('life-ceo')) return 'life-ceo';
    if (content.includes('mundo-tango')) return 'mundo-tango';
    
    return 'unknown';
  }

  private suggestLocation(filePath: string, fileType: FileType, domain: string): string {
    const fileName = path.basename(filePath);
    
    // Find matching domain mapping
    for (const mapping of this.domainMappings) {
      if (mapping.pattern.test(filePath)) {
        return path.join(mapping.suggestedPath, fileName);
      }
    }

    // Default suggestions based on file type
    const typeToPath: Record<FileType, string> = {
      [FileType.Component]: `systems/${domain}/features/components/`,
      [FileType.Service]: `systems/${domain}/services/`,
      [FileType.Agent]: 'systems/life-ceo/agents/',
      [FileType.Utility]: 'systems/shared/utilities/',
      [FileType.Test]: 'tests/',
      [FileType.Config]: 'infrastructure/config/',
      [FileType.Route]: `systems/${domain}/api/`,
      [FileType.Schema]: 'systems/shared/database/schemas/',
      [FileType.Style]: 'systems/shared/styles/',
      [FileType.Document]: 'documentation/',
      [FileType.Unknown]: ''
    };

    return typeToPath[fileType] ? path.join(typeToPath[fileType], fileName) : filePath;
  }

  private analyzeTypeScript(content: string): {
    imports: string[];
    exports: string[];
    complexity: number;
  } {
    const imports: string[] = [];
    const exports: string[] = [];
    let complexity = 0;

    try {
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const visit = (node: ts.Node) => {
        // Count imports
        if (ts.isImportDeclaration(node)) {
          const moduleSpecifier = node.moduleSpecifier;
          if (ts.isStringLiteral(moduleSpecifier)) {
            imports.push(moduleSpecifier.text);
          }
        }

        // Count exports
        if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
          exports.push('export');
        }

        // Calculate complexity
        if (
          ts.isIfStatement(node) ||
          ts.isForStatement(node) ||
          ts.isWhileStatement(node) ||
          ts.isSwitchStatement(node) ||
          ts.isConditionalExpression(node)
        ) {
          complexity++;
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    } catch (error) {
      console.warn('TypeScript analysis failed:', error);
    }

    return { imports, exports, complexity };
  }

  private extractDependencies(imports: string[]): string[] {
    return imports
      .filter(imp => !imp.startsWith('.') && !imp.startsWith('@/'))
      .map(imp => {
        const match = imp.match(/^(@?[^/]+)/);
        return match ? match[1] : imp;
      })
      .filter((dep, index, self) => self.indexOf(dep) === index);
  }

  async buildImportGraph(rootPath: string): Promise<Map<string, Set<string>>> {
    const graph = new Map<string, Set<string>>();
    const files = await this.findAllSourceFiles(rootPath);

    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file);
        const normalizedPath = path.relative(rootPath, file);
        
        if (!graph.has(normalizedPath)) {
          graph.set(normalizedPath, new Set());
        }

        for (const imp of analysis.imports) {
          if (imp.startsWith('.')) {
            const resolvedImport = path.resolve(path.dirname(file), imp);
            const normalizedImport = path.relative(rootPath, resolvedImport);
            graph.get(normalizedPath)!.add(normalizedImport);
          }
        }
      } catch (error) {
        console.warn(`Failed to analyze ${file}:`, error);
      }
    }

    return graph;
  }

  private async findAllSourceFiles(rootPath: string): Promise<string[]> {
    const files: string[] = [];
    const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage']);

    const traverse = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !ignoreDirs.has(entry.name)) {
          await traverse(path.join(dir, entry.name));
        } else if (entry.isFile() && this.isSourceFile(entry.name)) {
          files.push(path.join(dir, entry.name));
        }
      }
    };

    await traverse(rootPath);
    return files;
  }

  private isSourceFile(fileName: string): boolean {
    return /\.(ts|tsx|js|jsx|css|scss|less)$/.test(fileName);
  }

  calculateModuleCohesion(importGraph: Map<string, Set<string>>): number {
    // Module cohesion: ratio of internal dependencies to total dependencies
    const modules = this.identifyModules(importGraph);
    let totalInternalDeps = 0;
    let totalDeps = 0;

    for (const [moduleName, moduleFiles] of modules) {
      for (const file of moduleFiles) {
        const deps = importGraph.get(file) || new Set();
        for (const dep of deps) {
          totalDeps++;
          if (this.getModuleForFile(dep, modules) === moduleName) {
            totalInternalDeps++;
          }
        }
      }
    }

    return totalDeps > 0 ? totalInternalDeps / totalDeps : 1;
  }

  calculateCoupling(importGraph: Map<string, Set<string>>): number {
    // Coupling: ratio of external dependencies to total files
    const modules = this.identifyModules(importGraph);
    let externalDeps = 0;
    let totalFiles = importGraph.size;

    for (const [file, deps] of importGraph) {
      const fileModule = this.getModuleForFile(file, modules);
      for (const dep of deps) {
        const depModule = this.getModuleForFile(dep, modules);
        if (fileModule !== depModule) {
          externalDeps++;
        }
      }
    }

    return totalFiles > 0 ? externalDeps / totalFiles : 0;
  }

  private identifyModules(importGraph: Map<string, Set<string>>): Map<string, Set<string>> {
    const modules = new Map<string, Set<string>>();
    
    for (const file of importGraph.keys()) {
      const module = this.getModuleFromPath(file);
      if (!modules.has(module)) {
        modules.set(module, new Set());
      }
      modules.get(module)!.add(file);
    }

    return modules;
  }

  private getModuleFromPath(filePath: string): string {
    const parts = filePath.split(path.sep);
    
    // Identify module based on path structure
    if (parts.includes('life-ceo')) return 'life-ceo';
    if (parts.includes('mundo-tango')) return 'mundo-tango';
    if (parts.includes('shared')) return 'shared';
    if (parts.includes('components')) return 'components';
    if (parts.includes('services')) return 'services';
    
    // Default to first directory
    return parts[0] || 'root';
  }

  private getModuleForFile(
    file: string, 
    modules: Map<string, Set<string>>
  ): string | undefined {
    for (const [moduleName, moduleFiles] of modules) {
      if (moduleFiles.has(file)) {
        return moduleName;
      }
    }
    return undefined;
  }

  findCircularDependencies(importGraph: Map<string, Set<string>>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[] = []) => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = importGraph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart !== -1) {
            cycles.push(path.slice(cycleStart));
          }
        }
      }

      recursionStack.delete(node);
    };

    for (const node of importGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }
}

export default HierarchyAnalyzer;