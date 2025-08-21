import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  FolderOpen, 
  GitBranch,
  Zap,
  TrendingUp,
  Archive,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

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

interface Suggestion {
  type: 'move' | 'split' | 'merge' | 'delete';
  target: string;
  reason: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

interface ProjectMetrics {
  timestamp: string;
  hierarchy: HierarchyMetrics;
  suggestions: Suggestion[];
}

export default function HierarchyDashboard() {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled auto-refresh to prevent 404 errors

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/evolution/metrics/latest', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScore = () => {
    if (!metrics) return 0;
    const { moduleCohesion, couplingScore } = metrics.hierarchy;
    // Higher cohesion is good, lower coupling is good
    const cohesionScore = moduleCohesion * 100;
    const couplingPenalty = couplingScore * 100;
    return Math.max(0, Math.min(100, cohesionScore - couplingPenalty));
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Metrics Available</AlertTitle>
        <AlertDescription>
          The evolution service is still analyzing your project structure.
        </AlertDescription>
      </Alert>
    );
  }

  const healthScore = getHealthScore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Hierarchy Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Real-time analysis of your project structure health
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Health Score</CardTitle>
          <CardDescription>
            Based on module cohesion and coupling analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore.toFixed(0)}%
            </div>
            <Progress value={healthScore} className="flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <span className="text-sm text-gray-600">Module Cohesion</span>
              <div className="font-semibold">
                {(metrics.hierarchy.moduleCohesion * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Coupling Score</span>
              <div className="font-semibold">
                {(metrics.hierarchy.couplingScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
            {metrics.suggestions.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {metrics.suggestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.hierarchy.totalFiles}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Directories</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.hierarchy.totalDirectories}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Max Depth</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.hierarchy.maxDepth}</div>
                {metrics.hierarchy.maxDepth > 5 && (
                  <p className="text-xs text-yellow-600 mt-1">Consider flattening</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Files/Dir</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.hierarchy.avgFilesPerDirectory.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {metrics.suggestions.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No Suggestions</AlertTitle>
              <AlertDescription>
                Your project structure looks good! No improvements needed at this time.
              </AlertDescription>
            </Alert>
          ) : (
            metrics.suggestions.map((suggestion, index) => (
              <Alert key={index}>
                <Zap className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Suggestion
                  <Badge variant={getImpactColor(suggestion.impact)}>
                    {suggestion.impact} impact
                  </Badge>
                  <Badge variant="outline">
                    {(suggestion.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="font-medium">{suggestion.target}</p>
                  <p className="text-sm mt-1">{suggestion.reason}</p>
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {metrics.hierarchy.misplacedFiles.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Misplaced Files</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  {metrics.hierarchy.misplacedFiles.length} files appear to be in the wrong location:
                </p>
                <ul className="list-disc list-inside text-sm">
                  {metrics.hierarchy.misplacedFiles.slice(0, 5).map((file, index) => (
                    <li key={index} className="font-mono">{file}</li>
                  ))}
                  {metrics.hierarchy.misplacedFiles.length > 5 && (
                    <li>...and {metrics.hierarchy.misplacedFiles.length - 5} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {metrics.hierarchy.orphanedFiles.length > 0 && (
            <Alert>
              <Archive className="h-4 w-4" />
              <AlertTitle>Orphaned Files</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  {metrics.hierarchy.orphanedFiles.length} files have no connections to other files:
                </p>
                <ul className="list-disc list-inside text-sm">
                  {metrics.hierarchy.orphanedFiles.slice(0, 5).map((file, index) => (
                    <li key={index} className="font-mono">{file}</li>
                  ))}
                  {metrics.hierarchy.orphanedFiles.length > 5 && (
                    <li>...and {metrics.hierarchy.orphanedFiles.length - 5} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {metrics.hierarchy.misplacedFiles.length === 0 && 
           metrics.hierarchy.orphanedFiles.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No Issues Found</AlertTitle>
              <AlertDescription>
                Your project structure has no detected issues.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-500 text-right">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </div>
    </div>
  );
}