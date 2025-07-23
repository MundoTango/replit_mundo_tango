import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileJson, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Package,
  GitBranch,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { comprehensiveProjectData } from '@/data/comprehensive-project-data';

interface ExportStats {
  totalItems: number;
  epics: number;
  stories: number;
  tasks: number;
  subtasks: number;
  layerCoverage: number[];
  phaseCoverage: number[];
  completionRate: number;
}

const JiraExportDashboard: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Calculate export statistics
  const calculateStats = (): ExportStats => {
    let totalItems = 0;
    let epics = 0;
    let stories = 0;
    let tasks = 0;
    let subtasks = 0;
    let totalCompletion = 0;
    const layers = new Set<number>();
    const phases = new Set<number>();
    
    const processItem = (item: any) => {
      totalItems++;
      
      // Count by type
      switch (item.type) {
        case 'Platform':
        case 'Section':
          epics++;
          break;
        case 'Feature':
        case 'Project':
          stories++;
          break;
        case 'Task':
          tasks++;
          break;
        case 'Sub-task':
          subtasks++;
          break;
      }
      
      // Track completion
      totalCompletion += item.completion || 0;
      
      // Calculate layer and phase
      if (item.team) {
        // Simplified layer calculation for demo
        const layerMap: Record<string, number> = {
          'Frontend': 7,
          'Backend': 10,
          'Database': 15,
          'AI': 23,
          'Security': 21
        };
        item.team.forEach((t: string) => {
          if (layerMap[t]) layers.add(layerMap[t]);
        });
      }
      
      // Calculate phase from completion
      const phase = Math.ceil((item.completion || 0) / 5);
      if (phase > 0) phases.add(phase);
      
      // Process children
      if (item.children) {
        item.children.forEach(processItem);
      }
    };
    
    comprehensiveProjectData.forEach(processItem);
    
    return {
      totalItems,
      epics,
      stories,
      tasks,
      subtasks,
      layerCoverage: Array.from(layers).sort((a, b) => a - b),
      phaseCoverage: Array.from(phases).sort((a, b) => a - b),
      completionRate: totalItems > 0 ? Math.round(totalCompletion / totalItems) : 0
    };
  };
  
  const stats = calculateStats();
  
  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create export data
      const exportData = exportFormat === 'json' 
        ? generateJSONExport()
        : generateCSVExport();
      
      // Download the file
      const blob = new Blob([exportData], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mundo-tango-jira-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      
      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Generate JSON export
  const generateJSONExport = () => {
    return JSON.stringify({
      project: {
        key: 'MT',
        name: 'Mundo Tango',
        description: 'Social platform for tango dancers worldwide'
      },
      exportDate: new Date().toISOString(),
      framework: '40x20s',
      statistics: stats,
      issues: comprehensiveProjectData
    }, null, 2);
  };
  
  // Generate CSV export (simplified)
  const generateCSVExport = () => {
    const headers = ['Type', 'Title', 'Description', 'Status', 'Priority', 'Completion', 'Team'];
    const rows: string[][] = [];
    
    const processItemForCSV = (item: any, level = 0) => {
      rows.push([
        item.type,
        '"' + item.title.replace(/"/g, '""') + '"',
        '"' + item.description.replace(/"/g, '""') + '"',
        item.status,
        item.priority,
        (item.completion || 0) + '%',
        (item.team || []).join(';')
      ]);
      
      if (item.children) {
        item.children.forEach((child: any) => processItemForCSV(child, level + 1));
      }
    };
    
    comprehensiveProjectData.forEach(item => processItemForCSV(item));
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            JIRA Export Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Export Mundo Tango to JIRA using 40x20s Framework
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
          <Layers className="w-4 h-4 mr-2" />
          40x20s Framework
        </Badge>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glassmorphic-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Package className="w-5 h-5 text-turquoise-500" />
              <Badge className="bg-green-100 text-green-700 text-xs">
                {stats.completionRate}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
            <p className="text-sm text-gray-600">Total Items</p>
            <Progress value={stats.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card className="glassmorphic-card">
          <CardHeader className="pb-2">
            <GitBranch className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.epics}</p>
            <p className="text-sm text-gray-600">Epics</p>
            <div className="text-xs text-gray-500 mt-1">
              {stats.stories} stories
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphic-card">
          <CardHeader className="pb-2">
            <Target className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.tasks}</p>
            <p className="text-sm text-gray-600">Tasks</p>
            <div className="text-xs text-gray-500 mt-1">
              {stats.subtasks} sub-tasks
            </div>
          </CardContent>
        </Card>
        
        <Card className="glassmorphic-card">
          <CardHeader className="pb-2">
            <Layers className="w-5 h-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.layerCoverage.length}</p>
            <p className="text-sm text-gray-600">Layers Covered</p>
            <div className="text-xs text-gray-500 mt-1">
              {stats.phaseCoverage.length} phases
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Options */}
      <Card className="glassmorphic-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={exportFormat} onValueChange={(v) => setExportFormat(v as 'csv' | 'json')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                JSON Format
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                CSV Format
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className="mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  JSON format is recommended for JIRA REST API import. Includes full hierarchy and metadata.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="csv" className="mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  CSV format for JIRA's External System Import. Flattened structure with basic fields.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              <p>Ready to export {stats.totalItems} items</p>
              <p className="text-xs text-gray-500 mt-1">
                Covering {stats.layerCoverage.length} layers across {stats.phaseCoverage.length} phases
              </p>
            </div>
            
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
          
          {exportStatus === 'success' && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Export successful! Your file has been downloaded.
              </AlertDescription>
            </Alert>
          )}
          
          {exportStatus === 'error' && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Export failed. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Layer Coverage Visualization */}
      <Card className="glassmorphic-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">40x20s Framework Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Layer Coverage</h4>
              <div className="space-y-2">
                {stats.layerCoverage.map(layer => (
                  <div key={layer} className="flex items-center justify-between">
                    <span className="text-sm">Layer {layer}</span>
                    <Badge variant="outline" className="text-xs">
                      {getLayerName(layer)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Phase Distribution</h4>
              <div className="space-y-2">
                {[1, 5, 10, 15, 20].map(phase => {
                  const isActive = stats.phaseCoverage.includes(phase);
                  return (
                    <div key={phase} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-turquoise-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Phase {phase}: {getPhaseName(phase)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const getLayerName = (layer: number): string => {
  const layerNames: Record<number, string> = {
    7: 'Frontend',
    10: 'Backend',
    15: 'Database',
    21: 'Security',
    23: 'AI/ML'
  };
  return layerNames[layer] || 'Custom';
};

const getPhaseName = (phase: number): string => {
  if (phase <= 4) return 'Planning';
  if (phase <= 8) return 'Development';
  if (phase <= 12) return 'Testing';
  if (phase <= 16) return 'Deployment';
  return 'Optimization';
};

export default JiraExportDashboard;