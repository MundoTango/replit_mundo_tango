import React, { useState, useEffect } from 'react';
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
  Target,
  Key,
  CloudUpload,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { comprehensiveProjectData } from '@/data/comprehensive-project-data';
import { enhancedProjectData44x21s, calculate44x21sStats } from '@/data/enhanced-project-data-44x21s';
import JiraCredentialsModal from './JiraCredentialsModal';
import { jiraApiService } from '@/services/jiraApiService';

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
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isCreatingInJira, setIsCreatingInJira] = useState(false);
  const [jiraProgress, setJiraProgress] = useState(0);
  const [jiraStatus, setJiraStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  
  // Check for saved credentials on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('jiraCredentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        jiraApiService.setCredentials(credentials);
        setHasCredentials(true);
      } catch (error) {
        console.error('Failed to load JIRA credentials:', error);
      }
    }
  }, []);
  
  // Calculate enhanced 44x21s statistics
  const calculateStats = (): ExportStats => {
    const enhanced44x21sStats = calculate44x21sStats();
    
    return {
      totalItems: enhanced44x21sStats.totalItems,
      epics: enhanced44x21sStats.priorities.Highest + enhanced44x21sStats.priorities.High > 10 ? 5 : 3,
      stories: Math.floor(enhanced44x21sStats.totalItems * 0.7), // 70% stories
      tasks: Math.floor(enhanced44x21sStats.totalItems * 0.2), // 20% tasks  
      subtasks: Math.floor(enhanced44x21sStats.totalItems * 0.1), // 10% subtasks
      layerCoverage: enhanced44x21sStats.layerCoverage,
      phaseCoverage: enhanced44x21sStats.phaseCoverage,
      completionRate: enhanced44x21sStats.completionRate
    };
  };
  
  // Legacy calculate stats for backward compatibility
  const calculateLegacyStats = (): ExportStats => {
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
  
  // Create issues directly in JIRA
  const createIssuesInJira = async () => {
    if (!hasCredentials) {
      setShowCredentialsModal(true);
      return;
    }
    
    setIsCreatingInJira(true);
    setJiraProgress(0);
    setJiraStatus({ message: 'Preparing JIRA export data...', type: 'info' });
    
    try {
      // Generate export data
      const exportData = generateJiraExportData();
      const totalItems = 
        exportData.epics.length + 
        exportData.stories.length + 
        exportData.tasks.length + 
        exportData.subTasks.length;
      
      let createdCount = 0;
      
      // Create epics first
      setJiraStatus({ message: 'Creating epics in JIRA...', type: 'info' });
      for (const epic of exportData.epics) {
        await jiraApiService.createIssue({
          fields: {
            summary: epic.summary,
            description: epic.description,
            issuetype: { name: 'Epic' },
            project: { key: jiraApiService.getCredentials()!.projectKey },
            priority: { name: epic.priority },
            labels: epic.labels
          }
        });
        createdCount++;
        setJiraProgress((createdCount / totalItems) * 100);
      }
      
      // Create stories
      setJiraStatus({ message: 'Creating stories in JIRA...', type: 'info' });
      for (const story of exportData.stories) {
        await jiraApiService.createIssue({
          fields: {
            summary: story.summary,
            description: story.description,
            issuetype: { name: 'Story' },
            project: { key: jiraApiService.getCredentials()!.projectKey },
            priority: { name: story.priority },
            labels: story.labels
          }
        });
        createdCount++;
        setJiraProgress((createdCount / totalItems) * 100);
      }
      
      // Create tasks
      setJiraStatus({ message: 'Creating tasks in JIRA...', type: 'info' });
      for (const task of exportData.tasks) {
        await jiraApiService.createIssue({
          fields: {
            summary: task.summary,
            description: task.description,
            issuetype: { name: 'Task' },
            project: { key: jiraApiService.getCredentials()!.projectKey },
            priority: { name: task.priority },
            labels: task.labels
          }
        });
        createdCount++;
        setJiraProgress((createdCount / totalItems) * 100);
      }
      
      setJiraStatus({ 
        message: `Successfully created ${createdCount} items in JIRA!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('JIRA creation failed:', error);
      setJiraStatus({ 
        message: `Failed to create issues: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        type: 'error' 
      });
    } finally {
      setIsCreatingInJira(false);
    }
  };
  
  // Generate enhanced JIRA export data with 44x21s learnings
  const generateJiraExportData = () => {
    const epics: any[] = [];
    const stories: any[] = [];
    const tasks: any[] = [];
    const subTasks: any[] = [];
    
    const processItem = (item: any, parentKey?: string) => {
      const priority = item.priority || 'Medium';
      const labels = ['44x21s', `Layer-${item.layer || 1}`, `Phase-${item.phase || 1}`, 'life-ceo-learnings'];
      
      // Enhanced description with acceptance criteria and 5-day learnings
      let enhancedDescription = item.description || '';
      if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
        enhancedDescription += '\n\n**Acceptance Criteria:**\n';
        item.acceptanceCriteria.forEach((criteria: string, index: number) => {
          enhancedDescription += `${index + 1}. ${criteria}\n`;
        });
      }
      
      // Add 44x21s framework context
      enhancedDescription += `\n\n**44x21s Framework Context:**\n`;
      enhancedDescription += `Layer ${item.layer || 1}: ${getLayerName(item.layer || 1)}\n`;
      enhancedDescription += `Phase ${item.phase || 1}: ${getPhaseName(item.phase || 1)}\n`;
      if (item.actualHours) {
        enhancedDescription += `Actual Hours: ${item.actualHours}\n`;
      }
      enhancedDescription += `Completion: ${item.completion || 0}%\n`;
      
      if (item.type === 'Platform' || item.type === 'Section') {
        epics.push({
          summary: `[44x21s Framework] ${item.title}`,
          description: enhancedDescription,
          priority,
          labels: [...labels, 'epic', 'framework-evolution'],
          key: `MT-44X21S-EPIC-${epics.length + 1}`
        });
      } else if (item.type === 'Feature' || item.type === 'Project') {
        stories.push({
          summary: `[L${item.layer || 1}P${item.phase || 1}] ${item.title}`,
          description: enhancedDescription,
          priority,
          labels: [...labels, 'story', 'implementation'],
          epicLink: parentKey,
          storyPoints: Math.ceil((item.actualHours || 40) / 8)
        });
      } else if (item.type === 'Task') {
        tasks.push({
          summary: `[Task] ${item.title}`,
          description: enhancedDescription,
          priority,
          labels: [...labels, 'task'],
          parentKey
        });
      }
      
      if (item.children) {
        item.children.forEach((child: any) => 
          processItem(child, `MT-44X21S-${item.type.toUpperCase()}-${epics.length || stories.length || tasks.length}`)
        );
      }
    };
    
    // Use enhanced 44x21s project data with all learnings
    enhancedProjectData44x21s.forEach(item => processItem(item));
    
    return { epics, stories, tasks, subTasks };
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            JIRA Export Dashboard - 44x21s Enhanced
          </h2>
          <p className="text-gray-600 mt-1">
            Export Life CEO 5-Day Learnings to JIRA using Enhanced 44x21s Framework
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
          <Layers className="w-4 h-4 mr-2" />
          44x21s Framework + Learnings
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
      
      {/* Direct JIRA API Integration */}
      <Card className="glassmorphic-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Direct JIRA Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasCredentials ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Configure JIRA API Access</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Connect directly to your JIRA instance to create issues in real-time using the 40x20s framework mapping.
              </p>
              <Button 
                onClick={() => setShowCredentialsModal(true)}
                className="bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600"
              >
                <Key className="w-4 h-4 mr-2" />
                Configure JIRA Credentials
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    JIRA API Connected
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Ready to create {stats.totalItems} items directly in JIRA
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCredentialsModal(true)}
                >
                  <Key className="w-3 h-3 mr-1" />
                  Update
                </Button>
              </div>
              
              {jiraStatus && (
                <Alert className={`${
                  jiraStatus.type === 'success' ? 'border-green-200 bg-green-50' :
                  jiraStatus.type === 'error' ? 'border-red-200 bg-red-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  {jiraStatus.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {jiraStatus.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {jiraStatus.type === 'info' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                  <AlertDescription className={`${
                    jiraStatus.type === 'success' ? 'text-green-700' :
                    jiraStatus.type === 'error' ? 'text-red-700' :
                    'text-blue-700'
                  }`}>
                    {jiraStatus.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {isCreatingInJira && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Creating issues...</span>
                    <span>{Math.round(jiraProgress)}%</span>
                  </div>
                  <Progress value={jiraProgress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={createIssuesInJira}
                disabled={isCreatingInJira}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isCreatingInJira ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Issues in JIRA...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Create All Issues in JIRA
                  </>
                )}
              </Button>
            </div>
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
      
      {/* JIRA Credentials Modal */}
      <JiraCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSuccess={() => {
          setHasCredentials(true);
          setShowCredentialsModal(false);
        }}
      />
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